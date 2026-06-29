import { useMemo, useState } from "react";
import { X, Search } from "lucide-react";
import { PHONE_BRANDS } from "../lib/phoneDB";

interface PhonePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (brand: string, model: string) => void;
  initialBrand?: string;
  initialModel?: string;
}

// 品牌型号选择器(模态)
export function PhonePicker({ open, onClose, onSelect, initialBrand, initialModel }: PhonePickerProps) {
  const [brand, setBrand] = useState<string>(initialBrand || "");
  const [q, setQ] = useState("");

  const filteredModels = useMemo(() => {
    const b = PHONE_BRANDS.find((x) => x.key === brand);
    if (!b) return [];
    const t = q.trim().toLowerCase();
    if (!t) return b.models;
    return b.models.filter((m) => m.name.toLowerCase().includes(t));
  }, [brand, q]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-sm flex items-end md:items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl h-[80vh] md:h-[70vh] bg-ink-900 border-t md:border border-white/10 md:rounded-2xl rounded-t-2xl flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="font-semibold text-zinc-100">选择品牌型号</h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* 左侧:品牌 */}
          <div className="w-24 md:w-32 border-r border-white/5 overflow-y-auto">
            {PHONE_BRANDS.map((b) => (
              <button
                key={b.key}
                onClick={() => { setBrand(b.key); setQ(""); }}
                className={`w-full px-3 py-2.5 text-sm text-left transition ${
                  brand === b.key ? "bg-amber-glow/10 text-amber-glow" : "text-zinc-300 hover:bg-ink-800"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>

          {/* 右侧:型号 */}
          <div className="flex-1 flex flex-col min-w-0">
            {brand ? (
              <>
                <div className="relative p-3 border-b border-white/5">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    className="input pl-9"
                    placeholder="搜索型号"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {filteredModels.length === 0 ? (
                    <p className="text-center text-zinc-500 py-12">没有匹配的型号</p>
                  ) : (
                    filteredModels.map((m) => (
                      <button
                        key={m.name}
                        onClick={() => {
                          const b = PHONE_BRANDS.find((x) => x.key === brand);
                          if (b) onSelect(b.name, m.name);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${
                          m.name === initialModel
                            ? "bg-amber-glow/10 text-amber-glow"
                            : "text-zinc-200 hover:bg-ink-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{m.name}</span>
                          <span className="text-2xs text-zinc-500">{m.releaseYear}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
                ← 请先选择品牌
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
