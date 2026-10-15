import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PhotoDocument = ClientPhoto & Document;

@Schema({ timestamps: true })
export class ClientPhoto {
  @Prop({ required: true, index: true })
  clientId: string;

  @Prop({ required: true })
  photoId: string;

  @Prop({ required: true })
  cat: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  desc: string;

  @Prop({ required: true, default: 210 })
  hue: number;

  @Prop({ required: true, default: 1 })
  seed: number;

  @Prop({ default: '' })
  imageUrl: string;
}

export const ClientPhotoSchema = SchemaFactory.createForClass(ClientPhoto);
ClientPhotoSchema.index({ clientId: 1, photoId: 1 }, { unique: true });
