import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  School as SchoolIcon,
  Users,
  Briefcase,
  FileSpreadsheet,
  History,
  QrCode,
  ClipboardCheck,
  Award,
  LogOut,
  UserCircle,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "../context/AuthContext";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Define navigation items per role
  const getNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case "super_admin":
        return [
          { path: "/dashboard", label: "Analytics Dashboard", icon: LayoutDashboard },
          { path: "/events", label: "Manage Events", icon: Calendar },
          { path: "/schools", label: "Manage Schools", icon: SchoolIcon },
          { path: "/registrations", label: "Manage Registrations", icon: Users },
          { path: "/projects", label: "Project Stalls", icon: Briefcase },
          { path: "/approvals", label: "User Approvals", icon: ClipboardCheck },
          { path: "/reports", label: "Reports Center", icon: FileSpreadsheet },
          { path: "/audits", label: "Audit Logs", icon: History },
        ];
      case "school_coordinator":
        return [
          { path: "/school-profile", label: "School Profile", icon: SchoolIcon },
          { path: "/registrations", label: "Registrations Hub", icon: Users },
          { path: "/projects", label: "My Project Teams", icon: Briefcase },
        ];
      case "volunteer":
        return [
          { path: "/scanner", label: "QR check-in Scanner", icon: QrCode },
          { path: "/attendance", label: "Check-in log", icon: ClipboardCheck },
        ];
      case "jury":
        return [
          { path: "/evaluate", label: "Jury Evaluations", icon: Award },
        ];
      case "event_coordinator":
        return [
          { path: "/dashboard", label: "Live Dashboard", icon: LayoutDashboard },
          { path: "/projects", label: "Stalls Map", icon: Briefcase },
          { path: "/attendance", label: "Check-in Log", icon: ClipboardCheck },
          { path: "/approvals", label: "User Approvals", icon: Users },
          { path: "/reports", label: "Reports Export", icon: FileSpreadsheet },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "w-64 border-r border-blue-100 bg-white/90 backdrop-blur-xl flex-shrink-0 absolute md:relative z-50 h-full transition-transform duration-300 ease-in-out overflow-hidden shadow-lg md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col gap-2 p-4 h-full relative z-10">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-3 mt-4">
            Navigation Menu
          </div>
          <nav className="flex flex-col gap-1.5 flex-grow overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 border",
                    isActive
                      ? "bg-blue-50 text-blue-600 border-blue-100/50 shadow-[0_2px_8px_-2px_rgba(59,130,246,0.12)] font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800 border-transparent"
                  )
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Profile & Logout */}
          <div className="mt-auto border-t border-slate-100 pt-4 flex flex-col gap-3">
            {user && (
              <div className="px-3 flex items-center gap-3">
                <UserCircle className="w-8 h-8 text-blue-500 flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-slate-700 truncate capitalize">{user.username}</span>
                  <span className="text-[10px] font-medium text-slate-400 capitalize truncate">{user.role.replace("_", " ")}</span>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-transparent hover:border-red-100"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
