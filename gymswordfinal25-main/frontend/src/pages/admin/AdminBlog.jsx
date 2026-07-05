import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const EMPTY_FORM = { title: "", content: "", excerpt: "", image_url: "", author: "", is_published: false };

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const load = () => {
    setLoading(true);
    api.get("/admin/blog")
      .then(({ data }) => setPosts(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditPost(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEdit = (post) => {
    setEditPost(post);
    setForm({
      title: post.title || "",
      content: post.content || "",
      excerpt: post.excerpt || "",
      image_url: post.image_url || "",
      author: post.author || "",
      is_published: !!post.is_published,
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.title?.trim()) return toast.error("Title is required");
    try {
      if (editPost) {
        await api.put(`/admin/blog/${editPost.id}`, form);
        toast.success("Post updated");
      } else {
        await api.post("/admin/blog", form);
        toast.success("Post created");
      }
      setShowModal(false);
      load();
    } catch {
      toast.error("Failed to save post");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await api.delete(`/admin/blog/${id}`);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = posts.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => {
    if (!d) return "\u2014";
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
    } catch { return d; }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-overline text-white/50">Content</div>
          <h1 className="font-display uppercase font-black text-4xl mt-2">Blog Posts</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-white text-black text-xs font-bold uppercase tracking-wider px-5 py-3 hover:bg-white/90 transition"
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/20 pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
          />
        </div>
        <span className="text-overline text-white/40">{filtered.length} found</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-white/40">Loading...</div>
      ) : (
        <div className="bg-white/5 border border-white/10 overflow-x-auto">
          <table className="w-full text-sm min-w-[650px]">
            <thead className="text-overline text-white/40 border-b border-white/10">
              <tr>
                <th className="text-left p-4">Title</th>
                <th className="text-left">Author</th>
                <th className="text-left">Status</th>
                <th className="text-left">Date</th>
                <th className="text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                  <td className="p-4 font-medium max-w-[240px] truncate">{post.title}</td>
                  <td className="text-white/70">{post.author || "\u2014"}</td>
                  <td>
                    {post.is_published ? (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-green-500/20 text-green-300 border border-green-500/30">
                        Published
                      </span>
                    ) : (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="text-white/50">{formatDate(post.created_at || post.updated_at)}</td>
                  <td className="text-right pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(post)}
                        className="p-2 hover:bg-white/10 transition text-white/70 hover:text-white"
                        title="Edit"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => del(post.id)}
                        className="p-2 hover:bg-red-500/10 transition text-red-400/70 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-white/30">No blog posts found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#0A0A0A] border border-white/10 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white/30 hover:text-white transition"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-black uppercase tracking-tight mb-5">
              {editPost ? "Edit Post" : "New Post"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-overline text-white/50 font-semibold mb-1 block">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/40 placeholder:text-white/30"
                  placeholder="Post title"
                />
              </div>
              <div>
                <label className="text-overline text-white/50 font-semibold mb-1 block">Author</label>
                <input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/40 placeholder:text-white/30"
                  placeholder="Author name"
                />
              </div>
              <div>
                <label className="text-overline text-white/50 font-semibold mb-1 block">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={2}
                  className="w-full bg-white/5 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/40 placeholder:text-white/30 resize-none"
                  placeholder="Short excerpt / summary"
                />
              </div>
              <div>
                <label className="text-overline text-white/50 font-semibold mb-1 block">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={6}
                  className="w-full bg-white/5 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/40 placeholder:text-white/30 resize-none"
                  placeholder="Blog post content"
                />
              </div>
              <div>
                <label className="text-overline text-white/50 font-semibold mb-1 block">Image URL</label>
                <input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/40 placeholder:text-white/30"
                  placeholder="https://..."
                />
                {form.image_url && (
                  <div className="mt-2 w-32 h-20 rounded overflow-hidden border border-white/10 bg-white/5">
                    <img
                      src={form.image_url}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="w-4 h-4 accent-white"
                  />
                  <span className="text-sm text-white/70">Published</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-white/20 text-sm py-3 text-white/70 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={save}
                className="flex-1 bg-white text-black text-sm py-3 font-semibold hover:bg-white/90 transition"
              >
                {editPost ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
