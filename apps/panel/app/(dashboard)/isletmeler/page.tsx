"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useIsletmeler } from "./hooks/useIsletmeler";
import { IsletmelerFilters } from "./components/IsletmelerFilters";
import { IsletmelerTable } from "./components/IsletmelerTable";
import { IsletmelerForm } from "./components/IsletmelerForm";

export default function IsletmelerPage() {
  const {
    businesses,
    partners,
    totalCount,
    totalPages,
    loading,
    page,
    setPage,
    filters,
    setFilter,
    open,
    setOpen,
    saving,
    form,
    setForm,
    errors,
    saveBusiness,
  } = useIsletmeler();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">İşletmeler</h2>
          <p className="text-muted-foreground">Cihazlarımızın bulunduğu işletmeler</p>
        </div>
        <IsletmelerForm
          open={open}
          onOpenChange={setOpen}
          form={form}
          onFormChange={setForm}
          errors={errors}
          saving={saving}
          onSave={saveBusiness}
          partners={partners}
        />
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <IsletmelerFilters
            filters={filters}
            partners={partners}
            onFilterChange={setFilter}
          />
        </CardHeader>
        <CardContent>
          <IsletmelerTable
            businesses={businesses}
            loading={loading}
            totalCount={totalCount}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
