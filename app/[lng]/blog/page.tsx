import { getAllPosts, Post } from "@/lib/actions/posts";
import { BlogClient } from "@/components/blog/blog-client";

export const metadata = {
  title: "Blog - CarPortal",
  description: "Read the latest automotive news and insights.",
};

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const allPosts = await getAllPosts("blog");
  const posts = allPosts.filter((p: Post) => p.status === "published");

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pt-24 pb-12">
      <div className="container px-4 md:px-6">
        <BlogClient initialPosts={posts} lng={lng} />
      </div>
    </div>
  );
}
