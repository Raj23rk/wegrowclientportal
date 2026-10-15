import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../schemas/client.schema';
import { ActionItem, ActionItemDocument } from '../schemas/action-item.schema';
import { Session, SessionDocument } from '../schemas/session.schema';
import { Report, ReportDocument } from '../schemas/report.schema';
import { BusinessUpdate, UpdateDocument } from '../schemas/update.schema';
import { ClientEvent, EventDocument } from '../schemas/event.schema';
import { ClientPhoto, PhotoDocument } from '../schemas/photo.schema';
import { DocumentItem, DocumentItemDocument } from '../schemas/document.schema';
import { NotificationItem, NotificationDocument } from '../schemas/notification.schema';
import { SessionFeedback, FeedbackDocument } from '../schemas/feedback.schema';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(ActionItem.name) private actionModel: Model<ActionItemDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    @InjectModel(BusinessUpdate.name) private updateModel: Model<UpdateDocument>,
    @InjectModel(ClientEvent.name) private eventModel: Model<EventDocument>,
    @InjectModel(ClientPhoto.name) private photoModel: Model<PhotoDocument>,
    @InjectModel(DocumentItem.name) private documentModel: Model<DocumentItemDocument>,
    @InjectModel(NotificationItem.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(SessionFeedback.name) private feedbackModel: Model<FeedbackDocument>
  ) {}

  async findAll(): Promise<Client[]> {
    return this.clientModel.find().lean();
  }

  async findByClientId(clientId: string): Promise<any> {
    const client = await this.clientModel.findOne({ clientId }).lean();
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    // Fetch related collections for full portal view
    const [actions, sessions, reports, updates, events, photos, documents, notifications, feedback] =
      await Promise.all([
        this.actionModel.find({ clientId }).lean(),
        this.sessionModel.find({ clientId }).sort({ date: 1 }).lean(),
        this.reportModel.find({ clientId }).sort({ date: -1 }).lean(),
        this.updateModel.find({ clientId }).sort({ date: -1 }).lean(),
        this.eventModel.find().sort({ date: 1 }).lean(),
        this.photoModel.find({ clientId }).sort({ date: -1 }).lean(),
        this.documentModel.find({ clientId }).sort({ date: -1 }).lean(),
        this.notificationModel.find({ clientId }).sort({ date: -1 }).lean(),
        this.feedbackModel.find({ clientId }).sort({ date: -1 }).lean()
      ]);

    return {
      ...client,
      actions,
      sessions,
      reports,
      updates,
      events,
      photos,
      documents,
      notifications,
      feedback
    };
  }

  async updateProfile(clientId: string, patch: Partial<Client>): Promise<Client> {
    const updated = await this.clientModel.findOneAndUpdate(
      { clientId },
      { $set: patch },
      { new: true }
    );
    if (!updated) {
      throw new NotFoundException(`Client ${clientId} not found`);
    }
    return updated;
  }
}
