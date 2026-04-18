import { beforeEach, describe, expect, it, vi } from "vitest";

const { nextAuth, credentialsProvider, compare, db, getCapturedAuthorize } = vi.hoisted(() => {
  let capturedAuthorize: ((credentials: unknown) => Promise<unknown>) | undefined;

  return {
    nextAuth: vi.fn(() => ({
      handlers: { GET: vi.fn(), POST: vi.fn() },
      signIn: vi.fn(),
      signOut: vi.fn(),
      auth: vi.fn(),
    })),
    credentialsProvider: vi.fn((config) => {
      capturedAuthorize = config?.authorize as ((credentials: unknown) => Promise<unknown>) | undefined;
      return config;
    }),
    getCapturedAuthorize: () => capturedAuthorize,
    compare: vi.fn(),
    db: {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    },
  };
});

vi.mock("next-auth", () => ({ default: nextAuth }));
vi.mock("next-auth/providers/credentials", () => ({ default: credentialsProvider }));
vi.mock("bcryptjs", () => ({ default: { compare }, compare }));
vi.mock("@/lib/db", () => ({ db }));

describe("verifyCredentials", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Warm up the module so the credentialsProvider gets called
    await import("./auth");
  });

  it("returns null for invalid credential shape", async () => {
    const { verifyCredentials } = await import("./auth");

    await expect(verifyCredentials("not-an-email", "123")).resolves.toBeNull();
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns null when the user is inactive or missing", async () => {
    db.user.findUnique.mockResolvedValue({ status: "INACTIVE" });

    const { verifyCredentials } = await import("./auth");

    await expect(verifyCredentials("admin@example.com", "Password123")).resolves.toBeNull();
  });

  it("returns null when the password does not match", async () => {
    db.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      status: "ACTIVE",
      avatarUrl: null,
      passwordHash: "stored",
    });
    compare.mockResolvedValue(false);

    const { verifyCredentials } = await import("./auth");

    await expect(verifyCredentials("admin@example.com", "Password123")).resolves.toBeNull();
  });

  it("returns the verified user and updates last login when requested", async () => {
    db.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      status: "ACTIVE",
      avatarUrl: "avatar.png",
      passwordHash: "stored",
    });
    compare.mockResolvedValue(true);

    const { verifyCredentials } = await import("./auth");

    await expect(verifyCredentials("ADMIN@EXAMPLE.COM", "Password123", { updateLastLogin: true })).resolves.toEqual({
      id: "user-1",
      name: "Admin",
      email: "admin@example.com",
      role: "ADMIN",
      image: "avatar.png",
    });

    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { email: "admin@example.com", deletedAt: null },
    });
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { lastLoginAt: expect.any(Date) },
    });
  });
});

describe("Credentials Provider authorize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null if credentials are missing", async () => {
    await import("./auth");
    const authorize = getCapturedAuthorize();
    if (!authorize) throw new Error("Authorize method not captured.");
    
    await expect(authorize(null)).resolves.toBeNull();
    await expect(authorize({ email: "test" })).resolves.toBeNull();
    await expect(authorize({ password: "test" })).resolves.toBeNull();
  });

  it("calls verifyCredentials with strings and updates lastlogin if credentials provided", async () => {
    await import("./auth");
    const authorize = getCapturedAuthorize();
    if (!authorize) throw new Error("Authorize method not captured.");
    
    db.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      status: "ACTIVE",
      passwordHash: "stored",
    });
    compare.mockResolvedValue(true);

    const result = await authorize({ email: "test@example.com", password: "Password123" });
    
    expect(result).toMatchObject({
      id: "user-1",
      email: "test@example.com",
    });
    expect(db.user.update).toHaveBeenCalled();
  });
});
