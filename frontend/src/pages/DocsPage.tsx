import CodeBlock from "../components/docs/CodeBlock";
import EndpointCard from "../components/docs/EndpointCard";
import { endpoints } from "../components/docs/endpoints";

export default function DocsPage() {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">API Documentation</h1>
        <p className="max-w-2xl text-slate-400">
          A Flask API that accepts image uploads, returns mocked OpenAI vision
          analysis, and supports streaming chat about each image with per-image
          conversation history.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
        <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/30 p-6 text-sm md:grid-cols-2">
          <div>
            <div className="mb-1 text-xs uppercase tracking-wider text-slate-500">
              Base URL
            </div>
            <code className="font-mono text-teal-300">http://localhost:8000</code>
          </div>
          <div>
            <div className="mb-1 text-xs uppercase tracking-wider text-slate-500">
              Response format
            </div>
            <span className="text-slate-300">
              JSON · chat endpoints match OpenAI's chat.completion shape
            </span>
          </div>
          <div>
            <div className="mb-1 text-xs uppercase tracking-wider text-slate-500">
              Max upload
            </div>
            <span className="text-slate-300">16 MB · PNG, JPG, JPEG, GIF</span>
          </div>
          <div>
            <div className="mb-1 text-xs uppercase tracking-wider text-slate-500">
              Streaming
            </div>
            <span className="text-slate-300">
              Server-Sent Events (text/event-stream)
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Error envelope</h2>
        <p className="text-sm text-slate-400">
          All errors return a consistent JSON envelope matching OpenAI's error shape.
        </p>
        <CodeBlock
          language="json"
          code={`{
  "error": {
    "message": "Human-readable description",
    "type": "invalid_request_error",
    "code": "machine_readable_identifier"
  }
}`}
        />
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight">Endpoints</h2>
        <div className="space-y-6">
          {endpoints.map((endpoint) => (
            <EndpointCard
              key={`${endpoint.method}-${endpoint.path}`}
              endpoint={endpoint}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
