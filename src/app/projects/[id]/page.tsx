import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const user = await requireUser();
    const { id } = await params;

    const [project] = await getDb()
        .select({
            name: projects.name,
            document: projects.document,
        })
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.ownerId, user.id)))
        .limit(1);

    if (!project) notFound();

    return (
        <main className="mx-auto max-w-4xl px-6 py-12">
            <h1 className="text-3xl font-semibold">{project.name}</h1>
            <ul className="mt-6 space-y-2">
                {project.document.pages.map((page) => (
                    <li key={page.id}>{page.name}</li>
                ))}
            </ul>
        </main>
    );
}