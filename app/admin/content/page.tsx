"use client";

import { useEffect, useState } from "react";

type ContentData = Record<string, Record<string, string>>;
interface FaqItem { q: string; a: string; }

const SECTIONS = [
  { key: "hero", label: "Hero Section", fields: ["title", "subtitle"] },
  { key: "features", label: "Features", fields: ["title", "subtitle", "items"] },
  { key: "comparison", label: "Comparison Table", fields: ["title", "subtitle", "rows"] },
  { key: "testimonials", label: "Testimonials", fields: ["items"] },
  { key: "social_proof", label: "Social Proof", fields: ["title", "items"] },
  { key: "article", label: "Article Content (HTML)", fields: ["body"] },
];

export default function AdminContent() {
  const [content, setContent] = useState<ContentData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  // FAQ state
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [faqSaving, setFaqSaving] = useState(false);
  const [faqSaved, setFaqSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((res) => res.json())
      .then((data) => {
        setContent(data);
        if (data?.faq?.items) {
          try { setFaqs(JSON.parse(data.faq.items)); } catch { setFaqs([]); }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (section: string, key: string, value: string) => {
    const saveKey = `${section}.${key}`;
    setSaving(saveKey);
    try {
      await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, key, value }),
      });
      setSaved(saveKey);
      setTimeout(() => setSaved(null), 2000);
    } catch { /* silent */ } finally {
      setSaving(null);
    }
  };

  const updateValue = (section: string, key: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const isJsonField = (key: string) => ["items", "rows"].includes(key);
  const isHtmlField = (key: string) => key === "body";

  const formatJson = (val: string) => {
    try { return JSON.stringify(JSON.parse(val), null, 2); } catch { return val; }
  };

  // FAQ handlers
  const updateFaq = (i: number, field: "q" | "a", val: string) => {
    setFaqs((prev) => prev.map((f, idx) => idx === i ? { ...f, [field]: val } : f));
  };

  const addFaq = () => setFaqs((prev) => [...prev, { q: "", a: "" }]);

  const removeFaq = (i: number) => setFaqs((prev) => prev.filter((_, idx) => idx !== i));

  const moveFaq = (i: number, dir: -1 | 1) => {
    setFaqs((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const saveFaqs = async () => {
    setFaqSaving(true);
    try {
      await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "faq", key: "items", value: JSON.stringify(faqs) }),
      });
      setFaqSaved(true);
      setTimeout(() => setFaqSaved(false), 2000);
    } catch { /* silent */ } finally {
      setFaqSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-gray-200 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Content</h1>

      <div className="space-y-6 max-w-3xl">
        {/* Standard Sections */}
        {SECTIONS.map((section) => (
          <div key={section.key} className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{section.label}</h2>
            <div className="space-y-4">
              {section.fields.map((field) => {
                const val = content[section.key]?.[field] || "";
                const saveKey = `${section.key}.${field}`;
                return (
                  <div key={field}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700 capitalize">{field}</label>
                      <div className="flex items-center gap-2">
                        {saved === saveKey && <span className="text-xs text-green-600">Saved</span>}
                        <button
                          onClick={() => handleSave(section.key, field, val)}
                          disabled={saving === saveKey}
                          className="text-xs px-3 py-1 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50"
                        >
                          {saving === saveKey ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                    {isHtmlField(field) ? (
                      <textarea
                        value={val}
                        onChange={(e) => updateValue(section.key, field, e.target.value)}
                        rows={30}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Enter HTML content..."
                      />
                    ) : isJsonField(field) ? (
                      <textarea
                        value={formatJson(val)}
                        onChange={(e) => updateValue(section.key, field, e.target.value)}
                        rows={12}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    ) : field === "subtitle" ? (
                      <textarea
                        value={val}
                        onChange={(e) => updateValue(section.key, field, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    ) : (
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => updateValue(section.key, field, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Visual FAQ Editor */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">FAQ</h2>
              <p className="text-xs text-gray-500 mt-0.5">{faqs.length} question{faqs.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex items-center gap-3">
              {faqSaved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
              <button
                onClick={addFaq}
                className="text-xs px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Question
              </button>
              <button
                onClick={saveFaqs}
                disabled={faqSaving}
                className="text-xs px-4 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium"
              >
                {faqSaving ? "Saving..." : "Save All FAQs"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">FAQ #{i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveFaq(i, -1)}
                      disabled={i === 0}
                      title="Move up"
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveFaq(i, 1)}
                      disabled={i === faqs.length - 1}
                      title="Move down"
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeFaq(i)}
                      title="Delete"
                      className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 ml-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                    <input
                      type="text"
                      value={faq.q}
                      onChange={(e) => updateFaq(i, "q", e.target.value)}
                      placeholder="Enter question..."
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Answer</label>
                    <textarea
                      value={faq.a}
                      onChange={(e) => updateFaq(i, "a", e.target.value)}
                      placeholder="Enter answer..."
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            {faqs.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
                <p className="text-sm">No FAQ items yet. Click &quot;Add Question&quot; to get started.</p>
              </div>
            )}
          </div>

          {faqs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={addFaq}
                className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add another question
              </button>
              <button
                onClick={saveFaqs}
                disabled={faqSaving}
                className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm font-medium"
              >
                {faqSaving ? "Saving..." : "Save All FAQs"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
