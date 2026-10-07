interface Props {
  status: number;
}

function colorFor(status: number): string {
  if (status >= 200 && status < 300)
    return "bg-green-500/20 text-green-300 border-green-700/50";
  if (status >= 400 && status < 500)
    return "bg-amber-500/20 text-amber-300 border-amber-700/50";
  if (status >= 500) return "bg-red-500/20 text-red-300 border-red-700/50";
  return "bg-slate-500/20 text-slate-300 border-slate-700/50";
}

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-xs font-semibold ${colorFor(status)}`}
    >
      {status}
    </span>
  );
}
