import type { Metadata } from "next";
import { IletisimPage } from "./iletisim-page";

export const metadata: Metadata = {
  title: "İletişim | Şarjup",
  description:
    "Şarjup ile iletişime geçin. WhatsApp, telefon, email kanalları üzerinden 24 saat içinde dönüş yapıyoruz. Kocaeli/İzmit merkezli.",
};

export default function Page() {
  return <IletisimPage />;
}
