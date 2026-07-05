import { X } from "lucide-react";

export default function ComingSoonModal({ open, onClose, title, message, icon }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[1100] transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-[1101] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white max-w-[420px] w-full p-8 pointer-events-auto relative animate-slide-down" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
          <div className="text-center">
            {icon && <div className="mb-4 flex justify-center">{icon}</div>}
            <h3 className="text-lg font-bold text-black mb-2">{title}</h3>
            <p className="text-sm text-black/50 leading-relaxed">{message}</p>
          </div>
        </div>
      </div>
    </>
  );
}
