"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalPosts: 0, publishedPosts: 0, draftPosts: 0 });

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((res) => res.json())
      .then((posts: { published: number }[]) => {
        if (Array.isArray(posts)) {
          setStats({
            totalPosts: posts.length,
            publishedPosts: posts.filter((p) => p.published).length,
            draftPosts: posts.filter((p) => !p.published).length,
          });
        }
      })
      .catch(() => {});
  }, []);

  const cards = [
    { label: "Total Posts", value: stats.totalPosts, color: "bg-blue-500" },
    { label: "Published", value: stats.publishedPosts, color: "bg-green-500" },
    { label: "Drafts", value: stats.draftPosts, color: "bg-yellow-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{card.value}</span>
              </div>
              <span className="text-sm font-medium text-gray-600">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/blog/new"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors"
        >
          <h3 className="font-semibold text-gray-900">Create Blog Post</h3>
          <p className="text-sm text-gray-500 mt-1">Write and publish a new blog post</p>
        </Link>
        <Link
          href="/admin/content"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors"
        >
          <h3 className="font-semibold text-gray-900">Edit Content</h3>
          <p className="text-sm text-gray-500 mt-1">Update landing page sections</p>
        </Link>
        <Link
          href="/admin/settings"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors"
        >
          <h3 className="font-semibold text-gray-900">Site Settings</h3>
          <p className="text-sm text-gray-500 mt-1">Manage SEO and site configuration</p>
        </Link>
        <Link
          href="/"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors"
        >
          <h3 className="font-semibold text-gray-900">View Site</h3>
          <p className="text-sm text-gray-500 mt-1">Open the public-facing website</p>
        </Link>
      </div>
    </div>
  );
}
