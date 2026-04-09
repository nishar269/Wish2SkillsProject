import { getJobPosts } from "@/actions/career";
import CareerClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function AdminCareerPage() {
  const jobPosts = await getJobPosts();

  return <CareerClientPage initialJobs={jobPosts} />;
}
