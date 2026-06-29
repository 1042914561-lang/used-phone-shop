import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { useAuthStore } from "../lib/authStore";
import { isOfflineMode } from "../lib/supabase";

export function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const fn = mode === "signin" ? signIn : signUp;
      const r = await fn(email.trim(), password);
      if (r.error) {
        setErr(r.error);
      } else {
        navigate("/used-phones");
      }
    } catch (e: any) {
      setErr(e?.message || "操作失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-ink-950 to-ink-900">
      <div className="w-20 h-20 rounded-3xl bg-amber-gradient flex items-center justify-center shadow-glow mb-6">
        <Smartphone className="w-10 h-10 text-ink-950" />
      </div>
      <h1 className="text-2xl font-bold text-zinc-50 mb-1">优品二手手机店</h1>
      <p className="text-sm text-zinc-500 mb-8">商家后台管理</p>

      {isOfflineMode() && (
        <div className="w-full max-w-sm mb-4 p-3 rounded-xl bg-status-cancelled/10 border border-status-cancelled/30 text-xs text-status-cancelled">
          ⚠️ Supabase 环境变量未配置。请在 Vercel 项目设置里填入 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。
        </div>
      )}

      <form onSubmit={submit} className="w-full max-w-sm space-y-3">
        <div>
          <label className="text-2xs text-zinc-500">邮箱</label>
          <input
            type="email"
            className="input mt-1"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="text-2xs text-zinc-500">密码</label>
          <div className="relative mt-1">
            <input
              type={showPwd ? "text" : "password"}
              className="input pr-10"
              placeholder="至少 6 位"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {err && <p className="text-xs text-status-cancelled">{err}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {mode === "signin" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {loading ? "处理中..." : mode === "signin" ? "登录" : "注册"}
        </button>

        <button
          type="button"
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErr(null); }}
          className="w-full text-xs text-zinc-400 hover:text-zinc-200"
        >
          {mode === "signin" ? "还没账号?去注册" : "已有账号?去登录"}
        </button>
      </form>

      <button
        onClick={() => navigate("/shop")}
        className="mt-8 text-xs text-zinc-500 hover:text-amber-glow"
      >
        顾客入口:看店内全部在售 →
      </button>
    </div>
  );
}
