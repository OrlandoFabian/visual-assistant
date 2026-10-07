import CodeBlock from "../CodeBlock";
import DocHeader from "../DocHeader";

export default function Logging() {
  return (
    <article className="space-y-8">
      <DocHeader
        category="Concepts"
        title="Logging"
        lead="The backend emits one JSON object per log line to stdout. Container log collectors (docker, CloudWatch, Loki, Datadog) ingest the lines without regex, and every entry carries a request_id so a single HTTP call can be grepped end-to-end."
      />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Shape</h2>
        <CodeBlock
          language="json"
          code={`{
  "timestamp": "2026-10-07T15:20:00.123Z",
  "level": "INFO",
  "logger": "app",
  "message": "request",
  "request_id": "8ecc62d4e2874368a9ba5d18d59b9c61",
  "method": "POST",
  "path": "/chat/img_abc123",
  "status": 200,
  "duration_ms": 231.4
}`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Base fields</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="py-2 pr-4">Field</th>
              <th className="py-2 pr-4">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">timestamp</td>
              <td className="py-2 pr-4">ISO 8601 UTC string</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">level</td>
              <td className="py-2 pr-4">INFO · WARNING · ERROR · CRITICAL</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">logger</td>
              <td className="py-2 pr-4">Which logger emitted the record (app, flask-limiter, sqlalchemy, etc.)</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">message</td>
              <td className="py-2 pr-4">The logged string</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">request_id</td>
              <td className="py-2 pr-4">Current request&apos;s correlation ID, or null outside a request</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Per-request fields</h2>
        <p className="text-sm text-slate-300">
          Every completed request emits one summary log line with:
        </p>
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
          <li><code className="font-mono text-teal-300">method</code> — HTTP method</li>
          <li><code className="font-mono text-teal-300">path</code> — requested path</li>
          <li><code className="font-mono text-teal-300">status</code> — response status code</li>
          <li><code className="font-mono text-teal-300">duration_ms</code> — handler latency in milliseconds (1 decimal)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Error traces</h2>
        <p className="text-sm text-slate-300">
          When an exception is logged (e.g. a mid-stream SSE failure), the
          formatter attaches the full traceback as an <code className="font-mono">exception</code> field in the same JSON object. One log line carries both the summary and the stack trace.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Grep tips</h2>
        <CodeBlock
          language="bash"
          code={`# All logs for one request
docker compose logs backend | grep '"request_id":"<id>"'

# Only errors
docker compose logs backend | grep '"level":"ERROR"'

# Slow requests (> 1 second)
docker compose logs backend | python3 -c "
import sys, json
for line in sys.stdin:
    try:
        d = json.loads(line)
        if d.get('duration_ms', 0) > 1000:
            print(line, end='')
    except: pass
"`}
        />
      </section>
    </article>
  );
}
