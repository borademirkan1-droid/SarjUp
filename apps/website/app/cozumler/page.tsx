import type { Metadata } from "next";
import { CozumlerPage } from "./cozumler-page";

export const metadata: Metadata = {
  title: "Çözümler | Şarjup",
  description:
    "20.000 mAh batarya, NFC aktivasyon, RFID kart sistemi. Şarjup'un akıllı şarj çözümü hakkında tüm detaylar.",
};

export default function Page() {
  return <CozumlerPage />;
}
