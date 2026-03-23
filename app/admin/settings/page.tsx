"use client";

import { useEffect, useState } from "react";

const SETTING_FIELDS = [
  { key: "site_name", label: "Site Name", type: "text" },
  { key: "meta_description", label: "Meta Description", type: "textarea" },
  { key: "footer_links", label: "Footer Links (JSON)", type: "json" },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (key: string) => {
    setSaving(key);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: settings[key] || "" }),
      });
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch {
      // Silently fail
    } finally {
      setSaving(null);
    }
  };

  const formatJson = (val: string) => {
    try {
      return JSON.stringify(JSON.parse(val), null, 2);
    } catch {
      return val;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-40 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Site Settings</h1>

      <div className="max-w-3xl bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {SETTING_FIELDS.map((field) => {
          const val = settings[field.key] || "";
          return (
            <div key={field.key}>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                <div className="flex items-center gap-2">
                  {saved === field.key && (
                    <span className="text-xs text-green-600">Saved</span>
                  )}
                  <button
                    onClick={() => handleSave(field.key)}
                    disabled={saving === field.key}
                    className="text-xs px-3 py-1 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50"
                  >
                    {saving === field.key ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
              {field.type === "json" ? (
                <textarea
                  value={formatJson(val)}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              ) : field.type === "textarea" ? (
                <textarea
                  value={val}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              ) : (
                <input
                  type="text"
                  value={val}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
