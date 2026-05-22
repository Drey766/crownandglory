"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { BlogPost } from "@/types";
import { formatDate } from "@/lib/utils";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const supabase = createSupabaseBrowserClient();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();
      setPost(data);
      setLoading(false);
    }
    load();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="pt-20 container-site py-12 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-72 bg-brand-dark2 rounded-xl" />
          <div className="h-8 bg-brand-dark2 rounded w-3/4" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-4 bg-brand-dark2 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-muted mb-4">Article not found</p>
          <Link href="/blog" className="btn-primary">Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      {/* Cover image */}
      {post.cover_image && (
        <div className="relative h-64 sm:h-96 w-full bg-brand-dark2">
          <Image src={post.cover_image} alt={post.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent" />
        </div>
      )}

      <div className="container-site py-8 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-brand-muted mb-6">
          <Link href="/blog" className="hover:text-brand-white transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-brand-white truncate">{post.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl text-brand-white leading-tight">{post.title}</h1>
          <div className="flex items-center gap-4 mt-4 text-xs text-brand-muted">
            <span>By {post.author}</span>
            <span>·</span>
            <span>{formatDate(post.created_at)}</span>
            <span>·</span>
            <span>{post.read_time} min read</span>
          </div>
        </div>

        {/* Content */}
        <div
          className="prose-article"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-brand-mid flex items-center justify-between">
          <Link href="/blog" className="btn-ghost text-sm">← All Articles</Link>
          <div className="flex gap-3">
            <Link href="/shop" className="btn-outline text-sm">Shop Hair</Link>
            <Link href="/book" className="btn-primary text-sm">Book Now</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
