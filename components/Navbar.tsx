"use client";

import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4 lg:px-8">
        <div className="flex lg:flex-1">
          <a href="/" className="flex items-center gap-2">
            <svg className="h-8 w-8" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M35 31.6667H17.3333C16.4493 31.6667 15.6014 31.3155 14.9763 30.6904C14.3512 30.0652 14 29.2174 14 28.3333V11.6667C14 10.7826 14.3512 9.93477 14.9763 9.30965C15.6014 8.68453 16.4493 8.33334 17.3333 8.33334H40.6667C41.5507 8.33334 42.3986 8.68453 43.0237 9.30965C43.6488 9.93477 44 10.7826 44 11.6667V15.8333M44 31.6667V21.6667L40 26.5" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11.6667L29 21.6667L44 11.6667" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xl font-bold text-gray-900">TempMail.co</span>
          </a>
        </div>

        <div className="hidden md:flex md:gap-x-8">
          <a href="#inbox" className="text-sm font-semibold text-gray-900 hover:text-gray-600">10 Minutes</a>
          <a href="#features" className="text-sm font-semibold text-gray-900 hover:text-gray-600">Features</a>
          <a href="#faq" className="text-sm font-semibold text-gray-900 hover:text-gray-600">Pricing</a>
          <a href="#blog" className="text-sm font-semibold text-gray-900 hover:text-gray-600">Blog</a>
          <a href="#" className="text-sm font-semibold text-gray-900 hover:text-gray-600">API</a>
        </div>

        <div className="hidden md:flex md:flex-1 md:justify-end items-center gap-1">
          <a href="#" className="text-sm font-semibold text-gray-900 hover:text-gray-600">Log in</a>
          <span className="text-gray-400">/</span>
          <a href="#" className="text-sm font-semibold text-gray-900 hover:text-gray-600">Sign up</a>
          <span className="ml-1">&rarr;</span>
        </div>

        <button
          className="md:hidden p-2 rounded hover:bg-gray-100"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg className="w-6 h-6" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 pb-4">
          <div className="space-y-1 pt-2">
            <a href="#inbox" className="block py-2 text-sm font-semibold text-gray-900" onClick={() => setMobileOpen(false)}>Inbox</a>
            <a href="#features" className="block py-2 text-sm font-semibold text-gray-900" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#faq" className="block py-2 text-sm font-semibold text-gray-900" onClick={() => setMobileOpen(false)}>Pricing</a>
            <a href="#blog" className="block py-2 text-sm font-semibold text-gray-900" onClick={() => setMobileOpen(false)}>Blog</a>
            <a href="#" className="block py-2 text-sm font-semibold text-gray-900">API</a>
            <div className="border-t border-gray-100 pt-2 mt-2">
              <a href="#" className="block py-2 text-sm font-semibold text-gray-900">Log in</a>
              <a href="#" className="block py-2 text-sm font-semibold text-gray-900">Sign up</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
