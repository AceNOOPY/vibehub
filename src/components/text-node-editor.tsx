"use client";

import { useState } from "react";

import type { TextNode } from "@/db/project-document";

type TextNodeEditorProps = {
    node: TextNode;
    action: (formData: FormData) => Promise<void>;
};

export function TextNodeEditor({ node, action }: TextNodeEditorProps) {
    const [text, setText] = useState(node.props.text);
    const [isEditing, setIsEditing] = useState(false);

    async function handleSubmit(formData: FormData) {
        await action(formData);
        setText(text.trim());
        setIsEditing(false);
    }

    function handleCancel() {
        setText(node.props.text);
        setIsEditing(false);
    }

    if (!isEditing) {
        return (
            <div className="flex items-center gap-3">
                <p className="flex-1">{text}</p>

                <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded border px-3 py-1"
                >
                    Edit
                </button>
            </div>
        );
    }

    return (
        <form
            action={handleSubmit} className="flex gap-2">
            <input
                name="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text..."
                required
                maxLength={2000}
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