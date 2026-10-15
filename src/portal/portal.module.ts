import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { ActionItem, ActionItemSchema } from '../schemas/action-item.schema';
import { BusinessUpdate, BusinessUpdateSchema } from '../schemas/update.schema';
import { ClientEvent, ClientEventSchema } from '../schemas/event.schema';
import { SessionFeedback, SessionFeedbackSchema } from '../schemas/feedback.schema';
import { NotificationItem, NotificationItemSchema } from '../schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActionItem.name, schema: ActionItemSchema },
      { name: BusinessUpdate.name, schema: BusinessUpdateSchema },
      { name: ClientEvent.name, schema: ClientEventSchema },
      { name: SessionFeedback.name, schema: SessionFeedbackSchema },
      { name: NotificationItem.name, schema: NotificationItemSchema }
    ])
  ],
  controllers: [PortalController],
  providers: [PortalService],
  exports: [PortalService]
})
export class PortalModule {}
