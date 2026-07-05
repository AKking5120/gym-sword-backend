import { useEffect, useState } from "react";
import { api, resolveImage } from "@/lib/api";
import LuxuryPage from "@/components/LuxuryPage";
import { Link } from "react-router-dom";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/settings/blog")
      .then(({ data }) => setPosts(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <LuxuryPage title="Blog" breadcrumbs={[{ to: "/", label: "Home" }, { label: "Blog" }]}>
      {loading ? (
        <div className="text-center text-black/40 py-20">Loading...</div>
      ) : !posts.length ? (
        <div className="text-center text-black/40 py-20">No posts yet</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="border border-black/10 group cursor-pointer hover:border-black/30 transition-all block">
              <div className="aspect-[4/3] bg-[#f5f5f7] overflow-hidden">
                <img
                  src={p.image_url ? resolveImage(p.image_url) : ""}
                  alt={p.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
              <div className="p-6">
                <p className="text-[10px] uppercase tracking-[0.15em] text-black/40 mb-2">{p.published_at ? new Date(p.published_at).toLocaleDateString("en-IN", { year: "numeric", month: "long" }) : ""}</p>
                <h3 className="text-[15px] font-bold mb-2 group-hover:underline">{p.title}</h3>
                <p className="text-[13px] text-black/50 leading-[1.7]">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </LuxuryPage>
  );
}