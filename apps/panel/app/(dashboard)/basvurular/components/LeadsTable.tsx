"use client";

import {
  Eye,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Phone,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { type Lead, statusConfig, formatTarih } from "../types";

type Props = {
  leads: Lead[];
  loading: boolean;
  updatingId: string | null;
  totalCount: number;
  page: number;
  totalPages: number;
  pageNumbers: number[];
  onOpenDetail: (lead: Lead) => void;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onOpenPartnerDialog: (lead: Lead) => void;
  onPageChange: (page: number) => void;
};

export function LeadsTable({
  leads,
  loading,
  updatingId,
  totalCount,
  page,
  totalPages,
  pageNumbers,
  onOpenDetail,
  onUpdateStatus,
  onOpenPartnerDialog,
  onPageChange,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>İletişim</TableHead>
              <TableHead>İşletme Türü</TableHead>
              <TableHead>Bölge</TableHead>
              <TableHead>Mesaj</TableHead>
              <TableHead>Kaynak</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="w-[60px] text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : leads.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-16 text-center text-muted-foreground">
                      Başvuru bulunamadı
                    </TableCell>
                  </TableRow>
                )
              : leads.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    updatingId={updatingId}
                    onOpenDetail={onOpenDetail}
                    onUpdateStatus={onUpdateStatus}
                    onOpenPartnerDialog={onOpenPartnerDialog}
                  />
                ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Toplam {totalCount} başvuru</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Önceki
          </Button>
          {pageNumbers.slice(0, 7).map((num) => (
            <Button
              key={num}
              size="sm"
              variant={num === page ? "default" : "outline"}
              onClick={() => onPageChange(num)}
            >
              {num}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
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

type LeadRowProps = {
  lead: Lead;
  updatingId: string | null;
  onOpenDetail: (lead: Lead) => void;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onOpenPartnerDialog: (lead: Lead) => void;
};

function LeadRow({ lead, updatingId, onOpenDetail, onUpdateStatus, onOpenPartnerDialog }: LeadRowProps) {
  return (
    <TableRow className="cursor-pointer" onClick={() => onOpenDetail(lead)}>
      <TableCell className="font-medium">
        {lead.first_name} {lead.last_name ?? ""}
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-0.5 text-xs">
          {lead.email && <span className="text-muted-foreground">{lead.email}</span>}
          {lead.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {lead.phone}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {lead.business_type ?? <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell>
        {lead.region ?? <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell className="max-w-[180px]">
        {lead.message
          ? <span className="line-clamp-2 text-xs text-muted-foreground">{lead.message}</span>
          : <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="whitespace-nowrap text-[10px]">
          {lead.source === "google_maps_scraper" ? "🗺 Maps" : "🌐 Form"}
        </Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
        {formatTarih(lead.created_at)}
      </TableCell>
      <TableCell>
        {updatingId === lead.id
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : (
              <Badge className={statusConfig[lead.status]?.className ?? ""}>
                {statusConfig[lead.status]?.label ?? lead.status}
              </Badge>
            )}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onOpenDetail(lead)}>
              <Eye className="mr-2 h-4 w-4" />Detay Gör
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onUpdateStatus(lead.id, "contacted")}>
              <MessageSquare className="mr-2 h-4 w-4" />İletişime Geçildi
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus(lead.id, "interested")}>
              <UserCheck className="mr-2 h-4 w-4 text-purple-600" />İlgileniyor
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus(lead.id, "converted")}>
              <UserCheck className="mr-2 h-4 w-4 text-emerald-600" />Partner Oldu
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpenPartnerDialog(lead); }}>
              <UserPlus className="mr-2 h-4 w-4 text-emerald-600" />Partner Yap
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onUpdateStatus(lead.id, "rejected")}
              className="text-red-600 focus:text-red-600"
            >
              <UserX className="mr-2 h-4 w-4" />Reddet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
