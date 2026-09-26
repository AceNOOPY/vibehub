import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { TextNodeEditor } from "@/components/text-node-editor";
import { PageNameEditor } from "@/components/page-name-editor";
import { ButtonNodeEditor } from "@/components/button-node-editor";
import { NodeMoveControls } from "@/components/node-move-controls";
import { SortableNodeList } from "@/components/sortable-node-list";
import { ProjectPagePreview } from "@/components/project-page-preview";
import { addButtonNode, addTextNode, createPage, updateTextNode, updateButtonNode, deleteTextNode, renamePage, deletePage, deleteButtonNode, moveNode, reorderNode } from "@/app/projects/actions";
import Link from "next/link";

export default async function ProjectPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ page?: string; mode?: string }>;
}) {
    const user = await requireUser();
    const { id } = await params;
    const { page: requestedPageId, mode } = await searchParams;
    const isPreviewMode = mode === "preview";

    const [project] = await getDb()
        .select({
            name: projects.name,
            document: projects.document,
        })
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.ownerId, user.id)))
        .limit(1);

    if (!project) notFound();

    const activePage = project.document.pages.find((page) => page.id === requestedPageId) ?? project.document.pages[0];

    if (!activePage) notFound();

    const createProjectPage = createPage.bind(null, id);

    const pageNavigation = (
        <nav
            aria-label="Project pages"
            className="mt-6 flex gap-2"
        >
            {project.document.pages.map((page) => (
                <Link
                    key={page.id}
                    href={{
                        pathname: `/projects/${id}`,
                        query: isPreviewMode
                            ? { page: page.id, mode: "preview" }
                            : { page: page.id },
                    }}
                    className={
                        page.id === activePage.id
                            ? "rounded bg-black px-4 py-2 text-white"
                            : "rounded border px-4 py-2"
                    }
                >
                    {page.name}
                </Link>
            ))}
        </nav>
    );

    if (isPreviewMode) {
        return (
            <main className="mx-auto max-w-4xl px-6 py-12">
                <h1 className="text-3xl font-semibold">{project.name}</h1>
                <Link
                    href={{
                        pathname: `/projects/${id}`,
                        query: { page: activePage.id },
                    }}
                    className="mt-4 inline-block rounded border px-4 py-2"
                >
                    Back to editor
                </Link>
                {pageNavigation}
                <div className="mt-6">
                    <ProjectPagePreview page={activePage} />
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-4xl px-6 py-12">
            <h1 className="text-3xl font-semibold">{project.name}</h1>
            <Link
                href={{
                    pathname: `/projects/${id}`,
                    query: { page: activePage.id, mode: "preview" },
                }}
                className="mt-4 inline-block rounded border px-4 py-2"
            >
                Preview
            </Link>
            <form action={createProjectPage} className="mt-6 flex gap-2">
                <input
                    name="name"
                    placeholder="New page name..."
                    required
                    maxLength={50}
                    className="flex-1 rounded border p-2"
                />
                <button
                    type="submit"
                    className="rounded bg-black px-4 py-2 text-white"
                >
                    Add Page
                </button>
            </form>
            {pageNavigation}
            <ul className="mt-6 space-y-2">
                {project.document.pages.filter((page) => page.id === activePage.id).map((page) => {
                    const addText = addTextNode.bind(null, id, page.id);
                    const rename = renamePage.bind(null, id, page.id);
                    const deletePageAction = deletePage.bind(null, id, page.id);
                    const addButton = addButtonNode.bind(null, id, page.id);
                    const reorder = reorderNode.bind(null, id, page.id);

                    return (
                        <li key={page.id}>
                            <PageNameEditor
                                key={page.id}
                                pageName={page.name}
                                action={rename}
                                deleteAction={deletePageAction}
                                isHome={page.id === project.document.pages[0].id}
                            />

                            <div className="mt-4 space-y-2">
                                {page.nodes.length === 0 ? (
                                    <p className="text-gray-500">No content yet.</p>
                                ) : (
                                    <SortableNodeList
                                        nodeIds={page.nodes.map((node) => node.id)}
                                        reorderAction={reorder}
                                    >
                                        {page.nodes.map((node, nodeIndex) => {
                                            const moveUp = moveNode.bind(
                                                null,
                                                id,
                                                page.id,
                                                node.id,
                                                "up",
                                            );

                                            const moveDown = moveNode.bind(
                                                null,
                                                id,
                                                page.id,
                                                node.id,
                                                "down",
                                            );

                                            function renderEditor() {
                                                switch (node.type) {
                                                    case "text": {
                                                        const updateText = updateTextNode.bind(
                                                            null,
                                                            id,
                                                            page.id,
                                                            node.id,
                                                        );

                                                        const deleteText = deleteTextNode.bind(
                                                            null,
                                                            id,
                                                            page.id,
                                                            node.id,
                                                        );

                                                        return (
                                                            <TextNodeEditor
                                                                node={node}
                                                                action={updateText}
                                                                deleteAction={deleteText}
                                                            />
                                                        );
                                                    }

                                                    case "button": {
                                                        const updateButton = updateButtonNode.bind(
                                                            null,
                                                            id,
                                                            page.id,
                                                            node.id,
                                                        );

                                                        const deleteButton = deleteButtonNode.bind(
                                                            null,
                                                            id,
                                                            page.id,
                                                            node.id,
                                                        );

                                                        return (
                                                            <ButtonNodeEditor
                                                                node={node}
                                                                action={updateButton}
                                                                deleteAction={deleteButton}
                                                            />
                                                        );
                                                    }
                                                }
                                            }

                                            return (
                                                <div
                                                    key={node.id}
                                                    className="flex items-start gap-2"
                                                >
                                                    <NodeMoveControls
                                                        moveUpAction={moveUp}
                                                        moveDownAction={moveDown}
                                                        canMoveUp={nodeIndex > 0}
                                                        canMoveDown={nodeIndex < page.nodes.length - 1}
                                                    />

                                                    <div className="flex-1">{renderEditor()}</div>
                                                </div>
                                            );
                                        })}
                                    </SortableNodeList>
                                )
                                }
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
                            <form action={addButton} className="mt-3 flex gap-2">
                                <input
                                    name="label"
                                    placeholder="Button label"
                                    required
                                    maxLength={100}
                                    className="flex-1 rounded border p-2"
                                />
                                <input
                                    name="href"
                                    placeholder="Button href"
                                    required
                                    maxLength={2048}
                                    className="flex-1 rounded border p-2"
                                />
                                <button
                                    type="submit"
                                    className="rounded bg-black px-4 py-2 text-white"
                                >
                                    Add Button
                                </button>
                            </form>
                        </li>
                    );
                })}
            </ul>
        </main>
    );
}