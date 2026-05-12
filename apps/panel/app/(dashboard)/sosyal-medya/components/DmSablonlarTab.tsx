"use client";

import { useState } from "react";
import {
  Edit2,
  Loader2,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useDmSablonlar } from "../hooks/useDmSablonlar";
import type { DmTemplate } from "../types";

// ─── Template Form Fields ─────────────────────────────────────────────────────

type TemplateFormProps = {
  name: string;
  keywords: string;
  response: string;
  priority: string;
  onName: (v: string) => void;
  onKeywords: (v: string) => void;
  onResponse: (v: string) => void;
  onPriority: (v: string) => void;
};

function TemplateFormFields({
  name, keywords, response, priority,
  onName, onKeywords, onResponse, onPriority,
}: TemplateFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Şablon Adı *</Label>
        <Input value={name} onChange={(e) => onName(e.target.value)} placeholder="Fiyat Sorusu" className="mt-1" />
      </div>
      <div>
        <Label>Anahtar Kelimeler</Label>
        <Input value={keywords} onChange={(e) => onKeywords(e.target.value)} placeholder="fiyat, ücret, kaç para (virgül veya boşlukla ayır)" className="mt-1" />
      </div>
      <div>
        <Label>Yanıt Metni *</Label>
        <Textarea value={response} onChange={(e) => onResponse(e.target.value)} placeholder="Otomatik yanıt..." rows={3} className="mt-1" />
      </div>
      <div>
        <Label>Öncelik</Label>
        <Input type="number" value={priority} onChange={(e) => onPriority(e.target.value)} placeholder="0" className="mt-1" />
      </div>
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  togglingId,
  deletingId,
  onToggle,
  onEdit,
  onDelete,
}: {
  template: DmTemplate;
  togglingId: string | null;
  deletingId: string | null;
  onToggle: (t: DmTemplate) => void;
  onEdit: (t: DmTemplate) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className={!template.is_active ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{template.name}</span>
              <Badge variant="outline" className="text-[10px]">Öncelik: {template.priority}</Badge>
              <Badge variant="outline" className="text-[10px]">Kullanım: {template.use_count}</Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {template.trigger_keywords.map((kw) => (
                <span key={kw} className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] text-blue-600 border border-blue-200">
                  {kw}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{template.response_text}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => onToggle(template)}
              disabled={togglingId === template.id}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              title={template.is_active ? "Devre dışı bırak" : "Aktif et"}
            >
              {togglingId === template.id
                ? <Loader2 className="h-5 w-5 animate-spin" />
                : template.is_active
                ? <ToggleRight className="h-5 w-5 text-emerald-600" />
                : <ToggleLeft className="h-5 w-5" />}
            </button>
            <Button size="icon" variant="ghost" onClick={() => onEdit(template)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-red-500 hover:text-red-600"
              disabled={deletingId === template.id}
              onClick={() => onDelete(template.id)}
            >
              {deletingId === template.id
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── DmSablonlarTab ───────────────────────────────────────────────────────────

export function DmSablonlarTab() {
  const { templates, loading, togglingId, deletingId, handleCreate, handleEdit, handleToggle, handleDelete } = useDmSablonlar();

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [newResponse, setNewResponse] = useState("");
  const [newPriority, setNewPriority] = useState("0");

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<DmTemplate | null>(null);
  const [editName, setEditName] = useState("");
  const [editKeywords, setEditKeywords] = useState("");
  const [editResponse, setEditResponse] = useState("");
  const [editPriority, setEditPriority] = useState("0");

  function openEdit(t: DmTemplate) {
    setEditTarget(t);
    setEditName(t.name);
    setEditKeywords(t.trigger_keywords.join(", "));
    setEditResponse(t.response_text);
    setEditPriority(String(t.priority));
    setEditOpen(true);
  }

  async function submitCreate() {
    setCreateLoading(true);
    const ok = await handleCreate({ name: newName, keywords: newKeywords, response: newResponse, priority: newPriority });
    setCreateLoading(false);
    if (ok) {
      setCreateOpen(false);
      setNewName(""); setNewKeywords(""); setNewResponse(""); setNewPriority("0");
    }
  }

  async function submitEdit() {
    if (!editTarget) return;
    setEditLoading(true);
    const ok = await handleEdit(editTarget.id, { name: editName, keywords: editKeywords, response: editResponse, priority: editPriority });
    setEditLoading(false);
    if (ok) setEditOpen(false);
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
              <TemplateCard
                key={t.id}
                template={t}
                togglingId={togglingId}
                deletingId={deletingId}
                onToggle={handleToggle}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Yeni DM Şablonu</DialogTitle></DialogHeader>
          <TemplateFormFields
            name={newName} keywords={newKeywords} response={newResponse} priority={newPriority}
            onName={setNewName} onKeywords={setNewKeywords} onResponse={setNewResponse} onPriority={setNewPriority}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>İptal</Button>
            <Button onClick={submitCreate} disabled={createLoading}>
              {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Şablonu Düzenle</DialogTitle></DialogHeader>
          <TemplateFormFields
            name={editName} keywords={editKeywords} response={editResponse} priority={editPriority}
            onName={setEditName} onKeywords={setEditKeywords} onResponse={setEditResponse} onPriority={setEditPriority}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>İptal</Button>
            <Button onClick={submitEdit} disabled={editLoading}>
              {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
