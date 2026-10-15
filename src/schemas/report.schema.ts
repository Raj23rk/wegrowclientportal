import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema({ timestamps: true })
export class Report {
  @Prop({ required: true, index: true })
  clientId: string;

  @Prop({ required: true })
  reportId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  cat: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  desc: string;

  @Prop({ required: true, default: 1 })
  pages: number;

  @Prop({ default: '' })
  fileUrl: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
ReportSchema.index({ clientId: 1, reportId: 1 }, { unique: true });
