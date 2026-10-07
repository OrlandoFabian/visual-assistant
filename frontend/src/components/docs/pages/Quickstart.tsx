import CodeBlock from "../CodeBlock";
import DocHeader from "../DocHeader";

export default function Quickstart() {
  return (
    <article className="space-y-8">
      <DocHeader
        category="Getting Started"
        title="Quickstart"
        lead="From a fresh clone of the repository to a running UI in three commands."
      />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Prerequisite</h2>
        <p className="text-sm text-slate-300">
          Docker Desktop installed and running. No local Python or Node install
          is required — all three services (backend, frontend, Postgres) run as
          containers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Boot the stack</h2>
        <CodeBlock
          language="bash"
          code={`cd inkit-visual-assistant
make dev`}
        />
        <p className="text-sm text-slate-400">
          First run takes 1–2 minutes to build images. Subsequent runs are cached
          and start in seconds. The command runs <code className="font-mono text-teal-300">flask db upgrade</code>{" "}
          on the backend container automatically, so the schema is always
          up-to-date before traffic is served.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Open the UI</h2>
        <p className="text-sm text-slate-300">
          Once all three services are healthy, open{" "}
          <a
            href="http://localhost:3000"
            className="font-mono text-teal-300 hover:text-teal-200"
          >
            http://localhost:3000
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Try it</h2>
        <ol className="list-inside list-decimal space-y-1.5 text-sm text-slate-300">
          <li>Drop any PNG or JPG onto the upload zone</li>
          <li>Watch the initial analysis appear as an assistant message</li>
          <li>Type a question and hit Enter</li>
          <li>Toggle the <strong>Streaming</strong> button to see word-by-word responses</li>
          <li>Open DevTools → Network to watch the SSE event stream in real time</li>
          <li>Upload more images and use the sidebar pagination to flip between them</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Teardown</h2>
        <CodeBlock
          language="bash"
          code="make clean"
        />
        <p className="text-sm text-slate-400">
          Stops all containers and removes the Postgres volume for a clean next run.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Ports in use</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="py-2 pr-4">Port</th>
              <th className="py-2 pr-4">Service</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">3000</td>
              <td className="py-2 pr-4">Frontend (nginx reverse proxy)</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">8000</td>
              <td className="py-2 pr-4">Backend (gunicorn + gevent)</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-teal-300">5432</td>
              <td className="py-2 pr-4">Postgres</td>
            </tr>
          </tbody>
        </table>
      </section>
    </article>
  );
}
