import { z } from "zod";

// ============================================
// Auth Validations
// ============================================

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  phone: z.string().optional(),
  role: z.enum(["STUDENT", "FACULTY", "COORDINATOR", "ADMIN", "AUTHORITY", "RECORDS"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================
// Course Validations
// ============================================

export const courseSchema = z.object({
  name: z.string().min(2, "Course name is required").max(200),
  code: z.string().min(2, "Course code is required").max(20),
  description: z.string().optional(),
  durationMonths: z.number().int().min(1).max(60),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).default("ACTIVE"),
});

export type CourseInput = z.infer<typeof courseSchema>;

// ============================================
// Batch Validations
// ============================================

export const batchSchema = z.object({
  name: z.string().min(2, "Batch name is required").max(100),
  courseId: z.string().min(1, "Course is required"),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional(),
  capacity: z.number().int().min(1).max(200).default(30),
  status: z.enum(["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"]).default("UPCOMING"),
});

export type BatchInput = z.infer<typeof batchSchema>;

// ============================================
// Subject Validations
// ============================================

export const subjectSchema = z.object({
  name: z.string().min(2, "Subject name is required").max(200),
  code: z.string().min(2, "Subject code is required").max(20),
  courseId: z.string().min(1, "Course is required"),
  credits: z.number().int().min(1).max(10).default(3),
});

export type SubjectInput = z.infer<typeof subjectSchema>;

// ============================================
// Student Validations
// ============================================

export const studentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  courseId: z.string().min(1, "Course is required"),
  batchId: z.string().min(1, "Batch is required"),
  enrollmentNo: z.string().optional(),
  parentPhone: z.string().optional(),
  address: z.string().optional(),
});

export type StudentInput = z.infer<typeof studentSchema>;

// ============================================
// Faculty Validations
// ============================================

export const facultySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.number().int().min(0).optional(),
  qualification: z.string().optional(),
});

export type FacultyInput = z.infer<typeof facultySchema>;

// ============================================
// Class Session Validations
// ============================================

export const classSessionSchema = z.object({
  batchId: z.string().min(1, "Batch is required"),
  subjectId: z.string().min(1, "Subject is required"),
  facultyId: z.string().min(1, "Faculty is required"),
  date: z.string().or(z.date()),
  startTime: z.string(),
  endTime: z.string(),
  room: z.string().optional(),
  meetLink: z.string().url().optional().or(z.literal("")),
  topic: z.string().optional(),
});

export type ClassSessionInput = z.infer<typeof classSessionSchema>;

// ============================================
// Feedback Validations
// ============================================

export const feedbackSchema = z.object({
  facultyId: z.string().optional(),
  subjectId: z.string().optional(),
  message: z.string().min(10, "Feedback must be at least 10 characters"),
  rating: z.number().int().min(1).max(5).default(5),
  isAnonymous: z.boolean().default(false),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

// ============================================
// Notification Validations
// ============================================

export const notificationSchema = z.object({
  title: z.string().min(3, "Title is required"),
  message: z.string().min(5, "Message is required"),
  type: z.enum(["INFO", "WARNING", "SUCCESS", "URGENT"]).default("INFO"),
  targetRole: z.enum(["STUDENT", "FACULTY", "COORDINATOR", "ADMIN", "AUTHORITY", "RECORDS"]).optional(),
  targetBatchId: z.string().optional(),
});

export type NotificationInput = z.infer<typeof notificationSchema>;
