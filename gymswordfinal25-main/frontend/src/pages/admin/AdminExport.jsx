import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Package, ShoppingCart, Users, FileText, Table } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const EXPORTS = [
  { type: "products", label: "Products", icon: Package, desc: "Export products as PDF or Excel" },
  { type: "orders", label: "Orders", icon: ShoppingCart, desc: "Export orders as PDF or Excel" },
  { type: "users", label: "Users", icon: Users, desc: "Export users as PDF or Excel" },
];

function csvToArray(csv) {
  const lines = csv.trim().split("\n");
  if (!lines.length) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const vals = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === "," && !inQuotes) { vals.push(current.replace(/^"|"$/g, "")); current = ""; continue; }
      current += ch;
    }
    vals.push(current.replace(/^"|"$/g, ""));
    return vals;
  });
  return { headers, rows };
}

export default function AdminExport() {
  const [loading, setLoading] = useState(null);

  const fetchBlob = async (type) => {
    const res = await api.get(`/admin/export/${type}`, { responseType: "blob" });
    return res.data;
  };

  const exportPDF = async (type, label) => {
    setLoading(`pdf-${type}`);
    try {
      const blob = await fetchBlob(type);
      const csv = await blob.text();
      const { headers, rows } = csvToArray(csv);

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      doc.setFontSize(16);
      doc.text(`GymSword - ${label} Report`, 14, 20);
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 28);

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 34,
        styles: { fontSize: 6, cellPadding: 1.5 },
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      doc.save(`${type}-report.pdf`);
      toast.success(`${label} PDF exported`);
    } catch (e) { console.error(e); toast.error("PDF export failed: " + e.message); }
    finally { setLoading(null); }
  };

  const exportExcel = async (type, label) => {
    setLoading(`xlsx-${type}`);
    try {
      const blob = await fetchBlob(type);
      const csv = await blob.text();
      const { headers, rows } = csvToArray(csv);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws["!cols"] = headers.map(() => ({ wch: 20 }));
      XLSX.utils.book_append_sheet(wb, ws, label);
      XLSX.writeFile(wb, `${type}-report.xlsx`);
      toast.success(`${label} Excel exported`);
    } catch { toast.error("Excel export failed"); }
    finally { setLoading(null); }
  };

  return (
    <div className="space-y-10">
      <div>
        <div className="text-overline text-white/50">Data</div>
        <h1 className="font-display uppercase font-black text-4xl sm:text-5xl mt-2">Export</h1>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {EXPORTS.map(({ type, label, icon: Icon, desc }) => (
          <div key={type} className="bg-white/5 border border-white/10 p-6 flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
              <Icon className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{label}</h3>
              <p className="text-sm text-white/50 mt-1">{desc}</p>
            </div>
            <div className="mt-auto flex gap-3 w-full">
              <button
                onClick={() => exportPDF(type, label)}
                disabled={loading === `pdf-${type}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50"
              >
                <FileText size={14} />
                {loading === `pdf-${type}` ? "Exporting\u2026" : "PDF"}
              </button>
              <button
                onClick={() => exportExcel(type, label)}
                disabled={loading === `xlsx-${type}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-white/20 text-white text-sm font-semibold rounded-lg hover:bg-white/10 transition disabled:opacity-50"
              >
                <Table size={14} />
                {loading === `xlsx-${type}` ? "Exporting\u2026" : "Excel"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
