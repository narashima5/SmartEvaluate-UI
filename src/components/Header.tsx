import { Swords, Menu } from 'lucide-react';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-lg flex-shrink-0">
            <div className="flex h-16 items-center px-4 md:px-6">
                <button
                    onClick={onMenuClick}
                    className="mr-3 md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors focus:outline-none"
                    aria-label="Toggle menu"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="flex items-center gap-3 cursor-default group">
                    <div className="flex p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 transition-all duration-300 group-hover:bg-blue-500/20 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        <Swords className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-blue-200 transition-all duration-300 leading-tight">
                            Smart Evaluate
                        </h1>
                        <span className="text-xs font-medium text-slate-400">Code of Thrones</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
