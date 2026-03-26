"use client";

interface MessageViewProps {
  message: {
    id: string;
    from: string;
    from_name: string;
    subject: string;
    text: string;
    html: string;
    received_at: string;
    has_attachments: boolean;
    attachments: any[];
  } | null;
  isLoading: boolean;
  onBack: () => void;
}

function sanitizeHtml(html: string): string {
  if (!html) return "";
  // Remove script tags and event handlers for safety
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

export default function MessageView({
  message,
  isLoading,
  onBack,
}: MessageViewProps) {
  if (isLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/5 mb-6" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (!message) return null;

  const formattedDate = new Date(message.received_at).toLocaleString();
  const hasHtml = message.html && message.html.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3 md:hidden"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          {message.subject || "(No subject)"}
        </h2>
        <div className="mt-2 text-sm text-gray-500 space-y-0.5">
          <p>
            <span className="text-gray-400">From:</span>{" "}
            {message.from_name ? `${message.from_name} <${message.from}>` : message.from}
          </p>
          <p>
            <span className="text-gray-400">Date:</span> {formattedDate}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {hasHtml ? (
          <div
            className="prose prose-sm max-w-none [&_img]:max-w-full [&_a]:text-primary [&_table]:text-sm"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(message.html),
            }}
          />
        ) : (
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
            {message.text || "No content"}
          </pre>
        )}
      </div>
    </div>
  );
}
