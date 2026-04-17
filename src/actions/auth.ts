"use server";

import { signIn, signOut } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { AuthError } from "next-auth";

export async function loginAction(formData: FormData) {
  console.log("LOGIN_ACTION: Attempting login for", formData.get("email"));
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const parsed = loginSchema.safeParse({ email, password });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid login data." };
  }

  try {
    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    if (result?.error) {
       return { error: "Invalid email or password. Please try again." };
    }

    return { success: true };
  } catch (error) {
    console.error("LOGIN_ACTION_ERROR:", error);
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirect: false });
}

import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { sendNotificationEmail } from "@/lib/mail";

// Generates a 1-hour secure reset token using JWT
export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required." };

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Return success anyway to prevent email enumeration (security best practice)
      return { success: true };
    }

    const secret = process.env.NEXTAUTH_SECRET || "fallback_secret_for_local";
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "1h" });

    // Use absolute URL from environment, or fallback to relative for Vercel/Netlify environments if needed
    // Netlify gives URL automatically to the edge, but for safety:
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.URL || "https://wish2skill.netlify.app";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await sendNotificationEmail(
      user.email,
      "CampusOS Password Reset Request",
      "Password Reset Authorization",
      "You recently requested to reset your password for your Wish2Skill CampusOS account. Click the button below to authorize a new password. This link will expire in 1 hour.",
      "Reset via Secure Link",
      resetUrl
    );

    return { success: true };
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return { error: "Failed to dispatch reset sequence. Please contact support." };
  }
}

import bcrypt from "bcryptjs";

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) return { error: "Reset token missing. Please use a valid link." };
  if (!password || password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };

  try {
    const secret = process.env.NEXTAUTH_SECRET || "fallback_secret_for_local";
    const decoded = jwt.verify(token, secret) as { userId: string };

    const user = await db.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return { error: "User not found or token invalid." };

    const passwordHash = await bcrypt.hash(password, 12);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    return { success: true };
  } catch {
    return { error: "Invalid or expired reset token. Please request a new one." };
  }
}
