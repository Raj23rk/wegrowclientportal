import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../schemas/client.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { ActionItem, ActionItemDocument } from '../schemas/action-item.schema';
import { Session, SessionDocument } from '../schemas/session.schema';
import { ClientEvent, EventDocument } from '../schemas/event.schema';
import { DocumentItem, DocumentItemDocument } from '../schemas/document.schema';
import { Report, ReportDocument } from '../schemas/report.schema';
import { BusinessUpdate, UpdateDocument } from '../schemas/update.schema';
import { NotificationItem, NotificationDocument } from '../schemas/notification.schema';
import { SessionFeedback, FeedbackDocument } from '../schemas/feedback.schema';
import { ClientPhoto, PhotoDocument } from '../schemas/photo.schema';
import {
  CreateClientDto,
  UpdateClientDto,
  CreateMemberDto,
  UpdateMemberDto,
  CreateTaskDto,
  UpdateTaskDto,
  CreateSessionDto,
  UpdateSessionDto,
  CreateEventDto,
  CreateDocumentDto,
  CreateReportDto,
  CreateUpdateDto,
  CreateNotificationDto
} from './dto/admin.dto';

const DEFAULT_ROADMAP_MONTHS = [
  {
    n: 1,
    key: 'Month-01',
    name: 'Month 1',
    year: 2026,
    theme: 'Foundation & Business Assessment',
    objective: 'Understand the current business structure, key metrics, and operational bottlenecks.',
    focus: ['Organisation structure', 'Process mapping', 'Role clarity', 'Baseline assessment'],
    outcome: 'Comprehensive diagnostic report and 6-month priority transformation blueprint.',
    notes: 'Kick-off assessment and stakeholder interviews.'
  },
  {
    n: 2,
    key: 'Month-02',
    name: 'Month 2',
    year: 2026,
    theme: 'Process & SOP Optimisation',
    objective: 'Standardise and streamline core business operations and delivery pipelines.',
    focus: ['SOP documentation', 'Workflow automation', 'Quality checkpoints', 'Cycle time reduction'],
    outcome: 'Approved standard operating procedures across all core departments.',
    notes: 'SOP drafting and team review sessions.'
  },
  {
    n: 3,
    key: 'Month-03',
    name: 'Month 3',
    year: 2026,
    theme: 'People & Accountability Framework',
    objective: 'Align leadership, reporting hierarchies, and departmental accountability.',
    focus: ['Role charters', 'KRA/KPI frameworks', 'Capability matrix', 'Performance governance'],
    outcome: 'Clear performance scorecards for each department head and key employee.',
    notes: 'Conduct 1-on-1 capability reviews.'
  },
  {
    n: 4,
    key: 'Month-04',
    name: 'Month 4',
    year: 2027,
    theme: 'Technology & Tool Enablement',
    objective: 'Deploy tech enablers and CRM/ERP integrations to automate workflows.',
    focus: ['Digital tools audit', 'System integrations', 'Data visibility', 'Reporting dashboards'],
    outcome: 'Real-time operating dashboard and automated management reporting.',
    notes: 'Tool testing and training.'
  },
  {
    n: 5,
    key: 'Month-05',
    name: 'Month 5',
    year: 2027,
    theme: 'Performance & Revenue Governance',
    objective: 'Optimise sales funnels, profitability drivers, and cash flow governance.',
    focus: ['Pricing strategies', 'Pipeline velocity', 'Cost rationalisation', 'Customer retention'],
    outcome: 'Revenue acceleration framework and weekly governance cadences.',
    notes: 'Financial model deep-dive.'
  },
  {
    n: 6,
    key: 'Month-06',
    name: 'Month 6',
    year: 2027,
    theme: 'Scale, Autonomy & Final Review',
    objective: 'Institutionalise practices so the company runs autonomously without consultant dependency.',
    focus: ['Leadership succession', 'Continuous improvement loop', 'Audit checklist', 'Next-phase roadmap'],
    outcome: 'Complete business transformation audit report and autonomous operational cadence.',
    notes: 'Final board presentation and executive sign-off.'
  }
];

