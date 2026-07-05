import LuxuryPage from "@/components/LuxuryPage";

export default function Careers() {
  return (
    <LuxuryPage title="Careers" breadcrumbs={[{ to: "/", label: "Home" }, { label: "Careers" }]}>
      <div className="prose-luxury max-w-3xl space-y-10">
        <section>
          <h2 className="text-2xl font-display uppercase font-black mb-4">Join GymSword</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            We're building the future of premium athletic fashion. If you're passionate about performance, design,
            and innovation, we want to hear from you.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Open Positions</h2>
          <div className="space-y-3">
            {[
              { role: "Senior Fashion Designer", dept: "Design", location: "Remote" },
              { role: "Full Stack Developer", dept: "Engineering", location: "Remote" },
              { role: "Brand Marketing Manager", dept: "Marketing", location: "India" },
              { role: "Supply Chain Specialist", dept: "Operations", location: "India" },
            ].map((j, i) => (
              <div key={i} className="flex items-center justify-between border border-black/10 p-4 hover:border-black/30 transition-all cursor-pointer">
                <div>
                  <p className="text-[14px] font-bold">{j.role}</p>
                  <p className="text-[12px] text-black/40">{j.dept} · {j.location}</p>
                </div>
                <span className="text-[10px] uppercase tracking-[0.15em] text-black/40 border border-black/15 px-3 py-1">Apply</span>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-display uppercase font-black mb-3">Life at GymSword</h2>
          <p className="text-[14px] text-black/60 leading-[1.9]">
            We value creativity, discipline, and ambition. Our team is global, remote-first, and united by a
            passion for premium quality. We offer competitive compensation, flexible hours, and the opportunity
            to shape a brand that athletes love.
          </p>
        </section>
      </div>
    </LuxuryPage>
  );
}
