import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Fixed sidebar - desktop only */}
      <div className="fixed inset-y-0 left-0 z-40 hidden w-[280px] md:block">
        <Sidebar />
      </div>

      {/* Main content - pushed right on desktop */}
      <div className="min-h-screen md:pl-[280px]">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
