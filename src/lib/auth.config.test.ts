import { describe, expect, it } from "vitest";

import { authConfig } from "./auth.config";

describe("authConfig", () => {
  it("stores user id and valid role on the JWT", async () => {
    const token = await authConfig.callbacks.jwt({
      token: {},
      user: { id: "user-1", role: "ADMIN" } as any,
      account: null,
      profile: undefined,
      trigger: "signIn",
      isNewUser: false,
      session: undefined,
    });

    expect(token).toMatchObject({ id: "user-1", role: "ADMIN" });
  });

  it("ignores invalid roles in the JWT callback", async () => {
    const token = await authConfig.callbacks.jwt({
      token: {},
      user: { id: "user-1", role: "NOT_A_ROLE" } as any,
      account: null,
      profile: undefined,
      trigger: "signIn",
      isNewUser: false,
      session: undefined,
    });

    expect(token).toMatchObject({ id: "user-1" });
    expect("role" in token).toBe(false);
  });

  it("hydrates the session user from the JWT", async () => {
    const session = await authConfig.callbacks.session({
      session: { user: { name: "Asha", email: "asha@example.com", image: null } },
      token: { id: "user-1", role: "COORDINATOR" },
      user: undefined,
      newSession: undefined,
      trigger: undefined,
    });

    expect(session.user).toMatchObject({ id: "user-1", role: "COORDINATOR" });
  });

  it("allows public routes and rejects unauthenticated private routes", async () => {
    await expect(
      authConfig.callbacks.authorized({
        auth: null,
        request: { nextUrl: { pathname: "/login" } } as never,
      })
    ).resolves.toBe(true);

    await expect(
      authConfig.callbacks.authorized({
        auth: null,
        request: { nextUrl: { pathname: "/admin" } } as never,
      })
    ).resolves.toBe(false);

    await expect(
      authConfig.callbacks.authorized({
        auth: { user: { id: "user-1" } } as never,
        request: { nextUrl: { pathname: "/admin" } } as never,
      })
    ).resolves.toBe(true);
  });

  it("handles jwt callback without user", async () => {
    const token = { existing: "token" };
    const result = await authConfig.callbacks.jwt({
      token,
      user: null as any,
      account: null,
      profile: undefined,
      trigger: "signIn",
      isNewUser: false,
      session: undefined,
    });
    expect(result).toBe(token);
    expect(result).not.toHaveProperty("id");
  });

  it("handles jwt callback with user missing role", async () => {
    const token = await authConfig.callbacks.jwt({
      token: {},
      user: { id: "user-1" } as any,
      account: null,
      profile: undefined,
      trigger: "signIn",
      isNewUser: false,
      session: undefined,
    });
    expect(token.id).toBe("user-1");
    expect(token.role).toBeUndefined();
  });

  it("handles session callback with missing user or ID", async () => {
    // Missing session.user
    const session1 = await authConfig.callbacks.session({
      session: {} as any,
      token: { id: "user-1", role: "ADMIN" },
      user: undefined as any,
      newSession: undefined,
      trigger: undefined,
    });
    expect(session1.user).toBeUndefined();

    // Missing token fields
    const session2 = await authConfig.callbacks.session({
      session: { user: {} } as any,
      token: {},
      user: undefined as any,
      newSession: undefined,
      trigger: undefined,
    });
    expect(session2.user.id).toBeUndefined();
    expect(session2.user.role).toBeUndefined();
  });
});
