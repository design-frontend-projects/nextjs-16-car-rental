import { getAllPosts, Post } from "@/lib/actions/posts";
import { NewsClient } from "@/components/news/news-client";

export const metadata = {
  title: "News - CarPortal",
  description: "Latest news and updates from CarPortal.",
};

export default async function NewsPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const allPosts = await getAllPosts("news");
  const posts = allPosts.filter((p: Post) => p.status === "published");

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pt-24 pb-12">
      <div className="container px-4 md:px-6">
        <NewsClient initialPosts={posts} lng={lng} />
      </div>
    </div>
  );
}
