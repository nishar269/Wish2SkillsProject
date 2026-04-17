"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function submitFeedback(data: { message: string, rating: number, category?: string, facultyId?: string }) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const { message, rating, facultyId } = data;

  if (!message || message.length < 10) {
      return { error: "Feedback message must be at least 10 characters long." };
  }

  // Use Gemini to analyze the sentiment of the message
  let sentiment = "NEUTRAL";
  try {
      if (process.env.GEMINI_API_KEY) {
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          const prompt = `
          Analyze the following student feedback and classify its sentiment as exactly one of: POSITIVE, NEUTRAL, or NEGATIVE.
          Do not return any other text.
          Feedback: "${message}"
          Sentiment:`;
          
          const result = await model.generateContent(prompt);
          const responseText = result.response.text().trim().toUpperCase();
          if (["POSITIVE", "NEUTRAL", "NEGATIVE"].includes(responseText)) {
              sentiment = responseText;
          }
      }
  } catch (error) {
      console.error("AI Sentiment Analysis failed:", error);
      // Fallback to basic rule-based engine if Google API fails or is missing
      if (rating >= 4) sentiment = "POSITIVE";
      else if (rating <= 2) sentiment = "NEGATIVE";
  }

  // Get student ID if the user is a student
  const studentRecord = await db.student.findUnique({ where: { userId: session.user.id } });
  if (!studentRecord) return { error: "Only registered students can submit institutional feedback." };

  try {
      await db.feedback.create({
          data: {
              studentId: studentRecord.id,
              facultyId: facultyId || null,
              message,
              rating,
              sentiment,
              isAnonymous: false
          }
      });
      revalidatePath("/feedback");
      return { success: true };
  } catch (error) {
      console.error(error);
      return { error: "Failed to submit feedback." };
  }
}

export async function getAuthorityFeedbackData() {
  const session = await auth();
  if (!session || session.user.role !== "AUTHORITY") {
      return { error: "Unauthorized" };
  }

  try {
      const allFeedback = await db.feedback.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
              student: { include: { user: true } },
              subject: true
          }
      });

      const totalFeedbacks = allFeedback.length;
      let positiveCount = 0;
      let neutralCount = 0;
      let negativeCount = 0;
      let sumRating = 0;

      allFeedback.forEach(f => {
          if (f.sentiment === "POSITIVE") positiveCount++;
          else if (f.sentiment === "NEGATIVE") negativeCount++;
          else neutralCount++;
          
          sumRating += (f.rating || 5);
      });

      const averageRating = totalFeedbacks > 0 ? (sumRating / totalFeedbacks).toFixed(1) : "0.0";

      return {
          sentimentDistribution: {
              positive: totalFeedbacks > 0 ? Math.round((positiveCount / totalFeedbacks) * 100) : 0,
              neutral: totalFeedbacks > 0 ? Math.round((neutralCount / totalFeedbacks) * 100) : 0,
              negative: totalFeedbacks > 0 ? Math.round((negativeCount / totalFeedbacks) * 100) : 0,
          },
          averageRating: parseFloat(averageRating),
          recentFeedbacks: allFeedback.map(f => ({
              id: f.id,
              studentName: f.isAnonymous ? "Anonymous Student" : f.student.user.name,
              subject: f.subject?.name || "General Facility",
              rating: f.rating || 5,
              message: f.message,
              sentiment: f.sentiment,
              createdAt: f.createdAt
          }))
      };
  } catch (error) {
      console.error(error);
      return { error: "Failed to aggregate feedback analytics." };
  }
}

export async function getAllFeedback() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return [];

    try {
        return await db.feedback.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                student: { include: { user: true } },
                subject: true,
                faculty: { include: { user: true } }
            }
        });
    } catch {
        return [];
    }
}
