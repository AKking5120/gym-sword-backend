import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Edit3, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { api, resolveImage, formatApiErrorDetail } from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import { ADMIN } from "@/constants/testIds";

const EMPTY = {
  name: "",
  description: "",
  short_description: "",
  price: 0,
  compare_at_price: null,

  // Existing
  category: "men",
  collection: "",

  // New
  product_type: "oversized-t-shirts",
  brand: "GymSword",
  sku: "",
  stock_quantity: 100,
  fabric: "",
  weight: "",
  gender: "",

  images: [],
  colors: [],
  sizes: [],
  tags: [],

  is_active: true,
  is_featured: false,
  is_trending: false,
  is_sale: false,
  is_new_arrival: false,
  enable_360_view: false,
  enable_try_now: false,

  rating: 0,
  review_count: 0,
  variants: [],
};


const PRODUCT_CATEGORIES = [
  { v: "oversized-t-shirts", l: "Oversized T-Shirts" },
  { v: "regular-fit-t-shirts", l: "Regular Fit T-Shirts" },
  { v: "hoodies", l: "Hoodies" },
  { v: "jackets", l: "Jackets" },
  { v: "joggers", l: "Joggers" },
  { v: "shorts", l: "Shorts" },
  { v: "compression-wear", l: "Compression Wear" },
  { v: "crop-jackets", l: "Crop Jackets" },
  { v: "sports-bras", l: "Sports Bras" },
  { v: "leggings", l: "Leggings" },
];   

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const fileInput = useRef();
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => api.get("/admin/products").then(({ data }) => setProducts(data)).catch(() => setProducts([]));
  useEffect(() => { load(); }, []);

  const filtered = search
    ? products.filter((p) =>
        [p.name, p.category, p.product_type, String(p.price), String(p.id)]
          .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
      )
    : products;

  const startNew = () => setEditing({ ...EMPTY });

 const save = async () => {
  try {
    if (!editing.category) {
      toast.error("Please select Main Category");
      return;
    }

    if (!editing.product_type) {
      toast.error("Please select Product Category");
      return;
    }

    if (!editing.name?.trim()) {
      toast.error("Please enter Product Name");
      return;
    }

    if (!editing.images?.length) {
      toast.error("Please upload at least one image");
      return;
    }

    if (editing.id) {
      await api.patch(`/admin/products/${editing.id}`, editing);
    } else {
      await api.post("/admin/products", editing);
    }

    toast.success("Product saved");
    setEditing(null);
    load();
  } catch (e) {
    const message = formatApiErrorDetail(e?.response?.data?.message) || "Save failed";
    toast.error(message);
    console.error("Product save failed:", e?.response?.data || e);
  }
};

  const del = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/admin/products/${id}`);
    load();
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/admin/uploads", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setEditing({ ...editing, images: [...(editing.images || []), { url: data.url, alt: file.name }] });
      toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); }
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-overline text-white/50">Catalog</div>
          <h1 className="font-display uppercase font-black text-4xl mt-2">Inventory</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border border-white/10 pl-9 pr-3 py-2 text-sm text-white/80 placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <button data-testid={ADMIN.productNew} onClick={startNew} className="btn-luxury-light"><Plus size={14} className="mr-2" /> New Product</button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="text-overline text-white/40 border-b border-white/10">
            <tr><th className="text-left p-4">Product</th><th className="text-left">Main Category</th>
<th className="text-left">Sub Category</th><th className="text-left">Price</th><th className="text-left">Active</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="p-4 flex items-center gap-3">
                  {p.images?.[0] && <img src={resolveImage(p.images[0].url)} alt="" className="w-12 h-14 object-cover" />}
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-white/40">{p.slug}</div>
                  </div>
                </td>
  <td className="text-white/70 capitalize">
  {p.category}
</td>

<td className="text-white/70 capitalize">
  {p.product_type?.replaceAll("-", " ")}
</td>
                <td>{formatPrice(p.price)}</td>
                <td><span className={p.is_active ? "text-white" : "text-white/40"}>{p.is_active ? "Active" : "Hidden"}</span></td>
                <td className="text-right pr-4">
                  <button onClick={() => setEditing(p)} className="p-2 hover:bg-white/10"><Edit3 size={14} /></button>
                  <button onClick={() => del(p.id)} className="p-2 hover:bg-white/10"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center overflow-y-auto p-6">
          <div className="bg-[#111] border border-white/10 w-full max-w-3xl my-12 p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="font-display uppercase text-2xl">{editing.id ? "Edit Product" : "New Product"}</div>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-white/10"><X size={18} /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
              <F label="Short Description" value={editing.short_description} onChange={(v) => setEditing({ ...editing, short_description: v })} />
              <F label="Price" type="number" value={editing.price} onChange={(v) => setEditing({ ...editing, price: parseFloat(v) || 0 })} />
              <F label="Compare-at Price (optional)" type="number" value={editing.compare_at_price || ""} onChange={(v) => setEditing({ ...editing, compare_at_price: v ? parseFloat(v) : null })} />
              <F label="Stock Quantity" type="number" value={editing.stock_quantity ?? editing.stock ?? 0} onChange={(v) => setEditing({ ...editing, stock_quantity: parseInt(v, 10) || 0, stock: parseInt(v, 10) || 0 })} />
              <SelectF label="Category" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })}
                options={[{v:"men",l:"Men"},{v:"women",l:"Women"},{v:"accessories",l:"Accessories"},{v:"unisex",l:"Unisex"}]} />
                <SelectF
  label="Product Category"
  value={editing.product_type}
  onChange={(v) =>
    setEditing({
      ...editing,
      product_type: v,
    })
  }
  options={[
    { v: "oversized-t-shirts", l: "Oversized T-Shirts" },
    { v: "regular-fit-t-shirts", l: "Regular Fit T-Shirts" },
    { v: "hoodies", l: "Hoodies" },
    { v: "jackets", l: "Jackets" },
    { v: "joggers", l: "Joggers" },
    { v: "shorts", l: "Shorts" },
    { v: "compression-wear", l: "Compression Wear" },
    { v: "crop-jackets", l: "Crop Jackets" },
    { v: "sports-bras", l: "Sports Bras" },
    { v: "leggings", l: "Leggings" },
  ]}
/>
              <F label="Collection (new, sale, essentials)" value={editing.collection || ""} onChange={(v) => setEditing({ ...editing, collection: v })} />
              <F label="Colors (comma)" value={(editing.colors || []).join(", ")} onChange={(v) => setEditing({ ...editing, colors: v.split(",").map(s => s.trim()).filter(Boolean) })} className="sm:col-span-2" />
              <div className="sm:col-span-2">
                <div className="text-overline text-white/50 mb-2">Sizes</div>
                <SizeToggle value={editing.sizes || []} onChange={(v) => setEditing({ ...editing, sizes: v })} />
              </div>
              <TextareaF label="Description" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} className="sm:col-span-2" />
              <div className="sm:col-span-2">
                <div className="text-overline text-white/50 mb-2">Images</div>
                
                <div className="flex flex-wrap gap-3 mb-3">
                  {(editing.images || []).map((im, i) => (
                    <div key={i} className="relative w-24 h-28 border border-white/10">
                      <img src={resolveImage(im.url)} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setEditing({ ...editing, images: editing.images.filter((_, j) => j !== i) })} className="absolute -top-2 -right-2 bg-white text-black p-1"><X size={10} /></button>
                    </div>
                  ))}
                </div>
                <input type="file" accept="image/*" hidden ref={fileInput} onChange={handleUpload} data-testid={ADMIN.productImageUpload} />
                <button onClick={() => fileInput.current?.click()} className="border border-white/30 px-4 py-2 text-overline hover:bg-white hover:text-black transition">
                  <Upload size={12} className="inline mr-2" /> {uploading ? "Uploading…" : "Upload Image"}
                </button>
                <div className="text-xs text-white/40 mt-2">External image URLs are also valid in your data — paste a URL into the images list via API for bulk imports.</div>
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                Active (visible on storefront)
              </label>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={editing.enable_360_view} onChange={(e) => setEditing({ ...editing, enable_360_view: e.target.checked })} />
                Enable 360° View
              </label>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={editing.enable_try_now} onChange={(e) => setEditing({ ...editing, enable_try_now: e.target.checked })} />
                Enable Try Now
              </label>
            </div>
            <div className="mt-8 flex gap-3 justify-end">
              <button onClick={() => setEditing(null)} className="border border-white/30 px-6 py-3 text-overline hover:bg-white/10">Cancel</button>
              <button onClick={save} data-testid={ADMIN.productSave} className="btn-luxury-light">Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "28", "30", "32", "34", "36", "38", "Free"];

function SizeToggle({ value, onChange }) {
  const toggle = (size) => {
    const next = value.includes(size) ? value.filter(s => s !== size) : [...value, size];
    onChange(next);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {COMMON_SIZES.map(s => (
        <button key={s} type="button" onClick={() => toggle(s)}
          className={`px-4 py-2 text-sm border transition ${
            value.includes(s)
              ? "bg-white text-black border-white"
              : "bg-transparent text-white/60 border-white/20 hover:border-white/40"
          }`}>
          {s}
        </button>
      ))}
    </div>
  );
}

function F({ label, value, onChange, type = "text", className = "" }) {
  return (
    <label className={`block ${className}`}>
      <div className="text-overline text-white/50 mb-2">{label}</div>
      <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white text-white" />
    </label>
  );
}
function TextareaF({ label, value, onChange, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <div className="text-overline text-white/50 mb-2">{label}</div>
      <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={4}
        className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white text-white" />
    </label>
  );
}
function SelectF({ label, value, onChange, options, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <div className="text-overline text-white/50 mb-2">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#111] border border-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white text-white">
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}
