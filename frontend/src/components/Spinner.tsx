interface Props {
  className?: string;
}

export default function Spinner({ className = "" }: Props) {
  return (
    <div
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-teal-400 ${className}`}
    />
  );
}
