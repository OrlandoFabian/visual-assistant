import type { ChatMessage } from "../api/client";

interface Props {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: Props) {
  if (messages.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-500">
        No messages yet. Ask something to get started.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`rounded-lg border p-3 ${
            msg.role === "user"
              ? "border-slate-800 bg-slate-900/40"
              : "border-teal-900/50 bg-teal-950/20"
          }`}
        >
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className={msg.role === "user" ? "text-slate-400" : "text-teal-400"}>
              {msg.role === "user" ? "You" : "Assistant"}
            </span>
            {msg.partial && (
              <span className="rounded bg-amber-900/40 px-2 py-0.5 text-amber-300">
                partial
              </span>
            )}
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
            {msg.content}
          </p>
        </div>
      ))}
    </div>
  );
}
