"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building,
  Coffee,
  Heart,
  Hotel,
  MoreHorizontal,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BusinessWithPartner } from "@/lib/supabase/types";
import { statusMapToTr } from "../constants";

type Props = {
  businesses: BusinessWithPartner[];
  loading: boolean;
  totalCount: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function formatDate(date: string) {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function TipIcon({ tip }: { tip: string }) {
  if (tip === "cafe") return <Coffee className="h-4 w-4 text-amber-700" />;
  if (tip === "restaurant") return <UtensilsCrossed className="h-4 w-4 text-orange-700" />;
  if (tip === "hotel") return <Hotel className="h-4 w-4 text-indigo-700" />;
  if (tip === "mall") return <ShoppingBag className="h-4 w-4 text-violet-700" />;
  if (tip === "hospital") return <Heart className="h-4 w-4 text-red-700" />;
  return <Building className="h-4 w-4 text-slate-700" />;
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    inactive: "bg-slate-100 text-slate-700 hover:bg-slate-100",
    debt: "bg-red-100 text-red-700 hover:bg-red-100",
  };
  return (
    <Badge className={colorMap[status] ?? ""}>
      {statusMapToTr[status] ?? status}
    </Badge>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 9 }).map((_, j) => (
            <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function BusinessRow({ item }: { item: BusinessWithPartner }) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => router.push(`/isletmeler/${item.id}`)}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          <TipIcon tip={item.business_type} />
          <span className="font-medium">{item.name}</span>
        </div>
      </TableCell>
      <TableCell>
        {item.partner ? (
          <Link
            href={`/partnerler/${item.partner.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:underline"
          >
            {item.partner.full_name}
          </Link>
        ) : "-"}
      </TableCell>
      <TableCell>{item.phone}</TableCell>
      <TableCell>{item.city} / {item.district}</TableCell>
      <TableCell>
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{item.device_count}</Badge>
      </TableCell>
      <TableCell>{formatDate(item.created_at)}</TableCell>
      <TableCell>{formatDate(item.contract_start_date)}</TableCell>
      <TableCell><StatusBadge status={item.status} /></TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => router.push(`/isletmeler/${item.id}`)}>
              Detay Görüntüle
            </DropdownMenuItem>
            <DropdownMenuItem>Düzenle</DropdownMenuItem>
            <DropdownMenuItem>Cihazlarını Gör</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export function IsletmelerTable({
  businesses,
  loading,
  totalCount,
  page,
  totalPages,
  onPageChange,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table className="min-w-[1200px]">
          <TableHeader>
            <TableRow>
              <TableHead>İşletme Adı</TableHead>
              <TableHead>Bağlı Partner</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Şehir/İlçe</TableHead>
              <TableHead>Cihaz Sayısı</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
              <TableHead>Sözleşme Başlangıcı</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">Eylemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? <SkeletonRows />
              : businesses.map((item) => <BusinessRow key={item.id} item={item} />)}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Toplam {totalCount} işletme</p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Önceki
          </Button>
          <span className="text-sm">{page} / {totalPages}</span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Sonraki
          </Button>
        </div>
      </div>
    </div>
  );
}
