export interface LocalMessage {
  role: "user" | "assistant";
  content: string;
  partial?: boolean;
}

interface Props {
  messages: LocalMessage[];
  streamContent: string | null;
}

export default function MessageList({ messages, streamContent }: Props) {
  return (
    <div className="space-y-6">
      {messages.map((msg, i) =>
        msg.role === "user" ? (
          <UserBubble key={i} content={msg.content} />
        ) : (
          <AssistantBubble key={i} content={msg.content} partial={msg.partial} />
        ),
      )}
      {streamContent !== null && (
        <AssistantBubble content={streamContent} streaming />
      )}
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-slate-800 px-4 py-2.5 text-sm leading-relaxed text-slate-100">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

interface AssistantBubbleProps {
  content: string;
  partial?: boolean;
  streaming?: boolean;
}

function AssistantBubble({ content, partial, streaming }: AssistantBubbleProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs">
        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500" />
        <span className="text-slate-400">Assistant</span>
        {partial && (
          <span className="rounded bg-amber-900/40 px-1.5 py-0.5 text-amber-300">
            partial
          </span>
        )}
      </div>
      <div className="pl-7 text-sm leading-relaxed text-slate-200">
        <p className="whitespace-pre-wrap">
          {content}
          {streaming && (
            <span className="ml-0.5 inline-block h-4 w-[3px] translate-y-1 animate-pulse bg-teal-400" />
          )}
        </p>
      </div>
    </div>
  );
}
