"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Smartphone,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Inbox,
  Instagram,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/api/activity-logs";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/partnerler", label: "Partnerler", icon: Users },
  { href: "/basvurular", label: "Başvurular", icon: Inbox },
  { href: "/isletmeler", label: "İşletmeler", icon: Building2 },
  { href: "/cihazlar", label: "Cihazlar", icon: Smartphone },
  { href: "/odemeler", label: "Ödemeler", icon: CreditCard },
  { href: "/dekontlar", label: "Dekontlar", icon: FileText },
  { href: "/sosyal-medya", label: "Sosyal Medya", icon: Instagram },
  { href: "/raporlar", label: "Raporlar", icon: BarChart3 },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings },
];

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      await logActivity({
        actorId: data.user.id,
        actorType: "admin",
        action: "logout",
        resourceType: "auth",
        details: {
          email: data.user.email ?? null,
        },
      });
    }

    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className={cn("flex h-full w-full flex-col bg-card", mobile ? "" : "border-r")}>
      <div className="border-b px-6 py-5">
        <Image src="/logo.png" alt="ŞarjUp" width={140} height={44} className="h-auto w-auto" />
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-3">
          <Avatar>
            <AvatarFallback>AK</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium">Admin Kullanıcı</p>
            <p className="text-muted-foreground">Yönetici</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Çıkış
        </Button>
      </div>
    </aside>
  );
}
