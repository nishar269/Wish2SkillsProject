import { getJobs, getStudentApplications } from "@/actions/jobs";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function CareerPortalPage() {
  const [jobs, myApplications] = await Promise.all([
    getJobs(),
    getStudentApplications()
  ]);

  return <ClientPage initialJobs={jobs} myApplications={myApplications} />;
}
