"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getUserProfile() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  return await db.user.findUnique({
    where: { id: session.user.id },
    include: {
        student: true,
        faculty: true
    }
  });
}

export async function updateProfile(data: { name: string, phone?: string }) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        phone: data.phone,
      }
    });

    revalidatePath("/settings");
    return { success: true };
  } catch {
    return { error: "Failed to update profile." };
  }
}

export async function updatePassword(data: { current: string, new: string }) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.passwordHash) throw new Error("User not found");

  const isCorrect = await bcrypt.compare(data.current, user.passwordHash);
  if (!isCorrect) return { error: "Current password is incorrect." };

  try {
    const passwordHash = await bcrypt.hash(data.new, 12);
    await db.user.update({
      where: { id: session.user.id },
      data: { passwordHash }
    });
    return { success: true };
  } catch {
    return { error: "Failed to update password." };
  }
}
