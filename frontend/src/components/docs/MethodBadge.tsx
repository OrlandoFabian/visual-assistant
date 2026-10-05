interface Props {
  method: "GET" | "POST" | "PUT" | "DELETE";
}

const COLORS: Record<string, string> = {
  GET: "bg-blue-500/20 text-blue-300 border-blue-700/50",
  POST: "bg-teal-500/20 text-teal-300 border-teal-700/50",
  PUT: "bg-amber-500/20 text-amber-300 border-amber-700/50",
  DELETE: "bg-red-500/20 text-red-300 border-red-700/50",
};

export default function MethodBadge({ method }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-xs font-semibold ${COLORS[method]}`}
    >
      {method}
    </span>
  );
}
