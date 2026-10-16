import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Client, ClientSchema } from '../schemas/client.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { ActionItem, ActionItemSchema } from '../schemas/action-item.schema';
import { Session, SessionSchema } from '../schemas/session.schema';
import { ClientEvent, ClientEventSchema } from '../schemas/event.schema';
import { DocumentItem, DocumentItemSchema } from '../schemas/document.schema';
import { Report, ReportSchema } from '../schemas/report.schema';
import { BusinessUpdate, BusinessUpdateSchema } from '../schemas/update.schema';
import { NotificationItem, NotificationItemSchema } from '../schemas/notification.schema';
import { SessionFeedback, SessionFeedbackSchema } from '../schemas/feedback.schema';
import { ClientPhoto, ClientPhotoSchema } from '../schemas/photo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Client.name, schema: ClientSchema },
      { name: User.name, schema: UserSchema },
      { name: ActionItem.name, schema: ActionItemSchema },
      { name: Session.name, schema: SessionSchema },
      { name: ClientEvent.name, schema: ClientEventSchema },
      { name: DocumentItem.name, schema: DocumentItemSchema },
      { name: Report.name, schema: ReportSchema },
      { name: BusinessUpdate.name, schema: BusinessUpdateSchema },
      { name: NotificationItem.name, schema: NotificationItemSchema },
      { name: SessionFeedback.name, schema: SessionFeedbackSchema },
      { name: ClientPhoto.name, schema: ClientPhotoSchema }
    ])
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AdminModule {}
