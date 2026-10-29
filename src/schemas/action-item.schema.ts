import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActionItemDocument = ActionItem & Document;

@Schema({ _id: false })
export class ActionComment {
  @Prop({ required: true })
  by: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  text: string;
}

@Schema({ timestamps: true })
export class ActionItem {
  @Prop({ required: true, index: true })
  clientId: string;

  @Prop({ required: true })
  actionId: string;

  @Prop({ required: true })
  month: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  desc: string;

  @Prop({ required: true, enum: ['High', 'Medium', 'Low'], default: 'Medium' })
  priority: string;

  @Prop({ required: true })
  owner: string;

  @Prop({ required: true })
  due: string;

  @Prop({
    required: true,
    enum: ['Not Started', 'In Progress', 'Under Review', 'Completed', 'Delayed'],
    default: 'Not Started'
  })
  status: string;

  @Prop({ required: true, min: 0, max: 100, default: 0 })
  progress: number;

  @Prop({ type: [ActionComment], default: [] })
  comments: ActionComment[];

  @Prop({ type: Array, default: [] })
  attachments: any[];
}

export const ActionItemSchema = SchemaFactory.createForClass(ActionItem);
ActionItemSchema.index({ clientId: 1, actionId: 1 }, { unique: true });
