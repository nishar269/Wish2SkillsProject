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

import { loginAction, logoutAction } from "./auth";

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
});
