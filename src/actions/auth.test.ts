import { beforeEach, describe, expect, it, vi } from "vitest";

const { signIn, signOut, verifyCredentials, AuthError } = vi.hoisted(() => {
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
    verifyCredentials: vi.fn(),
    AuthError: MockAuthError,
  };
});

vi.mock("@/lib/auth", () => ({
  signIn,
  signOut,
  verifyCredentials,
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

// jwt and bcrypt mock setups
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
    verifyCredentials.mockResolvedValue({ id: "1", email: "admin@wish2skill.com", role: "ADMIN" });
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
    expect(verifyCredentials).not.toHaveBeenCalled();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("returns a friendly message when credentials are invalid", async () => {
    verifyCredentials.mockResolvedValue(null);

    await expect(loginAction(createLoginForm("admin@wish2skill.com", "wrongpass"))).resolves.toEqual({
      error: "Invalid email or password",
    });
    expect(signIn).not.toHaveBeenCalled();
  });

  it("returns a fallback message when sign-in fails unexpectedly", async () => {
    verifyCredentials.mockResolvedValue({ id: "1", email: "admin@wish2skill.com", role: "ADMIN" });
    signIn.mockRejectedValue(new AuthError("Configuration"));

    await expect(loginAction(createLoginForm("admin@wish2skill.com", "Password123"))).resolves.toEqual({
      error: "Something went wrong. Please try again.",
    });
  });

  it("returns generic error if signIn returns error object", async () => {
    verifyCredentials.mockResolvedValue({ id: "1", email: "user@example.com", role: "USER" });
    signIn.mockResolvedValue({ error: "Some error" });
    await expect(loginAction(createLoginForm("user@example.com", "Password123"))).resolves.toEqual({
      error: "Invalid email or password. Please try again.",
    });
  });

  it("throws the error if it is not an AuthError", async () => {
    verifyCredentials.mockResolvedValue({ id: "1", email: "user@example.com", role: "USER" });
    const standardError = new Error("Database offline");
    signIn.mockRejectedValue(standardError);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(loginAction(createLoginForm("user@example.com", "Password123"))).rejects.toThrow("Database offline");
    
    errorSpy.mockRestore();
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

    it("returns success silently when user is not found to prevent enumeration", async () => {
      const form = new FormData();
      form.set("email", "unknown@wish2skill.com");
      mockDbAuth.user.findUnique.mockResolvedValue(null);
      
      await expect(forgotPasswordAction(form)).resolves.toEqual({ success: true });
      expect(sendNotificationEmail).not.toHaveBeenCalled();
    });

    it("returns error string if forgotPasswordAction encounters an exception", async () => {
      const form = new FormData();
      form.set("email", "error@wish2skill.com");
      mockDbAuth.user.findUnique.mockRejectedValue(new Error("db failing"));
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      await expect(forgotPasswordAction(form)).resolves.toEqual({ error: "Failed to dispatch reset sequence. Please contact support." });
      
      errorSpy.mockRestore();
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

    it("returns error if user not found with an otherwise valid token", async () => {
      const form = new FormData();
      form.set("token", "valid_token");
      form.set("password", "Pass1234");
      form.set("confirmPassword", "Pass1234");

      mockDbAuth.user.findUnique.mockResolvedValue(null);
      await expect(resetPasswordAction(form)).resolves.toEqual({ error: "User not found or token invalid." });
    });

    it("returns error if token verification throws", async () => {
      const jwt = await import("jsonwebtoken");
      vi.mocked(jwt.default.verify).mockImplementationOnce(() => {
        throw new Error("Expired");
      });

      const form = new FormData();
      form.set("token", "expired_token");
      form.set("password", "Pass1234");
      form.set("confirmPassword", "Pass1234");

      await expect(resetPasswordAction(form)).resolves.toEqual({ error: "Invalid or expired reset token. Please request a new one." });
    });
  });
});
