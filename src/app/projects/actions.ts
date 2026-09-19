"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export async function createProject(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();

  if (!name || name.length > 100) {
    throw new Error("Project name must be 1–100 characters");
  }

  await getDb().insert(projects).values({
    ownerId: user.id,
    name,
    document: {
      schemaVersion: 1,
      pages: [{ id: crypto.randomUUID(), name: "Home", nodes: [] }],
    },
  });

  revalidatePath("/");
  redirect("/");
}