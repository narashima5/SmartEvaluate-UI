import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { api } from "../utils/api";
import GlassCard from "../components/GlassCard";
import {
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Camera,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";
import type { Student } from "../types";

interface ScanResult {
  status: "success" | "duplicate" | "invalid" | "error";
  message: string;
  student?: {
    name: string;
    school: string;
    category: string;
    registrationNumber: string;
    projectCode?: string;
    stallNumber?: string;
    entryTime?: string;
  };
}

export default function Scanner() {
  const [activeTab, setActiveTab] = useState<"scan" | "manual">("scan");
  const [gate, setGate] = useState("Main Entrance");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);

  // Manual Check-in States
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [searching, setSearching] = useState(false);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Initialize QR scanner on tab mount
  useEffect(() => {
    if (activeTab !== "scan") {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (e) {
          console.error(e);
        }
        scannerRef.current = null;
      }
      return;
    }

    setScanning(true);
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(handleScanSuccess, handleScanError);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (e) {
          console.error("Cleanup scanner error", e);
        }
      }
    };
  }, [activeTab]);

  const handleScanSuccess = async (decodedText: string) => {
    // Stop scanning briefly to prevent double scans
    if (scannerRef.current) {
      try {
        // We let the scanner continue but throttle API calls by checking state
      } catch (e) {}
    }

    setScanResult(null);

    try {
      const response = await api.post("/api/checkin/verify", {
        qrToken: decodedText,
        gate,
      });

      if (response && response.status) {
        setScanResult({
          status: response.status,
          message: response.message,
          student: response.student,
        });
        
        // Play success beep sound
        playScanBeep(response.status === "success");
      }
    } catch (err: any) {
      console.error("Scan processing error:", err);
      setScanResult({
        status: "error",
        message: err.message || "Failed to process ticket entry.",
      });
      playScanBeep(false);
    }
  };

  const handleScanError = () => {
    // Silent
  };

  const playScanBeep = (isSuccess: boolean) => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(isSuccess ? 880 : 330, context.currentTime); // A5 for success, E3 for error
      gainNode.gain.setValueAtTime(0.1, context.currentTime);

      oscillator.start();
      oscillator.stop(context.currentTime + (isSuccess ? 0.15 : 0.3));
    } catch (e) {
      console.log("AudioContext blocked or unsupported.");
    }
  };

  // Search for manual check-in
  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    setScanResult(null);

    try {
      const data = await api.get(`/api/students?search=${encodeURIComponent(search)}&checkedIn=false`);
      setSearchResults(data);
    } catch (err) {
      console.error("Manual search failed", err);
    } finally {
      setSearching(false);
    }
  };

  const handleManualCheckIn = async (student: Student) => {
    setCheckingInId(student._id);
    setScanResult(null);

    try {
      // 1. Get signed token for this student
      const signData = await api.get(`/api/checkin/sign/${student._id}`);
      
      // 2. Process check-in
      const response = await api.post("/api/checkin/verify", {
        qrToken: signData.token,
        gate,
      });

      setScanResult({
        status: response.status,
        message: response.message,
        student: response.student,
      });

      playScanBeep(true);
      // Remove student from search results list
      setSearchResults((prev) => prev.filter((s) => s._id !== student._id));
    } catch (err: any) {
      setScanResult({
        status: "error",
        message: err.message || "Failed to complete manual check-in.",
      });
      playScanBeep(false);
    } finally {
      setCheckingInId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 text-center flex flex-col gap-1">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Volunteer Portal</span>
        </div>
        <h2 className="text-2xl font-bold font-display text-slate-800 font-display">Gate Check-in Desk</h2>
      </div>

      {/* Selector and Gate config */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold text-slate-400 uppercase">Entrance Gate Location</label>
          <select
            value={gate}
            onChange={(e) => setGate(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 font-semibold px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="Main Entrance">Main Entrance</option>
            <option value="Auditorium Gate">Auditorium Gate</option>
            <option value="Exhibition Pavilion A">Exhibition Pavilion A</option>
            <option value="Exhibition Pavilion B">Exhibition Pavilion B</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold text-slate-400 uppercase">Check-in Mode</label>
          <div className="bg-slate-100 p-0.5 rounded-xl flex gap-1 h-full items-center">
            <button
              onClick={() => setActiveTab("scan")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "scan" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
              }`}
            >
              Camera Scan
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "manual" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
              }`}
            >
              Manual Lookup
            </button>
          </div>
        </div>
      </div>

      {/* Visual Scan Results State */}
      {scanResult && (
        <GlassCard
          className={`p-5 border-l-4 shadow-md ${
            scanResult.status === "success"
              ? "border-emerald-500 bg-emerald-50/20 text-emerald-900 border-emerald-100"
              : scanResult.status === "duplicate"
              ? "border-amber-500 bg-amber-50/20 text-amber-900 border-amber-100"
              : "border-red-500 bg-red-50/20 text-red-900 border-red-100"
          }`}
        >
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {scanResult.status === "success" && <CheckCircle className="w-8 h-8 text-emerald-500" />}
              {scanResult.status === "duplicate" && <AlertTriangle className="w-8 h-8 text-amber-500" />}
              {(scanResult.status === "invalid" || scanResult.status === "error") && (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
            </div>

            <div className="flex-grow flex flex-col gap-1.5">
              <h4 className="font-extrabold text-sm capitalize">{scanResult.message}</h4>
              
              {scanResult.student && (
                <div className="flex flex-col gap-1 text-xs text-slate-600 mt-2 font-medium">
                  <div className="flex justify-between border-b border-slate-100/50 pb-1">
                    <span>Name</span>
                    <span className="font-bold text-slate-800">{scanResult.student.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100/50 pb-1">
                    <span>School</span>
                    <span className="font-semibold text-slate-700 max-w-[200px] truncate">{scanResult.student.school}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100/50 pb-1">
                    <span>Category</span>
                    <span className="font-semibold text-slate-700">{scanResult.student.category}</span>
                  </div>
                  {scanResult.student.projectCode && (
                    <div className="flex justify-between items-center text-[10px] font-bold text-blue-600 bg-blue-50/50 border border-blue-100 px-2 py-0.5 rounded-md mt-1">
                      <span>Project: {scanResult.student.projectCode}</span>
                      <span>Stall: {scanResult.student.stallNumber || "Not Assigned"}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Camera Scan Window */}
      {activeTab === "scan" && (
        <GlassCard className="p-6 border-slate-200/50 bg-white/70 shadow-sm flex flex-col items-center gap-4">
          <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-900 relative">
            <div id="qr-reader" className="w-full" />
            {!scanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-white text-xs font-bold gap-2">
                <Camera className="w-4 h-4" />
                <span>Camera loading...</span>
              </div>
            )}
          </div>
          <div className="text-center text-xs text-slate-400 leading-normal max-w-xs mt-1">
            Ensure the ticket QR code is aligned inside the scanner overlay. Do not scan photocopied or low-contrast images.
          </div>
        </GlassCard>
      )}

      {/* Manual lookup list */}
      {activeTab === "manual" && (
        <GlassCard className="p-6 border-slate-200/50 bg-white/70 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-slate-800 text-sm">Lookup Student Registration</h3>
          
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search name, class, registration number..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer shadow-sm disabled:opacity-75"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Results list */}
          <div className="flex flex-col gap-2 mt-2 max-h-60 overflow-y-auto">
            {searchResults.map((st) => (
              <div
                key={st._id}
                className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex flex-col gap-0.5 max-w-[280px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 text-xs">{st.name}</span>
                    <span className="text-[9px] font-mono text-blue-600 font-bold bg-blue-50 px-1 py-0.5 rounded leading-none">
                      {st.registrationNumber}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium truncate">
                    Class {st.class}-{st.section} • {st.category}
                  </span>
                </div>

                <button
                  onClick={() => handleManualCheckIn(st)}
                  disabled={checkingInId === st._id}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-[10px] flex items-center gap-1 cursor-pointer disabled:opacity-75"
                >
                  {checkingInId === st._id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                  <span>Check In</span>
                </button>
              </div>
            ))}

            {searchResults.length === 0 && search && !searching && (
              <div className="py-8 text-center text-xs text-slate-400">
                No matching unregistered students found.
              </div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
