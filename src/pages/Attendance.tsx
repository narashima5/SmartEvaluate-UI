import { useState } from "react";
import { api } from "../utils/api";
import { useQuery } from "@tanstack/react-query";
import GlassCard from "../components/GlassCard";
import AttendanceTable from "../components/AttendanceTable";
import { Search, Sparkles, AlertCircle } from "lucide-react";
import type { Student, Event } from "../types";

export default function Attendance() {
  const [search, setSearch] = useState("");

  // 1. Fetch Active Event Query
  const { data: activeEvent = null, isLoading: isActiveEventLoading } = useQuery<Event | null>({
    queryKey: ["active-event"],
    queryFn: async () => {
      try {
        const data = await api.get("/api/events/active");
        if (data && data._id) {
          return data;
        }
      } catch (err) {
        console.log("No active event loaded.");
      }
      return null;
    },
  });

  // 2. Fetch Checked-in Students Query
  const {
    data: students = [],
    isLoading: isStudentsLoading,
    error: queryError,
  } = useQuery<Student[]>({
    queryKey: ["checked-in-students", activeEvent?._id, search],
    queryFn: () => {
      let endpoint = "/api/students?checkedIn=true";
      if (search) endpoint += `&search=${encodeURIComponent(search)}`;
      if (activeEvent?._id) endpoint += `&eventId=${activeEvent._id}`;
      return api.get(endpoint);
    },
    enabled: !!activeEvent?._id,
  });

  const loading = isActiveEventLoading || (isStudentsLoading && !!activeEvent?._id);
  const error = queryError ? (queryError as any).message : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Real-Time Check-In Ledger</span>
        </div>
        <h2 className="text-2xl font-bold font-display text-slate-800">Attendance Log</h2>
        {activeEvent && (
          <p className="text-xs text-slate-500 mt-1">
            Checked-in entries for: <span className="font-semibold text-slate-700">{activeEvent.title}</span>
          </p>
        )}
      </div>

      {!activeEvent && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-start gap-3 shadow-sm mb-6">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-sm">No Active Event Configured</span>
            <span className="text-xs text-amber-700/95 leading-relaxed">
              There is currently no active exhibition event configured in the system. An administrator must activate an event in the <strong>Manage Events</strong> dashboard before check-ins or attendance tracking can proceed.
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <GlassCard className="p-4 border-slate-200/50 bg-white/70 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search checked-in students..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>
      </GlassCard>

      {/* Attendance Log Table Component */}
      <AttendanceTable students={students} activeEvent={activeEvent} />
    </div>
  );
}
