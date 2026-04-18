import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { PrismaClient } = vi.hoisted(() => {
  const PrismaClientMock = vi.fn(function MockPrismaClient(this: { tag: string }) {
    this.tag = "prisma-instance";
  });

  return { PrismaClient: PrismaClientMock };
});

vi.mock("@prisma/client", () => ({ PrismaClient }));

describe("db singleton", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.resetModules();
    PrismaClient.mockClear();
    delete (globalThis as typeof globalThis & { prisma?: unknown }).prisma;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("creates and caches a prisma client outside production", async () => {
    process.env.NODE_ENV = "test";

    const { db } = await import("./db");

    expect(PrismaClient).toHaveBeenCalledTimes(1);
    expect(db).toEqual({ tag: "prisma-instance" });
    expect((globalThis as typeof globalThis & { prisma?: unknown }).prisma).toEqual(db);
  });

  it("reuses an existing cached prisma client", async () => {
    process.env.NODE_ENV = "test";
    const existing = { tag: "existing-prisma" };
    (globalThis as typeof globalThis & { prisma?: unknown }).prisma = existing;

    const { db } = await import("./db");

    expect(PrismaClient).not.toHaveBeenCalled();
    expect(db).toBe(existing);
  });
});
