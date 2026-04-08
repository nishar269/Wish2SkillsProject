import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // 1. Create Admin User
  const adminEmail = 'admin@wish2skill.com';
  
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!admin) {
    const passwordHash = await bcrypt.hash('Password123', 12);
    
    admin = await prisma.user.create({
      data: {
        name: 'System Admin',
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
        status: 'ACTIVE'
      }
    });
    console.log(`Created admin user: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists`);
  }

  // 2. Create Faculty User
  const facultyEmail = 'faculty@wish2skill.com';
  let faculty = await prisma.user.findUnique({
    where: { email: facultyEmail }
  });

  if (!faculty) {
    const passwordHash = await bcrypt.hash('Password123', 12);
    
    faculty = await prisma.user.create({
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
    console.log(`Created faculty user: ${facultyEmail}`);
  }

  // 3. Create Student User
  const studentEmail = 'student@wish2skill.com';
  let student = await prisma.user.findUnique({
    where: { email: studentEmail }
  });

  if (!student) {
    // We need a dummy course and batch first
    const course = await prisma.course.create({
      data: {
        name: 'Java Full Stack',
        code: 'JFS',
        durationMonths: 6,
        status: 'ACTIVE',
      }
    });

    const batch = await prisma.batch.create({
      data: {
        name: 'JFS-B12',
        courseId: course.id,
        startDate: new Date(),
        status: 'ACTIVE'
      }
    });

    const passwordHash = await bcrypt.hash('Password123', 12);
    
    student = await prisma.user.create({
      data: {
        name: 'Rahul Kumar',
        email: studentEmail,
        passwordHash,
        role: Role.STUDENT,
        status: 'ACTIVE',
        student: {
          create: {
            enrollmentNo: 'ENR-2026-001',
            courseId: course.id,
            batchId: batch.id
          }
        }
      }
    });
    console.log(`Created student user & mock course/batch: ${studentEmail}`);
  }

  // 4. Create Coordinator User
  const coordEmail = 'coord@wish2skill.com';
  let coord = await prisma.user.findUnique({
    where: { email: coordEmail }
  });

  if (!coord) {
    const passwordHash = await bcrypt.hash('Password123', 12);
    
    coord = await prisma.user.create({
      data: {
        name: 'Exam Coordinator',
        email: coordEmail,
        passwordHash,
        role: Role.COORDINATOR,
        status: 'ACTIVE'
      }
    });
    console.log(`Created coordinator user: ${coordEmail}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
