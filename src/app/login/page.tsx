"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const [mode, setMode] = useState<"signin" | "signup">("signin");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        setMessage("");

        const form = new FormData(event.currentTarget);
        const email = String(form.get("email"));
        const password = String(form.get("password"));

        const supabase = createClient();
        const { data, error } =
            mode === "signup"
                ? await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                })
                : await supabase.auth.signInWithPassword({ email, password });

        setBusy(false);
        if (error) {
            setMessage(error.message);
            return;
        }

        if (!data.session) {
            setMessage("Check your email to confirm your account.");
            return;
        }

        router.replace("/");
        router.refresh();
    }

    return (
        <main className="mx-auto max-w-sm px-6 py-20">
            <h1 className="text-3xl font-semibold">
                {mode === "signup" ? "Create your VibeHub account" : "Sign in to VibeHub"}
            </h1>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">

                <input name="email" type="email" placeholder="Email" required
                    className="w-full rounded border p-3" />
                <input name="password" type="password" placeholder="Password" required
                    className="w-full rounded border p-3" />

                {message && <p role="alert" className="text-red-600">{message}</p>}

                <button
                    type="submit"
                    disabled={busy}
                    className="rounded bg-black px-5 py-3 text-white"
                >
                    {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
                </button>
                
                <button
                    type="button"
                    onClick={() => {
                        setMode(mode === "signup" ? "signin" : "signup");
                        setMessage("");
                    }}
                    className="block text-sm underline"
                >
                    {mode === "signup" ? "Already have an account? Sign in" : "Create an account"}
                </button>
            </form>
        </main>
    );
}