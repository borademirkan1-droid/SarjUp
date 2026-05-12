"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Partner } from "@/lib/supabase/types";
import { sehirler, tiplerTr } from "../constants";
import type { Filters } from "../hooks/useIsletmeler";

type Props = {
  filters: Filters;
  partners: Partner[];
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
};

export function IsletmelerFilters({ filters, partners, onFilterChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="İşletme adı, telefon..."
          value={filters.arama}
          onChange={(e) => onFilterChange("arama", e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={filters.partner} onValueChange={(v) => onFilterChange("partner", v)}>
        <SelectTrigger><SelectValue placeholder="Partner" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Tümü">Tümü</SelectItem>
          {partners.map((item) => (
            <SelectItem key={item.id} value={item.id}>{item.full_name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.sehir} onValueChange={(v) => onFilterChange("sehir", v)}>
        <SelectTrigger><SelectValue placeholder="Şehir" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Tümü">Tümü</SelectItem>
          {sehirler.map((item) => (
            <SelectItem key={item} value={item}>{item}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.tip} onValueChange={(v) => onFilterChange("tip", v)}>
        <SelectTrigger><SelectValue placeholder="İşletme tipi" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Tümü">Tümü</SelectItem>
          {tiplerTr.map((item) => (
            <SelectItem key={item} value={item}>{item}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.durum} onValueChange={(v) => onFilterChange("durum", v)}>
        <SelectTrigger><SelectValue placeholder="Durum" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Tümü">Tümü</SelectItem>
          <SelectItem value="Aktif">Aktif</SelectItem>
          <SelectItem value="Pasif">Pasif</SelectItem>
          <SelectItem value="Borçlu">Borçlu</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
