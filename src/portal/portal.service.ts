import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActionItem, ActionItemDocument } from '../schemas/action-item.schema';
import { BusinessUpdate, UpdateDocument } from '../schemas/update.schema';
import { ClientEvent, EventDocument } from '../schemas/event.schema';
import { SessionFeedback, FeedbackDocument } from '../schemas/feedback.schema';
import { NotificationItem, NotificationDocument } from '../schemas/notification.schema';
import { TODAY } from '../seed-data';

@Injectable()
export class PortalService {
  constructor(
    @InjectModel(ActionItem.name) private actionModel: Model<ActionItemDocument>,
    @InjectModel(BusinessUpdate.name) private updateModel: Model<UpdateDocument>,
    @InjectModel(ClientEvent.name) private eventModel: Model<EventDocument>,
    @InjectModel(SessionFeedback.name) private feedbackModel: Model<FeedbackDocument>,
    @InjectModel(NotificationItem.name) private notificationModel: Model<NotificationDocument>
  ) {}

  async addActionComment(clientId: string, actionId: string, authorName: string, text: string) {
    const action = await this.actionModel.findOne({ clientId, actionId });
    if (!action) {
      throw new NotFoundException(`Action item ${actionId} not found`);
    }

    action.comments.push({
      by: authorName,
      date: TODAY,
      text
    });
    await action.save();
    return action;
  }

  async submitFeedback(
    clientId: string,
    sessionId: string,
    rating: number,
    useful: string,
    relevance: string,
    improve: string,
    comments: string
  ) {
    const existing = await this.feedbackModel.findOne({ clientId, session: sessionId });
    if (existing) {
      existing.rating = rating;
      existing.useful = useful;
      existing.relevance = relevance;
      existing.improve = improve;
      existing.comments = comments;
      existing.date = TODAY;
      await existing.save();
      return existing;
    }

    return this.feedbackModel.create({
      clientId,
      session: sessionId,
      rating,
      useful,
      relevance,
      improve,
      comments,
      date: TODAY
    });
  }

  async publishUpdate(
    clientId: string,
    title: string,
    type: string,
    cat: string,
    body: string
  ) {
    const updateId = 'UP' + Date.now();
    const update = await this.updateModel.create({
      clientId,
      updateId,
      title,
      type,
      cat,
      body,
      date: TODAY
    });

    // Also dispatch notification to the client
    await this.notificationModel.create({
      clientId,
      notifId: 'NP' + Date.now(),
      cat: type === 'Action Required' ? 'Important' : 'Important',
      text: `New update: ${title}`,
      date: TODAY,
      read: false,
      link: '#/updates'
    });

    return update;
  }

  async markNotificationRead(clientId: string, notifId: string) {
    return this.notificationModel.findOneAndUpdate(
      { clientId, notifId },
      { $set: { read: true } },
      { new: true }
    );
  }

  async markAllNotificationsRead(clientId: string) {
    return this.notificationModel.updateMany({ clientId }, { $set: { read: true } });
  }

  async toggleEventRegistration(clientId: string, eventId: string): Promise<boolean> {
    const event = await this.eventModel.findOne({ eventId });
    if (!event) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }

    const isRegistered = event.registeredClientIds.includes(clientId);
    if (isRegistered) {
      event.registeredClientIds = event.registeredClientIds.filter((id) => id !== clientId);
      await event.save();
      return false;
    } else {
      event.registeredClientIds.push(clientId);
      await event.save();
      return true;
    }
  }
}
