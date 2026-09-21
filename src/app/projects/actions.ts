"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, eq, sql } from "drizzle-orm";
import type { TextNode } from "@/db/project-document";

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

export async function addTextNode(
  projectId: string,
  pageId: string,
  formData: FormData
) {
  const user = await requireUser();
  const text = String(formData.get("text") ?? "").trim();

  if (!text || text.length > 2000) {
    throw new Error("Text must be 1–2000 characters");
  }

  const db = getDb();

  const [project] = await db
    .select({
      document: projects.document,
      revision: projects.revision,
    })
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.ownerId, user.id)
      )
    )
    .limit(1);

  if (!project) {
    throw new Error("Project not found");
  }

  const pageExists = project.document.pages.some((page) => page.id === pageId);

  if (!pageExists) {
    throw new Error("Page not found");
  }

  const node: TextNode = {
    id: crypto.randomUUID(),
    type: "text",
    props: { text },
  };

  const updatedDocument = {
    ...project.document,
    pages: project.document.pages.map((page) =>
      page.id === pageId
        ? { ...page, nodes: [...page.nodes, node] }
        : page
    ),
  };

  const updateProjects = await db.update(projects)
    .set({
      document: updatedDocument,
      revision: sql`${projects.revision} + 1`,
    })
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.ownerId, user.id),
        eq(projects.revision, project.revision)
      ),
    )
    .returning({ id: projects.id });

  if (updateProjects.length === 0) {
    throw new Error("Failed to update project. Please try again.");
  }

  revalidatePath(`/projects/${projectId}`);
}