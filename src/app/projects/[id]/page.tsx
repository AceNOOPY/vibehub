import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { TextNodeEditor } from "@/components/text-node-editor";
import { addTextNode, updateTextNode, deleteTextNode } from "@/app/projects/actions";

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
                {project.document.pages.map((page) => {
                    const addText = addTextNode.bind(null, id, page.id);

                    return (
                        <li key={page.id}>
                            <h2 className="text-xl font-semibold">{page.name}</h2>

                            <div className="mt-4 space-y-2">
                                {page.nodes.length === 0 ? (
                                    <p className="text-gray-500">No content yet.</p>
                                ) : (
                                    page.nodes.map((node) => {
                                        switch (node.type) {
                                            case "text":
                                                const updateText = updateTextNode.bind(null, id, page.id, node.id);
                                                const deleteText = deleteTextNode.bind(null, id, page.id, node.id);

                                                return (
                                                    <TextNodeEditor
                                                        key={node.id}
                                                        node={node}
                                                        action={updateText}
                                                        deleteAction={deleteText}
                                                    />
                                                );

                                        }
                                    })
                                )}
                            </div>

                            <form action={addText} className="mt-3 flex gap-2">
                                <input
                                    name="text"
                                    placeholder="Enter text..."
                                    required
                                    maxLength={2000}
                                    className="flex-1 rounded border p-2"
                                />
                                <button
                                    type="submit"
                                    className="rounded bg-black px-4 py-2 text-white"
                                >
                                    Add Text
                                </button>
                            </form>
                        </li>
                    );
                })}
            </ul>
        </main>
    );
}