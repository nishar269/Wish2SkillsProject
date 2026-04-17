"use server";

import { auth } from "@/lib/auth";

export async function chatWithCampusAI(prompt: string, history: { role: string, parts: { text: string }[] }[] = []) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // Try OpenRouter first, then Gemini, then offline
  if (openRouterKey) {
    return await chatWithOpenRouter(prompt, history, session, openRouterKey);
  } else if (geminiKey) {
    return await chatWithGemini(prompt, history, session, geminiKey);
  } else {
    return {
      text: "The AI service is currently unavailable. Please contact your administrator to configure the API key.",
      isOffline: true,
    };
  }
}

// ============================================
// OpenRouter Provider (Primary)
// ============================================
async function chatWithOpenRouter(
  prompt: string,
  history: { role: string; parts: { text: string }[] }[],
  session: { user: { role?: string; name?: string | null } },
  apiKey: string
) {
  const systemMessage = `You are "Campus Scout", the official AI assistant of Wish2Skill CampusOS.
You are helping a ${session.user.role || "user"} named ${session.user.name || "User"}.
The platform manages courses, batches, attendance, assignments, and student records.
Keep your answers professional, helpful, and concise.
If asked about technical issues, tell them to contact the Admin at admin@wish2skill.com.`;

  // Convert history to OpenAI chat format
  const messages: { role: string; content: string }[] = [
    { role: "system", content: systemMessage },
  ];

  for (const msg of history) {
    messages.push({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.parts.map((p) => p.text).join(" "),
    });
  }

  messages.push({ role: "user", content: prompt });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://wish2skill.netlify.app",
        "X-Title": "Wish2Skill CampusOS",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenRouter Error:", response.status, errorBody);
      return { text: "Sorry, I'm having trouble processing your request right now. Please try again in a moment." };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";
    return { text };
  } catch (error) {
    console.error("OpenRouter Error:", error);
    return { text: "Sorry, I'm having trouble processing your request right now. Please try again in a moment." };
  }
}

// ============================================
// Gemini Provider (Fallback)
// ============================================
async function chatWithGemini(
  prompt: string,
  history: { role: string; parts: { text: string }[] }[],
  session: { user: { role?: string; name?: string | null } },
  apiKey: string
) {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "Sorry, I'm having trouble processing your request right now. Please try again in a moment." };
  }
}
