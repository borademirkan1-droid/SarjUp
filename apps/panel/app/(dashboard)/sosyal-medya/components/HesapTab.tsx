"use client";

import { useEffect, useState } from "react";
import { Instagram, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { saveAccount } from "@/lib/actions/social";
import { formatTarih } from "../types";
import type { SocialAccount } from "../types";

export function HesapTab() {
  const supabase = createClient();
  const [account, setAccount] = useState<SocialAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [accessToken, setAccessToken] = useState("");
  const [pageId, setPageId] = useState("");
  const [igUserId, setIgUserId] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function fetchAccount() {
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
    fetchAccount();
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

  const isConnected = account?.is_active;

  return (
    <div className="space-y-4">
      {isConnected ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="flex items-center gap-3 p-4">
            <Instagram className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-700">@{account!.username}</p>
              <p className="text-xs text-emerald-600">
                {account!.connected_at ? `Bağlandı: ${formatTarih(account!.connected_at)}` : "Bağlı"}
              </p>
            </div>
            <Badge className="ml-auto bg-emerald-100 text-emerald-700">Aktif</Badge>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <Instagram className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Henüz bağlı bir Instagram hesabı yok.<br />
              Meta API kurulumu tamamlandığında buradan bağlanabilirsiniz.
            </p>
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
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="sarjup.oficial" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="access-token">Access Token *</Label>
            <Input id="access-token" type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} placeholder="Bearer token veya long-lived token" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="page-id">Page ID *</Label>
            <Input id="page-id" value={pageId} onChange={(e) => setPageId(e.target.value)} placeholder="Meta Business Page ID" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="ig-user-id">Instagram User ID *</Label>
            <Input id="ig-user-id" value={igUserId} onChange={(e) => setIgUserId(e.target.value)} placeholder="Instagram Business Account ID" className="mt-1" />
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
