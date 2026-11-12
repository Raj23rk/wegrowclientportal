import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClientDocument = Client & Document;

@Schema({ _id: false })
export class MonthPlan {
  @Prop({ default: 1 })
  n: number;

  @Prop({ default: '' })
  key: string;

  @Prop({ default: '' })
  name: string;

  @Prop({ default: 2026 })
  year: number;

  @Prop({ default: '' })
  theme: string;

  @Prop({ default: '' })
  objective: string;

  @Prop({ type: [String], default: [] })
  focus: string[];

  @Prop({ default: '' })
  outcome: string;

  @Prop({ default: '' })
  notes: string;
}

@Schema({ _id: false })
export class ScorePoint {
  @Prop({ required: true })
  m: string;

  @Prop({ required: true })
  v: number;
}

@Schema({ _id: false })
export class DeptMetric {
  @Prop({ required: true })
  k: string;

  @Prop({ required: true })
  prev: number;

  @Prop({ required: true })
  v: number;
}

@Schema({ timestamps: true })
export class Client {
  @Prop({ required: true, unique: true })
  clientId: string;

  @Prop({ required: true })
  company: string;

  @Prop({ default: '' })
  short: string;

  @Prop({ default: '#C2410C' })
  color: string;

  @Prop({ default: 'Management & Consulting' })
  industry: string;

  @Prop({ default: '50-100 employees' })
  size: string;

  @Prop({ default: 'Bangalore' })
  city: string;

  @Prop({ default: 'Bangalore, India' })
  location: string;

  @Prop({ required: true })
  contact: string;

  @Prop({ default: 'Managing Director' })
  contactTitle: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  start: string;

  @Prop({ default: '' })
  end: string;

  @Prop({ default: 'Dr. Thavabalan' })
  consultant: string;

  @Prop({ type: [String], default: [] })
  areas: string[];

  @Prop({ type: Object, default: {} })
  people: Record<string, string>;

  @Prop({ type: [ScorePoint], default: [] })
  scoreHistory: ScorePoint[];

  @Prop({ type: [DeptMetric], default: [] })
  dept: DeptMetric[];

  @Prop({ type: Object, default: null })
  logo?: any;

  @Prop({ default: 'Active' })
  status: string;

  @Prop({ type: [MonthPlan], default: [] })
  months: MonthPlan[];
}

export const ClientSchema = SchemaFactory.createForClass(Client);
