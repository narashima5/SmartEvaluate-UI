import { useState, useEffect } from "react";
import { api } from "../utils/api";
import GlassCard from "../components/GlassCard";
import {
  Download,
  Users,
  CheckSquare,
  Award,
  School as SchoolIcon,
  Loader2,
  Sparkles,
  Printer,
  X,
} from "lucide-react";
import type { Event } from "../types";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function Reports() {
  const { user } = useAuth();

  if (user?.role === "school_coordinator") {
    return <Navigate to="/school-profile" replace />;
  }

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // PDF Preview states
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewing, setPreviewing] = useState(false);

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

  const handlePreviewPdf = async (reportType: string, title: string) => {
    if (!selectedEventId) {
      setError("Please select an exhibition event first.");
      return;
    }

    setError(null);
    setPreviewing(true);

    try {
      const endpoint = `/api/reports/${reportType}?eventId=${selectedEventId}&format=json`;
      const data = await api.get(endpoint);
      setPreviewData(data);
      setPreviewTitle(title);
    } catch (err: any) {
      console.error("Failed to fetch report data:", err);
      setError("Failed to generate print preview.");
    } finally {
      setPreviewing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const activeEvent = events.find((e) => e._id === selectedEventId);

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
      id: "winners",
      title: "Ranked Winner Lists",
      desc: "Project teams sorted by aggregate jury evaluation score per category to determine winners.",
      icon: Award,
      color: "bg-yellow-50 text-yellow-600 border-yellow-100",
    },
    {
      id: "schools",
      title: "School Engagement Reports",
      desc: "Aggregate engagement summaries per school containing registration count, attendance count, and entry ratio.",
      icon: SchoolIcon,
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Print Specific CSS Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          nav, header, sidebar, button, .no-print {
            display: none !important;
          }
          #print-modal-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            z-index: 999999 !important;
            display: block !important;
          }
          #print-section {
            border: none !important;
            box-shadow: none !important;
            max-height: none !important;
            overflow: visible !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          table {
            width: 100% !important;
            font-size: 9px !important;
            border-collapse: collapse !important;
          }
          th, td {
            padding: 3px 5px !important;
            word-break: break-word !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Title */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Analytical Exports</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800">Reports Center</h2>
          <p className="text-xs text-slate-500">Export spreadsheets and print official PDF reports.</p>
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
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold no-print">
          {error}
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
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
              <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-end gap-2 text-xs">
                <button
                  onClick={() => handlePreviewPdf(rep.id, rep.title)}
                  disabled={previewing || downloading !== null}
                  className="bg-[#A90F0F] hover:bg-[#8B0C0C] text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm disabled:opacity-75"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PDF Print</span>
                </button>

                <button
                  onClick={() => handleDownload(rep.id, "excel")}
                  disabled={downloading !== null || previewing}
                  className="bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {downloading === excelKey ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Excel</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownload(rep.id, "csv")}
                  disabled={downloading !== null || previewing}
                  className="bg-slate-55 border border-slate-100 hover:bg-slate-100 text-slate-600 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {downloading === csvKey ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </>
                  )}
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* PDF Print Preview Modal */}
      {previewData && (
        <div id="print-modal-overlay" className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-4xl p-6 bg-white border-slate-200/50 shadow-2xl relative my-8 flex flex-col gap-4">
            <button
              onClick={() => setPreviewData(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <span>Institutional PDF Print Preview</span>
              </h3>
              <button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Send to Printer / Save PDF</span>
              </button>
            </div>

            {/* Printable Report Section */}
            <div id="print-section" className="bg-white border border-slate-200 p-8 rounded-xl overflow-x-auto max-h-[60vh] overflow-y-auto">
              {/* Institutional Header */}
              <div className="text-center flex flex-col items-center border-b-2 border-slate-900 pb-6 mb-6">
                <h1 className="text-xl font-bold tracking-wide text-slate-900">PRATHYUSHA ENGINEERING COLLEGE</h1>
                <p className="text-[10px] text-slate-600 font-medium tracking-widest uppercase mt-0.5">Approved by AICTE, New Delhi & Affiliated to Anna University</p>
                <div className="w-12 h-0.5 bg-blue-600 my-3" />
                <h2 className="text-md font-bold text-slate-800">{previewTitle.toUpperCase()} REPORT</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">Event: {activeEvent?.title || "Exhibition Event"}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
              </div>

              {/* Table Data */}
              {previewData.length > 0 ? (
                <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                  <thead>
                    <tr className="bg-slate-50">
                      {Object.keys(previewData[0]).map((header) => (
                        <th key={header} className="border border-slate-300 px-3 py-2 font-bold text-slate-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                        {Object.values(row).map((val: any, cellIdx) => (
                          <td key={cellIdx} className="border border-slate-300 px-3 py-2 text-slate-600">
                            {typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center text-slate-400 py-12">
                  No records found for this report scope.
                </div>
              )}

              {/* Signature Blocks */}
              <div className="mt-16 grid grid-cols-2 gap-12 text-center pt-8 border-t border-dashed border-slate-200">
                <div className="flex flex-col items-center">
                  <div className="w-40 border-b border-slate-800 mt-6" />
                  <span className="text-[10px] font-bold text-slate-700 uppercase mt-2">Event Coordinator</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-40 border-b border-slate-800 mt-6" />
                  <span className="text-[10px] font-bold text-slate-700 uppercase mt-2">Principal Head</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
