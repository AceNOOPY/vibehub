# VibeHub AI Development Instructions

## Project
VibeHub is a web-first AI-powered mini-app builder and marketplace.

## Technology Stack
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase PostgreSQL
- Supabase Auth
- Drizzle ORM
- npm
- Git and GitHub

## Working Rules
- Read existing repository files before making changes.
- Prefer small, focused changes.
- Do not modify unrelated files.
- Avoid unnecessary dependencies.
- Prefer free and open-source tools or free service tiers where practical.
- Do not enable paid APIs or services without explicit approval.
- Explain significant implementation decisions.
- Report failed checks honestly.

## Code Quality
- Use TypeScript.
- Follow existing linting and formatting rules.
- Prefer reusable components.
- Avoid duplicated logic.
- Keep functions and components focused.
- Run relevant lint, type-check, test, and build commands after meaningful changes.

## Security
- Never commit secrets, API keys, passwords, tokens, or credentials.
- Never expose privileged Supabase credentials in client-side code.
- Keep environment-specific secrets outside source control.
- Do not perform destructive database operations without explicit approval.

## Database
- Use Drizzle ORM for application database access unless explicitly changed.
- Keep schema changes reproducible through migrations.
- Do not manually alter production schemas or data.

## Git
- Check git status before broad changes.
- Preserve unrelated uncommitted work.
- Do not force-push or rewrite history unless explicitly requested.
- Keep commits focused and descriptive.

## AI Portability
VibeHub must not depend on one AI coding provider.

Codex and Gemini must:
- Use this repository as the source of truth.
- Follow the same architecture and coding standards.
- Read repository documentation before continuing existing work.
- Store durable decisions in repository files rather than relying on chat history.
- Avoid provider-specific application dependencies unless explicitly required.

## Handoff
After meaningful work:
- Record what was completed.
- Record unresolved issues.
- Record the next logical step.
- Leave enough repository context for another AI assistant to continue.
