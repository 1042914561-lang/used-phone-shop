import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getUsedPhone, addUsedPhone, updateUsedPhone,
  uploadUsedPhonePhoto, listUsedPhonePhotos, deleteUsedPhonePhoto, markUsedPhoneSold,
} from "../lib/db";
import {
  USED_PHONE_CONDITION_OPTIONS, USED_PHONE_STATUS_CONFIG, UsedPhoneStatus,
} from "../lib/types";
import { formatMoney } from "../lib/utils";
import { PhonePicker } from "../components/PhonePicker";
import { X, Upload, Star, Save, ArrowLeft, Check } from "lucide-react";

export function UsedPhoneForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<any>({
    brand: "", model: "", storage: "", color: "",
    condition: "95新", battery_health: 90,
    imei: "", source: "", source_price: 0,
    sell_price: 0, status: "available",
    title: "", description: "", faults: "", accessories: "", remark: "",
  });
  const [photos, setPhotos] = useState<{ id: string; url: string; storage_path?: string }[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const p = await getUsedPhone(id);
        if (p) setForm({ ...p });
        const phs = await listUsedPhonePhotos(id);
        setPhotos(phs.map((x) => ({ id: x.id, url: x.url, storage_path: x.storage_path })));
      } catch (e: any) { setErr(e?.message || "加载失败"); }
    })();
  }, [id]);

  function set<K extends string>(k: K, v: any) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  async function save() {
    if (!form.brand || !form.model) {
      setErr("请先选择品牌型号");
      return;
    }
    if ((form.sell_price ?? 0) <= 0) {
      setErr("请填写售价");
      return;
    }
    setErr(null);
    setSaving(true);
    try {
      if (isEdit) {
        await updateUsedPhone(id!, form);
      } else {
        const created = await addUsedPhone(form);
        if (id !== created.id) navigate(`/used-phones/${created.id}`, { replace: true });
      }
      alert("已保存");
    } catch (e: any) {
      setErr(e?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !id) return;
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        const ph = await uploadUsedPhonePhoto(id, f);
        setPhotos((arr) => [...arr, { id: ph.id, url: ph.url, storage_path: ph.storage_path }]);
      }
    } catch (e: any) {
      alert("上传失败:" + (e?.message || "未知错误"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function removePhoto(ph: { id: string; storage_path?: string }) {
    if (!ph.storage_path) {
      setPhotos((arr) => arr.filter((p) => p.id !== ph.id));
      return;
    }
    if (!confirm("确定删除这张图片?")) return;
    try {
      await deleteUsedPhonePhoto({ id: ph.id, phone_id: id!, url: "", storage_path: ph.storage_path, sort_order: 0, created_at: "" });
      setPhotos((arr) => arr.filter((p) => p.id !== ph.id));
    } catch (e: any) { alert("删除失败:" + e?.message); }
  }

  async function markSold() {
    const sp = prompt("成交价(元):", String(form.sell_price || ""));
    if (sp == null) return;
    const buyer = prompt("买家手机号:", "");
    if (!buyer) return;
    try {
      await markUsedPhoneSold(id!, Number(sp) || 0, buyer);
      alert("已标记为已售出");
      navigate("/used-phones");
    } catch (e: any) { alert("操作失败:" + e?.message); }
  }

  return (
    <div className="space-y-4 animate-fade-in pb-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/used-phones")} className="btn-ghost"><ArrowLeft className="w-4 h-4" /></button>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-50">{isEdit ? "编辑二手机" : "发布二手机"}</h1>
        </div>
        <div className="flex gap-2">
          {isEdit && form.status !== "sold" && (
            <button onClick={markSold} className="btn-secondary"><Check className="w-4 h-4" /> 标记已售</button>
          )}
          <button onClick={save} disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" /> {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>

      {err && <div className="p-3 rounded-lg bg-status-cancelled/10 text-status-cancelled text-sm">{err}</div>}

      {/* 品牌型号 */}
      <div className="card p-4 space-y-3">
        <h3 className="font-semibold text-zinc-100 text-sm">品牌型号 *</h3>
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="w-full p-3 rounded-lg border border-white/10 bg-ink-800 text-left hover:border-amber-glow/30 transition"
        >
          {form.brand && form.model ? (
            <span><span className="text-zinc-300">{form.brand}</span> <span className="text-zinc-400 text-sm">{form.model}</span></span>
          ) : (
            <span className="text-zinc-500 text-sm">点击选择品牌 / 型号</span>
          )}
        </button>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>
            <label className="text-2xs text-zinc-500">存储</label>
            <input className="input mt-1" placeholder="如 256G" value={form.storage} onChange={(e) => set("storage", e.target.value)} />
          </div>
          <div>
            <label className="text-2xs text-zinc-500">颜色</label>
            <input className="input mt-1" placeholder="如 深空黑" value={form.color} onChange={(e) => set("color", e.target.value)} />
          </div>
          <div>
            <label className="text-2xs text-zinc-500">成色</label>
            <select className="input mt-1" value={form.condition} onChange={(e) => set("condition", e.target.value)}>
              {USED_PHONE_CONDITION_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-2xs text-zinc-500">电池健康 %</label>
            <input type="number" min={0} max={100} className="input mt-1" value={form.battery_health} onChange={(e) => set("battery_health", Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* 公开信息 */}
      <div className="card p-4 space-y-3">
        <h3 className="font-semibold text-zinc-100 text-sm">公开信息(客户可见)</h3>
        <div>
          <label className="text-2xs text-zinc-500">标题(留空则自动)</label>
          <input className="input mt-1" placeholder="如:iPhone 15 Pro 256G 暗紫 国行 99新" value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div>
          <label className="text-2xs text-zinc-500">商品描述</label>
          <textarea className="input mt-1 min-h-[80px]" placeholder="使用情况、保养状态等" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="text-2xs text-zinc-500">瑕疵说明</label>
            <textarea className="input mt-1 min-h-[60px]" placeholder="如实描述划痕/磕碰/维修史" value={form.faults} onChange={(e) => set("faults", e.target.value)} />
          </div>
          <div>
            <label className="text-2xs text-zinc-500">配件</label>
            <textarea className="input mt-1 min-h-[60px]" placeholder="如:原装充电器、数据线、盒子" value={form.accessories} onChange={(e) => set("accessories", e.target.value)} />
          </div>
        </div>
      </div>

      {/* 价格 / 状态 */}
      <div className="card p-4 space-y-3">
        <h3 className="font-semibold text-zinc-100 text-sm">价格 / 状态</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div>
            <label className="text-2xs text-zinc-500">售价 *</label>
            <input type="number" min={0} step={0.01} className="input mt-1" value={form.sell_price} onChange={(e) => set("sell_price", Number(e.target.value))} />
          </div>
          <div>
            <label className="text-2xs text-zinc-500">状态</label>
            <select className="input mt-1" value={form.status} onChange={(e) => set("status", e.target.value as UsedPhoneStatus)}>
              {Object.entries(USED_PHONE_STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{(v as any).label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-2xs text-zinc-500">现价预览</label>
            <div className="input mt-1 num text-amber-glow font-bold">{formatMoney(form.sell_price ?? 0)}</div>
          </div>
        </div>
      </div>

      {/* 内部信息(不对外) */}
      <div className="card p-4 space-y-3">
        <h3 className="font-semibold text-zinc-100 text-sm">内部信息(商家私有)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="text-2xs text-zinc-500">IMEI</label>
            <input className="input mt-1" value={form.imei} onChange={(e) => set("imei", e.target.value)} />
          </div>
          <div>
            <label className="text-2xs text-zinc-500">回收来源</label>
            <input className="input mt-1" placeholder="如:以旧换新" value={form.source} onChange={(e) => set("source", e.target.value)} />
          </div>
          <div>
            <label className="text-2xs text-zinc-500">回收价</label>
            <input type="number" min={0} step={0.01} className="input mt-1" value={form.source_price} onChange={(e) => set("source_price", Number(e.target.value))} />
          </div>
        </div>
        <div>
          <label className="text-2xs text-zinc-500">内部备注</label>
          <textarea className="input mt-1 min-h-[60px]" value={form.remark} onChange={(e) => set("remark", e.target.value)} />
        </div>
      </div>

      {/* 图片(仅编辑时可上传) */}
      {isEdit && (
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-zinc-100 text-sm">图片({photos.length} 张)</h3>
            <label className="btn-secondary cursor-pointer">
              <Upload className="w-4 h-4" />
              {uploading ? "上传中..." : "上传图片"}
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
          {photos.length === 0 ? (
            <p className="text-center text-zinc-500 text-sm py-8">还没有图片,建议至少 3-5 张实拍</p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {photos.map((p, i) => (
                <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden bg-ink-800 group">
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-amber-glow text-ink-950 text-2xs px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5" /> 封面
                    </span>
                  )}
                  <button
                    onClick={() => removePhoto(p)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-ink-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!isEdit && (
        <div className="card p-4 bg-amber-glow/5 border-amber-glow/20">
          <p className="text-sm text-amber-glow">💡 提示:先保存基本信息,然后可以上传图片、分享链接。</p>
        </div>
      )}

      <PhonePicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(brand, model) => { set("brand", brand); set("model", model); setShowPicker(false); }}
        initialBrand={form.brand}
        initialModel={form.model}
      />
    </div>
  );
}
