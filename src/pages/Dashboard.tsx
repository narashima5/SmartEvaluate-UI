import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { api } from "../utils/api";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Sparkles, AlertCircle, X, Search, School, User as UserIcon, Phone, MapPin } from "lucide-react";
import type { Event } from "../types";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

// Import modular sub-components
import SummaryStatsGrid from "../components/dashboard/SummaryStatsGrid";
import GenderRatioChart from "../components/dashboard/GenderRatioChart";
import ClassAttendanceChart from "../components/dashboard/ClassAttendanceChart";
import SchoolEngagementTable from "../components/dashboard/SchoolEngagementTable";
import LiveScanTicker from "../components/dashboard/LiveScanTicker";
import GlassCard from "../components/GlassCard";

interface LiveScan {
  name: string;
  school: string;
  category: string;
  registrationNumber: string;
  projectCode?: string;
  stallNumber?: string;
  entryTime: string;
  gate?: string;
}

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "school_coordinator") {
    return <Navigate to="/school-profile" replace />;
  }

  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [analytics, setAnalytics] = useState<any>(null);
  const [liveScans, setLiveScans] = useState<LiveScan[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [schoolStudentSearch, setSchoolStudentSearch] = useState<string>("");
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

  // Fetch details of selected school
  const { data: selectedSchool, isLoading: isSchoolLoading } = useQuery<any>({
    queryKey: ["school", selectedSchoolId],
    queryFn: () => api.get(`/api/schools/${selectedSchoolId}`),
    enabled: !!selectedSchoolId,
  });

  // Fetch student registrations of selected school for the current event
  const { data: schoolStudents = [], isLoading: isSchoolStudentsLoading } = useQuery<any[]>({
    queryKey: ["schoolStudents", selectedSchoolId, selectedEventId],
    queryFn: () => api.get(`/api/students?schoolId=${selectedSchoolId}&eventId=${selectedEventId}`),
    enabled: !!selectedSchoolId && !!selectedEventId,
  });

  // Update local analytics copy to merge live WebSocket updates
  useEffect(() => {
    if (queryAnalytics) {
      setAnalytics(queryAnalytics);
      if (queryAnalytics.recentScans) {
        setLiveScans(queryAnalytics.recentScans);
      } else {
        setLiveScans([]);
      }
    }
  }, [queryAnalytics]);

  // Socket.io Real-time connection
  useEffect(() => {
    if (!selectedEventId) return;

    const API_URL =
      import.meta.env.VITE_API_URL ||
      (typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "");

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
        gate: data.student.gate,
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

  const filteredSchoolStudents = schoolStudents.filter((student) => {
    const searchVal = schoolStudentSearch.toLowerCase();
    return (
      student.name?.toLowerCase().includes(searchVal) ||
      student.registrationNumber?.toLowerCase().includes(searchVal) ||
      student.class?.toLowerCase().includes(searchVal) ||
      student.category?.toLowerCase().includes(searchVal)
    );
  });

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

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <GenderRatioChart data={analytics?.genderRatio} />
            </div>
            <div className="md:col-span-2">
              <ClassAttendanceChart data={analytics?.classParticipation} />
            </div>
          </div>

          {/* School Engagement Table */}
          <div className="grid grid-cols-1 gap-6">
            <SchoolEngagementTable
              data={analytics?.schoolParticipation}
              onSchoolClick={(schoolId) => setSelectedSchoolId(schoolId)}
            />
          </div>

          {/* Live Check-In Ticker */}
          <LiveScanTicker liveScans={liveScans} />
        </>
      )}

      {/* School Engagement Details Modal */}
      {selectedSchoolId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-4xl p-6 bg-white border-slate-200/50 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto flex flex-col gap-6">
            <button
              onClick={() => {
                setSelectedSchoolId(null);
                setSchoolStudentSearch("");
              }}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {isSchoolLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : selectedSchool ? (
              <>
                {/* Header */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100/50 text-blue-600">
                      <School className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
                        {selectedSchool.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        School Code: <span className="font-bold text-blue-600 uppercase">{selectedSchool.code}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Contact Info */}
                  <div className="bg-slate-50/60 border border-slate-100/80 p-4 rounded-2xl flex flex-col gap-2.5">
                    <h4 className="font-bold text-slate-800 text-[10px] tracking-wider uppercase text-blue-600/90">Contact Details</h4>
                    <div className="flex flex-col gap-1.5 text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>Principal: <strong>{selectedSchool.principalName}</strong></span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>In-Charge: <strong>{selectedSchool.inChargeName}</strong></span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Coordinator: <strong>{selectedSchool.coordinatorMobile}</strong></span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Emergency: <strong>{selectedSchool.emergencyContact}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="bg-slate-50/60 border border-slate-100/80 p-4 rounded-2xl flex flex-col gap-2.5">
                    <h4 className="font-bold text-slate-800 text-[10px] tracking-wider uppercase text-blue-600/90">Address & Location</h4>
                    <div className="flex items-start gap-1.5 text-slate-600 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <p>
                        {selectedSchool.address}<br />
                        {selectedSchool.district}, {selectedSchool.state} - {selectedSchool.pincode}
                      </p>
                    </div>
                  </div>

                  {/* Faculty & Totals */}
                  <div className="bg-slate-50/60 border border-slate-100/80 p-4 rounded-2xl flex flex-col gap-2.5">
                    <h4 className="font-bold text-slate-800 text-[10px] tracking-wider uppercase text-blue-600/90">Faculty Details</h4>
                    <div className="flex flex-col gap-1.5 text-slate-600 font-medium">
                      <p>Teachers Registered: <strong>{selectedSchool.teachersCount || 0}</strong></p>
                      {selectedSchool.teacherNames && selectedSchool.teacherNames.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedSchool.teacherNames.map((name: string, i: number) => (
                            <span key={i} className="bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Student Details List Section */}
                <div className="flex flex-col gap-3 flex-1 overflow-hidden min-h-[300px]">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h4 className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider">
                      Student Registrations ({schoolStudents.length})
                    </h4>

                    {/* Search bar inside modal */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={schoolStudentSearch}
                        onChange={(e) => setSchoolStudentSearch(e.target.value)}
                        placeholder="Search student or class..."
                        className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  {isSchoolStudentsLoading ? (
                    <div className="flex items-center justify-center py-12 flex-1">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-100 rounded-xl flex-1 max-h-[350px]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold sticky top-0">
                            <th className="py-2.5 px-4">Reg No</th>
                            <th className="py-2.5 px-4">Name</th>
                            <th className="py-2.5 px-4">Class & Sec</th>
                            <th className="py-2.5 px-4">Category</th>
                            <th className="py-2.5 px-4">Gender</th>
                            <th className="py-2.5 px-4 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
                          {filteredSchoolStudents.map((stud) => (
                            <tr key={stud._id} className="hover:bg-slate-50/30">
                              <td className="py-2.5 px-4 font-mono text-[10px] text-slate-500">{stud.registrationNumber}</td>
                              <td className="py-2.5 px-4 font-bold text-slate-700">{stud.name}</td>
                              <td className="py-2.5 px-4">{stud.class} - {stud.section}</td>
                              <td className="py-2.5 px-4">
                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                  stud.category === "Visitor"
                                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                                    : "bg-blue-50 text-blue-600 border border-blue-100"
                                }`}>
                                  {stud.category}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-slate-500">{stud.gender}</td>
                              <td className="py-2.5 px-4 text-right">
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                  stud.checkedIn
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                    : "bg-slate-50 text-slate-400 border border-slate-100"
                                }`}>
                                  <span className={`w-1 h-1 rounded-full ${stud.checkedIn ? "bg-emerald-500" : "bg-slate-400"}`} />
                                  {stud.checkedIn ? "Checked In" : "Pending"}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {filteredSchoolStudents.length === 0 && (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400">
                                No student records found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Failed to load school profile.
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
