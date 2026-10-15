import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException
} from '@nestjs/common';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('portal')
@UseGuards(JwtAuthGuard)
export class PortalController {
  constructor(private portalService: PortalService) {}

  @Post(':clientId/actions/:actionId/comments')
  async addComment(
    @Param('clientId') clientId: string,
    @Param('actionId') actionId: string,
    @Body('text') text: string,
    @Request() req: any
  ) {
    if (req.user.role !== 'admin' && req.user.clientId !== clientId) {
      throw new ForbiddenException('Access denied');
    }
    return this.portalService.addActionComment(clientId, actionId, req.user.name, text);
  }

  @Post(':clientId/feedback')
  async submitFeedback(
    @Param('clientId') clientId: string,
    @Body()
    body: {
      session: string;
      rating: number;
      useful: string;
      relevance: string;
      improve: string;
      comments: string;
    },
    @Request() req: any
  ) {
    if (req.user.role !== 'admin' && req.user.clientId !== clientId) {
      throw new ForbiddenException('Access denied');
    }
    return this.portalService.submitFeedback(
      clientId,
      body.session,
      body.rating,
      body.useful,
      body.relevance,
      body.improve,
      body.comments
    );
  }

  @Post('admin/publish')
  async publishUpdate(
    @Body()
    body: {
      clientId: string;
      title: string;
      type: string;
      cat: string;
      body: string;
    },
    @Request() req: any
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only consultants can publish updates');
    }
    return this.portalService.publishUpdate(
      body.clientId,
      body.title,
      body.type,
      body.cat,
      body.body
    );
  }

  @Patch(':clientId/notifications/:notifId/read')
  async markNotificationRead(
    @Param('clientId') clientId: string,
    @Param('notifId') notifId: string,
    @Request() req: any
  ) {
    if (req.user.role !== 'admin' && req.user.clientId !== clientId) {
      throw new ForbiddenException('Access denied');
    }
    return this.portalService.markNotificationRead(clientId, notifId);
  }

  @Patch(':clientId/notifications/read-all')
  async markAllNotificationsRead(
    @Param('clientId') clientId: string,
    @Request() req: any
  ) {
    if (req.user.role !== 'admin' && req.user.clientId !== clientId) {
      throw new ForbiddenException('Access denied');
    }
    return this.portalService.markAllNotificationsRead(clientId);
  }

  @Post(':clientId/events/:eventId/toggle-registration')
  async toggleRegistration(
    @Param('clientId') clientId: string,
    @Param('eventId') eventId: string,
    @Request() req: any
  ) {
    if (req.user.role !== 'admin' && req.user.clientId !== clientId) {
      throw new ForbiddenException('Access denied');
    }
    return {
      registered: await this.portalService.toggleEventRegistration(clientId, eventId)
    };
  }
}
