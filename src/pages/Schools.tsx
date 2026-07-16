import { useState, useEffect } from "react";
import { api } from "../utils/api";
import GlassCard from "../components/GlassCard";
import { School as SchoolIcon, Search, Phone, Sparkles, Trash2 } from "lucide-react";
import type { School } from "../types";

export default function Schools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchSchools = async () => {
    try {
      let endpoint = "/api/schools";
      if (search) endpoint += `?search=${encodeURIComponent(search)}`;
      
      const data = await api.get(endpoint);
      setSchools(data);
    } catch (err: any) {
      setError(err.message || "Failed to load schools.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this school profile? All associated students and projects will need to be re-associated.")) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/api/schools/${id}`);
      setSuccess("School profile removed successfully.");
      fetchSchools();
    } catch (err: any) {
      setError(err.message || "Failed to delete school.");
    }
  };

  if (loading && schools.length === 0) {
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
          <span>Institutes Ledger</span>
        </div>
        <h2 className="text-2xl font-bold font-display text-slate-800">Manage Schools</h2>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-semibold">
          {success}
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
            placeholder="Search school name, code, district..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>
      </GlassCard>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schools.map((sch) => (
          <GlassCard
            key={sch._id}
            className="p-5 border-slate-200/50 bg-white/70 shadow-sm flex flex-col justify-between gap-4"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 flex-shrink-0">
                    <SchoolIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-slate-800 text-sm leading-tight truncate max-w-[200px]" title={sch.name}>
                      {sch.name}
                    </h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 font-mono">
                      CODE: {sch.code}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(sch._id)}
                  className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer"
                  title="Remove school profile"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Coordinates details */}
              <div className="grid grid-cols-2 gap-4 text-xs mt-2 border-t border-slate-100 pt-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">District & Location</span>
                  <span className="font-semibold text-slate-700 truncate">
                    {sch.district}, {sch.state}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Principal Head</span>
                  <span className="font-semibold text-slate-700 truncate">{sch.principalName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Escorts Count</span>
                  <span className="font-semibold text-slate-700">{sch.teachersCount} escort(s)</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">In-charge Coordinator</span>
                  <span className="font-semibold text-slate-700 truncate">{sch.inChargeName}</span>
                </div>
              </div>
            </div>

            {/* Footer contact */}
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] font-bold text-blue-600">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                <span>Emergency: {sch.emergencyContact}</span>
              </span>
              <span className="text-slate-400 truncate max-w-[150px] font-medium" title={sch.coordinatorEmail}>
                {sch.coordinatorEmail}
              </span>
            </div>
          </GlassCard>
        ))}

        {schools.length === 0 && (
          <div className="col-span-2 p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-white/70 animate-pulse">
            No school coordinators have registered school profiles yet.
          </div>
        )}
      </div>
    </div>
  );
}
