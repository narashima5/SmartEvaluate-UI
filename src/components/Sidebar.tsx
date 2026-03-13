import { NavLink } from 'react-router-dom';
import { Users, ClipboardCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { path: '/participants', label: 'Participant Log', icon: Users },
    { path: '/evaluate', label: 'Evaluate', icon: ClipboardCheck },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "w-64 border-r border-white/5 bg-slate-900/95 backdrop-blur-xl flex-shrink-0 absolute md:relative z-50 h-[100dvh] md:h-full transition-transform duration-300 ease-in-out overflow-hidden shadow-2xl md:shadow-none",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Decorative gradient orb */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col gap-2 p-4 h-full relative z-10">
                    <div className="text-xs font-semibold text-slate-500/80 uppercase tracking-widest mb-3 px-3 mt-4">
                        Navigation
                    </div>
                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300',
                                        isActive
                                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)] ring-1 ring-inset ring-white/5'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                                    )
                                }
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </aside>
        </>
    );
}
