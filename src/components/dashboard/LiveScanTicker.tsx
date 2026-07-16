import GlassCard from "../GlassCard";

interface LiveScan {
  name: string;
  school: string;
  category: string;
  registrationNumber: string;
  projectCode?: string;
  stallNumber?: string;
  entryTime: string;
}

interface LiveScanTickerProps {
  liveScans: LiveScan[];
}

export default function LiveScanTicker({ liveScans }: LiveScanTickerProps) {
  return (
    <GlassCard className="p-6 border-slate-200/50 bg-white/70 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          <h3 className="font-bold text-slate-800 text-sm">Live Attendance Gate Log</h3>
        </div>
        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
          Real-time feed active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto max-h-48">
        {liveScans.map((s, idx) => (
          <div
            key={idx}
            className="p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col gap-1.5 transition-all duration-300 hover:scale-[1.01] hover:border-blue-100"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{s.name}</span>
              <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full uppercase leading-none">
                {s.category === "Visitor" ? "Visitor" : "Presenter"}
              </span>
            </div>
            <span className="text-[9px] font-semibold text-slate-400 truncate uppercase">{s.school}</span>
            {s.projectCode && (
              <div className="flex justify-between items-center text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md mt-1">
                <span>ID: {s.projectCode}</span>
                <span>Stall: {s.stallNumber || "TBD"}</span>
              </div>
            )}
            <span className="text-[8px] text-slate-400 self-end mt-1">
              {new Date(s.entryTime).toLocaleTimeString(undefined, { timeStyle: "short" })}
            </span>
          </div>
        ))}

        {liveScans.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-slate-400">
            Waiting for incoming student entry scans...
          </div>
        )}
      </div>
    </GlassCard>
  );
}
