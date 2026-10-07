import { Link, useParams } from "react-router-dom";

import EndpointCard from "../EndpointCard";
import { endpoints } from "../endpoints";

export default function EndpointPage() {
  const { slug } = useParams<{ slug: string }>();
  const endpoint = endpoints.find((e) => e.slug === slug);

  if (!endpoint) {
    return (
      <article className="space-y-4">
        <h1 className="text-3xl font-semibold">Endpoint not found</h1>
        <p className="text-slate-400">
          No endpoint matches the slug{" "}
          <code className="font-mono text-teal-300">{slug}</code>.
        </p>
        <Link to="/docs/welcome" className="text-sm text-teal-300 hover:text-teal-200">
          ← Back to Welcome
        </Link>
      </article>
    );
  }

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">
          Endpoint
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {endpoint.summary}
        </h1>
      </header>
      <EndpointCard endpoint={endpoint} />
    </article>
  );
}
