import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Smartphone, Store, Phone, ChevronRight } from "lucide-react";
import { publicListUsedPhones } from "../../lib/db";
import { formatMoney } from "../../lib/utils";

export function ShopList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopPhone, setShopPhone] = useState("");

  useEffect(() => {
    publicListUsedPhones().then((d) => {
      setItems(d);
      // 从 localStorage 读店铺联系手机号(商家在设置里可改,默认示例)
      const p = localStorage.getItem("ups.shopPhone");
      if (p) setShopPhone(p);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-950 to-ink-900">
      <header className="sticky top-0 z-10 bg-ink-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-glow/20 flex items-center justify-center">
            <Store className="w-5 h-5 text-amber-glow" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-zinc-50">优品二手手机店</h1>
            <p className="text-2xs text-zinc-500">实拍实物 · 真实在售 · 扫码直达</p>
          </div>
          {shopPhone && (
            <a
              href={`tel:${shopPhone}`}
              className="px-3 py-2 rounded-lg bg-amber-glow/10 text-amber-glow text-xs flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" /> 店主
            </a>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4 pb-24">
        {loading ? (
          <div className="space-y-3">
            <div className="shimmer h-40" />
            <div className="shimmer h-40" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Smartphone className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">店家还没有上架机型</p>
            <p className="text-2xs text-zinc-600 mt-1">请稍后再来看看</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((p) => (
              <Link
                key={p.id}
                to={`/shop/${p.id}`}
                className="card overflow-hidden hover:border-amber-glow/30 transition group"
              >
                <div className="aspect-square bg-ink-800 overflow-hidden">
                  {p.photos?.[0] ? (
                    <img
                      src={p.photos[0].url}
                      alt={p.title || `${p.brand} ${p.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <Smartphone className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <div className="font-semibold text-zinc-100 line-clamp-2 min-h-[2.5em]">
                    {p.title || `${p.brand} ${p.model}`}
                  </div>
                  <div className="text-2xs text-zinc-500 truncate">
                    {[p.storage, p.color, p.condition].filter(Boolean).join(" · ")}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="num text-xl font-bold text-amber-glow">
                      {formatMoney(p.sell_price)}
                    </span>
                    <span className="text-2xs text-zinc-500 flex items-center gap-0.5">
                      查看 <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center text-2xs text-zinc-600 pb-6">
        优品二手手机店 · 一切以实物为准
      </footer>
    </div>
  );
}
