import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.error(
    "[Supabase] 环境变量未配置,请在 .env / Vercel 设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(url || "", anonKey || "", {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export function isOfflineMode(): boolean {
  return !url || !anonKey;
}
