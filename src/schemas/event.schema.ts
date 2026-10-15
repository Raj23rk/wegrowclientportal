import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = ClientEvent & Document;

@Schema({ timestamps: true })
export class ClientEvent {
  @Prop({ required: true, unique: true })
  eventId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  loc: string;

  @Prop({ required: true })
  desc: string;

  @Prop({ type: [String], default: [] })
  agenda: string[];

  @Prop({ type: [String], default: [] })
  speakers: string[];

  @Prop({ required: true })
  participants: string;

  @Prop({ required: true, default: 50 })
  seats: number;

  @Prop({ required: true, default: 220 })
  hue: number;

  @Prop({ type: [String], default: [] })
  registeredClientIds: string[];
}

export const ClientEventSchema = SchemaFactory.createForClass(ClientEvent);
