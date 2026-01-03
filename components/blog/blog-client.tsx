"use client";

import { useState } from "react";
import type { Post } from "@/lib/actions/posts";
import { PostCard } from "@/components/cars/post-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PostSearch } from "@/components/cars/post-search";
import { useTranslation } from "@/app/i18n/client";

interface BlogClientProps {
  initialPosts: Post[];
  lng: string;
}

export function BlogClient({ initialPosts, lng }: BlogClientProps) {
  const { t } = useTranslation(lng, "common");
  const [posts] = useState<Post[]>(initialPosts);
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-2">
          <Badge
            variant="outline"
            className="text-primary border-primary/20 bg-primary/5 uppercase tracking-wider"
          >
            Our Journal
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {t("nav.blog")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Stay updated with the latest trends in the automotive industry, car
            care tips, and more.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PostSearch posts={posts} />
          <div className="h-10 border-l mx-2 hidden md:block" />
          <div className="flex items-center bg-muted p-1 rounded-lg">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setView("grid")}
              className="h-8 w-8"
            >
              <span>Grid</span>
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setView("list")}
              className="h-8 w-8"
            >
              <span>List</span>
            </Button>
          </div>
        </div>
      </div>

      {initialPosts.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-2xl border border-dashed">
          <p className="text-muted-foreground">No blog posts found.</p>
        </div>
      ) : (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              : "flex flex-col gap-6"
          }
        >
          {initialPosts.map((post) => (
            <PostCard key={post.id} post={post} view={view} lng={lng} />
          ))}
        </div>
      )}
    </>
  );
}
