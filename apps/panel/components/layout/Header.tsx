"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Info, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/Sidebar";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/common/EmptyState";
import { formatRelativeDateTimeTR } from "@/lib/format";
import {
  getNotificationActivities,
  getUnreadNotificationCount,
  logActivity,
  type NotificationActivityItem,
} from "@/lib/api/activity-logs";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/partnerler": "Partnerler",
  "/isletmeler": "İşletmeler",
  "/cihazlar": "Cihazlar",
  "/odemeler": "Ödemeler",
  "/raporlar": "Raporlar",
  "/ayarlar": "Ayarlar",
  "/profil": "Profil",
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [notificationItems, setNotificationItems] = useState<NotificationActivityItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [displayName, setDisplayName] = useState("Yönetici");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const title = useMemo(() => titles[pathname] ?? "Panel", [pathname]);

  useEffect(() => {
    async function fetchHeaderData() {
      try {
        const [items, count] = await Promise.all([getNotificationActivities(8), getUnreadNotificationCount()]);
        setNotificationItems(items);
        setUnreadCount(count);
      } catch (error) {
        console.error(error);
      }

      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        const user = data.user;

        if (!user) {
          return;
        }

        setUserId(user.id);
        setEmail(user.email ?? "");
        const nameFromMeta = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
        setDisplayName(nameFromMeta || user.email || "Yönetici");
      } catch (error) {
        console.error(error);
      }
    }

    fetchHeaderData();
  }, []);

  function activityTitle(item: NotificationActivityItem) {
    const actionLabelMap: Record<string, string> = {
      create: "Yeni kayıt oluşturuldu",
      update: "Kayıt güncellendi",
      update_status: "Durum güncellendi",
      delete: "Kayıt silindi",
      create_super_admin: "Süper admin oluşturuldu",
      change_password: "Şifre değiştirildi",
      reset_test_data: "Test verileri silindi",
      update_settings: "Genel ayarlar kaydedildi",
      login: "Giriş yapıldı",
      logout: "Çıkış yapıldı",
    };
    const resourceMap: Record<string, string> = {
      partner: "Partner",
      business: "İşletme",
      device: "Cihaz",
      payment: "Ödeme",
      auth: "Güvenlik",
      auth_user: "Kullanıcı",
      app_settings: "Ayarlar",
      system: "Sistem",
    };

    const action = actionLabelMap[item.action] ?? "Yeni işlem";
    const resource = resourceMap[item.resource_type] ?? "Kayıt";
    return `${resource}: ${action}`;
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase("tr-TR"))
      .join("");
  }

  async function handleLogout() {
    const supabase = createClient();

    if (userId) {
      await logActivity({
        actorId: userId,
        actorType: "admin",
        action: "logout",
        resourceType: "auth",
        details: {
          email,
        },
      });
    }

    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-background/95 px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Menüyü aç">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar mobile />
            </SheetContent>
          </Sheet>
        </div>

        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">Ana Sayfa / {title}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Temayı değiştir"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative" aria-label="Bildirimler">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[360px] p-0">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-semibold">Bildirimler</p>
              <p className="text-xs text-muted-foreground">Son aktiviteler</p>
            </div>
            <div className="max-h-[360px] overflow-y-auto p-2">
              {notificationItems.length === 0 ? (
                <EmptyState icon={Info} title="Yeni bildirim yok" description="Yeni bir aktivite olduğunda burada göreceksiniz." />
              ) : (
                notificationItems.map((item) => (
                  <div key={item.id} className="mb-1 rounded-md border p-3 last:mb-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{activityTitle(item)}</p>
                      {item.isUnread ? <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" /> : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{formatRelativeDateTimeTR(item.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline">{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
            {email ? <p className="px-2 pb-2 text-xs text-muted-foreground">{email}</p> : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profil")}>Profil</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>Çıkış Yap</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}