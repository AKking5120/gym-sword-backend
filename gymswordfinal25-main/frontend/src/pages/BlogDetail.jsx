import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, resolveImage } from "@/lib/api";
import LuxuryPage from "@/components/LuxuryPage";

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/settings/blog")
      .then(({ data }) => {
        const found = (data || []).find((p) => p.slug === slug);
        setPost(found || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LuxuryPage title="Loading..."><div className="text-center text-black/40 py-20">Loading...</div></LuxuryPage>;
  if (!post) return <LuxuryPage title="Not Found"><div className="text-center text-black/40 py-20"><p>Post not found</p><Link to="/blog" className="text-black underline mt-4 inline-block">Back to Blog</Link></div></LuxuryPage>;

  return (
    <LuxuryPage title={post.title} breadcrumbs={[{ to: "/", label: "Home" }, { to: "/blog", label: "Blog" }, { label: post.title }]}>
      <article className="max-w-3xl mx-auto">
        {post.image_url && (
          <div className="aspect-[16/9] bg-[#f5f5f7] mb-8 overflow-hidden">
            <img src={resolveImage(post.image_url)} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        <p className="text-[10px] uppercase tracking-[0.15em] text-black/40 mb-4">
          {post.published_at ? new Date(post.published_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : ""}
          {post.author ? ` · ${post.author}` : ""}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-6">{post.title}</h1>
        <div className="prose prose-sm max-w-none text-black/70 leading-[1.8]" dangerouslySetInnerHTML={{ __html: post.content || post.excerpt || "" }} />
      </article>
    </LuxuryPage>
  );
}