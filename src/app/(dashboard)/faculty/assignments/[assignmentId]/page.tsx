import { getAssignmentSubmissions } from "@/actions/assignments";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function AssignmentSubmissionPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params;

  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: {
        subject: true,
        batch: true
    }
  });

  if (!assignment) return notFound();

  const submissions = await getAssignmentSubmissions(assignmentId);

  return (
    <ClientPage 
        assignment={assignment}
        submissions={submissions}
    />
  );
}
