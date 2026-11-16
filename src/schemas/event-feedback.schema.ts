import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventFeedbackDocument = EventFeedback & Document;

@Schema({ timestamps: true })
export class EventFeedback {
  @Prop({ default: '', trim: true })
  name: string; // Optional

  @Prop({ default: '', trim: true })
  designation: string;

  @Prop({ default: '', trim: true })
  department: string;

  @Prop({ default: '2026-11-19', trim: true })
  date: string;

  @Prop({ default: 'WeGrow B School Lead Trainer', trim: true })
  trainer: string;

  // Section A: Programme content
  @Prop({ type: Object, default: {} })
  programmeContent: {
    q1?: string;
    q2?: string;
    q3?: string;
    q4?: string;
    q5?: string;
  };

  // Section B: Trainer / facilitator
  @Prop({ type: Object, default: {} })
  trainerFacilitator: {
    q1?: string;
    q2?: string;
    q3?: string;
    q4?: string;
    q5?: string;
  };

  // Section C: Activities & case studies
  @Prop({ type: Object, default: {} })
  activities: {
    selfAwareness?: string;
    leadershipStyle?: string;
    situationalLeadership?: string;
    workplaceChallenge?: string;
  };

  // Section D: Learning & application
  @Prop({ type: Object, default: {} })
  learningApplication: {
    q1?: string;
    q2?: string;
    q3?: string;
    q4?: string;
  };

  // Section E: Arrangements & logistics
  @Prop({ type: Object, default: {} })
  arrangementsLogistics: {
    venueSeating?: string;
    audioVisual?: string;
    foodRefreshments?: string;
    scheduleBreaks?: string;
  };

  // Section F: Overall
  @Prop({ default: 'Excellent' })
  overallRating: string; // Excellent | Very good | Good | Average | Poor

  @Prop({ default: 'Right' })
  programmeDuration: string; // Short | Right | Long

  @Prop({ default: 'Yes' })
  recommend: string; // Yes | Maybe | No

  // Section G: Comments
  @Prop({ default: '' })
  mostUseful: string;

  @Prop({ default: '' })
  leastUseful: string;

  @Prop({ default: '' })
  howCanImprove: string;

  @Prop({ default: '' })
  futureTopics: string;

  @Prop({ default: '' })
  otherComments: string;

  @Prop({ default: () => new Date().toISOString() })
  submittedAt: string;
}

export const EventFeedbackSchema = SchemaFactory.createForClass(EventFeedback);
