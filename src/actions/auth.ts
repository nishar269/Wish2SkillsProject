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