const DEFAULT_DEPT_METRICS = [
  { k: 'People', prev: 50, v: 65 },
  { k: 'Process', prev: 45, v: 60 },
  { k: 'Technology', prev: 40, v: 55 },
  { k: 'Operations', prev: 50, v: 70 },
  { k: 'Management', prev: 55, v: 72 }
];

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(ActionItem.name) private actionModel: Model<ActionItemDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(ClientEvent.name) private eventModel: Model<EventDocument>,
    @InjectModel(DocumentItem.name) private documentModel: Model<DocumentItemDocument>,
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    @InjectModel(BusinessUpdate.name) private updateModel: Model<UpdateDocument>,
    @InjectModel(NotificationItem.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(SessionFeedback.name) private feedbackModel: Model<FeedbackDocument>,
    @InjectModel(ClientPhoto.name) private photoModel: Model<PhotoDocument>
  ) {}

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  // ==========================================
  // 1. CLIENT MANAGEMENT
  // ==========================================

  async createClient(dto: CreateClientDto) {
    // 1. Generate or validate clientId
    let clientId = dto.clientId?.trim().toUpperCase();
    if (!clientId) {
      const highestClient = await this.clientModel
        .findOne({ clientId: /^C\d+$/ })
        .sort({ clientId: -1 })
        .lean();

      if (highestClient && highestClient.clientId) {
        const numPart = parseInt(highestClient.clientId.replace(/\D/g, ''), 10);
        clientId = `C${String(numPart + 1).padStart(3, '0')}`;
      } else {
        clientId = 'C001';
      }
    }

    const existingClient = await this.clientModel.findOne({ clientId });
    if (existingClient) {
      throw new ConflictException(`Client with ID ${clientId} already exists`);
    }

    // Default short code
    const short =
      dto.short ||
      dto.company
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const client = new this.clientModel({
      clientId,
      company: dto.company,
      short,
      color: dto.color || '#2563EB',
      industry: dto.industry || 'Management & Consulting',
      size: dto.size || '50-100 employees',
      city: dto.city || 'Bangalore',
      location: dto.location || `${dto.city || 'Bangalore'}, India`,
      contact: dto.contact,
      contactTitle: dto.contactTitle || 'Managing Director',
      email: dto.email.toLowerCase().trim(),
      phone: dto.phone || '',
      start: dto.start || this.getTodayString(),
      end: dto.end || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      consultant: dto.consultant || 'Dr. Thavabalan',
      areas:
        dto.areas && dto.areas.length > 0
          ? dto.areas
          : ['Operations', 'Process', 'People', 'Technology', 'Finance', 'Management'],
      people: dto.people || { ceo: `${dto.contact} (${dto.contactTitle || 'MD'})` },
      scoreHistory: [{ m: 'Baseline', v: 55 }],
      dept: DEFAULT_DEPT_METRICS,
      months: dto.months && dto.months.length > 0 ? dto.months : DEFAULT_ROADMAP_MONTHS
    });

    await client.save();

    // Create primary contact login account in User table
    let primaryUser: any = null;
    try {
      const existingUser = await this.userModel.findOne({ email: dto.email.toLowerCase().trim() });
      if (!existingUser) {
        const initialPassword = dto.initialPassword || 'welcome123';
        primaryUser = await this.userModel.create({
          email: dto.email.toLowerCase().trim(),
          passwordHash: initialPassword,
          clientId,
          role: 'client',
          name: dto.contact,
          title: dto.contactTitle || 'Managing Director',
          phone: dto.phone || '',
          isActive: true
        });
      }
    } catch (err) {
      this.logger.warn(`Could not auto-create primary user for ${dto.email}: ${err.message}`);
    }

    // Send welcome notification
    await this.notificationModel.create({
      clientId,
      notifId: 'N' + Date.now().toString().slice(-6),
      cat: 'Important',
      text: `Welcome to WeGrow B School Portal! Your transformation portal is now active.`,
      date: this.getTodayString(),
      read: false,
      link: '#/overview'
    });

    return {
      success: true,
      client,
      initialUser: primaryUser
        ? {
            email: primaryUser.email,
            name: primaryUser.name,
            title: primaryUser.title,
            tempPassword: dto.initialPassword || 'welcome123'
          }
        : null
    };
  }

  async findAllClients(search?: string): Promise<any[]> {
    const query: any = {};
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { clientId: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } }
      ];
    }

    const clients = await this.clientModel.find(query).sort({ createdAt: -1 }).lean();

    // Enrich with summary stats for admin dashboard overview
    const enriched = await Promise.all(
      clients.map(async (cl) => {
        const [tasksCount, completedTasksCount, membersCount, upcomingSession, docsCount] =
          await Promise.all([
            this.actionModel.countDocuments({ clientId: cl.clientId }),
            this.actionModel.countDocuments({ clientId: cl.clientId, status: 'Completed' }),
            this.userModel.countDocuments({ clientId: cl.clientId }),
            this.sessionModel
              .findOne({ clientId: cl.clientId, status: 'Upcoming' })
              .sort({ date: 1 })
              .lean(),
            this.documentModel.countDocuments({ clientId: cl.clientId })
          ]);

        const latestScore =
          cl.scoreHistory && cl.scoreHistory.length > 0
            ? cl.scoreHistory[cl.scoreHistory.length - 1].v
            : 0;

        return {
          ...cl,
          stats: {
            tasksCount,
            completedTasksCount,
            pendingTasksCount: tasksCount - completedTasksCount,
            membersCount,
            documentsCount: docsCount,
            latestScore,
            upcomingSession: upcomingSession
              ? {
                  sessionId: upcomingSession.sessionId,
                  title: upcomingSession.title,
                  date: upcomingSession.date,
                  time: upcomingSession.time
                }
              : null
          }
        };
      })
    );

    return enriched;
  }

  async findClientById(clientId: string): Promise<any> {
    const client = await this.clientModel.findOne({ clientId }).lean();
    if (!client) {
      throw new NotFoundException(`Client ${clientId} not found`);
    }

    const [members, actions, sessions, reports, updates, documents, notifications, feedback] =
      await Promise.all([
        this.userModel
          .find({ clientId })
          .select('-passwordHash')
          .sort({ createdAt: -1 })
          .lean(),
        this.actionModel.find({ clientId }).sort({ due: 1 }).lean(),
        this.sessionModel.find({ clientId }).sort({ date: 1 }).lean(),
        this.reportModel.find({ clientId }).sort({ date: -1 }).lean(),
        this.updateModel.find({ clientId }).sort({ date: -1 }).lean(),
        this.documentModel.find({ clientId }).sort({ date: -1 }).lean(),
        this.notificationModel.find({ clientId }).sort({ date: -1 }).lean(),
        this.feedbackModel.find({ clientId }).sort({ date: -1 }).lean()
      ]);

    return {
      ...client,
      members,
      actions,
      sessions,
      reports,
      updates,
      documents,
      notifications,
      feedback
    };
  }

  async updateClient(clientId: string, dto: UpdateClientDto) {
    const updated = await this.clientModel.findOneAndUpdate(
      { clientId },
      { $set: dto },
      { new: true }
    );

    if (!updated) {
      throw new NotFoundException(`Client ${clientId} not found`);
    }

    return updated;
  }

  async deleteClient(clientId: string, cascade = true) {
    const res = await this.clientModel.findOneAndDelete({ clientId });
    if (!res) {
      throw new NotFoundException(`Client ${clientId} not found`);
    }

    if (cascade) {
      await Promise.all([
        this.userModel.deleteMany({ clientId }),
        this.actionModel.deleteMany({ clientId }),
        this.sessionModel.deleteMany({ clientId }),
        this.documentModel.deleteMany({ clientId }),
        this.reportModel.deleteMany({ clientId }),
        this.updateModel.deleteMany({ clientId }),
        this.notificationModel.deleteMany({ clientId }),
        this.feedbackModel.deleteMany({ clientId }),
        this.photoModel.deleteMany({ clientId })
      ]);
    }

    return { success: true, message: `Client ${clientId} and associated records deleted` };
  }

  // ==========================================
  // 2. COMPANY MEMBER MANAGEMENT
  // ==========================================

  async getMembers(clientId: string) {
    return this.userModel.find({ clientId }).select('-passwordHash').sort({ createdAt: -1 }).lean();
  }

  async addMember(clientId: string, dto: CreateMemberDto) {
    const client = await this.clientModel.findOne({ clientId });
    if (!client) {
      throw new NotFoundException(`Client ${clientId} does not exist`);
    }

    const email = dto.email.toLowerCase().trim();
    const existing = await this.userModel.findOne({ email });
    if (existing) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    const password = dto.password || 'welcome123';
    const user = await this.userModel.create({
      clientId,
      email,
      passwordHash: password,
      role: dto.role || 'client',
      name: dto.name,
      title: dto.title,
      phone: dto.phone || '',
      isActive: true
    });

    // Optionally update people map on client
    if (dto.deptKey) {
      const currentPeople = client.people || {};
      currentPeople[dto.deptKey] = `${dto.name} (${dto.title})`;
      await this.clientModel.updateOne({ clientId }, { $set: { people: currentPeople } });
    }

    // Send notification to the client portal
    await this.notificationModel.create({
      clientId,
      notifId: 'N' + Date.now().toString().slice(-6),
      cat: 'Important',
      text: `New team member added: ${dto.name} (${dto.title})`,
      date: this.getTodayString(),
      read: false,
      link: '#/overview'
    });

    return {
      _id: user._id,
      email: user.email,
      clientId: user.clientId,
      role: user.role,
      name: user.name,
      title: user.title,
      phone: user.phone,
      initialPassword: password
    };
  }

  async updateMember(userId: string, dto: UpdateMemberDto) {
    const updateData: any = { ...dto };
    if (dto.password) {
      updateData.passwordHash = dto.password;
      delete updateData.password;
    }
    if (dto.email) {
      updateData.email = dto.email.toLowerCase().trim();
    }

    const updated = await this.userModel
      .findByIdAndUpdate(userId, { $set: updateData }, { new: true })
      .select('-passwordHash');

    if (!updated) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return updated;
  }

  async deleteMember(userId: string) {
    const res = await this.userModel.findByIdAndDelete(userId);
    if (!res) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return { success: true, message: `Member removed successfully` };
  }

  // ==========================================
  // 3. TASK ASSIGNMENT & FOLLOW-UP MANAGEMENT
  // ==========================================

  async createTask(clientId: string, dto: CreateTaskDto) {
    const client = await this.clientModel.findOne({ clientId });
    if (!client) {
      throw new NotFoundException(`Client ${clientId} not found`);
    }

    const actionId = dto.actionId || 'ACT-' + Date.now().toString().slice(-6);

    const task = await this.actionModel.create({
      clientId,
      actionId,
      month: dto.month || 1,
      title: dto.title,
      desc: dto.desc || '',
      priority: dto.priority || 'Medium',
      owner: dto.owner,
      due: dto.due,
      status: dto.status || 'Not Started',
      progress: dto.progress ?? 0,
      comments: [],
      attachments: dto.attachments || []
    });

    // Notify client portal of task assignment
    await this.notificationModel.create({
      clientId,
      notifId: 'N' + Date.now().toString().slice(-6),
      cat: 'Action Plan',
      text: `New action assigned: "${dto.title}" (Due: ${dto.due}, Assigned to: ${dto.owner})`,
      date: this.getTodayString(),
      read: false,
      link: '#/actions'
    });

    return task;
  }

  async findAllTasks(filters: {
    clientId?: string;
    status?: string;
    priority?: string;
    owner?: string;
    search?: string;
  }) {
    const query: any = {};
    if (filters.clientId) query.clientId = filters.clientId;
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.owner) query.owner = { $regex: filters.owner, $options: 'i' };
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { desc: { $regex: filters.search, $options: 'i' } },
        { owner: { $regex: filters.search, $options: 'i' } }
      ];
    }

    return this.actionModel.find(query).sort({ due: 1 }).lean();
  }

  async updateTask(clientId: string, actionId: string, dto: UpdateTaskDto) {
    const updated = await this.actionModel.findOneAndUpdate(
      { clientId, actionId },
      { $set: dto },
      { new: true }
    );

    if (!updated) {
      throw new NotFoundException(`Action item ${actionId} for client ${clientId} not found`);
    }

    // If marked completed, trigger congratulations notification
    if (dto.status === 'Completed') {
      await this.notificationModel.create({
        clientId,
        notifId: 'N' + Date.now().toString().slice(-6),
        cat: 'Action Plan',
        text: `Milestone Achieved: Action item "${updated.title}" marked Completed!`,
        date: this.getTodayString(),
        read: false,
        link: '#/actions'
      });
    }

    return updated;
  }

  async addTaskComment(clientId: string, actionId: string, authorName: string, text: string) {
    const action = await this.actionModel.findOne({ clientId, actionId });
    if (!action) {
      throw new NotFoundException(`Action item ${actionId} not found`);
    }

    action.comments.push({
      by: authorName,
      date: this.getTodayString(),
      text
    });

    await action.save();

    // Notify client of follow-up comment
    await this.notificationModel.create({
      clientId,
      notifId: 'N' + Date.now().toString().slice(-6),
      cat: 'Action Plan',
      text: `New follow-up comment on task "${action.title}": "${text.slice(0, 60)}..."`,
      date: this.getTodayString(),
      read: false,
      link: '#/actions'
    });

    return action;
  }

  async deleteTask(clientId: string, actionId: string) {
    const res = await this.actionModel.findOneAndDelete({ clientId, actionId });
    if (!res) {
      throw new NotFoundException(`Action item ${actionId} not found`);
    }
    return { success: true, message: `Task ${actionId} deleted` };
  }

  // ==========================================
  // 4. MEETING CALENDAR & SCHEDULING
  // ==========================================

  async createSession(clientId: string, dto: CreateSessionDto) {
    const client = await this.clientModel.findOne({ clientId });
    if (!client) {
      throw new NotFoundException(`Client ${clientId} not found`);
    }

    const sessionId = dto.sessionId || 'S' + Date.now().toString().slice(-5);

    const session = await this.sessionModel.create({
      clientId,
      sessionId,
      title: dto.title,
      date: dto.date,
      time: dto.time,
      duration: dto.duration || 3,
      mode: dto.mode || 'Online',
      location: dto.location || (dto.mode === 'In person' ? `${client.city} Office` : 'Google Meet'),
      link: dto.link || (dto.mode === 'Online' ? 'https://meet.google.com/wegrow-consulting' : ''),
      consultant: dto.consultant || client.consultant || 'Dr. Thavabalan',
      agenda: dto.agenda || ['Strategy alignment', 'Operational review', 'Next sprint actions'],
      objectives: dto.objectives || ['Review monthly KPI progress', 'Address open blockers'],
      status: dto.status || 'Upcoming',
      summary: dto.summary || null,
      attachments: dto.attachments || []
    });

    // Notify client of scheduled session
    await this.notificationModel.create({
      clientId,
      notifId: 'N' + Date.now().toString().slice(-6),
      cat: 'Sessions',
      text: `Consulting session booked: "${dto.title}" on ${dto.date} at ${dto.time}`,
      date: this.getTodayString(),
      read: false,
      link: '#/sessions'
    });

    return session;
  }

  async findAllSessions(filters: {
    clientId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const query: any = {};
    if (filters.clientId) query.clientId = filters.clientId;
    if (filters.status) query.status = filters.status;
    if (filters.fromDate || filters.toDate) {
      query.date = {};
      if (filters.fromDate) query.date.$gte = filters.fromDate;
      if (filters.toDate) query.date.$lte = filters.toDate;
    }

    return this.sessionModel.find(query).sort({ date: 1 }).lean();
  }

  async updateSession(clientId: string, sessionId: string, dto: UpdateSessionDto) {
    const session = await this.sessionModel.findOne({ clientId, sessionId });
    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    const isRescheduled = (dto.date && dto.date !== session.date) || (dto.time && dto.time !== session.time);

    const updated = await this.sessionModel.findOneAndUpdate(
      { clientId, sessionId },
      { $set: dto },
      { new: true }
    );

    if (isRescheduled) {
      await this.notificationModel.create({
        clientId,
        notifId: 'N' + Date.now().toString().slice(-6),
        cat: 'Sessions',
        text: `Session Rescheduled: "${updated.title}" moved to ${updated.date} at ${updated.time}`,
        date: this.getTodayString(),
        read: false,
        link: '#/sessions'
      });
    }

    return updated;
  }

  async deleteSession(clientId: string, sessionId: string) {
    const res = await this.sessionModel.findOneAndDelete({ clientId, sessionId });
    if (!res) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }
    return { success: true, message: `Session ${sessionId} cancelled` };
  }

  // Workshop & Networking Events
  async createEvent(dto: CreateEventDto) {
    const eventId = dto.eventId || 'EV' + Date.now().toString().slice(-5);
    return this.eventModel.create({
      eventId,
      title: dto.title,
      type: dto.type,
      date: dto.date,
      time: dto.time,
      loc: dto.loc,
      desc: dto.desc,
      agenda: dto.agenda || [],
      speakers: dto.speakers || [],
      participants: dto.participants || 'CXOs & Business Leaders',
      seats: dto.seats || 50,
      hue: dto.hue || 220,
      registeredClientIds: []
    });
  }

  async findAllEvents() {
    return this.eventModel.find().sort({ date: 1 }).lean();
  }

  async updateEvent(eventId: string, dto: Partial<CreateEventDto>) {
    const updated = await this.eventModel.findOneAndUpdate(
      { eventId },
      { $set: dto },
      { new: true }
    );
    if (!updated) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }
    return updated;
  }

  async deleteEvent(eventId: string) {
    const res = await this.eventModel.findOneAndDelete({ eventId });
    if (!res) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }
    return { success: true, message: `Event ${eventId} removed` };
  }

  // ==========================================
  // 5. CLIENT PORTAL DEPENDENCIES (DOCS, REPORTS, UPDATES, NOTIFICATIONS)
  // ==========================================

  // Deliverables & Documents
  async addDocument(clientId: string, dto: CreateDocumentDto) {
    const docId = dto.docId || 'DOC-' + Date.now().toString().slice(-5);
    const doc = await this.documentModel.create({
      clientId,
      docId,
      name: dto.name,
      cat: dto.cat,
      date: dto.date || this.getTodayString(),
      by: dto.by || 'WeGrow Advisory',
      type: dto.type || 'PDF',
      size: dto.size || '1.2 MB',
      storagePath: dto.storagePath || ''
    });

    await this.notificationModel.create({
      clientId,
      notifId: 'N' + Date.now().toString().slice(-6),
      cat: 'Reports',
      text: `New document published: ${dto.name}`,
      date: this.getTodayString(),
      read: false,
      link: '#/documents'
    });

    return doc;
  }

  async getDocuments(clientId: string) {
    return this.documentModel.find({ clientId }).sort({ date: -1 }).lean();
  }

  async deleteDocument(clientId: string, docId: string) {
    const res = await this.documentModel.findOneAndDelete({ clientId, docId });
    if (!res) {
      throw new NotFoundException(`Document ${docId} not found`);
    }
    return { success: true, message: `Document ${docId} deleted` };
  }

  // Quarterly & Executive Reports
  async addReport(clientId: string, dto: CreateReportDto) {
    const reportId = dto.reportId || 'REP-' + Date.now().toString().slice(-5);
    const report = await this.reportModel.create({
      clientId,
      reportId,
      name: dto.name,
      cat: dto.cat,
      date: dto.date || this.getTodayString(),
      desc: dto.desc,
      pages: dto.pages || 12,
      fileUrl: dto.fileUrl || ''
    });

    await this.notificationModel.create({
      clientId,
      notifId: 'N' + Date.now().toString().slice(-6),
      cat: 'Reports',
      text: `New transformation report uploaded: ${dto.name}`,
      date: this.getTodayString(),
      read: false,
      link: '#/reports'
    });

    return report;
  }

  async getReports(clientId: string) {
    return this.reportModel.find({ clientId }).sort({ date: -1 }).lean();
  }

  async deleteReport(clientId: string, reportId: string) {
    const res = await this.reportModel.findOneAndDelete({ clientId, reportId });
    if (!res) {
      throw new NotFoundException(`Report ${reportId} not found`);
    }
    return { success: true, message: `Report ${reportId} deleted` };
  }

  // Business Updates & Broadcasts
  async addUpdate(clientId: string, dto: CreateUpdateDto) {
    const updateId = dto.updateId || 'UP' + Date.now().toString().slice(-6);
    const update = await this.updateModel.create({
      clientId,
      updateId,
      title: dto.title,
      body: dto.body,
      date: dto.date || this.getTodayString(),
      cat: dto.cat || 'Strategic Alignment',
      type: dto.type || 'General Update'
    });

    await this.notificationModel.create({
      clientId,
      notifId: 'N' + Date.now().toString().slice(-6),
      cat: dto.type === 'Action Required' ? 'Important' : 'Important',
      text: `Consultant update: ${dto.title}`,
      date: this.getTodayString(),
      read: false,
      link: '#/updates'
    });

    return update;
  }

  async deleteUpdate(clientId: string, updateId: string) {
    const res = await this.updateModel.findOneAndDelete({ clientId, updateId });
    if (!res) {
      throw new NotFoundException(`Update ${updateId} not found`);
    }
    return { success: true, message: `Update ${updateId} deleted` };
  }

  // Direct Notifications Dispatch
  async sendNotification(clientId: string, dto: CreateNotificationDto) {
    const notifId = 'N' + Date.now().toString().slice(-6);
    return this.notificationModel.create({
      clientId,
      notifId,
      cat: dto.cat || 'Important',
      text: dto.text,
      date: this.getTodayString(),
      read: false,
      link: dto.link || '#/overview'
    });
  }

  // ==========================================
  // 6. ADMIN DASHBOARD OVERVIEW METRICS
  // ==========================================

  async getDashboardOverview() {
    const today = this.getTodayString();
    const in14Days = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [
      clientsCount,
      membersCount,
      totalTasks,
      completedTasks,
      pendingTasks,
      upcomingSessions,
      eventsCount,
      recentUpdates,
      recentFeedback
    ] = await Promise.all([
      this.clientModel.countDocuments(),
      this.userModel.countDocuments({ role: 'client' }),
      this.actionModel.countDocuments(),
      this.actionModel.countDocuments({ status: 'Completed' }),
      this.actionModel.countDocuments({ status: { $ne: 'Completed' } }),
      this.sessionModel
        .find({ date: { $gte: today, $lte: in14Days } })
        .sort({ date: 1 })
        .lean(),
      this.eventModel.countDocuments(),
      this.updateModel.find().sort({ createdAt: -1 }).limit(5).lean(),
      this.feedbackModel.find().sort({ createdAt: -1 }).limit(5).lean()
    ]);

    return {
      overview: {
        totalClients: clientsCount,
        totalCompanyMembers: membersCount,
        totalTasks,
        completedTasks,
        pendingTasks,
        taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        upcomingSessionsCount: upcomingSessions.length,
        eventsCount
      },
      upcomingSessions,
      recentUpdates,
      recentFeedback
    };
  }
}
