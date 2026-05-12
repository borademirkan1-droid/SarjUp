"use client";

import { useState } from "react";
import {
  CheckCircle,
  Loader2,
  PlusCircle,
  Send,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useKuyruk } from "../hooks/useKuyruk";
import { statusConfig, statusFilterOptions, formatTarih } from "../types";
import type { SocialPost } from "../types";

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  actioningId,
  onApprove,
  onReject,
  onPublish,
}: {
  post: SocialPost;
  actioningId: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onPublish: (id: string) => void;
}) {
  const isBusy = actioningId === post.id;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusConfig[post.status]?.className ?? ""}>
                {statusConfig[post.status]?.label ?? post.status}
              </Badge>
              <span className="text-xs text-muted-foreground">{formatTarih(post.created_at)}</span>
              {post.scheduled_at && (
                <span className="text-xs text-purple-600">
                  📅 {formatTarih(post.scheduled_at)}
                </span>
              )}
            </div>
            <p className="text-sm line-clamp-2">
              {post.caption.length > 150 ? post.caption.slice(0, 150) + "…" : post.caption}
            </p>
            {post.image_brief && (
              <p className="text-xs text-muted-foreground">🖼 {post.image_brief}</p>
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
                  disabled={isBusy}
                  onClick={() => onApprove(post.id)}
                >
                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  <span className="ml-1 hidden sm:inline">Onayla</span>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isBusy}
                  onClick={() => onReject(post.id)}
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
                      <Button size="sm" disabled onClick={() => onPublish(post.id)}>
                        <Send className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">Yayınla</span>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>API bağlantısı bekleniyor</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── KuyrukTab ────────────────────────────────────────────────────────────────

export function KuyrukTab() {
  const {
    posts,
    totalCount,
    totalPages,
    loading,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    actioningId,
    fetchPosts,
    handleCreatePost,
    handleApprove,
    handleReject,
    handlePublish,
  } = useKuyruk();

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [newImageBrief, setNewImageBrief] = useState("");
  const [newHashtags, setNewHashtags] = useState("");
  const [newScheduledAt, setNewScheduledAt] = useState("");

  // Approve dialog state
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveTargetId, setApproveTargetId] = useState<string | null>(null);
  const [approveScheduledAt, setApproveScheduledAt] = useState("");

  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function submitCreate() {
    setCreateLoading(true);
    const ok = await handleCreatePost({
      caption: newCaption,
      imageBrief: newImageBrief,
      hashtags: newHashtags,
      scheduledAt: newScheduledAt,
    });
    setCreateLoading(false);
    if (ok) {
      setCreateOpen(false);
      setNewCaption("");
      setNewImageBrief("");
      setNewHashtags("");
      setNewScheduledAt("");
    }
  }

  async function submitApprove() {
    if (!approveTargetId) return;
    const ok = await handleApprove(approveTargetId, approveScheduledAt);
    if (ok) {
      setApproveDialogOpen(false);
      setApproveTargetId(null);
      setApproveScheduledAt("");
    }
  }

  async function submitReject() {
    if (!rejectTargetId) return;
    const ok = await handleReject(rejectTargetId, rejectReason);
    if (ok) {
      setRejectDialogOpen(false);
      setRejectTargetId(null);
      setRejectReason("");
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
              <PostCard
                key={post.id}
                post={post}
                actioningId={actioningId}
                onApprove={(id) => { setApproveTargetId(id); setApproveDialogOpen(true); }}
                onReject={(id) => { setRejectTargetId(id); setRejectDialogOpen(true); }}
                onPublish={handlePublish}
              />
            ))}
      </div>

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

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Yeni Post Oluştur</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="caption">Caption *</Label>
              <Textarea id="caption" value={newCaption} onChange={(e) => setNewCaption(e.target.value)} placeholder="Post içeriği..." rows={4} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="image-brief">Görsel Briefi</Label>
              <Input id="image-brief" value={newImageBrief} onChange={(e) => setNewImageBrief(e.target.value)} placeholder="Görselde ne olmalı?" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="hashtags">Hashtagler</Label>
              <Input id="hashtags" value={newHashtags} onChange={(e) => setNewHashtags(e.target.value)} placeholder="#şarjup #şarj #işletme (boşluk veya virgülle ayır)" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="scheduled-at">Zamanlama (opsiyonel)</Label>
              <Input id="scheduled-at" type="datetime-local" value={newScheduledAt} onChange={(e) => setNewScheduledAt(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>İptal</Button>
            <Button onClick={submitCreate} disabled={createLoading}>
              {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Postu Onayla</DialogTitle></DialogHeader>
          <div>
            <Label htmlFor="approve-schedule">Yayın Zamanı (opsiyonel)</Label>
            <Input id="approve-schedule" type="datetime-local" value={approveScheduledAt} onChange={(e) => setApproveScheduledAt(e.target.value)} className="mt-1" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>İptal</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={submitApprove} disabled={!!actioningId}>
              {actioningId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Onayla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Postu Reddet</DialogTitle></DialogHeader>
          <div>
            <Label htmlFor="reject-reason">Red Sebebi *</Label>
            <Textarea id="reject-reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Red sebebini girin..." rows={3} className="mt-1" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>İptal</Button>
            <Button variant="destructive" onClick={submitReject} disabled={!!actioningId}>
              {actioningId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
