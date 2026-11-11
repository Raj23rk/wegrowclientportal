import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttendeeDocument = Attendee & Document;

@Schema({ timestamps: true })
export class Attendee {
  @Prop({ required: true, unique: true, index: true, trim: true, uppercase: true })
  passCode: string; // e.g. WG-LDP-001

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ default: '', trim: true })
  email: string;

  @Prop({ default: 'TAG Group', trim: true })
  companyName: string;

  @Prop({ required: true, trim: true })
  designation: string;

  @Prop({ default: 'Operations', trim: true })
  department: string;

  @Prop({ default: '3 – 5 Years', trim: true })
  experience: string;

  @Prop({ default: () => new Date().toISOString() })
  registeredAt: string;

  @Prop({ default: true })
  codeSentWhatsApp: boolean;

  @Prop({ default: true })
  codeSentEmail: boolean;

  @Prop({ default: false })
  isCheckedIn: boolean;

  @Prop({ default: null })
  checkInTime: string | null;

  @Prop({ default: false })
  feedbackFilled: boolean;

  @Prop({ default: null })
  feedbackRating: number | null;

  @Prop({ default: '' })
  feedbackNotes: string;
}

export const AttendeeSchema = SchemaFactory.createForClass(Attendee);

