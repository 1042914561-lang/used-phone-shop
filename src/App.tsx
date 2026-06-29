import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./lib/authStore";
import { Login } from "./pages/Login";
import { UsedPhonesList } from "./pages/UsedPhonesList";
import { UsedPhoneForm } from "./pages/UsedPhoneForm";
import { Inquiries } from "./pages/Inquiries";
import { PrintLabels } from "./pages/PrintLabels";
import { ShopList } from "./pages/shop/ShopList";
import { ShopDetail } from "./pages/shop/ShopDetail";
import { Layout } from "./components/Layout";

function Protected({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthStore();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-950">
        <div className="w-10 h-10 border-2 border-amber-glow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  // 用 getState() 直接拿 init 引用,避免 selector 模式的类型推断问题
  useEffect(() => {
    useAuthStore.getState().init();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protected><UsedPhonesList /></Protected>} />
        <Route path="/used-phones" element={<Protected><UsedPhonesList /></Protected>} />
        <Route path="/used-phones/new" element={<Protected><UsedPhoneForm /></Protected>} />
        <Route path="/used-phones/inquiries" element={<Protected><Inquiries /></Protected>} />
        <Route path="/used-phones/print" element={<Protected><PrintLabels /></Protected>} />
        <Route path="/used-phones/:id" element={<Protected><UsedPhoneForm /></Protected>} />
        {/* 公共扫码页(免登录) */}
        <Route path="/shop" element={<ShopList />} />
        <Route path="/shop/:id" element={<ShopDetail />} />
        <Route path="*" element={<Navigate to="/used-phones" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
