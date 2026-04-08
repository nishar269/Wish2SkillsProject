import { getMaterials } from "@/actions/materials";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function StudentResourcesPage() {
  const session = await auth();
  if (!session) return null;

  const student = await db.student.findUnique({
    where: { userId: session.user.id }
  });

  if (!student) return null;

  const materials = await db.material.findMany({
    where: { subject: { courseId: student.courseId } },
    include: {
      subject: true,
      faculty: { include: { user: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return <ClientPage initialMaterials={materials} />;
}
