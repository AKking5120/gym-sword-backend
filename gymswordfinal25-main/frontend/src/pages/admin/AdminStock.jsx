import { useEffect, useState } from "react";
import { Search, Save, AlertTriangle, Package } from "lucide-react";
import { toast } from "sonner";
import { api, resolveImage } from "@/lib/api";

export default function AdminStock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [edits, setEdits] = useState({});

  const load = () => {
    setLoading(true);
    api.get("/admin/products").then(({ data }) => {
      setProducts(data || []);
      const init = {};
      (data || []).forEach(p => { init[p.id] = p.stock_quantity ?? p.stock ?? 0; });
      setEdits(init);
    }).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = filtered.filter(p => (p.stock_quantity ?? p.stock ?? 0) <= 5);
  const normalStock = filtered.filter(p => (p.stock_quantity ?? p.stock ?? 0) > 5);

  const updateStock = async (id) => {
    try {
      await api.patch(`/admin/products/${id}`, { stock_quantity: edits[id] });
      toast.success("Stock updated");
      load();
    } catch { toast.error("Failed to update"); }
  };

  const bulkSave = async () => {
    for (const [id, qty] of Object.entries(edits)) {
      const p = products.find(x => x.id === parseInt(id));
      if (p && (p.stock_quantity ?? p.stock ?? 0) !== qty) {
        await api.patch(`/admin/products/${id}`, { stock_quantity: qty });
      }
    }
    toast.success("All stock updated");
    load();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-6">
        <div>
          <div className="text-overline text-white/50">Inventory</div>
          <h1 className="font-display uppercase font-black text-4xl mt-2">Stock Management</h1>
        </div>
        <button onClick={bulkSave} className="btn-luxury-light flex items-center gap-2">
          <Save size={14} /> Save All Changes
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full bg-white/5 border border-white/20 pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white" />
      </div>

      {loading && <div className="text-center py-12 text-sm text-white/40">Loading...</div>}

      {!loading && (
        <>
          {lowStock.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-300">{lowStock.length} product(s) have low stock (≤5)</span>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="text-overline text-white/40 border-b border-white/10">
                <tr>
                  <th className="text-left p-4">Product</th>
                  <th className="text-left">Current Stock</th>
                  <th className="text-left">New Stock</th>
                  <th className="text-left"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const currentQty = p.stock_quantity ?? p.stock ?? 0;
                  const isLow = currentQty <= 5;
                  return (
                    <tr key={p.id} className={`border-b border-white/5 ${isLow ? "bg-red-500/5" : ""}`}>
                      <td className="p-4 flex items-center gap-3">
                        {p.images?.[0] && <img src={resolveImage(p.images[0].url)} alt="" className="w-10 h-12 object-cover" />}
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-white/40">{p.sku || p.slug}</div>
                        </div>
                      </td>
                      <td className={`font-bold ${isLow ? "text-red-400" : "text-white/80"}`}>
                        {currentQty}
                        {isLow && <AlertTriangle size={12} className="inline ml-1 text-red-400" />}
                      </td>
                      <td className="py-3">
                        <input type="number" min="0"
                          value={edits[p.id] ?? 0}
                          onChange={e => setEdits({ ...edits, [p.id]: parseInt(e.target.value) || 0 })}
                          className="w-24 bg-transparent border border-white/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-white" />
                      </td>
                      <td>
                        <button onClick={() => updateStock(p.id)} className="px-3 py-2 text-xs border border-white/20 hover:bg-white/10 transition">
                          Update
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!filtered.length && <div className="text-center py-12 text-sm text-white/40">No products found</div>}
          </div>
        </>
      )}
    </div>
  );
}
