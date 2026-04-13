import { getPost, incrementViewCount } from "@/actions/forum";
import PostClientPage from "./client-page";
import { notFound } from "next/navigation";

export default async function ForumPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const post = await getPost(postId);
  
  if (!post) notFound();

  // Background view increment
  await incrementViewCount(postId);

  return <PostClientPage post={post} />;
}
