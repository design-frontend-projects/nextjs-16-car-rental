"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const carSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1886, "Invalid year"),
  price: z.coerce.number().min(0, "Price must be positive"),
  mileage: z.coerce.number().min(0, "Mileage must be positive"),
  condition: z.enum(["New", "Used"]),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  status: z
    .enum(["Available", "Sold", "Rented", "Maintenance"])
    .default("Available"),
});

export async function createCar(prevState: any, formData: FormData) {
  const supabase = await createClient();

  // Extract images manually or assume they are handled by a client-side upload first
  // For this initial implementation, we'll assume the form passed image URLs as hidden fields
  // or a comma-separated string, but to keep it simple with shadcn form,
  // we usually use client-side state and pass data differently or use a proper parser.
  // Here, let's assume we are receiving standard form data.

  const rawData = {
    make: formData.get("make"),
    model: formData.get("model"),
    year: formData.get("year"),
    price: formData.get("price"),
    mileage: formData.get("mileage"),
    condition: formData.get("condition"),
    description: formData.get("description"),
    // images: ... handled separately usually
  };

  const validatedFields = carSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Car.",
    };
  }

  const { data, error } = await supabase
    .from("cars")
    .insert([validatedFields.data])
    .select();

  if (error) {
    return {
      message: "Database Error: Failed to Create Car.",
    };
  }

  revalidatePath("/admin/cars");
  redirect("/admin/cars");
}

export async function updateCar(
  id: string,
  prevState: any,
  formData: FormData
) {
  const supabase = await createClient();

  const rawData = {
    make: formData.get("make"),
    model: formData.get("model"),
    year: formData.get("year"),
    price: formData.get("price"),
    mileage: formData.get("mileage"),
    condition: formData.get("condition"),
    description: formData.get("description"),
  };

  const validatedFields = carSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Car.",
    };
  }

  const { error } = await supabase
    .from("cars")
    .update(validatedFields.data)
    .eq("id", id);

  if (error) {
    return {
      message: "Database Error: Failed to Update Car.",
    };
  }

  revalidatePath("/admin/cars");
  redirect("/admin/cars");
}

export async function deleteCar(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("cars").delete().eq("id", id);

  if (error) {
    throw new Error("Failed to delete car");
  }

  revalidatePath("/admin/cars");
}
