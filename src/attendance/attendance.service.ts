import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CacheService } from '../common/cache.service';
import { Attendee, AttendeeDocument } from '../schemas/attendee.schema';
import { RegisterAttendeeDto, GateCheckInDto, UpdateFeedbackDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendee.name)
    private readonly attendeeModel: Model<AttendeeDocument>,
    private readonly cacheService: CacheService
  ) {}

  /**
   * Automatically generate sequential passcode in format: WG-LDP-001, WG-LDP-002, etc.
   */
  async generateNextPassCode(): Promise<string> {
    // Find all passcodes starting with WG-LDP-
    const attendees = await this.attendeeModel.find({}, { passCode: 1 }).lean();

    let maxNum = 0;
    const regex = /^WG-LDP-(\d+)$/i;

    for (const a of attendees) {
      if (a.passCode) {
        const match = a.passCode.match(regex);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }

    // Also consider TAG26-xxx if any are in the db
    if (maxNum === 0 && attendees.length > 0) {
      maxNum = attendees.length;
    }

    const nextNum = maxNum + 1;
    return `WG-LDP-${String(nextNum).padStart(3, '0')}`;
  }

  /**
   * Helper to format current time like "09:30 AM"
   */
  private getFormattedTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Helper to format registration date like "2026-11-11 04:30 PM"
   */
  private getFormattedRegDate(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${this.getFormattedTime()}`;
  }

  /**
   * Register a new employee/nominee from frontend form
   */
  async register(dto: RegisterAttendeeDto): Promise<AttendeeDocument> {
    // Check if duplicate phone or email exists
    const cleanPhone = dto.phone.trim();
    if (cleanPhone) {
      const existing = await this.attendeeModel.findOne({ phone: cleanPhone });
      if (existing) {
        return existing;
      }
    }

    const passCode = await this.generateNextPassCode();

    // Auto generate email if not provided
    const email =
      dto.email && dto.email.trim()
        ? dto.email.trim().toLowerCase()
        : `${dto.fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '.')}@taggroup.in`;

    const newAttendee = new this.attendeeModel({
      passCode,
      fullName: dto.fullName.trim(),
      phone: cleanPhone,
      email,
      companyName: dto.companyName?.trim() || 'TAG Group',
      designation: dto.designation.trim(),
      department: dto.department?.trim() || 'Operations',
      experience: dto.experience?.trim() || '3 – 5 Years',
      registeredAt: this.getFormattedRegDate(),
      codeSentWhatsApp: true,
      codeSentEmail: true,
      isCheckedIn: false,
      checkInTime: null,
      feedbackFilled: false,
      feedbackRating: null,
      feedbackNotes: ''
    });

    const saved = await newAttendee.save();
    this.cacheService.deletePattern('attendance:');
    return saved;
  }

  /**
   * Delete all attendees (purge test/dummy data)
   */
  async clearAll(): Promise<{ count: number; message: string }> {
    const res = await this.attendeeModel.deleteMany({});
    this.cacheService.deletePattern('attendance:');
    return { count: res.deletedCount || 0, message: 'All attendee records cleared successfully' };
  }

  /**
   * Delete single attendee by id
   */
  async deleteAttendee(id: string): Promise<{ success: boolean }> {
    await this.attendeeModel.findByIdAndDelete(id);
    this.cacheService.deletePattern('attendance:');
    return { success: true };
  }

  /**
   * Get all attendees with search, filters and metrics
   */
  async findAll(query?: {
    search?: string;
    department?: string;
    status?: string;
  }): Promise<{ attendees: any[]; stats: any }> {
    const cacheKey = `attendance:all:${query?.search || ''}:${query?.department || ''}:${query?.status || ''}`;
    return this.cacheService.wrap(cacheKey, 15, async () => {
      const filter: any = {};

      if (query?.department && query.department !== 'ALL') {
        filter.department = query.department;
      }

      if (query?.status && query.status !== 'ALL') {
        if (query.status === 'CHECKED_IN') {
          filter.isCheckedIn = true;
        } else if (query.status === 'UNCHECKED') {
          filter.isCheckedIn = false;
        } else if (query.status === 'FEEDBACK') {
          filter.feedbackFilled = true;
        }
      }

      if (query?.search && query.search.trim()) {
        const q = query.search.trim();
        const regex = new RegExp(q, 'i');
        filter.$or = [
          { fullName: regex },
          { phone: regex },
          { passCode: regex },
          { designation: regex },
          { companyName: regex },
          { email: regex }
        ];
      }

      const allRecords = await this.attendeeModel.find({}).sort({ createdAt: -1 }).lean();
      const stats = this.computeStats(allRecords);

      // Apply filters to return attendees
      const filteredRecords = await this.attendeeModel.find(filter).sort({ createdAt: -1 }).lean();

      return {
        attendees: filteredRecords.map((a) => ({
          ...a,
          id: (a as any)._id?.toString() || (a as any).id
        })),
        stats
      };
    });
  }

  /**
   * Compute metrics / summary stats
   */
  private computeStats(records: any[]) {
    const totalRegistered = records.length;
    const checkedInCount = records.filter((a) => a.isCheckedIn).length;
    const uncheckInCount = totalRegistered - checkedInCount;
    const feedbackCount = records.filter((a) => a.feedbackFilled).length;
    const passcodesSentCount = records.filter((a) => a.codeSentWhatsApp || a.codeSentEmail).length;
    const checkInRate = totalRegistered > 0 ? Math.round((checkedInCount / totalRegistered) * 100) : 0;

    return {
      totalRegistered,
      checkedInCount,
      uncheckInCount,
      feedbackCount,
      passcodesSentCount,
      checkInRate
    };
  }

  /**
   * Mark check-in for an attendee (called by "Mark Check-In" button click)
   * This immediately sets isCheckedIn = true, records checkInTime, and increases checked in value!
   */
  async markCheckIn(id: string): Promise<{ success: boolean; attendee: any; stats: any }> {
    let attendee: any = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      attendee = await this.attendeeModel.findById(id);
    }

    if (!attendee) {
      attendee = await this.attendeeModel.findOne({
        $or: [{ passCode: id.toUpperCase() }, { phone: id }]
      });
    }

    if (!attendee) {
      throw new NotFoundException(`Attendee not found with id or passCode: ${id}`);
    }

    attendee.isCheckedIn = true;
    attendee.checkInTime = this.getFormattedTime();
    await attendee.save();
    this.cacheService.deletePattern('attendance:');

    const allRecords = await this.attendeeModel.find({}).lean();
    const stats = this.computeStats(allRecords);

    return {
      success: true,
      attendee: {
        ...attendee.toObject(),
        id: attendee._id.toString()
      },
      stats
    };
  }

  /**
   * Toggle check-in status (allows marking check-in or undoing check-in)
   */
  async toggleCheckIn(id: string): Promise<{ success: boolean; attendee: any; stats: any }> {
    let attendee: any = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      attendee = await this.attendeeModel.findById(id);
    }

    if (!attendee) {
      attendee = await this.attendeeModel.findOne({
        $or: [{ passCode: id.toUpperCase() }, { phone: id }]
      });
    }

    if (!attendee) {
      throw new NotFoundException(`Attendee not found with id or passCode: ${id}`);
    }

    const nextState = !attendee.isCheckedIn;
    attendee.isCheckedIn = nextState;
    attendee.checkInTime = nextState ? this.getFormattedTime() : null;
    await attendee.save();
    this.cacheService.deletePattern('attendance:');

    const allRecords = await this.attendeeModel.find({}).lean();
    const stats = this.computeStats(allRecords);

    return {
      success: true,
      attendee: {
        ...attendee.toObject(),
        id: attendee._id.toString()
      },
      stats
    };
  }

  /**
   * Gate check-in verification by Passcode or Phone
   */
  async gateCheckIn(dto: GateCheckInDto): Promise<{ success: boolean; message: string; attendee?: any; stats?: any }> {
    const cleanCode = dto.code.trim().toUpperCase();

    const attendee: any = await this.attendeeModel.findOne({
      $or: [
        { passCode: cleanCode },
        { phone: cleanCode },
        { passCode: cleanCode.replace('-', '') },
        { passCode: `WG-LDP-${cleanCode.replace(/[^0-9]/g, '').padStart(3, '0')}` }
      ]
    });

    if (!attendee) {
      return {
        success: false,
        message: `No attendee found matching "${cleanCode}". Please verify nominee details.`
      };
    }

    if (attendee.isCheckedIn) {
      const allRecords = await this.attendeeModel.find({}).lean();
      return {
        success: true,
        message: `Already Checked-In at ${attendee.checkInTime || 'Gate'}!`,
        attendee: { ...attendee.toObject(), id: attendee._id.toString() },
        stats: this.computeStats(allRecords)
      };
    }

    attendee.isCheckedIn = true;
    attendee.checkInTime = this.getFormattedTime();
    await attendee.save();
    this.cacheService.deletePattern('attendance:');

    const allRecords = await this.attendeeModel.find({}).lean();
    const stats = this.computeStats(allRecords);

    return {
      success: true,
      message: `Verified! Welcome ${attendee.fullName} (${attendee.designation}) to Leadership in Action!`,
      attendee: { ...attendee.toObject(), id: attendee._id.toString() },
      stats
    };
  }

  /**
   * Toggle or update feedback status
   */
  async updateFeedback(id: string, dto?: UpdateFeedbackDto): Promise<{ success: boolean; attendee: any; stats: any }> {
    const attendee = await this.attendeeModel.findById(id);
    if (!attendee) {
      throw new NotFoundException(`Attendee not found: ${id}`);
    }

    if (dto && typeof dto.feedbackFilled === 'boolean') {
      attendee.feedbackFilled = dto.feedbackFilled;
      attendee.feedbackRating = dto.feedbackRating ?? (dto.feedbackFilled ? 5 : null);
      if (dto.feedbackNotes !== undefined) attendee.feedbackNotes = dto.feedbackNotes;
    } else {
      attendee.feedbackFilled = !attendee.feedbackFilled;
      attendee.feedbackRating = attendee.feedbackFilled ? 5 : null;
    }

    await attendee.save();
    this.cacheService.deletePattern('attendance:');

    const allRecords = await this.attendeeModel.find({}).lean();
    return {
      success: true,
      attendee: { ...attendee.toObject(), id: attendee._id.toString() },
      stats: this.computeStats(allRecords)
    };
  }

  /**
   * Update dispatch status (WhatsApp / Email)
   */
  async updateDispatch(id: string, channel: 'wa' | 'mail'): Promise<{ success: boolean; attendee: any }> {
    const attendee = await this.attendeeModel.findById(id);
    if (!attendee) {
      throw new NotFoundException(`Attendee not found: ${id}`);
    }

    if (channel === 'wa') {
      attendee.codeSentWhatsApp = true;
    } else if (channel === 'mail') {
      attendee.codeSentEmail = true;
    }

    await attendee.save();
    this.cacheService.deletePattern('attendance:');

    return {
      success: true,
      attendee: { ...attendee.toObject(), id: attendee._id.toString() }
    };
  }

  /**
   * Quick summary stats
   */
  async getStats(): Promise<any> {
    return this.cacheService.wrap('attendance:stats', 15, async () => {
      const allRecords = await this.attendeeModel.find({}).lean();
      return this.computeStats(allRecords);
    });
  }
}

