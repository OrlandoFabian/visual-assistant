import CodeBlock from "./CodeBlock";
import MethodBadge from "./MethodBadge";
import StatusBadge from "./StatusBadge";

export interface Endpoint {
  method: "GET" | "POST";
  path: string;
  summary: string;
  description: string;
  request?: {
    contentType: string;
    example: string;
    description?: string;
  };
  responses: Array<{
    status: number;
    description: string;
    example?: string;
  }>;
  curl: string;
}

interface Props {
  endpoint: Endpoint;
}

export default function EndpointCard({ endpoint }: Props) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <MethodBadge method={endpoint.method} />
        <code className="font-mono text-lg text-slate-100">{endpoint.path}</code>
      </header>

      <p className="mb-6 text-sm leading-relaxed text-slate-300">
        {endpoint.description}
      </p>

      {endpoint.request && (
        <section className="mb-6 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Request
          </h3>
          {endpoint.request.description && (
            <p className="text-sm text-slate-400">
              {endpoint.request.description}
            </p>
          )}
          <p className="text-xs text-slate-500">
            Content-Type:{" "}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">
              {endpoint.request.contentType}
            </code>
          </p>
          <CodeBlock code={endpoint.request.example} language="json" />
        </section>
      )}

      <section className="mb-6 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Responses
        </h3>
        <div className="space-y-4">
          {endpoint.responses.map((r) => (
            <div key={r.status} className="space-y-2">
              <div className="flex items-center gap-3">
                <StatusBadge status={r.status} />
                <span className="text-sm text-slate-300">{r.description}</span>
              </div>
              {r.example && <CodeBlock code={r.example} language="json" />}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Example
        </h3>
        <CodeBlock code={endpoint.curl} language="bash" />
      </section>
    </article>
  );
}
