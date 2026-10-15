import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UpdateDocument = BusinessUpdate & Document;

@Schema({ timestamps: true })
export class BusinessUpdate {
  @Prop({ required: true, index: true })
  clientId: string;

  @Prop({ required: true })
  updateId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  cat: string;

  @Prop({
    required: true,
    enum: ['General Update', 'Important Update', 'Action Required', 'Milestone', 'Recommendation'],
    default: 'General Update'
  })
  type: string;
}

export const BusinessUpdateSchema = SchemaFactory.createForClass(BusinessUpdate);
BusinessUpdateSchema.index({ clientId: 1, updateId: 1 }, { unique: true });
