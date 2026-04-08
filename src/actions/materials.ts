"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkFacultyOrAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "FACULTY" && session.user.role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getMaterials(subjectId?: string) {
    return await db.material.findMany({
        where: subjectId ? { subjectId } : {},
        include: {
            subject: true,
            faculty: { include: { user: true } }
        },
        orderBy: { createdAt: "desc" }
    });
}

export async function createMaterial(data: { 
    title: string, 
    description?: string, 
    fileUrl: string, 
    fileType: string, 
    subjectId: string 
}) {
    const session = await checkFacultyOrAdmin();
    
    let facultyId: string | undefined;
    if (session.user.role === "FACULTY") {
        const fac = await db.faculty.findUnique({ where: { userId: session.user.id } });
        facultyId = fac?.id;
    }

    try {
        await db.material.create({
            data: {
                title: data.title,
                description: data.description,
                fileUrl: data.fileUrl,
                fileType: data.fileType,
                subjectId: data.subjectId,
                facultyId: facultyId,
            }
        });

        revalidatePath("/faculty/resources");
        revalidatePath("/student/resources");
        return { success: true };
    } catch (error) {
        return { error: "Failed to upload material record." };
    }
}

export async function deleteMaterial(id: string) {
    await checkFacultyOrAdmin();
    try {
        await db.material.delete({ where: { id } });
        revalidatePath("/faculty/resources");
        return { success: true };
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function summarizeMaterial(id: string) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const material = await db.material.findUnique({
        where: { id },
        include: { subject: true }
    });

    if (!material) throw new Error("Material not found");

    if (!process.env.GEMINI_API_KEY) {
        return { summary: "AI Summarization is currently unavailable. Please check your API key configuration." };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `
            You are an Academic Assistant. Summarize the following learning resource details in 3-4 bullet points for a student.
            Title: ${material.title}
            Subject: ${material.subject.name}
            Description: ${material.description || "N/A"}
            
            Keep the tone educational and encouraging.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return { summary: response.text() };
    } catch (e) {
        return { error: "Failed to generate summary." };
    }
}
