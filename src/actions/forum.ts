"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  let categories = await db.forumCategory.findMany({
    include: {
      _count: {
        select: { posts: true }
      }
    },
    orderBy: { name: "asc" }
  });

  if (categories.length === 0) {
    // Auto-seed if empty
    const defaultCategories = [
        { name: "General Discussions", icon: "MessageSquare", description: "Talk about anything campus related." },
        { name: "Tech & Engineering", icon: "Code", description: "Share projects, code, and technical insights." },
        { name: "Events & News", icon: "Bell", description: "Stay updated with campus happenings." },
        { name: "Project Showcase", icon: "Lightbulb", description: "Show off what you've built!" }
    ];

    for (const cat of defaultCategories) {
        await db.forumCategory.create({ data: cat });
    }

    categories = await db.forumCategory.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: "asc" }
    });
  }

  return categories;
}

export async function getPosts(categoryId: string) {
  return await db.forumPost.findMany({
    where: { categoryId },
    include: {
      author: {
        select: { name: true, avatarUrl: true, role: true }
      },
      _count: {
        select: { comments: true }
      }
    },
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" }
    ]
  });
}

export async function getPost(postId: string) {
  return await db.forumPost.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: { name: true, avatarUrl: true, role: true }
      },
      category: true,
      comments: {
        include: {
          author: {
            select: { name: true, avatarUrl: true, role: true }
          }
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });
}

export async function createPost(data: { title: string, content: string, categoryId: string }) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  try {
    const post = await db.forumPost.create({
      data: {
        ...data,
        authorId: session.user.id
      }
    });

    revalidatePath(`/community/${data.categoryId}`);
    return { success: true, id: post.id };
  } catch {
    return { error: "Failed to create post" };
  }
}

export async function createComment(data: { content: string, postId: string }) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  try {
    await db.forumComment.create({
      data: {
        ...data,
        authorId: session.user.id
      }
    });

    revalidatePath(`/community/post/${data.postId}`);
    return { success: true };
  } catch {
    return { error: "Failed to add comment" };
  }
}

export async function incrementViewCount(postId: string) {
  try {
    await db.forumPost.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } }
    });
  } catch {}
}
