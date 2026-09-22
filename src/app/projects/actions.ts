"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, eq, sql } from "drizzle-orm";
import type { ButtonNode, TextNode } from "@/db/project-document";

function isAllowedButtonHref(href: string) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return true;
  }
  try {
    return new URL(href).protocol === "https:";
  } catch {
    return false;
  }
}

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

export async function addButtonNode(
  projectId: string,
  pageId: string,
  formData: FormData
) {
  const user = await requireUser();
  const label = String(formData.get("label") ?? "").trim();
  const href = String(formData.get("href") ?? "").trim();

  if (!label || label.length > 100) {
    throw new Error("Button label must be 1–100 characters");
  }

  if (!href || href.length > 2048 || !isAllowedButtonHref(href)) {
    throw new Error("Enter a valid internal or HTTPS URL");
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

  const node: ButtonNode = {
    id: crypto.randomUUID(),
    type: "button",
    props: { label, href },
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

export async function updateTextNode(
  projectId: string,
  pageId: string,
  nodeId: string,
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

  const page = project.document.pages.find((page) => page.id === pageId);

  if (!page) {
    throw new Error("Page not found");
  }

  const targetNode = project.document.pages
    .find((page) => page.id === pageId)
    ?.nodes.find((node) => node.id === nodeId);

  if (!targetNode || targetNode.type !== "text") {
    throw new Error("Text node not found");
  }

  const updatedDocument = {
    ...project.document,
    pages: project.document.pages.map((page) =>
      page.id === pageId
        ? {
          ...page,
          nodes: page.nodes.map((node) =>
            node.id === nodeId && node.type === "text" ? { ...node, props: { text } } : node
          ),
        }
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
    throw new Error("Project changed while you were editing it.");
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function updateButtonNode(
  projectId: string,
  pageId: string,
  nodeId: string,
  formData: FormData
) {
  const user = await requireUser();
  const label = String(formData.get("label") ?? "").trim();
  const href = String(formData.get("href") ?? "").trim();

  if (!label || label.length > 100) {
    throw new Error("Label must be 1–100 characters");
  }

  if (!href || href.length > 2048) {
    throw new Error("Enter a valid internal or HTTPS URL");
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

  const page = project.document.pages.find((page) => page.id === pageId);

  if (!page) {
    throw new Error("Page not found");
  }

  const targetNode = project.document.pages
    .find((page) => page.id === pageId)
    ?.nodes.find((node) => node.id === nodeId);

  if (!targetNode || targetNode.type !== "button") {
    throw new Error("Button node not found");
  }

  const updatedDocument = {
    ...project.document,
    pages: project.document.pages.map((page) =>
      page.id === pageId
        ? {
          ...page,
          nodes: page.nodes.map((node) =>
            node.id === nodeId && node.type === "button" ? { ...node, props: { label, href } } : node
          ),
        }
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
    throw new Error("Project changed while you were editing it.");
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function deleteTextNode(
  projectId: string,
  pageId: string,
  nodeId: string
) {
  const user = await requireUser();
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

  const targetNode = project.document.pages
    .find((page) => page.id === pageId)
    ?.nodes.find((node) => node.id === nodeId);

  if (!targetNode || targetNode.type !== "text") {
    throw new Error("Text node not found");
  }

  const updatedDocument = {
    ...project.document,
    pages: project.document.pages.map((page) =>
      page.id === pageId
        ? {
          ...page,
          nodes: page.nodes.filter((node) => node.id !== nodeId),
        }
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
    throw new Error("Project changed while you were editing it.");
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function deleteButtonNode(
  projectId: string,
  pageId: string,
  nodeId: string
) {
  const user = await requireUser();
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

  const targetNode = project.document.pages
    .find((page) => page.id === pageId)
    ?.nodes.find((node) => node.id === nodeId);

  if (!targetNode || targetNode.type !== "button") {
    throw new Error("Button node not found");
  }

  const updatedDocument = {
    ...project.document,
    pages: project.document.pages.map((page) =>
      page.id === pageId
        ? {
          ...page,
          nodes: page.nodes.filter((node) => node.id !== nodeId),
        }
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
    throw new Error("Project changed while you were editing it.");
  }

  revalidatePath(`/projects/${projectId}`);
}


export async function createPage(
  projectId: string,
  formData: FormData
) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();

  if (!name || name.length > 50) {
    throw new Error("Page name must be 1–50 characters");
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

  if (project.document.pages.length >= 20) {
    throw new Error("A project can have at most 20 pages");
  }

  const nameAlreadyExists = project.document.pages.some((page) => page.name.toLowerCase() === name.toLowerCase());

  if (nameAlreadyExists) {
    throw new Error("A page with this name already exists");
  }

  const updatedDocument = {
    ...project.document,
    pages: [
      ...project.document.pages,
      { id: crypto.randomUUID(), name, nodes: [] },
    ],
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
    throw new Error("Project changed while you were editing it.");
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function renamePage(
  projectId: string,
  pageId: string,
  formData: FormData
) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();

  if (!name || name.length > 50) {
    throw new Error("Page name must be 1–50 characters");
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

  const page = project.document.pages.find((page) => page.id === pageId);

  if (!page) {
    throw new Error("Page not found");
  }

  const nameAlreadyExists = project.document.pages.some((p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== pageId);

  if (nameAlreadyExists) {
    throw new Error("A page with this name already exists");
  }

  const updatedDocument = {
    ...project.document,
    pages: project.document.pages.map((p) =>
      p.id === pageId ? { ...p, name } : p
    ),
  };

  const updateProjects = await db.update(projects)
    .set({
      document: updatedDocument,
      revision: sql`${projects.revision} + 1`,
      updatedAt: new Date(),
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
    throw new Error("Project changed while you were editing it.");
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function deletePage(
  projectId: string,
  pageId: string
) {
  const user = await requireUser();
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

  const targetPage = project.document.pages.find(
    (page) => page.id === pageId,
  );

  if (!targetPage) {
    throw new Error("Page not found");
  }

  const homePage = project.document.pages[0];

  if (targetPage.id === homePage.id) {
    throw new Error("The home page cannot be deleted");
  }

  const updatedDocument = {
    ...project.document,
    pages: project.document.pages.filter((page) => page.id !== pageId),
  };

  const updateProjects = await db.update(projects)
    .set({
      document: updatedDocument,
      revision: sql`${projects.revision} + 1`,
      updatedAt: new Date(),
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
    throw new Error("Project changed while you were editing it.");
  }

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function moveNode(
  projectId: string,
  pageId: string,
  nodeId: string,
  direction: "up" | "down"
) {
  if (direction !== "up" && direction !== "down") {
    throw new Error("Invalid move direction");
  }

  const user = await requireUser();
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

  const page = project.document.pages.find((page) => page.id === pageId);

  if (!page) {
    throw new Error("Page not found");
  }

  const nodeIndex = page.nodes.findIndex((node) => node.id === nodeId);

  if (nodeIndex === -1) {
    throw new Error("Node not found");
  }

  const targetIndex = direction === "up" ? nodeIndex - 1 : nodeIndex + 1;

  if (targetIndex < 0 || targetIndex >= page.nodes.length) {
    return;
  }

  const reorderedNodes = [...page.nodes];
  const [node] = reorderedNodes.splice(nodeIndex, 1);

  if (!node) {
    throw new Error("Node not found");
  }

  reorderedNodes.splice(targetIndex, 0, node);

  const updatedDocument = {
    ...project.document,
    pages: project.document.pages.map((currentPage) =>
      currentPage.id === pageId
        ? { ...currentPage, nodes: reorderedNodes }
        : currentPage,
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
    throw new Error("Project changed while you were editing it.");
  }

  revalidatePath(`/projects/${projectId}`)
}