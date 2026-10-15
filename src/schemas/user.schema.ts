import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: null })
  clientId: string | null;

  @Prop({ required: true, enum: ['client', 'admin'], default: 'client' })
  role: 'client' | 'admin';

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  title: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
