import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ _id: false })
export class SessionSummary {
  @Prop({ type: [String], default: [] })
  participants: string[];

  @Prop({ type: [String], default: [] })
  discussions: string[];

  @Prop({ type: [String], default: [] })
  findings: string[];

  @Prop({ type: [String], default: [] })
  decisions: string[];

  @Prop({ type: [String], default: [] })
  next: string[];
}

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true, index: true })
  clientId: string;

  @Prop({ required: true })
  sessionId: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: ['In person', 'Online'] })
  mode: string;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  location: string;

  @Prop({ default: '' })
  link: string;

  @Prop({ required: true })
  consultant: string;

  @Prop({ type: [String], default: [] })
  agenda: string[];

  @Prop({ type: [String], default: [] })
  objectives: string[];

  @Prop({ required: true, enum: ['Completed', 'Upcoming'], default: 'Upcoming' })
  status: string;

  @Prop({ type: SessionSummary, default: null })
  summary: SessionSummary | null;

  @Prop({ type: [String], default: [] })
  attachments: string[];
}

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.index({ clientId: 1, sessionId: 1 }, { unique: true });
