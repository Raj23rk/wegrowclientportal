import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = NotificationItem & Document;

@Schema({ timestamps: true })
export class NotificationItem {
  @Prop({ required: true, index: true })
  clientId: string;

  @Prop({ required: true })
  notifId: string;

  @Prop({
    required: true,
    enum: ['Sessions', 'Action Plan', 'Reports', 'Events', 'Important']
  })
  cat: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true, default: false })
  read: boolean;

  @Prop({ required: true })
  link: string;
}

export const NotificationItemSchema = SchemaFactory.createForClass(NotificationItem);
NotificationItemSchema.index({ clientId: 1, notifId: 1 }, { unique: true });
