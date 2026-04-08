import { db } from "@/lib/db";
import { submitFeedback } from "@/actions/feedback";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const faculty = await db.faculty.findMany({
    include: { user: { select: { name: true } } }
  });
  
  return <ClientPage faculty={faculty} />;
}
