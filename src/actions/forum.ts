"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  return await db.forumCategory.findMany({
    include: {
      _count: {
        select: { posts: true }
      }
    },
    orderBy: { name: "asc" }
  });
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
