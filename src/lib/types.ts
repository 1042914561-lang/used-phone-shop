// =====================================================
// 类型定义 + 状态/成色 配置
// =====================================================

export type UsedPhoneStatus = "available" | "reserved" | "sold" | "offline";

export const USED_PHONE_STATUS_CONFIG: Record<UsedPhoneStatus, { label: string; color: string; bg: string }> = {
  available: { label: "在售", color: "#2ECC71", bg: "#2ECC7120" },
  reserved:  { label: "已预定", color: "#F5A623", bg: "#F5A62320" },
  sold:      { label: "已售出", color: "#7B8794", bg: "#7B879420" },
  offline:   { label: "下架", color: "#E74C3C", bg: "#E74C3C20" },
};

export const USED_PHONE_CONDITION_OPTIONS = [
  "99新",
  "95新",
  "9新",
  "8新",
  "7新",
  "其他",
] as const;

export interface UsedPhone {
  id: string;
  owner_id: string;
  brand: string;
  model: string;
  storage: string;
  color: string;
  condition: string;
  battery_health: number;
  imei: string;
  source: string;
  source_price: number;
  title: string;
  description: string;
  faults: string;
  accessories: string;
  sell_price: number;
  status: UsedPhoneStatus;
  listed_at: string;
  sold_at: string | null;
  sold_price: number | null;
  buyer_phone: string;
  remark: string;
  created_at: string;
  updated_at: string;
}

// 公共可见的精简结构(不暴露 IMEI/电池/进货价/内部备注)
export interface PublicUsedPhone {
  id: string;
  brand: string;
  model: string;
  storage: string;
  color: string;
  condition: string;
  title: string;
  description: string;
  faults: string;
  accessories: string;
  sell_price: number;
  listed_at: string;
  photos: { id: string; url: string }[];
}

export interface UsedPhonePhoto {
  id: string;
  phone_id: string;
  url: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
}

export interface UsedPhoneInquiry {
  id: string;
  phone_id: string | null;
  customer_name: string;
  customer_phone: string;
  message: string;
  created_at: string;
  phone?: PublicUsedPhone;
}
