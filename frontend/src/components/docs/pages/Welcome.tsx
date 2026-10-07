import { Link } from "react-router-dom";

import DocHeader from "../DocHeader";

export default function Welcome() {
  return (
    <article className="space-y-8">
      <DocHeader
        category="Getting Started"
        title="Welcome"
        lead="Visual Assistant is a full-stack reference implementation of an image-aware chat API. Upload an image, get an initial analysis, and hold a back-and-forth conversation about it with streaming replies."
      />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">What it does</h2>
        <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-300">
          <li>Accepts image uploads (PNG, JPG, JPEG, GIF; up to 16 MB)</li>
          <li>Returns an initial mocked vision analysis in OpenAI&apos;s Responses API shape</li>
          <li>Supports back-and-forth chat with per-image conversation history</li>
          <li>Streams chat replies as named Server-Sent Events</li>
          <li>Persists everything in Postgres, cascading cleanup on delete</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Stack</h2>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-4">
            <div className="mb-1 text-xs uppercase tracking-wider text-slate-500">
              Backend
            </div>
            <p className="text-slate-300">
              Flask 3 · SQLAlchemy 2 · Alembic · psycopg 3 · Flask-Limiter · gunicorn + gevent
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-4">
            <div className="mb-1 text-xs uppercase tracking-wider text-slate-500">
              Frontend
            </div>
            <p className="text-slate-300">
              React 19 · TypeScript · Vite · Tailwind CSS · react-router
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-4">
            <div className="mb-1 text-xs uppercase tracking-wider text-slate-500">
              Infrastructure
            </div>
            <p className="text-slate-300">
              Postgres 16 · nginx reverse proxy · Docker Compose
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-4">
            <div className="mb-1 text-xs uppercase tracking-wider text-slate-500">
              AI shape
            </div>
            <p className="text-slate-300">
              OpenAI Responses API (object, output[], output_text, named SSE events)
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-5">
        <h3 className="mb-2 text-sm font-semibold text-teal-300">Try it</h3>
        <p className="mb-3 text-sm text-slate-300">
          The interactive demo lets you upload an image and chat about it right now.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-teal-300 hover:text-teal-200"
        >
          Open demo →
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Where to go next</h2>
        <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-300">
          <li>
            <Link to="/docs/quickstart" className="text-teal-300 hover:text-teal-200">
              Quickstart
            </Link>{" "}
            — run the stack locally in three commands
          </li>
          <li>
            <Link to="/docs/error-envelope" className="text-teal-300 hover:text-teal-200">
              Error envelope
            </Link>{" "}
            — the shared error shape every endpoint returns
          </li>
          <li>
            <Link to="/docs/endpoints/upload" className="text-teal-300 hover:text-teal-200">
              Endpoint reference
            </Link>{" "}
            — one page per endpoint with examples and curl snippets
          </li>
        </ul>
      </section>
    </article>
  );
}
