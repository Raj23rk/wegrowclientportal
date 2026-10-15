import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DocumentItemDocument = DocumentItem & Document;

@Schema({ timestamps: true })
export class DocumentItem {
  @Prop({ required: true, index: true })
  clientId: string;

  @Prop({ required: true })
  docId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  cat: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  by: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  size: string;

  @Prop({ default: '' })
  storagePath: string;
}

export const DocumentItemSchema = SchemaFactory.createForClass(DocumentItem);
DocumentItemSchema.index({ clientId: 1, docId: 1 }, { unique: true });
