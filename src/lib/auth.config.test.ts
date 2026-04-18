import { describe, expect, it } from "vitest";

import { authConfig } from "./auth.config";

describe("authConfig", () => {
  it("stores user id and valid role on the JWT", async () => {
    const token = await authConfig.callbacks.jwt({
      token: {},
      user: { id: "user-1", role: "ADMIN" },
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
      user: { id: "user-1", role: "NOT_A_ROLE" },
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
});
