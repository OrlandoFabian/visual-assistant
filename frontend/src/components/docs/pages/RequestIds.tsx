import CodeBlock from "../CodeBlock";
import DocHeader from "../DocHeader";

export default function RequestIds() {
  return (
    <article className="space-y-8">
      <DocHeader
        category="Concepts"
        title="Request IDs"
        lead="Every request gets a unique ID — like a ticket number at a busy counter — that follows it through every log line it produces. One grep returns the full story for one user interaction."
      />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
        <ol className="list-inside list-decimal space-y-1.5 text-sm text-slate-300">
          <li>
            On arrival, the server reads an{" "}
            <code className="font-mono text-teal-300">X-Request-ID</code> header
            if present (handy when a frontend or edge proxy already minted one).
          </li>
          <li>
            If missing, the server generates a fresh{" "}
            <code className="font-mono text-teal-300">uuid4().hex</code>.
          </li>
          <li>
            The ID is attached to the Flask request-scope so any code in the
            same request can read it.
          </li>
          <li>
            Every log line emitted during the request carries{" "}
            <code className="font-mono text-teal-300">request_id</code>{" "}
            automatically via a logging filter.
          </li>
          <li>
            The response echoes the ID back as{" "}
            <code className="font-mono text-teal-300">X-Request-ID</code> so the
            client can surface it to support.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Sending your own</h2>
        <CodeBlock
          language="bash"
          code={`curl -H "X-Request-ID: trace-abc-123" http://localhost:8000/health`}
        />
        <p className="text-sm text-slate-400">
          The server echoes <code className="font-mono text-teal-300">trace-abc-123</code> back
          in the response headers instead of generating a new one.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Finding one request&apos;s log trail</h2>
        <CodeBlock
          language="bash"
          code={`docker compose logs backend | grep "trace-abc-123"`}
        />
        <p className="text-sm text-slate-400">
          Returns every structured log line produced during that one request —
          method, path, duration, any errors, in order.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Why this matters</h2>
        <p className="text-sm text-slate-300">
          Without request IDs, a user complaint like &ldquo;I got a 500 at 3 PM&rdquo;
          turns into needle-in-a-haystack log scanning. With them, support asks
          &ldquo;what&apos;s the X-Request-ID in your network tab?&rdquo; and
          the entire server-side trace is one grep away.
        </p>
      </section>
    </article>
  );
}
