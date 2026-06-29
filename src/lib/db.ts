import { supabase } from "./supabase";
import { getAuthUserId } from "./authStore";
import {
  UsedPhone,
  UsedPhoneStatus,
  PublicUsedPhone,
  UsedPhonePhoto,
  UsedPhoneInquiry,
} from "./types";

// =====================================================
// 商家 CRUD
// =====================================================

export async function listUsedPhones(status?: UsedPhoneStatus): Promise<UsedPhone[]> {
  let q = supabase.from("used_phones").select("*").order("listed_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as UsedPhone[];
}

export async function getUsedPhone(id: string): Promise<UsedPhone | null> {
  const { data, error } = await supabase.from("used_phones").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as UsedPhone) || null;
}

export async function addUsedPhone(input: Partial<UsedPhone>): Promise<UsedPhone> {
  const userId = getAuthUserId();
  if (!userId) throw new Error("未登录");
  const { data, error } = await supabase
    .from("used_phones")
    .insert({ ...input, owner_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as UsedPhone;
}

export async function updateUsedPhone(id: string, input: Partial<UsedPhone>): Promise<UsedPhone> {
  const { data, error } = await supabase
    .from("used_phones")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as UsedPhone;
}

export async function deleteUsedPhone(id: string): Promise<void> {
  const { error } = await supabase.from("used_phones").delete().eq("id", id);
  if (error) throw error;
}

export async function markUsedPhoneSold(
  id: string,
  soldPrice: number,
  buyerPhone: string
): Promise<UsedPhone> {
  const { data, error } = await supabase
    .from("used_phones")
    .update({
      status: "sold",
      sold_at: new Date().toISOString(),
      sold_price: soldPrice,
      buyer_phone: buyerPhone,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as UsedPhone;
}

// =====================================================
// 图片
// =====================================================

export async function listUsedPhonePhotos(phoneId: string): Promise<UsedPhonePhoto[]> {
  const { data, error } = await supabase
    .from("used_phone_photos")
    .select("*")
    .eq("phone_id", phoneId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []) as UsedPhonePhoto[];
}

export async function uploadUsedPhonePhoto(
  phoneId: string,
  file: File
): Promise<UsedPhonePhoto> {
  const userId = getAuthUserId();
  if (!userId) throw new Error("未登录");
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${phoneId}/${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("used-phone-photos")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) throw upErr;
  const { data: pub } = supabase.storage.from("used-phone-photos").getPublicUrl(path);
  const { data, error } = await supabase
    .from("used_phone_photos")
    .insert({ phone_id: phoneId, url: pub.publicUrl, storage_path: path })
    .select()
    .single();
  if (error) throw error;
  return data as UsedPhonePhoto;
}

export async function deleteUsedPhonePhoto(photo: UsedPhonePhoto): Promise<void> {
  await supabase.storage.from("used-phone-photos").remove([photo.storage_path]);
  const { error } = await supabase.from("used_phone_photos").delete().eq("id", photo.id);
  if (error) throw error;
}

// =====================================================
// 询价
// =====================================================

export async function listMyInquiries(): Promise<UsedPhoneInquiry[]> {
  // RLS 已经限制为 owner = auth.uid() 的 phone 关联的询价
  const { data, error } = await supabase
    .from("used_phone_inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as UsedPhoneInquiry[];
}

// =====================================================
// 公共接口(免登录)
// =====================================================

const PUBLIC_FIELDS =
  "id, brand, model, storage, color, condition, title, description, faults, accessories, sell_price, listed_at";

async function attachPhotos(phones: { id: string }[]): Promise<Map<string, UsedPhonePhoto[]>> {
  const map = new Map<string, UsedPhonePhoto[]>();
  if (phones.length === 0) return map;
  const ids = phones.map((p) => p.id);
  const { data, error } = await supabase
    .from("used_phone_photos")
    .select("id, phone_id, url, storage_path, sort_order, created_at")
    .in("phone_id", ids)
    .order("sort_order", { ascending: true });
  if (error) return map;
  for (const p of (data || []) as UsedPhonePhoto[]) {
    const arr = map.get(p.phone_id) || [];
    arr.push(p);
    map.set(p.phone_id, arr);
  }
  return map;
}

export async function publicListUsedPhones(): Promise<PublicUsedPhone[]> {
  const { data, error } = await supabase
    .from("used_phones")
    .select(PUBLIC_FIELDS)
    .eq("status", "available")
    .order("listed_at", { ascending: false });
  if (error) throw error;
  const photosMap = await attachPhotos((data || []) as { id: string }[]);
  return (data || []).map((p: any) => ({
    ...p,
    photos: (photosMap.get(p.id) || []).map((ph) => ({ id: ph.id, url: ph.url })),
  })) as PublicUsedPhone[];
}

export async function publicGetUsedPhone(id: string): Promise<PublicUsedPhone | null> {
  const { data, error } = await supabase
    .from("used_phones")
    .select(PUBLIC_FIELDS)
    .eq("id", id)
    .eq("status", "available")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const photosMap = await attachPhotos([{ id }]);
  return {
    ...(data as any),
    photos: (photosMap.get(id) || []).map((ph) => ({ id: ph.id, url: ph.url })),
  } as PublicUsedPhone;
}

export async function publicCreateInquiry(input: {
  phone_id: string;
  customer_name: string;
  customer_phone: string;
  message?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("used_phone_inquiries").insert(input);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
