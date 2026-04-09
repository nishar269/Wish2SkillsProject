import { getJobPosts } from "@/actions/career";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import StudentJobsClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function StudentJobsPage() {
  const session = await auth();
  const jobs = await getJobPosts();
  
  const student = await db.student.findUnique({
      where: { userId: session?.user.id },
      include: { applications: true }
  });

  return <StudentJobsClientPage jobs={jobs} studentApplications={student?.applications || []} />;
}
