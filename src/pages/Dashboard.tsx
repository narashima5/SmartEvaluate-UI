import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { api } from "../utils/api";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Sparkles, AlertCircle } from "lucide-react";
import type { Event } from "../types";

// Import modular sub-components
import SummaryStatsGrid from "../components/dashboard/SummaryStatsGrid";
import ProjectsByDomainChart from "../components/dashboard/ProjectsByDomainChart";
import GenderRatioChart from "../components/dashboard/GenderRatioChart";
import ClassAttendanceChart from "../components/dashboard/ClassAttendanceChart";
import SchoolEngagementTable from "../components/dashboard/SchoolEngagementTable";
import LiveScanTicker from "../components/dashboard/LiveScanTicker";

interface LiveScan {
  name: string;
  school: string;
  category: string;
  registrationNumber: string;
  projectCode?: string;
  stallNumber?: string;
  entryTime: string;
}

export default function Dashboard() {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [analytics, setAnalytics] = useState<any>(null);
  const [liveScans, setLiveScans] = useState<LiveScan[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // Fetch Events list using useQuery
  const { data: events = [], isLoading: isEventsLoading } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: () => api.get("/api/events"),
  });

  // Set default selected event
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      const active = events.find((e: Event) => e.status === "active");
      if (active) {
        setSelectedEventId(active._id);
      } else {
        setSelectedEventId(events[0]._id);
      }
    }
  }, [events, selectedEventId]);

  // Fetch Analytics using useQuery
  const {
    data: queryAnalytics,
    isLoading: isAnalyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: ["analytics", selectedEventId],
    queryFn: () => api.get(`/api/dashboard/analytics?eventId=${selectedEventId}`),
    enabled: !!selectedEventId,
  });

  // Update local analytics copy to merge live WebSocket updates
  useEffect(() => {
    if (queryAnalytics) {
      setAnalytics(queryAnalytics);
    }
  }, [queryAnalytics]);

  // Socket.io Real-time connection
  useEffect(() => {
    if (!selectedEventId) return;

    const API_URL = import.meta.env.VITE_API_URL || "";
    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WebSocket Dashboard connected:", socket.id);
      socket.emit("join_event_room", selectedEventId);
    });

    socket.on("attendance_update", (data: { student: any; stats: any }) => {
      // 1. Update live ticker feed
      const newScan: LiveScan = {
        name: data.student.name,
        school: data.student.school,
        category: data.student.category,
        registrationNumber: data.student.registrationNumber,
        projectCode: data.student.projectCode,
        stallNumber: data.student.stallNumber,
        entryTime: data.student.entryTime,
      };
      setLiveScans((prev) => [newScan, ...prev.slice(0, 19)]);

      // 2. Update local summary stats dynamically
      setAnalytics((prev: any) => {
        if (!prev) return null;
        const total = prev.summary.totalRegistrations;
        const checkedIn = data.stats.totalCheckedIn;
        const pending = total - checkedIn;
        const percentage = total > 0 ? parseFloat(((checkedIn / total) * 100).toFixed(2)) : 0;

        return {
          ...prev,
          summary: {
            ...prev.summary,
            checkedInCount: checkedIn,
            pendingCount: pending,
            attendancePercentage: percentage,
          },
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedEventId]);

  const loading = isEventsLoading || (isAnalyticsLoading && !analytics);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const summary = analytics?.summary || {
    totalRegistrations: 0,
    visitorsRegistered: 0,
    presentersRegistered: 0,
    checkedInCount: 0,
    pendingCount: 0,
    attendancePercentage: 0,
  };

  const selectedEvent = events.find((e) => e._id === selectedEventId);
  const error = analyticsError ? (analyticsError as any).message : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Selector & Details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Expo Metrics Center</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800">
            {selectedEvent ? selectedEvent.title : "Science Exhibition Analytics"}
          </h2>
          {selectedEvent && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>{new Date(selectedEvent.date).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
              <span>•</span>
              <span>{selectedEvent.venue}</span>
            </p>
          )}
        </div>

        {/* Dropdown filter */}
        {events.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Select Expo Event:</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500 shadow-sm"
            >
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title} {ev.status === "active" ? "(Active)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!selectedEventId && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-sm">No Events Configured</span>
            <span className="text-xs text-amber-700/95 leading-relaxed">
              There are currently no events created in the system. An administrator must create and activate an event under the <strong>Manage Events</strong> section to view analytics and metrics.
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {selectedEventId && (
        <>
          {/* Summary Cards */}
          <SummaryStatsGrid summary={summary} />

          {/* Charts Layer 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProjectsByDomainChart data={analytics?.projectsByDomain} />
            <GenderRatioChart data={analytics?.genderRatio} />
          </div>

          {/* Charts Layer 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ClassAttendanceChart data={analytics?.classParticipation} />
            <SchoolEngagementTable data={analytics?.schoolParticipation} />
          </div>

          {/* Live Check-In Ticker */}
          <LiveScanTicker liveScans={liveScans} />
        </>
      )}
    </div>
  );
}
