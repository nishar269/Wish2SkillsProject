"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function analyzeSentiment(text: string) {
    if (!process.env.GEMINI_API_KEY) return "NEUTRAL";
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(`Analyze the sentiment of this feedback in one word (POSITIVE, NEGATIVE, or NEUTRAL): "${text}"`);
        const response = await result.response;
        return response.text().trim().toUpperCase();
    } catch (e) {
        return "NEUTRAL";
    }
}

export async function submitFeedback(data: { content: string, rating: number, targetId?: string, type: string }) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const sentiment = await analyzeSentiment(data.content);

  try {
    await db.feedback.create({
      data: {
        fromId: session.user.id,
        content: data.content,
        rating: data.rating,
        type: data.type,
        targetId: data.targetId,
        sentiment: sentiment
      }
    });

    revalidatePath("/admin/feedback");
    return { success: true };
  } catch (error) {
    return { error: "Failed to submit feedback." };
  }
}

export async function getAllFeedback() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

    return await db.feedback.findMany({
        orderBy: { createdAt: "desc" },
        include: { 
            from: { select: { name: true, role: true } },
            target: { include: { user: { select: { name: true } } } }
        }
    });
}
