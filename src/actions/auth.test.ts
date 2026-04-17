import { beforeEach, describe, expect, it, vi } from "vitest";

const { signIn, signOut, AuthError } = vi.hoisted(() => {
  class MockAuthError extends Error {
    type: string;

    constructor(type: string) {
      super(type);
      this.type = type;
    }
  }

  return {
    signIn: vi.fn(),
    signOut: vi.fn(),
    AuthError: MockAuthError,
  };
});

vi.mock("@/lib/auth", () => ({
  signIn,
  signOut,
}));

vi.mock("next-auth", () => ({
  AuthError,
}));

import { loginAction, logoutAction, forgotPasswordAction, resetPasswordAction } from "./auth";

vi.mock("@/lib/mail", () => ({
  sendNotificationEmail: vi.fn(),
}));

import { sendNotificationEmail } from "@/lib/mail";

const mockDbAuth = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
}));
vi.mock("@/lib/db", () => ({ db: mockDbAuth }));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(() => "mock_token"),
    verify: vi.fn(() => ({ userId: "123" })),
  }
}));

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn(() => "hashed_pwd") }
}));

function createLoginForm(email: string, password: string) {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("password", password);
  return formData;
}

describe("auth actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in successfully with valid credentials", async () => {
    signIn.mockResolvedValue({ ok: true });

    await expect(loginAction(createLoginForm("admin@wish2skill.com", "Password123"))).resolves.toEqual({
      success: true,
    });
    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "admin@wish2skill.com",
      password: "Password123",
      redirect: false,
    });
  });

  it("rejects invalid form input before sign-in", async () => {
    await expect(loginAction(createLoginForm("bad-email", "123"))).resolves.toEqual({
      error: "Invalid email address",
    });
    expect(signIn).not.toHaveBeenCalled();
  });

  it("returns a friendly message when credentials sign-in fails", async () => {
    signIn.mockRejectedValue(new AuthError("CredentialsSignin"));

    await expect(loginAction(createLoginForm("admin@wish2skill.com", "wrongpass"))).resolves.toEqual({
      error: "Invalid email or password",
    });
  });

  it("logs out without redirecting", async () => {
    await logoutAction();
    expect(signOut).toHaveBeenCalledWith({ redirect: false });
  });

  describe("Password Recovery Flow", () => {
    it("returns error if email is missing in forgotPasswordAction", async () => {
      const form = new FormData();
      await expect(forgotPasswordAction(form)).resolves.toEqual({ error: "Email is required." });
    });

    it("sends recovery email for valid user", async () => {
      const form = new FormData();
      form.set("email", "admin@wish2skill.com");
      mockDbAuth.user.findUnique.mockResolvedValue({ id: "123", email: "admin@wish2skill.com" });
      
      await expect(forgotPasswordAction(form)).resolves.toEqual({ success: true });
      expect(sendNotificationEmail).toHaveBeenCalled();
    });

    it("rejects token reset if passwords do not match", async () => {
      const form = new FormData();
      form.set("token", "xyz");
      form.set("password", "Pass1234");
      form.set("confirmPassword", "Pass9999");
      await expect(resetPasswordAction(form)).resolves.toEqual({ error: "Passwords do not match." });
    });

    it("accepts valid token and updates password", async () => {
      const form = new FormData();
      form.set("token", "valid_token");
      form.set("password", "Pass1234");
      form.set("confirmPassword", "Pass1234");

      mockDbAuth.user.findUnique.mockResolvedValue({ id: "123" });
      
      await expect(resetPasswordAction(form)).resolves.toEqual({ success: true });
      expect(mockDbAuth.user.update).toHaveBeenCalled();
    });
  });
});
