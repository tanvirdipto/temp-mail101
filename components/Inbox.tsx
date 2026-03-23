"use client";

import EmptyState from "./EmptyState";

export interface InboxMessage {
  id: string;
  from: { address: string; name: string };
  subject: string;
  intro: string;
  seen: boolean;
  createdAt: string;
}

interface InboxProps {
  messages: InboxMessage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

export default function Inbox({
  messages,
  selectedId,
  onSelect,
  isLoading,
}: InboxProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="divide-y divide-gray-100">
      {messages.map((msg) => (
        <button
          key={msg.id}
          onClick={() => onSelect(msg.id)}
          className={`w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 ${
            selectedId === msg.id ? "bg-blue-50 border-l-2 border-primary" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {!msg.seen && (
                  <span className="shrink-0 w-2 h-2 rounded-full bg-primary" />
                )}
                <p
                  className={`text-sm truncate ${
                    msg.seen ? "text-gray-600" : "font-semibold text-gray-900"
                  }`}
                >
                  {msg.from.name || msg.from.address}
                </p>
              </div>
              <p
                className={`text-sm truncate mt-0.5 ${
                  msg.seen ? "text-gray-500" : "font-medium text-gray-800"
                }`}
              >
                {msg.subject || "(No subject)"}
              </p>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {msg.intro}
              </p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">
              {formatTime(msg.createdAt)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
