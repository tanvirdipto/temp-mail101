"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
}

const gradients = [
  "from-blue-100 to-purple-100",
  "from-emerald-100 to-cyan-100",
  "from-orange-100 to-rose-100",
];

export default function BlogInsights() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch("/api/blog")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section id="blog" className="bg-white mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <h2 className="font-bold text-3xl text-center">TempMail.co Insights</h2>
      <p className="text-base leading-8 text-center text-gray-600 mt-2">
        Temp Mail Latest Insights and Updates: Dive into the Most Recent Blog Posts
      </p>
      <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post, i) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col cursor-pointer">
            <div className={`w-full h-48 rounded-t-lg bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center p-8`}>
              <svg className="w-16 h-16 text-gray-400 opacity-50 group-hover:scale-110 transition-transform" fill="none" strokeWidth="1" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
              </svg>
            </div>
            <div className="p-6 shadow-md rounded-b-lg">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-slate-600 transition-colors leading-snug">
                {post.title}
              </h3>
              <div className="flex justify-between text-sm text-slate-500 mt-3">
                <span>BLOG</span>
                <span>{post.date}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
