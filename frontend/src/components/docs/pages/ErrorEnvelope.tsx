import CodeBlock from "../CodeBlock";

export default function ErrorEnvelope() {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">
          Concepts
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Error envelope</h1>
        <p className="text-lg leading-relaxed text-slate-300">
          Every error response — validation failure, rate limit, unknown image —
          returns the same JSON shape, modeled after OpenAI&apos;s own error
          format. Clients only need one parser.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Shape</h2>
        <CodeBlock
          language="json"
          code={`{
  "error": {
    "message": "Human-readable description of what went wrong",
    "type": "invalid_request_error",
    "code": "machine_readable_identifier"
  }
}`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Fields</h2>
        <dl className="space-y-3 text-sm">
          <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-4">
            <dt className="font-mono text-teal-300">message</dt>
            <dd className="mt-1 text-slate-300">
              Human-readable sentence suitable for showing to a user. May change
              between releases; don&apos;t key logic on this.
            </dd>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-4">
            <dt className="font-mono text-teal-300">type</dt>
            <dd className="mt-1 text-slate-300">
              Broad category. Always <code className="font-mono">invalid_request_error</code> for
              4xx validation / resource / limit errors; <code className="font-mono">server_error</code>{" "}
              for 5xx.
            </dd>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-4">
            <dt className="font-mono text-teal-300">code</dt>
            <dd className="mt-1 text-slate-300">
              Stable machine-readable identifier. Safe to branch on in client
              code. See the table below.
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Codes</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Code</th>
              <th className="py-2 pr-4">Meaning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">400</td>
              <td className="py-2 pr-4 font-mono">no_file</td>
              <td className="py-2 pr-4">Upload request has no file field</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">400</td>
              <td className="py-2 pr-4 font-mono">missing_prompt</td>
              <td className="py-2 pr-4">Chat request body has no prompt field</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">400</td>
              <td className="py-2 pr-4 font-mono">invalid_prompt</td>
              <td className="py-2 pr-4">Prompt is empty, whitespace-only, or not a string</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">400</td>
              <td className="py-2 pr-4 font-mono">prompt_too_long</td>
              <td className="py-2 pr-4">Prompt exceeds 4000 characters</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">400</td>
              <td className="py-2 pr-4 font-mono">invalid_pagination</td>
              <td className="py-2 pr-4">limit/offset are non-integers, negative, or exceed the cap</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">404</td>
              <td className="py-2 pr-4 font-mono">image_not_found</td>
              <td className="py-2 pr-4">image_id doesn&apos;t exist</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">404</td>
              <td className="py-2 pr-4 font-mono">not_found</td>
              <td className="py-2 pr-4">Route doesn&apos;t exist (generic Flask 404)</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">405</td>
              <td className="py-2 pr-4 font-mono">method_not_allowed</td>
              <td className="py-2 pr-4">Wrong HTTP verb for a known route</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">413</td>
              <td className="py-2 pr-4 font-mono">file_too_large</td>
              <td className="py-2 pr-4">Upload exceeds the 16 MB cap</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">415</td>
              <td className="py-2 pr-4 font-mono">unsupported_file_type</td>
              <td className="py-2 pr-4">Extension not in the allow-list, or magic-byte sniff failed</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">415</td>
              <td className="py-2 pr-4 font-mono">mime_extension_mismatch</td>
              <td className="py-2 pr-4">Content doesn&apos;t match the extension (renamed executable)</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">429</td>
              <td className="py-2 pr-4 font-mono">rate_limit_exceeded</td>
              <td className="py-2 pr-4">Too many requests from this IP</td>
            </tr>
          </tbody>
        </table>
      </section>
    </article>
  );
}
