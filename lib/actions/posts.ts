"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/database.types";
import { revalidatePath } from "next/cache";

export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type InsertPost = Database["public"]["Tables"]["posts"]["Insert"];
export type UpdatePost = Database["public"]["Tables"]["posts"]["Update"];

export async function createPost(data: InsertPost) {
  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("posts")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath("/news");
  return post;
}

export async function updatePost(id: string, data: UpdatePost) {
  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("posts")
    .update(data)
    .withConverter(null) // Generic fix if needed, but standard should work
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${id}/edit`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/news");
  return post;
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath("/news");
}

export async function getPostById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getPostBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getAllPosts(type?: "blog" | "news") {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
