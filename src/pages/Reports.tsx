import { useState, useEffect } from "react";
import { api } from "../utils/api";
import GlassCard from "../components/GlassCard";
import {
  FileSpreadsheet,
  Download,
  Users,
  CheckSquare,
  Award,
  History,
  School as SchoolIcon,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { Event } from "../types";

export default function Reports() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.get("/api/events");
        setEvents(data);
        const active = data.find((e: Event) => e.status === "active");
        if (active) {
          setSelectedEventId(active._id);
        } else if (data.length > 0) {
          setSelectedEventId(data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load events in reports", err);
      }
    };
    fetchEvents();
  }, []);

  const handleDownload = async (reportType: string, format: "excel" | "csv") => {
    if (!selectedEventId) {
      setError("Please select an exhibition event first.");
      return;
    }

    setError(null);
    const key = `${reportType}-${format}`;
    setDownloading(key);

    try {
      const endpoint = `/api/reports/${reportType}?eventId=${selectedEventId}&format=${format}`;
      const blob = await api.get(endpoint);
      
      const fileExtension = format === "excel" ? "xlsx" : "csv";
      const filename = `Science_Expo_${reportType}_${new Date().toISOString().split("T")[0]}.${fileExtension}`;
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      console.error("Report download failed:", err);
      setError(err.message || `Failed to download the ${reportType} report.`);
    } finally {
      setDownloading(null);
    }
  };

  const reportsList = [
    {
      id: "registrations",
      title: "Student Registrations",
      desc: "Complete lists of registered presenting teams, individual visitors, classes, escorts, and school mapping details.",
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      id: "attendance",
      title: "Check-in Entry Logs",
      desc: "Chronological gate entry tracking reports, containing scanned timestamps, categories, and volunteer desk IDs.",
      icon: CheckSquare,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      id: "evaluations",
      title: "Jury Score sheets",
      desc: "Detailed rubric score cards for Innovation (25), Tech (20), Presentation (20), Practical (20), and Social (15).",
      icon: FileSpreadsheet,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    {
      id: "winners",
      title: "Ranked Winner Lists",
      desc: "Project teams sorted by aggregate jury evaluation score per domain and category to determine winners.",
      icon: Award,
      color: "bg-yellow-50 text-yellow-600 border-yellow-100",
    },
    {
      id: "school-summary",
      title: "School Engagement Reports",
      desc: "Aggregate engagement summaries per school containing registration count, attendance count, and entry ratio.",
      icon: SchoolIcon,
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      id: "audit-logs",
      title: "System Audit Trails",
      desc: "Administrator operations trail logging core activities, updates, profile changes, and database modifications.",
      icon: History,
      color: "bg-slate-100 text-slate-600 border-slate-200",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Analytical Exports</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800">Reports Center</h2>
          <p className="text-xs text-slate-500">Export high-performance spreadsheets from the active expo database.</p>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Select Target Event:</label>
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
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((rep) => {
          const excelKey = `${rep.id}-excel`;
          const csvKey = `${rep.id}-csv`;

          return (
            <GlassCard
              key={rep.id}
              className="p-6 border-slate-200/50 bg-white/70 shadow-sm flex flex-col justify-between gap-5 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <div className={`p-3 rounded-xl border flex-shrink-0 ${rep.color}`}>
                  <rep.icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-bold text-slate-800 text-sm leading-none">{rep.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{rep.desc}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2 text-xs">
                <button
                  onClick={() => handleDownload(rep.id, "excel")}
                  disabled={downloading !== null}
                  className="bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {downloading === excelKey ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Exporting Excel...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Excel (.xlsx)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownload(rep.id, "csv")}
                  disabled={downloading !== null}
                  className="bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {downloading === csvKey ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Exporting CSV...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV (.csv)</span>
                    </>
                  )}
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
