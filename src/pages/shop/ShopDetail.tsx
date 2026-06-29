import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Smartphone, ChevronLeft, ChevronRight, Store, Check, X, Phone,
} from "lucide-react";
import { publicGetUsedPhone, publicCreateInquiry } from "../../lib/db";
import { formatMoney } from "../../lib/utils";

export function ShopDetail() {
  const { id } = useParams<{ id: string }>();
  const [phone, setPhone] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shopPhone, setShopPhone] = useState("");
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", message: "" });
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    publicGetUsedPhone(id).then((p) => {
      setPhone(p);
      setLoading(false);
    }).catch((e) => {
      console.error(e);
      setLoading(false);
    });
    const sp = localStorage.getItem("ups.shopPhone");
    if (sp) setShopPhone(sp);
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    if (!form.customer_name.trim() || !form.customer_phone.trim()) {
      setErr("请填写姓名和手机号");
      return;
    }
    setErr(null);
    setSubmitting(true);
    try {
      const r = await publicCreateInquiry({
        phone_id: id,
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        message: form.message.trim(),
      });
      if (!r.ok) {
        setErr(r.error || "提交失败");
        return;
      }
      setSubmitted(true);
    } catch (e: any) {
      setErr(e?.message || "提交失败");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 p-4">
        <div className="shimmer h-80 mb-3" />
        <div className="shimmer h-20 mb-2" />
        <div className="shimmer h-12" />
      </div>
    );
  }

  if (!phone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-ink-950">
        <Smartphone className="w-16 h-16 text-zinc-700 mb-3" />
        <p className="text-zinc-400">该机型已下架或不存在</p>
        <Link to="/shop" className="mt-4 text-amber-glow text-sm">← 返回店铺</Link>
      </div>
    );
  }

  const photos: { id: string; url: string }[] = phone.photos || [];

  return (
    <div className="min-h-screen bg-ink-950 pb-24">
      {/* 顶栏 */}
      <header className="sticky top-0 z-20 bg-ink-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/shop" className="p-1 text-zinc-400 hover:text-zinc-100">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <Store className="w-4 h-4 text-amber-glow" />
          <span className="text-sm text-zinc-300 truncate">优品二手手机店</span>
        </div>
      </header>

      {/* 图片轮播 */}
      {photos.length > 0 ? (
        <div className="relative bg-ink-900">
          <div className="max-w-3xl mx-auto aspect-square overflow-hidden">
            <img
              src={photos[photoIdx].url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-ink-950/70 text-white flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-ink-950/70 text-white flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${i === photoIdx ? "bg-amber-glow" : "bg-white/40"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="aspect-square bg-ink-800 flex items-center justify-center text-zinc-600">
          <Smartphone className="w-20 h-20" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* 标题 + 价格 */}
        <div>
          <h1 className="text-xl font-bold text-zinc-50">
            {phone.title || `${phone.brand} ${phone.model}`}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {[phone.storage, phone.color, phone.condition].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-3 num text-3xl font-bold text-amber-glow">
            {formatMoney(phone.sell_price)}
          </div>
        </div>

        {/* 描述 */}
        {phone.description && (
          <div className="card p-4">
            <h3 className="font-semibold text-zinc-100 text-sm mb-2">商品描述</h3>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">{phone.description}</p>
          </div>
        )}

        {/* 瑕疵 */}
        {phone.faults && (
          <div className="card p-4">
            <h3 className="font-semibold text-zinc-100 text-sm mb-2">瑕疵说明</h3>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">{phone.faults}</p>
          </div>
        )}

        {/* 配件 */}
        {phone.accessories && (
          <div className="card p-4">
            <h3 className="font-semibold text-zinc-100 text-sm mb-2">配件</h3>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">{phone.accessories}</p>
          </div>
        )}

        {/* 缩略图 */}
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setPhotoIdx(i)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                  i === photoIdx ? "border-amber-glow" : "border-transparent"
                }`}
              >
                <img src={p.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 底部 CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-ink-900/95 backdrop-blur-md border-t border-white/5 p-3 flex gap-2">
        {shopPhone && (
          <a
            href={`tel:${shopPhone}`}
            className="btn-secondary flex-1"
          >
            <Phone className="w-4 h-4" /> 打电话
          </a>
        )}
        <button onClick={() => setShowForm(true)} className="btn-primary flex-1">
          <Check className="w-4 h-4" /> 我要这台
        </button>
      </div>

      {/* 询价表单 */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-sm flex items-end md:items-center justify-center animate-fade-in"
          onClick={() => !submitting && setShowForm(false)}
        >
          <div
            className="relative w-full max-w-md bg-ink-900 border-t md:border border-white/10 md:rounded-2xl rounded-t-2xl p-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-status-completed/20 flex items-center justify-center mb-3">
                  <Check className="w-8 h-8 text-status-completed" />
                </div>
                <h3 className="font-semibold text-zinc-100 text-lg">已收到您的询价</h3>
                <p className="text-sm text-zinc-400 mt-2">店家会尽快联系您,请保持电话畅通。</p>
                <button onClick={() => { setShowForm(false); setSubmitted(false); }} className="btn-primary mt-6 w-full">
                  完成
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-zinc-100">询价</h2>
                  <button onClick={() => setShowForm(false)} className="p-1 text-zinc-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  对「{phone.title || `${phone.brand} ${phone.model}`}」感兴趣?留个电话,店家联系您。
                </p>
                <form onSubmit={submit} className="space-y-3">
                  <div>
                    <label className="text-2xs text-zinc-500">您的称呼 *</label>
                    <input
                      className="input mt-1"
                      placeholder="如:王先生"
                      value={form.customer_name}
                      onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-2xs text-zinc-500">手机号 *</label>
                    <input
                      type="tel"
                      className="input mt-1"
                      placeholder="11 位手机号"
                      value={form.customer_phone}
                      onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                      required
                      pattern="1[3-9]\d{9}"
                    />
                  </div>
                  <div>
                    <label className="text-2xs text-zinc-500">留言(选填)</label>
                    <textarea
                      className="input mt-1 min-h-[60px]"
                      placeholder="想问点什么..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>
                  {err && <p className="text-xs text-status-cancelled">{err}</p>}
                  <button type="submit" disabled={submitting} className="btn-primary w-full">
                    {submitting ? "提交中..." : "提交询价"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
