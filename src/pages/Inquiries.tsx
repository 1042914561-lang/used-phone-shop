import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Phone, Clock, ArrowRight, Smartphone } from "lucide-react";
import { listMyInquiries } from "../lib/db";
import { formatDateTime, timeAgo } from "../lib/utils";
import { EmptyState } from "../components/EmptyState";

export function Inquiries() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyInquiries().then(setItems).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-50">客户询价</h1>
          <p className="text-sm text-zinc-500 mt-1">共 {items.length} 条</p>
        </div>
        <button onClick={() => navigate("/used-phones")} className="btn-secondary">返回列表</button>
      </div>

      {loading ? (
        <div className="shimmer h-32" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-7 h-7" />}
          title="还没有询价"
          desc="客户扫码后在详情页点「我要这台」就会留电话给你"
        />
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="card p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-zinc-100">{it.customer_name}</div>
                  <a
                    href={`tel:${it.customer_phone}`}
                    className="text-sm text-amber-glow hover:underline flex items-center gap-1 mt-1"
                  >
                    <Phone className="w-3.5 h-3.5" /> {it.customer_phone}
                  </a>
                  {it.message && (
                    <p className="text-sm text-zinc-300 mt-2 whitespace-pre-wrap">{it.message}</p>
                  )}
                </div>
                <div className="text-2xs text-zinc-500 flex flex-col items-end gap-1">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(it.created_at)}</span>
                  <span>{formatDateTime(it.created_at)}</span>
                </div>
              </div>
              {it.phone_id && (
                <Link
                  to={`/used-phones/${it.phone_id}`}
                  className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-zinc-400 hover:text-amber-glow"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  查看对应机型
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
