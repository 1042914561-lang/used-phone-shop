import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus, Search, Package, Edit3, Trash2, MessageSquare,
  QrCode, X, Copy, Printer, Check,
} from "lucide-react";
import {
  listUsedPhones, deleteUsedPhone, listMyInquiries,
} from "../lib/db";
import { USED_PHONE_STATUS_CONFIG, UsedPhoneStatus } from "../lib/types";
import { formatMoney, formatDate } from "../lib/utils";
import { EmptyState } from "../components/EmptyState";
import { QRCode } from "../components/QRCode";

export function UsedPhonesList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<UsedPhoneStatus | "">("");
  const [inquiryCount, setInquiryCount] = useState(0);
  const [showShopQr, setShowShopQr] = useState(false);

  useEffect(() => { load(); }, [status]);

  async function load() {
    setLoading(true);
    try {
      const list = await listUsedPhones(status || undefined);
      setItems(list);
      const inqs = await listMyInquiries();
      setInquiryCount(inqs.length);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter(
      (p) =>
        p.brand.toLowerCase().includes(t) ||
        p.model.toLowerCase().includes(t) ||
        (p.title || "").toLowerCase().includes(t) ||
        (p.imei || "").includes(t)
    );
  }, [items, q]);

  const stats = useMemo(() => {
    const available = items.filter((p) => p.status === "available").length;
    const sold = items.filter((p) => p.status === "sold").length;
    const totalProfit = items
      .filter((p) => p.status === "sold")
      .reduce((s, p) => s + ((p.sold_price || p.sell_price) - p.source_price), 0);
    return { available, sold, totalProfit };
  }, [items]);

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-50">二手机销售</h1>
          <p className="text-sm text-zinc-500 mt-1">
            在售 {stats.available} 台 · 已售 {stats.sold} 台 · 累计利润 ¥{stats.totalProfit.toFixed(2)}
            {inquiryCount > 0 && (
              <>
                {" · "}
                <Link to="/used-phones/inquiries" className="text-amber-glow hover:underline">
                  {inquiryCount} 条询价
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowShopQr(true)} className="btn-secondary" title="生成店内总览二维码,贴在店门口/收银台">
            <QrCode className="w-4 h-4" /> 店内二维码
          </button>
          <Link to="/used-phones/print" className="btn-secondary">
            <Printer className="w-4 h-4" /> 打印贴纸
          </Link>
          <Link to="/used-phones/inquiries" className="btn-secondary">
            <MessageSquare className="w-4 h-4" /> 询价
            {inquiryCount > 0 && <span className="ml-1 px-1.5 text-2xs rounded bg-amber-glow text-ink-950">{inquiryCount}</span>}
          </Link>
          <Link to="/used-phones/new" className="btn-primary">
            <Plus className="w-4 h-4" /> 发布二手机
          </Link>
        </div>
      </div>

      <div className="card p-3 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            className="input pl-10"
            placeholder="搜索品牌/型号/标题/IMEI"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="">全部状态</option>
          {Object.entries(USED_PHONE_STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{(v as any).label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="shimmer h-24" />
          <div className="shimmer h-24" />
        </div>
      ) : filtered.length === 0 ? (
        items.length === 0 ? (
          <EmptyState
            icon={<Package className="w-7 h-7" />}
            title="还没有二手机"
            desc="点「发布二手机」录入第一台"
            action={<Link to="/used-phones/new" className="btn-primary"><Plus className="w-4 h-4" /> 发布第一台</Link>}
          />
        ) : <p className="text-center text-zinc-500 py-12">没有匹配</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => {
            const cfg = USED_PHONE_STATUS_CONFIG[p.status as UsedPhoneStatus];
            const profit = p.status === "sold" ? (p.sold_price || p.sell_price) - p.source_price : null;
            return (
              <div key={p.id} className="card p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-zinc-100 truncate">
                      {p.title || `${p.brand} ${p.model}`}
                    </div>
                    <div className="text-xs text-zinc-500 truncate mt-0.5">
                      {[p.storage, p.color, p.condition].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <span
                    className="text-2xs px-2 py-0.5 rounded font-medium shrink-0"
                    style={{ backgroundColor: cfg.bg, color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="num text-2xl font-bold text-amber-glow">
                    {formatMoney(p.sell_price)}
                  </span>
                  {p.source_price > 0 && (
                    <span className="text-xs text-zinc-500">进价 {formatMoney(p.source_price)}</span>
                  )}
                  {profit !== null && (
                    <span className={`text-xs ml-auto ${profit > 0 ? "text-status-completed" : "text-status-cancelled"}`}>
                      利润 {formatMoney(profit)}
                    </span>
                  )}
                </div>
                <div className="text-2xs text-zinc-500">
                  {formatDate(p.listed_at)}
                  {p.battery_health > 0 && ` · 电池 ${p.battery_health}%`}
                </div>
                <div className="flex gap-1 pt-1 border-t border-white/5">
                  <button
                    onClick={() => navigate(`/used-phones/${p.id}`)}
                    className="flex-1 py-1.5 rounded-md text-xs text-zinc-300 hover:bg-ink-700 flex items-center justify-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> 编辑
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/shop/${p.id}`;
                      navigator.clipboard.writeText(url);
                      alert(`分享链接已复制:\n${url}\n\n可生成二维码给客户扫码`);
                    }}
                    className="flex-1 py-1.5 rounded-md text-xs text-amber-glow hover:bg-amber-glow/10 flex items-center justify-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" /> 分享
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`确定删除「${p.title || p.model}」?`)) return;
                      try { await deleteUsedPhone(p.id); load(); }
                      catch (e: any) { alert("删除失败:" + e?.message); }
                    }}
                    className="px-2 py-1.5 rounded-md text-xs text-status-cancelled hover:bg-status-cancelled/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showShopQr && <ShopQrModal onClose={() => setShowShopQr(false)} />}
    </div>
  );
}

function ShopQrModal({ onClose }: { onClose: () => void }) {
  const shopUrl = `${window.location.origin}/shop`;
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(shopUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-sm flex items-end md:items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-ink-900 border-t md:border border-white/10 md:rounded-2xl rounded-t-2xl p-5 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-100">店内总览二维码</h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-zinc-400 mb-4">
          把这个二维码贴在店门口 / 收银台 / 名片上,客户扫码即可看到所有在售机型。
        </p>
        <div className="flex justify-center my-4">
          <div className="text-center">
            <QRCode value={shopUrl} size={240} />
            <div className="mt-2 text-2xs text-zinc-500">扫码查看在售机型</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-ink-800 rounded-lg p-2 mt-4">
          <code className="flex-1 text-2xs text-zinc-400 truncate px-2">{shopUrl}</code>
          <button
            onClick={copy}
            className="px-3 py-1.5 rounded-md bg-amber-glow/10 text-amber-glow text-xs hover:bg-amber-glow/20 flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "已复制" : "复制"}
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="btn-secondary flex-1">关闭</button>
          <button onClick={() => window.print()} className="btn-primary flex-1">
            <Printer className="w-4 h-4" /> 打印
          </button>
        </div>
      </div>
    </div>
  );
}
