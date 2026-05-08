import type { Metadata } from "next";
import { PartnerlerPage } from "./partnerler-page";

export const metadata: Metadata = {
  title: "Yetkili İş Ortağı Programı | Şarjup",
  description:
    "Bölgenizde Şarjup'un Yetkili İş Ortağı olun. Premium şarj çözümünü işletmelere sunarken büyüyen bir markanın parçası olun.",
};

export default function Page() {
  return <PartnerlerPage />;
}
