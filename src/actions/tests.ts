"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type TestQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
};

type TestInput = {
  title: string;
  batchId: string;
  subjectId: string;
  date: string;
  totalMarks: number;
  questions: TestQuestion[];
};

async function checkFaculty() {
  const session = await auth();
  if (!session || session.user.role !== "FACULTY") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getFacultyTests() {
  const session = await checkFaculty();
  const faculty = await db.faculty.findUnique({ where: { userId: session.user.id } });
  if (!faculty) throw new Error("Faculty profile not found");

  return await db.test.findMany({
    where: { subject: { course: { batches: { some: { id: { not: "" } } } } } }, // Dummy filter or better logic needed
    include: {
      batch: true,
      subject: true,
      _count: { select: { results: true } }
    },
    orderBy: { date: "desc" }
  });
}

export async function createTest(data: TestInput) {
  await checkFaculty();
  
  try {
    await db.test.create({
      data: {
        title: data.title,
        batchId: data.batchId,
        subjectId: data.subjectId,
        date: new Date(data.date),
        totalMarks: data.totalMarks,
        questions: data.questions,
      }
    });

    revalidatePath("/faculty/tests");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create test." };
  }
}

export async function getTestDetails(testId: string) {
    return await db.test.findUnique({
        where: { id: testId },
        include: { subject: true, batch: true }
    });
}

// Student actions for taking the test
export async function submitTestResult(testId: string, answers: number[]) {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") throw new Error("Unauthorized");

    const student = await db.student.findUnique({ where: { userId: session.user.id } });
    if (!student) throw new Error("Student not found");

    const test = await db.test.findUnique({ where: { id: testId } });
    if (!test) throw new Error("Test not found");

    const questions = test.questions as TestQuestion[];
    let score = 0;

    answers.forEach((ans, idx) => {
        if (questions[idx] && questions[idx].correctAnswer === ans) {
            score += (test.totalMarks / questions.length);
        }
    });

    try {
        await db.result.upsert({
            where: {
                studentId_testId: {
                    studentId: student.id,
                    testId: test.id
                }
            },
            update: {
                marksObtained: score,
                createdAt: new Date()
            },
            create: {
                studentId: student.id,
                testId: test.id,
                marksObtained: score
            }
        });

        revalidatePath("/student/tests");
        return { success: true, score };
    } catch {
        return { error: "Failed to submit test results." };
    }
}
