import { Outlet } from "react-router-dom";
import { Sidebar } from "@/shared/layout/Sidebar";
import { Topbar } from "@/shared/layout/Topbar";

export function AppShell() {
  return (
    <div className="grid min-h-screen grid-cols-[280px_minmax(0,1fr)] max-[920px]:grid-cols-1">
      <Sidebar />
      <div className="flex min-w-0 flex-col">
        <Topbar />
        <main className="px-8 py-6 max-[720px]:px-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
