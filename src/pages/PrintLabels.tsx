import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import { listUsedPhones } from "../lib/db";
import { formatMoney } from "../lib/utils";
import { QRCode } from "../components/QRCode";

// 批量打印二维码贴纸(A4 一页约 6 个,适合贴机器背面/价签)
export function PrintLabels() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listUsedPhones("available").then(setItems).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="print:hidden sticky top-0 z-10 bg-ink-900/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate("/used-phones")} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> 返回
        </button>
        <h1 className="font-semibold text-zinc-100">批量打印二维码贴纸</h1>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer className="w-4 h-4" /> 打印
        </button>
      </div>

      <div className="p-4 print:p-2 max-w-5xl mx-auto">
        <div className="mb-3 text-sm text-zinc-400 print:hidden">
          共 {items.length} 台在售 · 每个贴纸含手机标题、价格、二维码。推荐 A4 纸
          <strong className="text-zinc-200 mx-1">每页 6 个</strong>
          ,剪开后贴机器背面 / 价签上。
        </div>

        {loading ? (
          <div className="shimmer h-32" />
        ) : items.length === 0 ? (
          <p className="text-center text-zinc-500 py-12">暂无在售机型</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 print:grid-cols-3 gap-3 print:gap-2">
            {items.map((p) => {
              const url = `${window.location.origin}/shop/${p.id}`;
              return (
                <div
                  key={p.id}
                  className="bg-white text-zinc-900 p-3 rounded-lg flex gap-3 print:rounded-none print:break-inside-avoid"
                >
                  <div className="shrink-0">
                    <QRCode value={url} size={120} />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col">
                    <div className="font-bold text-sm leading-tight line-clamp-2">
                      {p.title || `${p.brand} ${p.model}`}
                    </div>
                    <div className="text-2xs text-zinc-600 mt-1">
                      {[p.storage, p.color, p.condition].filter(Boolean).join(" · ")}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1 line-clamp-2 flex-1">
                      {p.description || "扫码查看详情"}
                    </div>
                    <div className="mt-1 text-lg font-bold text-amber-700">
                      {formatMoney(p.sell_price)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="hidden print:block text-2xs text-zinc-400 text-center mt-2">
          打印设置:无边距 · 实际尺寸
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .shimmer { display: none !important; }
        }
      `}</style>
    </div>
  );
}
