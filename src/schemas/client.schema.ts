import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClientDocument = Client & Document;

@Schema({ _id: false })
export class MonthPlan {
  @Prop({ required: true })
  n: number;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  theme: string;

  @Prop({ required: true })
  objective: string;

  @Prop({ type: [String], default: [] })
  focus: string[];

  @Prop({ required: true })
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

  @Prop({ required: true })
  short: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  industry: string;

  @Prop({ required: true })
  size: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  contact: string;

  @Prop({ required: true })
  contactTitle: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  start: string;

  @Prop({ required: true })
  end: string;

  @Prop({ required: true })
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
