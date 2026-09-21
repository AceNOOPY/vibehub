"use client";

import { useState } from "react";

type PageNameEditorProps = {
    pageName: string;
    action: (formData: FormData) => Promise<void>;
    deleteAction: () => Promise<void>;
    isHome: boolean;
};

export function PageNameEditor({ pageName, action, deleteAction, isHome }: PageNameEditorProps) {
    const [name, setName] = useState(pageName);
    const [isEditing, setIsEditing] = useState(false);

    async function handleSubmit(formData: FormData) {
        await action(formData);
        setName(name.trim());
        setIsEditing(false);
    }

    async function handleDelete() {
        const confirmed = window.confirm("Are you sure you want to delete this page?");
        
        if (!confirmed) {
            return;
        }
        await deleteAction();
    }

    function handleCancel() {
        setName(pageName);
        setIsEditing(false);
    }

    if (!isEditing) {
        return (
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">{name}</h2>

                <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded border px-3 py-1"
                >
                    Rename
                </button>
                {!isHome && (
                <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded border border-red-600 px-3 py-1 text-red-600"
                >
                    Delete
                </button>
                )}
            </div>
        );
    }

    return (
        <form action={handleSubmit} className="flex gap-2">
            <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                className="flex-1 rounded border p-2"
            />

            <button
                type="submit"
                className="rounded bg-black px-4 py-2 text-white"
            >
                Save
            </button>

            <button
                type="button"
                onClick={handleCancel}
                className="rounded border px-4 py-2"
            >
                Cancel
            </button>
        </form>
    );
}