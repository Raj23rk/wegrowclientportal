import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { Client, ClientSchema } from '../schemas/client.schema';
import { ActionItem, ActionItemSchema } from '../schemas/action-item.schema';
import { Session, SessionSchema } from '../schemas/session.schema';
import { Report, ReportSchema } from '../schemas/report.schema';
import { BusinessUpdate, BusinessUpdateSchema } from '../schemas/update.schema';
import { ClientEvent, ClientEventSchema } from '../schemas/event.schema';
import { ClientPhoto, ClientPhotoSchema } from '../schemas/photo.schema';
import { DocumentItem, DocumentItemSchema } from '../schemas/document.schema';
import { NotificationItem, NotificationItemSchema } from '../schemas/notification.schema';
import { SessionFeedback, SessionFeedbackSchema } from '../schemas/feedback.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Client.name, schema: ClientSchema },
      { name: ActionItem.name, schema: ActionItemSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Report.name, schema: ReportSchema },
      { name: BusinessUpdate.name, schema: BusinessUpdateSchema },
      { name: ClientEvent.name, schema: ClientEventSchema },
      { name: ClientPhoto.name, schema: ClientPhotoSchema },
      { name: DocumentItem.name, schema: DocumentItemSchema },
      { name: NotificationItem.name, schema: NotificationItemSchema },
      { name: SessionFeedback.name, schema: SessionFeedbackSchema }
    ])
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService]
})
export class ClientsModule {}
