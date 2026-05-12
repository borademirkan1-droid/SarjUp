"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterComboboxProps = {
  options: string[];
  value: string;          // "Tümü" = hiçbiri seçili değil
  allLabel?: string;      // ör. "Tüm Bölgeler"
  placeholder?: string;   // input placeholder
  onChange: (val: string) => void;
  className?: string;
};

export function FilterCombobox({
  options,
  value,
  allLabel = "Tümü",
  placeholder = "Ara…",
  onChange,
  className,
}: FilterComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dışarıya tıklanınca kapat
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const hasValue = value !== "Tümü";
  const filtered = options.filter((o) =>
    o.toLocaleLowerCase("tr").includes(search.toLocaleLowerCase("tr"))
  );

  function selectOption(opt: string) {
    onChange(opt);
    setSearch("");
    setOpen(false);
  }

  function clear() {
    onChange("Tümü");
    setSearch("");
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger / input */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          className={cn(
            "h-8 w-full rounded-md border border-input bg-background px-3 py-1 pr-7 text-sm shadow-sm",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-1 focus:ring-ring",
          )}
          placeholder={hasValue ? value : placeholder}
          value={open ? search : ""}
          onFocus={() => {
            setSearch("");
            setOpen(true);
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") { setOpen(false); setSearch(""); }
            if (e.key === "Enter" && filtered.length === 1) selectOption(filtered[0]);
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
          autoComplete="off"
        />

        {/* X veya chevron ikonu */}
        {hasValue ? (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
            aria-label="Temizle"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>

      {/* Seçili olmayan ama göstermek istediğimiz label */}
      {!open && hasValue && (
        <div
          className="absolute inset-0 flex cursor-pointer items-center rounded-md border border-input bg-background px-3 text-sm"
          onClick={() => { setOpen(true); inputRef.current?.focus(); }}
        >
          <span className="flex-1 truncate">{value}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); clear(); }}
            className="ml-1 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-md"
        >
          {/* "Tümü" seçeneği */}
          <button
            type="button"
            role="option"
            aria-selected={!hasValue}
            className={cn(
              "w-full px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
              !hasValue && "bg-accent/50 font-medium",
            )}
            onClick={() => selectOption("Tümü")}
          >
            {allLabel}
          </button>

          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">Sonuç bulunamadı</p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={value === opt}
                className={cn(
                  "w-full px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                  value === opt && "bg-accent font-medium",
                )}
                onClick={() => selectOption(opt)}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
