"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SerializedEditorState } from "lexical";
import { Post, InsertPost, createPost, updatePost } from "@/lib/actions/posts";
import { Json } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Editor } from "@/components/blocks/editor-00/editor";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface PostFormProps {
  initialData?: Post;
}

export function PostForm({ initialData }: PostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [type, setType] = useState<"blog" | "news">(
    initialData?.type || "blog"
  );
  const [status, setStatus] = useState<"draft" | "published">(
    initialData?.status || "draft"
  );
  const [featuredImage, setFeaturedImage] = useState(
    initialData?.featured_image || ""
  );
  const [authorName, setAuthorName] = useState(initialData?.author_name || "");
  const [editorState, setEditorState] = useState<SerializedEditorState | null>(
    (initialData?.content as unknown as SerializedEditorState) || null
  );

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!initialData) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorState) return;

    startTransition(async () => {
      try {
        const payload = {
          title,
          slug,
          excerpt,
          type,
          status,
          featured_image: featuredImage,
          author_name: authorName,
          content: editorState as unknown as Json,
          published_at:
            status === "published" ? new Date().toISOString() : null,
        };

        if (initialData) {
          await updatePost(initialData.id, payload);
          // toast.success("Post updated successfully");
        } else {
          await createPost(payload as InsertPost);
          // toast.success("Post created successfully");
        }
        router.push("/admin/posts");
        router.refresh();
      } catch (error) {
        console.error(error);
        // toast.error("Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {initialData ? "Edit Post" : "Create New Post"}
        </h2>
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/posts")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !title || !editorState}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Post" : "Save Post"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Post title..."
              value={title}
              onChange={handleTitleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <div className="min-h-[400px]">
              <Editor
                editorSerializedState={editorState || undefined}
                onSerializedChange={setEditorState}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt / Summary</Label>
            <Textarea
              id="excerpt"
              placeholder="Brief summary of the post..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              placeholder="url-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Post Type</Label>
            <Select
              value={type}
              onValueChange={(v: "blog" | "news") => setType(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="news">News</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(v: "draft" | "published") => setStatus(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author Name</Label>
            <Input
              id="author"
              placeholder="John Doe"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Featured Image URL</Label>
            <Input
              id="image"
              placeholder="https://..."
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
            />
            {featuredImage && (
              <div className="mt-2 rounded-lg overflow-hidden border relative h-40">
                <Image
                  src={featuredImage}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
