"use client";
// ============================================================
// Blog Page — /blog — client component with useEffect fetch
// ============================================================
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { BlogPost } from "@/types";
import { formatDateShort } from "@/lib/utils";

export default function BlogPage() {
  const supabase = createSupabaseBrowserClient();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      setPosts(data || []);
      setLoading(false);
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [featured, ...rest] = posts;

  return (
    <div className="pt-20 min-h-screen">
      <div className="bg-brand-dark border-b border-brand-mid">
        <div className="container-site py-10 text-center">
          <span className="section-tag mx-auto">Hair Care Tips & Trends</span>
          <h1 className="font-heading text-4xl text-brand-white mt-4">The Crown Journal</h1>
          <p className="text-brand-muted mt-2 max-w-xl mx-auto">
            Expert advice on wigs, extensions, braiding, and keeping your hair healthy in Kenya&apos;s climate.
          </p>
        </div>
      </div>

      <div className="container-site py-10">
        {loading ? (
          <div className="space-y-6">
            <div className="animate-pulse card h-72 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`blog-skel-${i}`} className="animate-pulse card h-56" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="group block card-hover overflow-hidden mb-10">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-64 lg:h-80 bg-brand-dark2">
                    {featured.cover_image && (
                      <Image src={featured.cover_image} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="badge-new">Featured</span>
                    </div>
                  </div>
                  <div className="p-6 lg:p-8 flex flex-col justify-center">
                    <span className="text-xs tracking-widest uppercase text-brand-gold font-semibold">{formatDateShort(featured.created_at)} · {featured.read_time} min read</span>
                    <h2 className="font-heading text-2xl lg:text-3xl text-brand-white mt-3 group-hover:text-brand-gold transition-colors">{featured.title}</h2>
                    <p className="text-brand-muted text-sm mt-3 leading-relaxed line-clamp-3">{featured.excerpt}</p>
                    <p className="text-xs text-brand-muted mt-4">By {featured.author}</p>
                    <span className="mt-4 text-brand-burgundy text-sm font-medium group-hover:text-brand-burgundy-light transition-colors">Read Article →</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Post grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post, idx) => (
                <Link key={`blog-post-${post.id}-${idx}`} href={`/blog/${post.slug}`} className="group card-hover flex flex-col">
                  <div className="relative h-48 bg-brand-dark2 overflow-hidden">
                    {post.cover_image && (
                      <Image src={post.cover_image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[10px] tracking-widest uppercase text-brand-gold font-semibold">{formatDateShort(post.created_at)} · {post.read_time} min</span>
                    <h3 className="font-heading text-base text-brand-white mt-2 group-hover:text-brand-gold transition-colors line-clamp-2 flex-1">{post.title}</h3>
                    <p className="text-xs text-brand-muted mt-2 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    <span className="text-xs text-brand-burgundy mt-3 font-medium">Read →</span>
                  </div>
                </Link>
              ))}
            </div>

            {posts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-brand-muted">No blog posts yet. Check back soon!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
