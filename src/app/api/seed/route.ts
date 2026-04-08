import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { Role } from '@/generated/prisma';

export async function GET() {
  try {
    // 1. Create Admin User
    const adminEmail = 'admin@wish2skill.com';
    let admin = await db.user.findUnique({ where: { email: adminEmail } });

    if (!admin) {
      const passwordHash = await bcrypt.hash('Password123', 12);
      admin = await db.user.create({
        data: {
          name: 'System Admin',
          email: adminEmail,
          passwordHash,
          role: Role.ADMIN,
          status: 'ACTIVE'
        }
      });
    }

    // 2. Create Faculty User
    const facultyEmail = 'faculty@wish2skill.com';
    let faculty = await db.user.findUnique({ where: { email: facultyEmail } });

    if (!faculty) {
      const passwordHash = await bcrypt.hash('Password123', 12);
      faculty = await db.user.create({
        data: {
          name: 'Prof. Sharma',
          email: facultyEmail,
          passwordHash,
          role: Role.FACULTY,
          status: 'ACTIVE',
          faculty: {
            create: {
              specialization: 'Computer Science',
              experience: 8
            }
          }
        }
      });
    }

    // 3. Create Student User
    const studentEmail = 'student@wish2skill.com';
    let student = await db.user.findUnique({ where: { email: studentEmail } });

    if (!student) {
      const course = await db.course.create({
        data: { name: 'Java Full Stack', code: 'JFS', durationMonths: 6, status: 'ACTIVE' }
      });

      const batch = await db.batch.create({
        data: { name: 'JFS-B12', courseId: course.id, startDate: new Date(), status: 'ACTIVE' }
      });

      const passwordHash = await bcrypt.hash('Password123', 12);
      student = await db.user.create({
        data: {
          name: 'Rahul Kumar',
          email: studentEmail,
          passwordHash,
          role: Role.STUDENT,
          status: 'ACTIVE',
          student: {
            create: { enrollmentNo: 'ENR-2026-001', courseId: course.id, batchId: batch.id }
          }
        }
      });
    }

    // 4. Create Coordinator User
    const coordEmail = 'coord@wish2skill.com';
    let coord = await db.user.findUnique({ where: { email: coordEmail } });

    if (!coord) {
      const passwordHash = await bcrypt.hash('Password123', 12);
      coord = await db.user.create({
        data: {
          name: 'Exam Coordinator',
          email: coordEmail,
          passwordHash,
          role: Role.COORDINATOR,
          status: 'ACTIVE'
        }
      });
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully with demo users!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
