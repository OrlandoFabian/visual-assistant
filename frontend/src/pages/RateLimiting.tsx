import CodeBlock from "../components/CodeBlock";

export default function RateLimiting() {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">
          Concepts
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Rate limiting</h1>
        <p className="text-lg leading-relaxed text-slate-300">
          Per-IP rate limits protect every write endpoint from flooding.
          Standard <code className="font-mono">X-RateLimit-*</code> headers
          advertise remaining quota on every response so well-behaved clients
          can back off before hitting a 429.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Limits</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="py-2 pr-4">Endpoint</th>
              <th className="py-2 pr-4">Limit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            <tr>
              <td className="py-2 pr-4 font-mono">POST /upload</td>
              <td className="py-2 pr-4">10 / minute</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">POST /chat/&lt;id&gt;</td>
              <td className="py-2 pr-4">60 / minute</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">POST /chat-stream/&lt;id&gt;</td>
              <td className="py-2 pr-4">20 / minute</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">any other endpoint</td>
              <td className="py-2 pr-4">200 / minute (global default)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Response headers</h2>
        <p className="text-sm text-slate-300">
          Every response — success or 429 — includes:
        </p>
        <CodeBlock
          language="http"
          code={`X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1791305100
Retry-After: 60`}
        />
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
          <li><code className="font-mono text-teal-300">X-RateLimit-Limit</code> — the ceiling for the current window</li>
          <li><code className="font-mono text-teal-300">X-RateLimit-Remaining</code> — how many requests you have left</li>
          <li><code className="font-mono text-teal-300">X-RateLimit-Reset</code> — unix timestamp when the window resets</li>
          <li><code className="font-mono text-teal-300">Retry-After</code> — seconds until the next request will succeed (on 429)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">429 response</h2>
        <p className="text-sm text-slate-300">
          When a limit is exceeded, the response reuses the standard error envelope:
        </p>
        <CodeBlock
          language="json"
          code={`{
  "error": {
    "message": "rate limit exceeded: 10 per 1 minute",
    "type": "invalid_request_error",
    "code": "rate_limit_exceeded"
  }
}`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Scaling across instances</h2>
        <p className="text-sm text-slate-300">
          Rate-limit counters are stored in-memory by default, which means each
          backend worker tracks limits independently. Fine for a single-instance
          deploy; for horizontal scaling, point Flask-Limiter at Redis:
        </p>
        <CodeBlock
          language="bash"
          code="RATELIMIT_STORAGE_URI=redis://redis:6379"
        />
        <p className="text-sm text-slate-400">
          Zero code change — limits become fleet-wide once the env var is set.
        </p>
      </section>
    </article>
  );
}
