import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FeedbackDocument = SessionFeedback & Document;

@Schema({ timestamps: true })
export class SessionFeedback {
  @Prop({ required: true, index: true })
  clientId: string;

  @Prop({ required: true })
  session: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ default: '' })
  useful: string;

  @Prop({ required: true, default: 'Very Relevant' })
  relevance: string;

  @Prop({ default: '' })
  improve: string;

  @Prop({ default: '' })
  comments: string;

  @Prop({ required: true })
  date: string;
}

export const SessionFeedbackSchema = SchemaFactory.createForClass(SessionFeedback);
SessionFeedbackSchema.index({ clientId: 1, session: 1 });
