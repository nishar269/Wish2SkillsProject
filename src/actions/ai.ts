"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function chatWithCampusAI(prompt: string, history: { role: string, parts: { text: string }[] }[] = []) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  if (!process.env.GEMINI_API_KEY) {
    return { 
        text: "I'm currently in offline mode. Please configure the `GEMINI_API_KEY` in the environment variables to enable my full AI capabilities! However, as a basic reply: I am the CampusOS Assistant, here to help students and faculty manage their academic lives." 
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Build context based on user role
    const systemInstruction = `
      You are "Campus Scout", the official AI assistant of Wish2Skill CampusOS.
      You are helping a ${session.user.role} named ${session.user.name}.
      The platform manages courses, batches, attendance, and assignments.
      Keep your answers professional, helpful, and concise.
      If asked about technical issues, tell them to contact the Admin at admin@wish2skill.com.
    `;

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(`${systemInstruction}\n\nUser Question: ${prompt}`);
    const response = await result.response;
    return { text: response.text() };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return { text: "Sorry, I'm having trouble connecting to my creative circuits right now. Please try again in a moment." };
  }
}
