"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getChatContacts() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  
  const userId = session.user.id;

  // Let's fetch all users that aren't the current user so they can chat with anyone
  // For a massive app, this should be limited, but for CampusOS MVP, anyone can DM anyone.
  const contacts = await db.user.findMany({
    where: { 
      id: { not: userId },
      status: "ACTIVE"
    },
    select: { id: true, name: true, role: true, avatarUrl: true },
    orderBy: { name: "asc" },
  });

  // Get unread counts
  const unreads = await db.directMessage.groupBy({
    by: ['senderId'],
    where: { receiverId: userId, readStatus: false },
    _count: { id: true },
  });

  const unreadMap = new Map(unreads.map(u => [u.senderId, u._count.id]));

  return contacts.map(c => ({
    ...c,
    unreadCount: unreadMap.get(c.id) || 0
  }));
}

export async function getChatMessages(contactId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  
  const userId = session.user.id;

  // Mark all unread from this contact as read
  await db.directMessage.updateMany({
    where: { senderId: contactId, receiverId: userId, readStatus: false },
    data: { readStatus: true }
  });

  const messages = await db.directMessage.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId },
      ]
    },
    orderBy: { createdAt: "asc" },
  });

  return messages;
}

export async function sendChatMessage(receiverId: string, content: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  
  const userId = session.user.id;

  if (!content.trim()) throw new Error("Empty message");

  const newMessage = await db.directMessage.create({
    data: {
      content: content.trim(),
      senderId: userId,
      receiverId: receiverId,
      readStatus: false
    }
  });

  return newMessage;
}
