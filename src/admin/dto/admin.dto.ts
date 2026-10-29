import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNumber,
  IsArray,
  IsBoolean,
  Min,
  Max
} from 'class-validator';

// ---------------- CLIENT DTOs ----------------
export class CreateClientDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsOptional()
  @IsString()
  short?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsString()
  @IsNotEmpty()
  contact: string;

  @IsOptional()
  @IsString()
  contactTitle?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  start?: string;

  @IsOptional()
  @IsString()
  end?: string;

  @IsOptional()
  @IsString()
  consultant?: string;

  @IsOptional()
  @IsArray()
  areas?: string[];

  @IsOptional()
  people?: Record<string, string>;

  @IsOptional()
  @IsArray()
  months?: any[];

  @IsOptional()
  logo?: any;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  status?: string;

  // Optional: create login user immediately for the primary contact
  @IsOptional()
  @IsString()
  initialPassword?: string;
}

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  short?: string;

  @IsOptional()
  logo?: any;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  contactTitle?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  start?: string;

  @IsOptional()
  @IsString()
  end?: string;

  @IsOptional()
  @IsString()
  consultant?: string;

  @IsOptional()
  @IsArray()
  areas?: string[];

  @IsOptional()
  people?: Record<string, string>;

  @IsOptional()
  @IsArray()
  scoreHistory?: any[];

  @IsOptional()
  @IsArray()
  dept?: any[];

  @IsOptional()
  @IsArray()
  months?: any[];
}

// ---------------- COMPANY MEMBER DTOs ----------------
export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(['client', 'admin'])
  role?: 'client' | 'admin';

  @IsOptional()
  @IsString()
  deptKey?: string; // Optional: 'ceo', 'ops', 'hr', 'fin', etc.
}

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  isActive?: boolean;
}

// ---------------- TASK / ACTION ITEM DTOs ----------------
export class CreateTaskDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  actionId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsNumber()
  month?: number;

  @IsOptional()
  @IsEnum(['High', 'Medium', 'Low'])
  priority?: 'High' | 'Medium' | 'Low';

  @IsString()
  @IsNotEmpty()
  owner: string;

  @IsString()
  @IsNotEmpty()
  due: string;

  @IsOptional()
  @IsEnum(['Not Started', 'In Progress', 'Under Review', 'Completed', 'Delayed'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsArray()
  attachments?: any[];

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsBoolean()
  notify?: boolean;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsNumber()
  month?: number;

  @IsOptional()
  @IsEnum(['High', 'Medium', 'Low'])
  priority?: 'High' | 'Medium' | 'Low';

  @IsOptional()
  @IsString()
  owner?: string;

  @IsOptional()
  @IsString()
  due?: string;

  @IsOptional()
  @IsEnum(['Not Started', 'In Progress', 'Under Review', 'Completed', 'Delayed'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsArray()
  attachments?: any[];

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsBoolean()
  notify?: boolean;
}

// ---------------- SESSION / CALENDAR MEETING DTOs ----------------
export class CreateSessionDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  date: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  time?: string; // e.g. "10:00 AM - 1:00 PM"

  @IsOptional()
  @IsString()
  start?: string;

  @IsOptional()
  @IsString()
  end?: string;

  @IsOptional()
  @IsNumber()
  duration?: number; // In hours or minutes (e.g. 3)

  @IsOptional()
  @IsEnum(['In person', 'Online'])
  mode?: 'In person' | 'Online';

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  link?: string; // Meeting URL

  @IsOptional()
  @IsString()
  consultant?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  agenda?: string[];

  @IsOptional()
  @IsArray()
  objectives?: string[];

  @IsOptional()
  @IsEnum(['Completed', 'Upcoming', 'Cancelled'])
  status?: 'Completed' | 'Upcoming' | 'Cancelled';

  @IsOptional()
  @IsArray()
  attachments?: any[];

  @IsOptional()
  @IsBoolean()
  notify?: boolean;

  @IsOptional()
  summary?: {
    participants?: string[];
    discussions?: string[];
    findings?: string[];
    decisions?: string[];
    next?: string[];
    file?: any;
  };
}

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  start?: string;

  @IsOptional()
  @IsString()
  end?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsEnum(['In person', 'Online'])
  mode?: 'In person' | 'Online';

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  consultant?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  agenda?: string[];

  @IsOptional()
  @IsArray()
  objectives?: string[];

  @IsOptional()
  @IsEnum(['Completed', 'Upcoming', 'Cancelled'])
  status?: 'Completed' | 'Upcoming' | 'Cancelled';

  @IsOptional()
  @IsArray()
  attachments?: any[];

  @IsOptional()
  @IsBoolean()
  notify?: boolean;

  @IsOptional()
  summary?: {
    participants?: string[];
    discussions?: string[];
    findings?: string[];
    decisions?: string[];
    next?: string[];
  };
}

// ---------------- EVENT DTOs ----------------
export class CreateEventDto {
  @IsOptional()
  @IsString()
  eventId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsString()
  @IsNotEmpty()
  loc: string;

  @IsString()
  @IsNotEmpty()
  desc: string;

  @IsOptional()
  @IsArray()
  agenda?: string[];

  @IsOptional()
  @IsArray()
  speakers?: string[];

  @IsOptional()
  @IsString()
  participants?: string;

  @IsOptional()
  @IsNumber()
  seats?: number;

  @IsOptional()
  @IsNumber()
  hue?: number;
}

// ---------------- DOCUMENT DTOs ----------------
export class CreateDocumentDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  docId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  cat: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  by?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  storagePath?: string;
}

// ---------------- REPORT DTOs ----------------
export class CreateReportDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  reportId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  cat: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsString()
  @IsNotEmpty()
  desc: string;

  @IsOptional()
  @IsNumber()
  pages?: number;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}

// ---------------- UPDATE / ANNOUNCEMENT DTOs ----------------
export class CreateUpdateDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  updateId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  cat?: string;

  @IsOptional()
  @IsEnum(['General Update', 'Important Update', 'Action Required', 'Milestone', 'Recommendation'])
  type?: string;
}

// ---------------- NOTIFICATION DTOs ----------------
export class CreateNotificationDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsEnum(['Sessions', 'Action Plan', 'Reports', 'Events', 'Important'])
  cat?: string;

  @IsOptional()
  @IsString()
  link?: string;
}
