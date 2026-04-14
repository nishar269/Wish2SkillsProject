import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import bcrypt from 'bcryptjs';
import { Role } from "@/lib/permissions";

export async function GET(req: Request) {
  const { db } = await import("@/lib/db");
  // Protection: Only allow seeding in development or with a secret key in production
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  
  if (process.env.NODE_ENV === 'production' && key !== process.env.SEED_KEY) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Production seeding requires a valid SEED_KEY.' }, { status: 401 });
  }

  try {
    // 1. Create Admin User
    const adminEmail = 'admin@wish2skill.com';
    let admin = await db.user.findUnique({ where: { email: adminEmail } });

    const passwordHash = await bcrypt.hash('Password123', 12);

    if (!admin) {
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

    // 2. Mock Course & Batch for global use
    const course = await db.course.upsert({
        where: { code: 'JFS' },
        update: {},
        create: { name: 'Java Full Stack', code: 'JFS', durationMonths: 6, status: 'ACTIVE' }
    });

    const batch = await db.batch.upsert({
        where: { name: 'JFS-B12' },
        update: {},
        create: { name: 'JFS-B12', courseId: course.id, startDate: new Date(), status: 'ACTIVE' }
    });

    // 3. Create Subjects
    const subjectsData = [
        { name: "Frontend with React", code: "REACT-101", courseId: course.id, credits: 4 },
        { name: "Backend with Spring Boot", code: "SPRING-101", courseId: course.id, credits: 4 },
        { name: "PostgreSQL Advanced", code: "DB-101", courseId: course.id, credits: 3 },
    ];

    const subjects: any[] = [];
    for (const s of subjectsData) {
        subjects.push(await db.subject.upsert({
            where: { code: s.code },
            update: {},
            create: s
        }));
    }

    // 4. Create Faculty User
    const facultyEmail = 'faculty@wish2skill.com';
    let facultyProfile = await db.faculty.findFirst({ where: { user: { email: facultyEmail } } });

    if (!facultyProfile) {
      const facultyUser = await db.user.upsert({
        where: { email: facultyEmail },
        update: {},
        create: {
            name: 'Prof. Aryan Sharma',
            email: facultyEmail,
            passwordHash,
            role: Role.FACULTY,
            status: 'ACTIVE'
        }
      });

      facultyProfile = await db.faculty.create({
        data: {
            userId: facultyUser.id,
            specialization: 'Software Engineering',
            experience: 8
        }
      });
    }

    // 5. Create Schedules (Class Sessions)
    const sessionsData = [
        { 
            batchId: batch.id, 
            subjectId: subjects[0].id, 
            facultyId: facultyProfile.id, 
            date: new Date(), 
            startTime: new Date(new Date().setHours(10, 0, 0, 0)), 
            endTime: new Date(new Date().setHours(12, 0, 0, 0)),
            room: 'Lab 101',
            topic: 'Introduction to Next.js 16'
        },
        { 
            batchId: batch.id, 
            subjectId: subjects[1].id, 
            facultyId: facultyProfile.id, 
            date: new Date(Date.now() + 86400000), 
            startTime: new Date(new Date().setHours(14, 0, 0, 0)), 
            endTime: new Date(new Date().setHours(16, 0, 0, 0)),
            room: 'Auditorium 2',
            topic: 'Microservices with Spring'
        }
    ];

    for (const session of sessionsData) {
        await db.classSession.create({ data: { ...session, status: 'SCHEDULED' } });
    }

    // 6. Create Student User
    const studentEmail = 'student@wish2skill.com';
    let student = await db.user.findUnique({ where: { email: studentEmail } });

    if (!student) {
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

    // 7. Create Coordinator User
    const coordEmail = 'coord@wish2skill.com';
    let coord = await db.user.findUnique({ where: { email: coordEmail } });

    if (!coord) {
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

    // 8. Create Records User
    const recordsEmail = 'records@wish2skill.com';
    if (!(await db.user.findUnique({ where: { email: recordsEmail } }))) {
        await db.user.create({
            data: {
                name: 'Data Manager',
                email: recordsEmail,
                passwordHash,
                role: Role.RECORDS,
                status: 'ACTIVE'
            }
        });
    }

    // 9. Create Authority User
    const authEmail = 'authority@wish2skill.com';
    if (!(await db.user.findUnique({ where: { email: authEmail } }))) {
        await db.user.create({
            data: {
                name: 'Institutional Head',
                email: authEmail,
                passwordHash,
                role: Role.AUTHORITY,
                status: 'ACTIVE'
            }
        });
    }

    // 10. Create Forum Categories
    const categories = [
        { name: "General Discussions", icon: "MessageSquare", description: "Talk about anything campus related." },
        { name: "Tech & Engineering", icon: "Code", description: "Share projects, code, and technical insights." },
        { name: "Events & News", icon: "Bell", description: "Stay updated with campus happenings." },
        { name: "Project Showcase", icon: "Lightbulb", description: "Show off what you've built!" }
    ];

    for (const cat of categories) {
        await db.forumCategory.upsert({
            where: { name: cat.name },
            update: {},
            create: cat
        });
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully with demo users and forum categories!' });
  } catch (error: any) {
    console.error("SEED_ERROR:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      name: error.name,
      stack: error.stack 
    }, { status: 500 });
  }
}
