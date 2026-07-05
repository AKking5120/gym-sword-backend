import LuxuryPage from "@/components/LuxuryPage";

const MEN_SIZES = [
  { size: "XS", chest: "34-36", waist: "28-30", hip: "34-36" },
  { size: "S", chest: "36-38", waist: "30-32", hip: "36-38" },
  { size: "M", chest: "38-40", waist: "32-34", hip: "38-40" },
  { size: "L", chest: "40-42", waist: "34-36", hip: "40-42" },
  { size: "XL", chest: "42-44", waist: "36-38", hip: "42-44" },
  { size: "2XL", chest: "44-46", waist: "38-40", hip: "44-46" },
  { size: "3XL", chest: "46-48", waist: "40-42", hip: "46-48" },
];

const WOMEN_SIZES = [
  { size: "XS", chest: "30-32", waist: "24-26", hip: "34-36" },
  { size: "S", chest: "32-34", waist: "26-28", hip: "36-38" },
  { size: "M", chest: "34-36", waist: "28-30", hip: "38-40" },
  { size: "L", chest: "36-38", waist: "30-32", hip: "40-42" },
  { size: "XL", chest: "38-40", waist: "32-34", hip: "42-44" },
  { size: "2XL", chest: "40-42", waist: "34-36", hip: "44-46" },
];

function SizeTable({ sizes, title }) {
  return (
    <section>
      <h2 className="text-xl font-display uppercase font-black mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-3 px-4 text-[11px] uppercase tracking-[0.1em] font-bold">Size</th>
              <th className="py-3 px-4 text-[11px] uppercase tracking-[0.1em] font-bold">Chest (in)</th>
              <th className="py-3 px-4 text-[11px] uppercase tracking-[0.1em] font-bold">Waist (in)</th>
              <th className="py-3 px-4 text-[11px] uppercase tracking-[0.1em] font-bold">Hip (in)</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((s, i) => (
              <tr key={s.size} className={`border-b border-black/10 ${i % 2 === 0 ? "bg-black/[0.02]" : ""}`}>
                <td className="py-3 px-4 text-[13px] font-bold">{s.size}</td>
                <td className="py-3 px-4 text-[13px] text-black/60">{s.chest}</td>
                <td className="py-3 px-4 text-[13px] text-black/60">{s.waist}</td>
                <td className="py-3 px-4 text-[13px] text-black/60">{s.hip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function SizeGuide() {
  return (
    <LuxuryPage title="Size Guide" breadcrumbs={[{ to: "/", label: "Home" }, { label: "Size Guide" }]}>
      <div className="max-w-3xl space-y-12">
        <section>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            All measurements are in inches. For the best fit, measure yourself and compare with the charts below.
            If you fall between sizes, we recommend sizing up for a relaxed fit.
          </p>
        </section>
        <SizeTable sizes={MEN_SIZES} title="Men" />
        <SizeTable sizes={WOMEN_SIZES} title="Women" />
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">How to Measure</h2>
          <ul className="text-[14px] text-black/60 leading-[1.9] space-y-2 list-disc pl-5">
            <li><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape level.</li>
            <li><strong>Waist:</strong> Measure around your natural waistline, the narrowest part of your torso.</li>
            <li><strong>Hip:</strong> Measure around the fullest part of your hips.</li>
          </ul>
        </section>
      </div>
    </LuxuryPage>
  );
}
