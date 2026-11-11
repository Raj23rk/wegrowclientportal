import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import {
  RegisterAttendeeDto,
  GateCheckInDto,
  UpdateFeedbackDto,
  UpdateDispatchDto
} from './dto/attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Health & Live status check for admin and frontend
   */
  @Get('health')
  async checkHealth() {
    const stats = await this.attendanceService.getStats();
    return {
      status: 'online',
      message: 'Attendance API is live and connected to MongoDB',
      timestamp: new Date().toISOString(),
      stats
    };
  }

  /**
   * Summary metrics overview
   */
  @Get('stats')
  async getStats() {
    return this.attendanceService.getStats();
  }

  /**
   * Employee / Nominee Registration Form API
   * Generates sequential passcode WG-LDP-001, WG-LDP-002, etc.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterAttendeeDto) {
    const attendee = await this.attendanceService.register(dto);
    return {
      success: true,
      message: 'Nomination registered successfully',
      attendee: {
        ...attendee.toObject(),
        id: attendee._id.toString()
      }
    };
  }

  /**
   * Get all attendees for Admin Attendance Portal
   * Supports ?search=...&department=...&status=...
   */
  @Get()
  async getAll(
    @Query('search') search?: string,
    @Query('department') department?: string,
    @Query('status') status?: string
  ) {
    return this.attendanceService.findAll({ search, department, status });
  }

  /**
   * Mark Check-In button click
   * Immediately sets isCheckedIn = true, records checkInTime, and increases checked in value!
   */
  @Patch(':id/checkin')
  async markCheckInPatch(@Param('id') id: string) {
    return this.attendanceService.markCheckIn(id);
  }

  @Post(':id/checkin')
  async markCheckInPost(@Param('id') id: string) {
    return this.attendanceService.markCheckIn(id);
  }

  /**
   * Toggle Check-In status (Check-in or undo)
   */
  @Patch(':id/toggle-checkin')
  async toggleCheckIn(@Param('id') id: string) {
    return this.attendanceService.toggleCheckIn(id);
  }

  /**
   * Quick Gate Check-in verification by Passcode or Phone
   */
  @Post('gate-checkin')
  @HttpCode(HttpStatus.OK)
  async gateCheckIn(@Body() dto: GateCheckInDto) {
    return this.attendanceService.gateCheckIn(dto);
  }

  /**
   * Toggle feedback status
   */
  @Patch(':id/feedback')
  async updateFeedback(@Param('id') id: string, @Body() dto: UpdateFeedbackDto) {
    return this.attendanceService.updateFeedback(id, dto);
  }

  /**
   * Update passcode dispatch status (WhatsApp / Email)
   */
  @Patch(':id/dispatch')
  async updateDispatch(@Param('id') id: string, @Body() dto: UpdateDispatchDto) {
    return this.attendanceService.updateDispatch(id, dto.channel);
  }

  /**
   * Reset / Seed initial 15 attendees
   */
  @Post('seed')
  async seedAttendees() {
    return this.attendanceService.seedAttendees();
  }
}

