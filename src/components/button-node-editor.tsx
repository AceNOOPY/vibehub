"use client";

import { useState } from "react";

import type { ButtonNode, ButtonVariant } from "@/db/project-document";

const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-blue-600 text-white",
    secondary: "bg-slate-200 text-slate-900",
    outline: "border border-slate-500 bg-transparent text-slate-900",
};

type ButtonNodeEditorProps = {
    node: ButtonNode;
    action: (formData: FormData) => Promise<void>;
    deleteAction: () => Promise<void>;
};

export function ButtonNodeEditor({ node, action, deleteAction }: ButtonNodeEditorProps) {
    const [label, setLabel] = useState(node.props.label);
    const [href, setHref] = useState(node.props.href);
    const [variant, setVariant] = useState<ButtonVariant>(
        node.props.variant ?? "primary",
    );
    const [isEditing, setIsEditing] = useState(false);

    async function handleSubmit(formData: FormData) {
        await action(formData);
        setLabel(label.trim());
        setHref(href.trim());
        setIsEditing(false);
    }

    async function handleDelete() {
        const confirmed = window.confirm("Are you sure you want to delete this button?");
        if (!confirmed) {
            return;
        }
        await deleteAction();
    }

    function handleCancel() {
        setLabel(node.props.label);
        setHref(node.props.href);
        setVariant(node.props.variant ?? "primary");
        setIsEditing(false);
    }

    if (!isEditing) {
        return (
            <div className="flex items-center gap-2">
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-block rounded px-4 py-2 ${variantClasses[variant]}`}
                >
                    {label}
                </a>

                <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded border px-3 py-2"
                >
                    Edit
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded border border-red-600 px-3 py-2 text-red-600"
                >
                    Delete
                </button>
            </div>
        );
    }

    return (
        <form action={handleSubmit} className="flex gap-2">
            <input
                name="label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                required
                maxLength={100}
                className="flex-1 rounded border p-2"
            />
            <input
                name="href"
                value={href}
                onChange={(event) => setHref(event.target.value)}
                required
                maxLength={2048}
                className="flex-1 rounded border p-2"
            />
            <select
                name="variant"
                aria-label="Button variant"
                value={variant}
                onChange={(event) =>
                    setVariant(event.target.value as ButtonVariant)
                }
                className="rounded border p-2"
            >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
            </select>
            <button
                type="submit"
                className="rounded bg-black px-4 py-2 text-white"
            >
                Save
            </button>

            <button
                type="button"
                onClick={handleCancel}
                className="rounded border px-3 py-2"
            >
                Cancel
            </button>
        </form>
    );
}
