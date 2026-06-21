import { Building2, LayoutDashboard, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/verification", label: "Verification", icon: ShieldCheck },
  { to: "/companies/company-control", label: "Companies", icon: Building2 },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">CG</div>
        <div>
          <div className="brand-title">CareerGraph</div>
          <div className="brand-subtitle">Admin Console</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) =>
              `nav-item${isActive ? " nav-item-active" : ""}`
            }
            to={item.to}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
