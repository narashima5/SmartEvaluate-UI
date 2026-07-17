import { Menu, Bell } from "lucide-react";
import logo from "../assets/logo/logo.png";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
  announcement?: string;
}

export default function Header({ onMenuClick, announcement }: HeaderProps) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col flex-shrink-0 w-full z-50">
      {/* Announcement Banner */}
      {announcement && (
        <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-1.5 px-4 text-xs sm:text-sm font-semibold tracking-wide shadow-sm flex items-center justify-center gap-2 animate-pulse">
          <Bell className="w-4 h-4 animate-bounce" />
          <span>{announcement}</span>
        </div>
      )}

      <header className="sticky top-0 w-full border-b border-blue-100 bg-white/70 backdrop-blur-md shadow-sm">
        <div className="flex h-16 items-center px-4 md:px-6 justify-between">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="mr-3 md:hidden p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3 cursor-default group">
              <div className="flex p-1 bg-white rounded-xl border border-blue-100 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <img src={logo} alt="College Logo" className="h-10 w-auto object-contain" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm sm:text-base font-bold font-display tracking-tight text-slate-800 leading-tight">
                  Prathyusha Engineering College
                </h1>
                <span className="text-[11px] font-semibold text-blue-600 tracking-wider uppercase leading-none">Smart Evaluate - Science Expo Hub</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-700 capitalize">{user.username}</span>
                <span className="text-[10px] font-medium text-blue-500 capitalize">{user.role.replace("_", " ")}</span>
              </div>
            )}
            <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-blue-100">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
