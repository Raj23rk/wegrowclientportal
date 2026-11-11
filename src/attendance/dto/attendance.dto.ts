import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class RegisterAttendeeDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsNotEmpty()
  designation: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  experience?: string;
}

export class GateCheckInDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class UpdateFeedbackDto {
  @IsBoolean()
  @IsOptional()
  feedbackFilled?: boolean;

  @IsNumber()
  @IsOptional()
  feedbackRating?: number;

  @IsString()
  @IsOptional()
  feedbackNotes?: string;
}

export class UpdateDispatchDto {
  @IsString()
  @IsNotEmpty()
  channel: 'wa' | 'mail';
}

