import { ReactNode, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Smartphone,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Home,
  QrCode,
  Printer,
} from "lucide-react";
import { useAuthStore } from "../lib/authStore";
import { isOfflineMode } from "../lib/supabase";

const BOTTOM_NAV_ITEMS = [
  { to: "/", icon: Home, label: "工作台", end: true },
  { to: "/used-phones", icon: Smartphone, label: "二手机" },
  { to: "/used-phones/inquiries", icon: MessageSquare, label: "询价" },
  { to: "/used-phones/print", icon: Printer, label: "贴纸" },
  { to: "/shop", icon: QrCode, label: "店铺", noAuth: true },
];

export function Layout({ children }: { children: ReactNode }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    if (!confirm("确定要退出登录吗?")) return;
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-ink-950">
      {/* 顶栏 */}
      <header className="md:hidden sticky top-0 z-40 bg-ink-900/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-gradient flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-ink-950" />
          </div>
          <span className="font-semibold text-zinc-100">优品二手</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-zinc-400">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* 侧边栏 - 桌面 */}
      <aside className="hidden md:flex w-60 flex-col bg-ink-900/50 border-r border-white/5 sticky top-0 h-screen">
        <SidebarContent onNavigate={() => {}} />
        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-ink-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> 退出登录
          </button>
        </div>
      </aside>

      {/* 移动端抽屉 */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 bg-ink-900 border-r border-white/5 flex flex-col animate-slide-up">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
            <div className="p-3 border-t border-white/5">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-ink-800 rounded-lg"
              >
                <LogOut className="w-4 h-4" /> 退出登录
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 主内容 */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* 底部 Tab */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-ink-900/95 backdrop-blur-md border-t border-white/5">
        <div className="grid grid-cols-5 h-16">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const active = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to + item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex flex-col items-center justify-center gap-1 ${
                  active ? "text-amber-glow" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-2xs">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const { session } = useAuthStore();
  return (
    <>
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-gradient flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-ink-950" />
          </div>
          <div>
            <p className="font-semibold text-zinc-100">优品二手手机店</p>
            <p className="text-2xs text-zinc-500">
              {isOfflineMode() ? "未配置" : "云端同步"}
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to + item.label + "-side"}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-amber-glow/10 text-amber-glow border border-amber-glow/20"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-ink-800"
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-white/5">
        <div className="px-3 py-2 text-xs">
          <p className="text-zinc-500">当前账号</p>
          <p className="text-zinc-300 truncate">{session?.user?.email}</p>
        </div>
      </div>
    </>
  );
}
