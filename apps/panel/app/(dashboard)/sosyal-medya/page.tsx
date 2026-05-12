"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KuyrukTab } from "./components/KuyrukTab";
import { DmSablonlarTab } from "./components/DmSablonlarTab";
import { HesapTab } from "./components/HesapTab";

export default function SosyalMedyaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Sosyal Medya</h2>
        <p className="text-muted-foreground">İçerik kuyruğu, DM şablonları ve hesap yönetimi</p>
      </div>

      <Tabs defaultValue="kuyruk">
        <TabsList>
          <TabsTrigger value="kuyruk">Kuyruk</TabsTrigger>
          <TabsTrigger value="dm-sablonlar">DM Şablonları</TabsTrigger>
          <TabsTrigger value="hesap">Hesap</TabsTrigger>
        </TabsList>
        <TabsContent value="kuyruk" className="mt-4">
          <KuyrukTab />
        </TabsContent>
        <TabsContent value="dm-sablonlar" className="mt-4">
          <DmSablonlarTab />
        </TabsContent>
        <TabsContent value="hesap" className="mt-4">
          <HesapTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
