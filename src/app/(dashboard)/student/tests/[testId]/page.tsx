import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function TakeTestPage({ params }: { params: { testId: string } }) {
  const test = await db.test.findUnique({
    where: { id: params.testId },
    include: { subject: true }
  });

  if (!test) return notFound();

  return <ClientPage test={test} />;
}
