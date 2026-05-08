"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  Instagram,
  Loader2,
  PlusCircle,
  Trash2,
  XCircle,
  Edit2,
  Send,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/client";
import {
  approvePost,
  rejectPost,
  createPost,
  publishPost,
  saveDmTemplate,
  deleteDmTemplate,
  updateDmTemplate,
  saveAccount,
} from "@/lib/actions/social";

const PAGE_SIZE = 10;

// ─── Types ────────────────────────────────────────────────────────────────────

type SocialPost = {
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

type DmTemplate = {
  id: string;
  name: string;
  trigger_keywords: string[];
  response_text: string;
  is_active: boolean;
  priority: number;
  use_count: number;
  created_at: string;
};

type SocialAccount = {
  id: string;
  platform: string;
  username: string;
  access_token: string | null;
  page_id: string | null;
  ig_user_id: string | null;
  is_active: boolean;
  connected_at: string | null;
};

// ─── Status config ─────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Taslak", className: "bg-gray-100 text-gray-600" },
  pending_approval: { label: "Onay Bekliyor", className: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Onaylı", className: "bg-blue-100 text-blue-700" },
  scheduled: { label: "Zamanlandı", className: "bg-purple-100 text-purple-700" },
  published: { label: "Yayınlandı", className: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Reddedildi", className: "bg-red-100 text-red-600" },
};

const statusFilterOptions = [
  { value: "all", label: "Tümü" },
  { value: "pending_approval", label: "Onay Bekliyor" },
  { value: "approved", label: "Onaylı" },
  { value: "published", label: "Yayınlandı" },
  { value: "rejected", label: "Reddedildi" },
];

function formatTarih(value: string) {
  const d = new Date(value);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ─── Kuyruk Tab ───────────────────────────────────────────────────────────────

function KuyrukTab() {
  const supabase = createClient();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Create post dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [newImageBrief, setNewImageBrief] = useState("");
  const [newHashtags, setNewHashtags] = useState("");
  const [newScheduledAt, setNewScheduledAt] = useState("");

  // Approve/reject
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveTargetId, setApproveTargetId] = useState<string | null>(null);
  const [approveScheduledAt, setApproveScheduledAt] = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("social_posts")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, count, error } = await query;
      if (error) throw error;
      setPosts(data ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      toast.error("Postlar yüklenemedi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  async function handleCreatePost() {
    if (!newCaption.trim()) {
      toast.error("Caption zorunludur");
      return;
    }
    setCreateLoading(true);
    try {
      const hashtags = newHashtags
        .split(/[\s,]+/)
        .map((h) => h.trim().replace(/^#/, ""))
        .filter(Boolean);
      await createPost({
        caption: newCaption,
        image_brief: newImageBrief || undefined,
        hashtags,
        scheduled_at: newScheduledAt || undefined,
      });
      toast.success("Post oluşturuldu, onay bekleniyor");
      setCreateOpen(false);
      setNewCaption("");
      setNewImageBrief("");
      setNewHashtags("");
      setNewScheduledAt("");
      fetchPosts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Post oluşturulamadı");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleApprove() {
    if (!approveTargetId) return;
    setActioningId(approveTargetId);
    try {
      await approvePost(approveTargetId, approveScheduledAt || undefined);
      toast.success("Post onaylandı");
      setApproveDialogOpen(false);
      setApproveTargetId(null);
      setApproveScheduledAt("");
      fetchPosts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Post onaylanamadı");
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject() {
    if (!rejectTargetId || !rejectReason.trim()) {
      toast.error("Red sebebi zorunludur");
      return;
    }
    setActioningId(rejectTargetId);
    try {
      await rejectPost(rejectTargetId, rejectReason);
      toast.success("Post reddedildi");
      setRejectDialogOpen(false);
      setRejectTargetId(null);
      setRejectReason("");
      fetchPosts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Post reddedilemedi");
    } finally {
      setActioningId(null);
    }
  }

  async function handlePublish(postId: string) {
    setActioningId(postId);
    try {
      const result = await publishPost(postId);
      if (!result.success) {
        toast.error(result.error ?? "Yayınlanamadı");
      } else {
        toast.success("Post yayınlandı");
        fetchPosts();
      }
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={statusFilter}
          onValueChange={(v) => { setStatusFilter(v); setPage(1); }}
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Durum filtrele" />
          </SelectTrigger>
          <SelectContent>
            {statusFilterOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPosts}>Yenile</Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Post Oluştur
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
            ))
          : posts.length === 0
          ? (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  Post bulunamadı
                </CardContent>
              </Card>
            )
          : posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={statusConfig[post.status]?.className ?? ""}>
                          {statusConfig[post.status]?.label ?? post.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTarih(post.created_at)}
                        </span>
                        {post.scheduled_at && (
                          <span className="text-xs text-purple-600">
                            📅 {formatTarih(post.scheduled_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm line-clamp-2">
                        {post.caption.length > 150
                          ? post.caption.slice(0, 150) + "…"
                          : post.caption}
                      </p>
                      {post.image_brief && (
                        <p className="text-xs text-muted-foreground">
                          🖼 {post.image_brief}
                        </p>
                      )}
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.slice(0, 6).map((tag) => (
                            <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                              #{tag}
                            </span>
                          ))}
                          {post.hashtags.length > 6 && (
                            <span className="text-[11px] text-muted-foreground">+{post.hashtags.length - 6}</span>
                          )}
                        </div>
                      )}
                      {post.status === "rejected" && post.rejection_reason && (
                        <p className="text-xs text-red-500">Red sebebi: {post.rejection_reason}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {post.status === "pending_approval" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={actioningId === post.id}
                            onClick={() => { setApproveTargetId(post.id); setApproveDialogOpen(true); }}
                          >
                            {actioningId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            <span className="ml-1 hidden sm:inline">Onayla</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={actioningId === post.id}
                            onClick={() => { setRejectTargetId(post.id); setRejectDialogOpen(true); }}
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="ml-1 hidden sm:inline">Reddet</span>
                          </Button>
                        </>
                      )}
                      {post.status === "approved" && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  size="sm"
                                  disabled
                                  onClick={() => handlePublish(post.id)}
                                >
                                  <Send className="h-4 w-4" />
                                  <span className="ml-1 hidden sm:inline">Yayınla</span>
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              API bağlantısı bekleniyor
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Toplam {totalCount} post</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Önceki</Button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((num) => (
            <Button key={num} size="sm" variant={num === page ? "default" : "outline"} onClick={() => setPage(num)}>
              {num}
            </Button>
          ))}
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Sonraki</Button>
        </div>
      </div>

      {/* Create Post Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni Post Oluştur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="caption">Caption *</Label>
              <Textarea
                id="caption"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="Post içeriği..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="image-brief">Görsel Briefi</Label>
              <Input
                id="image-brief"
                value={newImageBrief}
                onChange={(e) => setNewImageBrief(e.target.value)}
                placeholder="Görselde ne olmalı?"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="hashtags">Hashtagler</Label>
              <Input
                id="hashtags"
                value={newHashtags}
                onChange={(e) => setNewHashtags(e.target.value)}
                placeholder="#şarjup #şarj #işletme (boşluk veya virgülle ayır)"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="scheduled-at">Zamanlama (opsiyonel)</Label>
              <Input
                id="scheduled-at"
                type="datetime-local"
                value={newScheduledAt}
                onChange={(e) => setNewScheduledAt(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>İptal</Button>
            <Button onClick={handleCreatePost} disabled={createLoading}>
              {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Postu Onayla</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="approve-schedule">Yayın Zamanı (opsiyonel)</Label>
            <Input
              id="approve-schedule"
              type="datetime-local"
              value={approveScheduledAt}
              onChange={(e) => setApproveScheduledAt(e.target.value)}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>İptal</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleApprove}
              disabled={!!actioningId}
            >
              {actioningId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Onayla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Postu Reddet</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="reject-reason">Red Sebebi *</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Red sebebini girin..."
              rows={3}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>İptal</Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!!actioningId}
            >
              {actioningId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── DM Şablonları Tab ────────────────────────────────────────────────────────

function DmSablonlarTab() {
  const supabase = createClient();
  const [templates, setTemplates] = useState<DmTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [newResponse, setNewResponse] = useState("");
  const [newPriority, setNewPriority] = useState("0");

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<DmTemplate | null>(null);
  const [editName, setEditName] = useState("");
  const [editKeywords, setEditKeywords] = useState("");
  const [editResponse, setEditResponse] = useState("");
  const [editPriority, setEditPriority] = useState("0");

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("social_dm_templates")
        .select("*")
        .order("priority", { ascending: false });
      if (error) throw error;
      setTemplates(data ?? []);
    } catch {
      toast.error("Şablonlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  async function handleCreate() {
    if (!newName.trim() || !newResponse.trim()) {
      toast.error("İsim ve yanıt metni zorunludur");
      return;
    }
    setCreateLoading(true);
    try {
      const keywords = newKeywords.split(/[\s,]+/).map((k) => k.trim()).filter(Boolean);
      await saveDmTemplate({
        name: newName,
        trigger_keywords: keywords,
        response_text: newResponse,
        priority: parseInt(newPriority) || 0,
      });
      toast.success("Şablon oluşturuldu");
      setCreateOpen(false);
      setNewName(""); setNewKeywords(""); setNewResponse(""); setNewPriority("0");
      fetchTemplates();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Şablon oluşturulamadı");
    } finally {
      setCreateLoading(false);
    }
  }

  function openEdit(t: DmTemplate) {
    setEditTarget(t);
    setEditName(t.name);
    setEditKeywords(t.trigger_keywords.join(", "));
    setEditResponse(t.response_text);
    setEditPriority(String(t.priority));
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!editTarget) return;
    setEditLoading(true);
    try {
      const keywords = editKeywords.split(/[\s,]+/).map((k) => k.trim()).filter(Boolean);
      await updateDmTemplate(editTarget.id, {
        name: editName,
        trigger_keywords: keywords,
        response_text: editResponse,
        priority: parseInt(editPriority) || 0,
      });
      toast.success("Şablon güncellendi");
      setEditOpen(false);
      fetchTemplates();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Şablon güncellenemedi");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleToggle(t: DmTemplate) {
    setTogglingId(t.id);
    try {
      await updateDmTemplate(t.id, { is_active: !t.is_active });
      toast.success(t.is_active ? "Şablon devre dışı" : "Şablon aktif");
      setTemplates((prev) => prev.map((x) => x.id === t.id ? { ...x, is_active: !x.is_active } : x));
    } catch {
      toast.error("Güncelleme başarısız");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteDmTemplate(id);
      toast.success("Şablon silindi");
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error("Silinemedi");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <p className="text-sm text-muted-foreground">{templates.length} şablon</p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Yeni Şablon
        </Button>
      </div>

      <div className="space-y-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))
          : templates.length === 0
          ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Henüz şablon yok
                </CardContent>
              </Card>
            )
          : templates.map((t) => (
              <Card key={t.id} className={!t.is_active ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{t.name}</span>
                        <Badge variant="outline" className="text-[10px]">Öncelik: {t.priority}</Badge>
                        <Badge variant="outline" className="text-[10px]">Kullanım: {t.use_count}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {t.trigger_keywords.map((kw) => (
                          <span key={kw} className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] text-blue-600 border border-blue-200">
                            {kw}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{t.response_text}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => handleToggle(t)}
                        disabled={togglingId === t.id}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        title={t.is_active ? "Devre dışı bırak" : "Aktif et"}
                      >
                        {togglingId === t.id
                          ? <Loader2 className="h-5 w-5 animate-spin" />
                          : t.is_active
                          ? <ToggleRight className="h-5 w-5 text-emerald-600" />
                          : <ToggleLeft className="h-5 w-5" />}
                      </button>
                      <Button size="icon" variant="ghost" onClick={() => openEdit(t)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600"
                        disabled={deletingId === t.id}
                        onClick={() => handleDelete(t.id)}
                      >
                        {deletingId === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni DM Şablonu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Şablon Adı *</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Fiyat Sorusu" className="mt-1" />
            </div>
            <div>
              <Label>Anahtar Kelimeler</Label>
              <Input value={newKeywords} onChange={(e) => setNewKeywords(e.target.value)} placeholder="fiyat, ücret, kaç para (virgül veya boşlukla ayır)" className="mt-1" />
            </div>
            <div>
              <Label>Yanıt Metni *</Label>
              <Textarea value={newResponse} onChange={(e) => setNewResponse(e.target.value)} placeholder="Otomatik yanıt..." rows={3} className="mt-1" />
            </div>
            <div>
              <Label>Öncelik</Label>
              <Input type="number" value={newPriority} onChange={(e) => setNewPriority(e.target.value)} placeholder="0" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>İptal</Button>
            <Button onClick={handleCreate} disabled={createLoading}>
              {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Şablonu Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Şablon Adı *</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Anahtar Kelimeler</Label>
              <Input value={editKeywords} onChange={(e) => setEditKeywords(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Yanıt Metni *</Label>
              <Textarea value={editResponse} onChange={(e) => setEditResponse(e.target.value)} rows={3} className="mt-1" />
            </div>
            <div>
              <Label>Öncelik</Label>
              <Input type="number" value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>İptal</Button>
            <Button onClick={handleEdit} disabled={editLoading}>
              {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Hesap Tab ────────────────────────────────────────────────────────────────

function HesapTab() {
  const supabase = createClient();
  const [account, setAccount] = useState<SocialAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [accessToken, setAccessToken] = useState("");
  const [pageId, setPageId] = useState("");
  const [igUserId, setIgUserId] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("platform", "instagram")
        .maybeSingle();
      setAccount(data ?? null);
      if (data) {
        setAccessToken(data.access_token ?? "");
        setPageId(data.page_id ?? "");
        setIgUserId(data.ig_user_id ?? "");
        setUsername(data.username ?? "");
      }
      setLoading(false);
    }
    fetch();
  }, []);

  async function handleSave() {
    if (!accessToken.trim() || !pageId.trim() || !igUserId.trim() || !username.trim()) {
      toast.error("Tüm alanlar zorunludur");
      return;
    }
    setSaving(true);
    try {
      await saveAccount({ access_token: accessToken, page_id: pageId, ig_user_id: igUserId, username });
      toast.success("Hesap kaydedildi");
      setAccount({
        id: account?.id ?? "",
        platform: "instagram",
        username,
        access_token: accessToken,
        page_id: pageId,
        ig_user_id: igUserId,
        is_active: true,
        connected_at: new Date().toISOString(),
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      {!account || !account.is_active ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <Instagram className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Henüz bağlı bir Instagram hesabı yok.<br />
              Meta API kurulumu tamamlandığında buradan bağlanabilirsiniz.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="flex items-center gap-3 p-4">
            <Instagram className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-700">@{account.username}</p>
              <p className="text-xs text-emerald-600">
                {account.connected_at ? `Bağlandı: ${formatTarih(account.connected_at)}` : "Bağlı"}
              </p>
            </div>
            <Badge className="ml-auto bg-emerald-100 text-emerald-700">Aktif</Badge>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hesap Bilgilerini Güncelle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="username">Instagram Kullanıcı Adı *</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="sarjup.oficial"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="access-token">Access Token *</Label>
            <Input
              id="access-token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Bearer token veya long-lived token"
              className="mt-1"
              type="password"
            />
          </div>
          <div>
            <Label htmlFor="page-id">Page ID *</Label>
            <Input
              id="page-id"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              placeholder="Meta Business Page ID"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="ig-user-id">Instagram User ID *</Label>
            <Input
              id="ig-user-id"
              value={igUserId}
              onChange={(e) => setIgUserId(e.target.value)}
              placeholder="Instagram Business Account ID"
              className="mt-1"
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kaydet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SosyalMedyaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Sosyal Medya</h2>
        <p className="text-muted-foreground">İçerik kuyruğu, DM şablonları ve hesap yönetimi</p>
      </div>

      <Tabs defaultValue="kuyruk">
        <TabsList>
          <TabsTrigger value="kuyruk">Kuyruk</TabsTrigger>
          <TabsTrigger value="dm-sablonlar">DM Şablonları</TabsTrigger>
          <TabsTrigger value="hesap">Hesap</TabsTrigger>
        </TabsList>
        <TabsContent value="kuyruk" className="mt-4">
          <KuyrukTab />
        </TabsContent>
        <TabsContent value="dm-sablonlar" className="mt-4">
          <DmSablonlarTab />
        </TabsContent>
        <TabsContent value="hesap" className="mt-4">
          <HesapTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
