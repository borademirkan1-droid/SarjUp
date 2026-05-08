import type { Metadata } from "next";
import { FiyatlandirmaPage } from "./fiyatlandirma-page";

export const metadata: Metadata = {
  title: "Fiyatlandırma | Şarjup",
  description:
    "Şarjup akıllı şarj cihazı kiralama fiyatları. Aylık 1.200 ₺'den başlayan esnek paketler, kurulum ücreti yok, teknik destek dahil.",
};

export default function Page() {
  return <FiyatlandirmaPage />;
}
