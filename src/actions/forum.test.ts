import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  db: {
    forumCategory: {
      findMany: vi.fn(),
      create: vi.fn(),
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

  it("seeds default categories when the forum is empty", async () => {
    db.forumCategory.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: "cat-1", name: "General Discussions" }]);

    const { getCategories } = await import("./forum");

    await expect(getCategories()).resolves.toEqual([{ id: "cat-1", name: "General Discussions" }]);
    expect(db.forumCategory.create).toHaveBeenCalledTimes(4);
  });

  it("returns posts for a category with author and comment counts", async () => {
    db.forumPost.findMany.mockResolvedValue([{ id: "post-1" }]);

    const { getPosts } = await import("./forum");

    await expect(getPosts("cat-1")).resolves.toEqual([{ id: "post-1" }]);
    expect(db.forumPost.findMany).toHaveBeenCalledWith({
      where: { categoryId: "cat-1" },
      include: {
        author: {
          select: { name: true, avatarUrl: true, role: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });
  });

  it("returns a single post with comments and category details", async () => {
    db.forumPost.findUnique.mockResolvedValue({ id: "post-1" });

    const { getPost } = await import("./forum");

    await expect(getPost("post-1")).resolves.toEqual({ id: "post-1" });
    expect(db.forumPost.findUnique).toHaveBeenCalledWith({
      where: { id: "post-1" },
      include: {
        author: {
          select: { name: true, avatarUrl: true, role: true },
        },
        category: true,
        comments: {
          include: {
            author: {
              select: { name: true, avatarUrl: true, role: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  });

  it("blocks post creation when the user is not signed in", async () => {
    auth.mockResolvedValue(null);

    const { createPost } = await import("./forum");

    await expect(
      createPost({ title: "Hello", content: "First post", categoryId: "cat-1" })
    ).resolves.toEqual({ error: "Unauthorized" });
  });

  it("creates a post and revalidates the category page", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.forumPost.create.mockResolvedValue({ id: "post-1" });

    const { createPost } = await import("./forum");

    await expect(
      createPost({ title: "Hello", content: "First post", categoryId: "cat-1" })
    ).resolves.toEqual({ success: true, id: "post-1" });
    expect(db.forumPost.create).toHaveBeenCalledWith({
      data: {
        title: "Hello",
        content: "First post",
        categoryId: "cat-1",
        authorId: "student-user",
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/community/cat-1");
  });

  it("returns an error when post creation fails", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.forumPost.create.mockRejectedValue(new Error("db error"));

    const { createPost } = await import("./forum");

    await expect(
      createPost({ title: "Hello", content: "First post", categoryId: "cat-1" })
    ).resolves.toEqual({ error: "Failed to create post" });
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

  it("returns an error when comment creation fails", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.forumComment.create.mockRejectedValue(new Error("db error"));

    const { createComment } = await import("./forum");

    await expect(createComment({ content: "Useful post", postId: "post-1" })).resolves.toEqual({
      error: "Failed to add comment",
    });
  });

  it("swallows failures while incrementing post views", async () => {
    db.forumPost.update.mockRejectedValue(new Error("db error"));

    const { incrementViewCount } = await import("./forum");

    await expect(incrementViewCount("post-1")).resolves.toBeUndefined();
    expect(db.forumPost.update).toHaveBeenCalledWith({
      where: { id: "post-1" },
      data: { viewCount: { increment: 1 } },
    });
  });
});
