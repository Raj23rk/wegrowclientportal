import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
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

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==========================================
  // DASHBOARD OVERVIEW
  // ==========================================
  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardOverview();
  }

  // ==========================================
  // 1. CLIENT MANAGEMENT
  // ==========================================
  @Post('clients')
  async createClient(@Body() dto: CreateClientDto) {
    return this.adminService.createClient(dto);
  }

  @Get('clients')
  async getAllClients(@Query('search') search?: string): Promise<any[]> {
    return this.adminService.findAllClients(search);
  }

  @Get('clients/:clientId')
  async getClientById(@Param('clientId') clientId: string): Promise<any> {
    return this.adminService.findClientById(clientId);
  }

  @Patch('clients/:clientId')
  async updateClient(
    @Param('clientId') clientId: string,
    @Body() dto: UpdateClientDto
  ) {
    return this.adminService.updateClient(clientId, dto);
  }

  @Delete('clients/:clientId')
  async deleteClient(
    @Param('clientId') clientId: string,
    @Query('cascade') cascade?: string
  ) {
    return this.adminService.deleteClient(clientId, cascade !== 'false');
  }

  // ==========================================
  // 2. COMPANY MEMBERS MANAGEMENT
  // ==========================================
  @Get('clients/:clientId/members')
  async getMembers(@Param('clientId') clientId: string) {
    return this.adminService.getMembers(clientId);
  }

  @Post('clients/:clientId/members')
  async addMember(
    @Param('clientId') clientId: string,
    @Body() dto: CreateMemberDto
  ) {
    return this.adminService.addMember(clientId, dto);
  }

  @Patch('members/:userId')
  async updateMember(
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberDto
  ) {
    return this.adminService.updateMember(userId, dto);
  }

  @Delete('members/:userId')
  async deleteMember(@Param('userId') userId: string) {
    return this.adminService.deleteMember(userId);
  }

  // ==========================================
  // 3. TASK ASSIGNMENT & FOLLOW-UP MANAGEMENT
  // ==========================================
  @Post('clients/:clientId/tasks')
  async createTaskForClient(
    @Param('clientId') clientId: string,
    @Body() dto: CreateTaskDto
  ) {
    return this.adminService.createTask(clientId, dto);
  }

  @Post('tasks')
  async createTaskGeneric(@Body() dto: CreateTaskDto) {
    if (!dto.clientId) {
      throw new BadRequestException('clientId is required when assigning a task');
    }
    return this.adminService.createTask(dto.clientId, dto);
  }

  @Get('tasks')
  async getAllTasks(
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('owner') owner?: string,
    @Query('search') search?: string
  ) {
    return this.adminService.findAllTasks({
      clientId,
      status,
      priority,
      owner,
      search
    });
  }

  @Patch('clients/:clientId/tasks/:actionId')
  async updateClientTask(
    @Param('clientId') clientId: string,
    @Param('actionId') actionId: string,
    @Body() dto: UpdateTaskDto
  ) {
    return this.adminService.updateTask(clientId, actionId, dto);
  }

  @Post('clients/:clientId/tasks/:actionId/comments')
  async addTaskComment(
    @Param('clientId') clientId: string,
    @Param('actionId') actionId: string,
    @Body('text') text: string,
    @Request() req: any
  ) {
    const authorName = req.user?.name || 'Lead Consultant';
    return this.adminService.addTaskComment(clientId, actionId, authorName, text);
  }

  @Delete('clients/:clientId/tasks/:actionId')
  async deleteTask(
    @Param('clientId') clientId: string,
    @Param('actionId') actionId: string
  ) {
    return this.adminService.deleteTask(clientId, actionId);
  }

  // ==========================================
  // 4. MEETING CALENDAR & SCHEDULING
  // ==========================================
  @Post('clients/:clientId/sessions')
  async createSessionForClient(
    @Param('clientId') clientId: string,
    @Body() dto: CreateSessionDto
  ) {
    return this.adminService.createSession(clientId, dto);
  }

  @Post('sessions')
  async createSessionGeneric(@Body() dto: CreateSessionDto) {
    if (!dto.clientId) {
      throw new BadRequestException('clientId is required when scheduling a session');
    }
    return this.adminService.createSession(dto.clientId, dto);
  }

  @Get('sessions')
  @Get('calendar')
  async getSessions(
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    return this.adminService.findAllSessions({
      clientId,
      status,
      fromDate,
      toDate
    });
  }

  @Patch('clients/:clientId/sessions/:sessionId')
  async updateSession(
    @Param('clientId') clientId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateSessionDto
  ) {
    return this.adminService.updateSession(clientId, sessionId, dto);
  }

  @Delete('clients/:clientId/sessions/:sessionId')
  async deleteSession(
    @Param('clientId') clientId: string,
    @Param('sessionId') sessionId: string
  ) {
    return this.adminService.deleteSession(clientId, sessionId);
  }

  // Workshop & Networking Events
  @Post('events')
  async createEvent(@Body() dto: CreateEventDto) {
    return this.adminService.createEvent(dto);
  }

  @Get('events')
  async getAllEvents() {
    return this.adminService.findAllEvents();
  }

  @Patch('events/:eventId')
  async updateEvent(
    @Param('eventId') eventId: string,
    @Body() dto: Partial<CreateEventDto>
  ) {
    return this.adminService.updateEvent(eventId, dto);
  }

  @Delete('events/:eventId')
  async deleteEvent(@Param('eventId') eventId: string) {
    return this.adminService.deleteEvent(eventId);
  }

  // ==========================================
  // 5. CLIENT PORTAL DEPENDENCIES (DOCUMENTS, REPORTS, UPDATES, NOTIFICATIONS)
  // ==========================================

  // Deliverables & Documents
  @Post('clients/:clientId/documents')
  async addDocument(
    @Param('clientId') clientId: string,
    @Body() dto: CreateDocumentDto
  ) {
    return this.adminService.addDocument(clientId, dto);
  }

  @Get('clients/:clientId/documents')
  async getDocuments(@Param('clientId') clientId: string) {
    return this.adminService.getDocuments(clientId);
  }

  @Delete('clients/:clientId/documents/:docId')
  async deleteDocument(
    @Param('clientId') clientId: string,
    @Param('docId') docId: string
  ) {
    return this.adminService.deleteDocument(clientId, docId);
  }

  // Quarterly Reports
  @Post('clients/:clientId/reports')
  async addReport(
    @Param('clientId') clientId: string,
    @Body() dto: CreateReportDto
  ) {
    return this.adminService.addReport(clientId, dto);
  }

  @Get('clients/:clientId/reports')
  async getReports(@Param('clientId') clientId: string) {
    return this.adminService.getReports(clientId);
  }

  @Delete('clients/:clientId/reports/:reportId')
  async deleteReport(
    @Param('clientId') clientId: string,
    @Param('reportId') reportId: string
  ) {
    return this.adminService.deleteReport(clientId, reportId);
  }

  // Business Updates & Announcements
  @Post('clients/:clientId/updates')
  async addUpdate(
    @Param('clientId') clientId: string,
    @Body() dto: CreateUpdateDto
  ) {
    return this.adminService.addUpdate(clientId, dto);
  }

  @Delete('clients/:clientId/updates/:updateId')
  async deleteUpdate(
    @Param('clientId') clientId: string,
    @Param('updateId') updateId: string
  ) {
    return this.adminService.deleteUpdate(clientId, updateId);
  }

  // Direct Notifications Dispatch
  @Post('clients/:clientId/notifications')
  async sendNotification(
    @Param('clientId') clientId: string,
    @Body() dto: CreateNotificationDto
  ) {
    return this.adminService.sendNotification(clientId, dto);
  }
}
