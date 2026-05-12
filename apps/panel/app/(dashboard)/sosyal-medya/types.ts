// ─── Shared Types & Constants ─────────────────────────────────────────────────

export type SocialPost = {
  id: string;
  platform: string;
  caption: string;
  image_url: string | null;
  image_brief: string | null;
  hashtags: string[] | null;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  rejection_reason: string | null;
  created_by: string;
  created_at: string;
};

export type DmTemplate = {
  id: string;
  name: string;
  trigger_keywords: string[];
  response_text: string;
  is_active: boolean;
  priority: number;
  use_count: number;
  created_at: string;
};

export type SocialAccount = {
  id: string;
  platform: string;
  username: string;
  access_token: string | null;
  page_id: string | null;
  ig_user_id: string | null;
  is_active: boolean;
  connected_at: string | null;
};

export const PAGE_SIZE = 10;

export const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Taslak", className: "bg-gray-100 text-gray-600" },
  pending_approval: { label: "Onay Bekliyor", className: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Onaylı", className: "bg-blue-100 text-blue-700" },
  scheduled: { label: "Zamanlandı", className: "bg-purple-100 text-purple-700" },
  published: { label: "Yayınlandı", className: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Reddedildi", className: "bg-red-100 text-red-600" },
};

export const statusFilterOptions = [
  { value: "all", label: "Tümü" },
  { value: "pending_approval", label: "Onay Bekliyor" },
  { value: "approved", label: "Onaylı" },
  { value: "published", label: "Yayınlandı" },
  { value: "rejected", label: "Reddedildi" },
];

export function formatTarih(value: string): string {
  const d = new Date(value);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
