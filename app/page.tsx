"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import EmailHeader from "@/components/EmailHeader";
import Inbox, { InboxMessage } from "@/components/Inbox";
import MessageView from "@/components/MessageView";
import FeaturesSection from "@/components/FeaturesSection";
import ComparisonTable from "@/components/ComparisonTable";
import Testimonials from "@/components/Testimonials";
import SocialProof from "@/components/SocialProof";
import ArticleContent from "@/components/ArticleContent";
import FAQ from "@/components/FAQ";
import BlogInsights from "@/components/BlogInsights";
import Footer from "@/components/Footer";

interface FullMessage {
  id: string;
  from: string;
  from_name: string;
  subject: string;
  text: string;
  html: string;
  received_at: string;
  has_attachments: boolean;
  attachments: any[];
}

type SiteContent = Record<string, Record<string, string>>;

const STORAGE_KEY = "tempmail_email";

export default function Home() {
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fullMessage, setFullMessage] = useState<FullMessage | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [siteContent, setSiteContent] = useState<SiteContent>({});

  // Fetch site content from DB
  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => { if (data && !data.error) setSiteContent(data); })
      .catch(() => {});
  }, []);

  const saveSession = useCallback((address: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, address);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!email) return;

    try {
      const res = await fetch(
        `/api/temp-email/messages?email=${encodeURIComponent(email)}`
      );
      if (!res.ok) return;
      const data = await res.json();

      if (data.success && Array.isArray(data.messages)) {
        const formattedMessages: InboxMessage[] = data.messages.map((msg: any) => ({
          id: msg.id,
          from: { address: msg.from, name: msg.from_name },
          subject: msg.subject,
          intro: msg.subject,
          seen: msg.is_seen,
          isDeleted: false,
          hasAttachments: msg.has_attachments,
          size: 0,
          downloadUrl: "",
          createdAt: msg.received_at,
          updatedAt: msg.received_at,
        }));
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, [email]);

  const createNewAccount = useCallback(async (domain?: string) => {
    setAccountLoading(true);
    setError(null);
    setMessages([]);
    setSelectedId(null);
    setFullMessage(null);
    clearSession();

    try {
      const res = await fetch("/api/temp-email/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      if (!res.ok) throw new Error("Failed to create email");

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setEmail(data.email);
      saveSession(data.email);

      // Fetch messages immediately
      setTimeout(() => fetchMessages(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAccountLoading(false);
    }
  }, [clearSession, saveSession, fetchMessages]);

  // On mount: try to restore from localStorage, otherwise create new account
  useEffect(() => {
    async function init() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setEmail(stored);
          setAccountLoading(false);
          // Fetch messages for stored email
          setTimeout(() => {
            fetch(`/api/temp-email/messages?email=${encodeURIComponent(stored)}`)
              .then(res => res.json())
              .then(data => {
                if (data.success && Array.isArray(data.messages)) {
                  const formattedMessages: InboxMessage[] = data.messages.map((msg: any) => ({
                    id: msg.id,
                    from: { address: msg.from, name: msg.from_name },
                    subject: msg.subject,
                    intro: msg.subject,
                    seen: msg.is_seen,
                    isDeleted: false,
                    hasAttachments: msg.has_attachments,
                    size: 0,
                    downloadUrl: "",
                    createdAt: msg.received_at,
                    updatedAt: msg.received_at,
                  }));
                  setMessages(formattedMessages);
                }
              })
              .catch(() => {
                // If fetch fails, create new email
                clearSession();
                createNewAccount();
              });
          }, 500);
          return;
        }
      } catch {
        // Invalid stored data
      }
      createNewAccount();
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Message polling - fetches every 10 seconds
  useEffect(() => {
    if (!email) return;
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [email, fetchMessages]);

  const handleSelectMessage = useCallback(
    async (id: string) => {
      setSelectedId(id);
      setMessageLoading(true);

      try {
        const res = await fetch(
          `/api/temp-email/messages/${id}?email=${encodeURIComponent(email)}`
        );
        if (!res.ok) throw new Error("Failed to fetch message");

        const data = await res.json();
        if (data.success && data.message) {
          setFullMessage(data.message);

          // Mark as seen
          setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, seen: true } : m))
          );
        }
      } catch (err) {
        console.error("Failed to fetch message:", err);
        setFullMessage(null);
      } finally {
        setMessageLoading(false);
      }
    },
    [email]
  );

  const handleBack = useCallback(() => {
    setSelectedId(null);
    setFullMessage(null);
  }, []);

  const heroTitle = siteContent.hero?.title || "Temp Mail - Your Temporary Email Address";
  const heroSubtitle = siteContent.hero?.subtitle || "This is your unique temporary email address. Copy it and send an email. It will automatically delete when it expires, leaving no trace.";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-white mx-auto max-w-6xl pt-16 pb-5 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center px-4">
          <h1 className="mt-2 font-bold tracking-tight text-gray-900 text-2xl sm:text-5xl">
            {heroTitle}
          </h1>
          <p className="mt-4 text-slate-700 text-sm sm:text-base sm:leading-6 px-4">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Inbox Section */}
      <section id="inbox" className="bg-white mx-auto max-w-6xl px-4 sm:px-6 pb-16 pt-5 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => createNewAccount()}
              className="ml-4 text-red-600 font-medium hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        <EmailHeader
          email={email}
          onChangeAddress={createNewAccount}
          onRefreshInbox={fetchMessages}
          isLoading={accountLoading}
        />

        <div className="mt-4 rounded-lg border-[3px] border-gray-700 overflow-hidden">
          <div className="md:grid md:grid-cols-[340px_1fr] md:divide-x md:divide-gray-200 min-h-[500px]">
            <div className={`overflow-y-auto max-h-[500px] ${selectedId ? "hidden md:block" : ""}`}>
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700">
                  Inbox
                  {messages.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      {messages.length} message{messages.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </h3>
              </div>
              <Inbox messages={messages} selectedId={selectedId} onSelect={handleSelectMessage} isLoading={accountLoading} />
            </div>

            <div className={`overflow-y-auto max-h-[500px] ${selectedId ? "" : "hidden md:flex md:items-center md:justify-center"}`}>
              {selectedId ? (
                <MessageView message={fullMessage} isLoading={messageLoading} onBack={handleBack} />
              ) : (
                <div className="text-center p-8">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <p className="text-sm text-gray-400">Select a message to read</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          Want to save email address, custom domains, or forwarding emails?{" "}
          <a href="#" className="text-blue-500 hover:underline">Upgrade to Premium</a>
        </p>
      </section>

      <FeaturesSection content={siteContent.features} />
      <ComparisonTable content={siteContent.comparison} />
      <Testimonials content={siteContent.testimonials} />
      <SocialProof content={siteContent.social_proof} />
      <ArticleContent content={siteContent.article} />
      <FAQ content={siteContent.faq} />
      <BlogInsights />
      <Footer />
    </div>
  );
}
