import { Building2, LayoutDashboard, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";

const items = [
  { to: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { to: "/verification", label: "Xác thực", icon: ShieldCheck },
  { to: "/companies/company-control", label: "Doanh nghiệp", icon: Building2 },
];

export function Sidebar() {
  return (
    <aside
      className="flex flex-col gap-8 px-5 py-8 border-r border-[rgba(159,174,196,0.14)]
        bg-gradient-to-b from-[rgba(6,13,25,0.96)] to-[rgba(13,21,37,0.88)]
        backdrop-blur-lg max-[920px]:flex-row max-[920px]:flex-wrap max-[920px]:gap-4
        max-[920px]:border-r-0 max-[920px]:border-b max-[920px]:px-4 max-[920px]:py-4"
    >
      <div className="flex items-center gap-4 shrink-0">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-[0.95rem]
            border border-[rgba(99,146,255,0.35)]
            bg-gradient-to-br from-[rgba(42,78,151,0.92)] to-[rgba(17,151,134,0.92)]
            font-bold tracking-[0.06em] text-sm"
        >
          CG
        </div>
        <div>
          <div className="text-base font-bold">CareerGraph</div>
          <div className="text-[0.78rem] uppercase tracking-[0.08em] text-[#90a1bb]">
            Quản trị
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-[0.45rem] max-[920px]:flex-row max-[920px]:flex-wrap">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-[0.9rem] rounded-2xl",
                "border border-transparent text-[#bec9da] transition-all duration-150",
                isActive
                  ? "border-[rgba(115,152,228,0.16)] bg-[rgba(27,42,67,0.85)] text-[#f5f8ff] translate-x-0.5"
                  : "hover:border-[rgba(115,152,228,0.16)] hover:bg-[rgba(27,42,67,0.85)] hover:text-[#f5f8ff] hover:translate-x-0.5"
              )
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
