import { Users, CheckCircle, Clock, Percent, TrendingUp } from "lucide-react";
import GlassCard from "../GlassCard";

interface SummaryStatsGridProps {
  summary: {
    totalRegistrations: number;
    visitorsRegistered: number;
    presentersRegistered: number;
    checkedInCount: number;
    pendingCount: number;
    attendancePercentage: number;
  };
}

export default function SummaryStatsGrid({ summary }: SummaryStatsGridProps) {
  const cards = [
    {
      label: "Total Registrations",
      value: summary.totalRegistrations,
      icon: Users,
      desc: "Presenter + Visitor",
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      label: "Attendance Checked-In",
      value: summary.checkedInCount,
      icon: CheckCircle,
      desc: "Scanned at gates",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Pending Entry",
      value: summary.pendingCount,
      icon: Clock,
      desc: "Yet to arrive",
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      label: "Attendance Ratio",
      value: `${summary.attendancePercentage}%`,
      icon: Percent,
      desc: "Total check-in rate",
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      label: "Project Presenters",
      value: summary.presentersRegistered,
      icon: TrendingUp,
      desc: "Active presenters",
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <GlassCard
            key={idx}
            className={`p-5 flex flex-col justify-between gap-3 border-slate-200/50 bg-white/70 shadow-sm ${
              idx === 4 ? "col-span-2 lg:col-span-1" : ""
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-snug">{c.label}</span>
              <div className={`p-2 rounded-lg border ${c.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold font-display text-slate-800 tracking-tight transition-all duration-300">
                {c.value}
              </span>
              <span className="text-[9px] font-medium text-slate-400 mt-1">{c.desc}</span>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
