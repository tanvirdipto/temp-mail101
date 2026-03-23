"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface EmailHeaderProps {
  email: string;
  onChangeAddress: (domain?: string) => void;
  onRefreshInbox: () => Promise<void>;
  isLoading: boolean;
}

export default function EmailHeader({
  email,
  onChangeAddress,
  onRefreshInbox,
  isLoading,
}: EmailHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [showDomainPicker, setShowDomainPicker] = useState(false);
  const [domains, setDomains] = useState<string[]>([]);
  const [domainsLoading, setDomainsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowDomainPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchDomains = useCallback(async () => {
    setDomainsLoading(true);
    try {
      const res = await fetch("/api/domains");
      if (res.ok) {
        const data = await res.json();
        setDomains(data.domains || []);
      }
    } catch {
      // Silently fail
    } finally {
      setDomainsLoading(false);
    }
  }, []);

  const handleChangeAddressClick = useCallback(() => {
    if (showDomainPicker) {
      setShowDomainPicker(false);
      return;
    }
    setShowDomainPicker(true);
    if (domains.length === 0) {
      fetchDomains();
    }
  }, [showDomainPicker, domains.length, fetchDomains]);

  const handleDomainSelect = useCallback(
    (domain: string) => {
      setShowDomainPicker(false);
      onChangeAddress(domain);
    },
    [onChangeAddress]
  );

  const handleRefreshInbox = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    setRefreshed(false);
    try {
      await Promise.all([
        onRefreshInbox(),
        new Promise((r) => setTimeout(r, 600)),
      ]);
    } catch {
      // ignore
    }
    setRefreshing(false);
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 2000);
  }, [onRefreshInbox, refreshing]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = email;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [email]);

  return (
    <div className="rounded-lg border-[3px] border-gray-700 p-4 sm:p-6 bg-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Email */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isLoading ? (
            <div className="h-7 w-64 bg-gray-200 rounded animate-pulse" />
          ) : (
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 min-w-0 group"
              title="Click to copy"
            >
              <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {email}
              </span>
              <svg className="w-4 h-4 shrink-0 text-gray-400 group-hover:text-gray-600" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6" />
              </svg>
              {copied && (
                <span className="text-xs text-green-600 font-medium">Copied!</span>
              )}
            </button>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {/* Refresh Inbox Button */}
          <button
            onClick={handleRefreshInbox}
            disabled={isLoading || refreshing}
            className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.181-3.18" />
            </svg>
            {refreshing ? "Checking..." : refreshed ? "Refreshed!" : "Refresh Inbox"}
          </button>

          {/* Change Address Button + Domain Picker */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={handleChangeAddressClick}
              disabled={isLoading}
              className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
              Change Address
            </button>

            {showDomainPicker && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500 px-2">Select domain</p>
                </div>
                {domainsLoading ? (
                  <div className="p-4 text-center">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto" />
                  </div>
                ) : domains.length === 0 ? (
                  <div className="p-3 text-center text-sm text-gray-400">
                    No domains available
                  </div>
                ) : (
                  <div className="py-1 max-h-48 overflow-y-auto">
                    {domains.map((domain) => (
                      <button
                        key={domain}
                        onClick={() => handleDomainSelect(domain)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        @{domain}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom info row */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          Secure &amp; Anonymous
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          No Registration
        </span>
      </div>
    </div>
  );
}
