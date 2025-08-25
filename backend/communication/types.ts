export interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageRequest {
  recipientId: number;
  subject: string;
  content: string;
}

export interface Announcement {
  id: number;
  authorId: number;
  title: string;
  content: string;
  targetAudience: string;
  courseId?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  targetAudience: string;
  courseId?: number;
}

export interface Warning {
  id: number;
  studentId: number;
  issuedBy: number;
  courseId?: number;
  warningType: string;
  description: string;
  severity: string;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWarningRequest {
  studentId: number;
  courseId?: number;
  warningType: string;
  description: string;
  severity?: string;
}

export interface ListMessagesResponse {
  messages: Message[];
}

export interface ListAnnouncementsResponse {
  announcements: Announcement[];
}

export interface ListWarningsResponse {
  warnings: Warning[];
}
