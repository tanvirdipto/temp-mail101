"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Blog</h1>
        <p className="text-gray-500 mb-10">Insights and tips about email privacy and security</p>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border border-gray-200 rounded-xl p-6">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No blog posts yet.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-gray-600 text-sm mb-3">{post.excerpt}</p>
                <time className="text-xs text-gray-400">{post.date}</time>
              </Link>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
