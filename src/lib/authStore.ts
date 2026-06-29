import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,

  async init() {
    try {
      const { data } = await supabase.auth.getSession();
      set({ session: data.session, user: data.session?.user ?? null, loading: false });

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null });
      });
    } catch (e) {
      console.error("[auth] init failed", e);
      set({ loading: false });
    }
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.session) {
      // 持久化到 localStorage,iOS PWA 唤醒后能立即拿到 user_id
      try {
        localStorage.setItem("ups.session", JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          user_id: data.session.user.id,
          expires_at: data.session.expires_at,
        }));
      } catch {}
      set({ session: data.session, user: data.user });
    }
    return {};
  },

  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.session) {
      try {
        localStorage.setItem("ups.session", JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          user_id: data.session.user.id,
          expires_at: data.session.expires_at,
        }));
      } catch {}
      set({ session: data.session, user: data.user });
    }
    return {};
  },

  async logout() {
    await supabase.auth.signOut();
    try { localStorage.removeItem("ups.session"); } catch {}
    set({ session: null, user: null });
  },
}));

// 同步获取当前 user_id(避免 iOS WebView 异步卡顿)
export function getAuthUserId(): string | null {
  try {
    const raw = localStorage.getItem("ups.session");
    if (raw) {
      const s = JSON.parse(raw);
      if (s?.user_id) return s.user_id as string;
    }
  } catch {}
  return null;
}
