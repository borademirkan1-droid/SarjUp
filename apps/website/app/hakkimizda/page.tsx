import type { Metadata } from "next";
import { HakkimizdaPage } from "./hakkimizda-page";

export const metadata: Metadata = {
  title: "Hakkımızda | Şarjup",
  description:
    "Şarjup, modern işletmeler için akıllı şarj çözümleri geliştiren bir teknoloji şirketidir. Hikayemiz, vizyonumuz ve değerlerimiz.",
};

export default function Page() {
  return <HakkimizdaPage />;
}
