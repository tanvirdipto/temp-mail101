"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  date: string;
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setPost(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <article className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
          </div>
        ) : notFound ? (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h1>
            <p className="text-gray-500 mb-4">The blog post you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/blog" className="text-blue-600 hover:underline text-sm">
              Back to Blog
            </Link>
          </div>
        ) : post ? (
          <>
            <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
              &larr; Back to Blog
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{post.title}</h1>
            <time className="text-sm text-gray-400 block mb-8">{post.date}</time>
            <div
              className="prose prose-gray max-w-none text-gray-700 leading-relaxed
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h2]:mb-4
                [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-8 [&_h3]:mb-3
                [&_p]:mb-4 [&_p]:leading-7
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1.5
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1.5
                [&_li]:text-gray-700 [&_li]:leading-6
                [&_strong]:font-semibold [&_strong]:text-gray-900
                [&_em]:italic"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </>
        ) : null}
      </article>
      <Footer />
    </div>
  );
}
