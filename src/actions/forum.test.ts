import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  db: {
    forumCategory: {
      findMany: vi.fn(),
    },
    forumPost: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    forumComment: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));

describe("forum actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns community categories sorted by name", async () => {
    const categories = [{ id: "cat-1", name: "General" }];
    db.forumCategory.findMany.mockResolvedValue(categories);

    const { getCategories } = await import("./forum");

    await expect(getCategories()).resolves.toEqual(categories);
    expect(db.forumCategory.findMany).toHaveBeenCalledWith({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: "asc" },
    });
  });

  it("blocks post creation when the user is not signed in", async () => {
    auth.mockResolvedValue(null);

    const { createPost } = await import("./forum");

    await expect(
      createPost({ title: "Hello", content: "First post", categoryId: "cat-1" })
    ).resolves.toEqual({ error: "Unauthorized" });
  });

  it("creates comments for signed-in users and revalidates the post page", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });

    const { createComment } = await import("./forum");

    await expect(createComment({ content: "Useful post", postId: "post-1" })).resolves.toEqual({
      success: true,
    });
    expect(db.forumComment.create).toHaveBeenCalledWith({
      data: {
        content: "Useful post",
        postId: "post-1",
        authorId: "student-user",
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/community/post/post-1");
  });
});
