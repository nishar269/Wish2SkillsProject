import { getPosts, getCategories } from "@/actions/forum";
import CategoryClientPage from "./client-page";

export default async function CategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  const posts = await getPosts(categoryId);
  const categories = await getCategories();
  const currentCategory = categories.find(c => c.id === categoryId);

  if (!currentCategory) return <div>Category not found</div>;

  return (
    <CategoryClientPage 
      initialPosts={posts} 
      category={currentCategory} 
    />
  );
}
