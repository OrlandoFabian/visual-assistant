interface Props {
  category: string;
  title: string;
  lead?: string;
}

export default function DocHeader({ category, title, lead }: Props) {
  return (
    <header className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">
        {category}
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      {lead && <p className="text-lg leading-relaxed text-slate-300">{lead}</p>}
    </header>
  );
}
