import { requireUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { createProject } from "@/app/projects/actions";

export default async function Home() {
  const user = await requireUser();
  const projectList = await getDb()
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .where(eq(projects.ownerId, user.id))
    .orderBy(desc(projects.updatedAt));

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Your VibeHub workspace</h1>
      <p className="mt-4">Signed in as {user.email}</p>
      <form action={createProject}>
        <input
          name="name"
          placeholder="Project name"
          required
          maxLength={100}
        />
        <button type="submit">Create project</button>
      </form>
      {projectList.length === 0 ? (
        <p className="mt-6 text-gray-600">No projects yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {projectList.map((project) => (
            <li key={project.id}>{project.name}</li>
          ))}
        </ul>
      )}
    </main>
  );
}