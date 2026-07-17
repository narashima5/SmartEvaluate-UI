import { useState, useEffect } from "react";
import { api } from "../utils/api";
import GlassCard from "../components/GlassCard";
import { Search, Sparkles } from "lucide-react";

interface AuditLog {
  _id: string;
  action: string;
  description: string;
  user: {
    username: string;
    role: string;
  } | null;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export default function Audits() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    try {
      let endpoint = "/api/audits";
      if (search) endpoint += `?search=${encodeURIComponent(search)}`;
      
      const data = await api.get(endpoint);
      setLogs(data);
    } catch (err: any) {
      setError(err.message || "Failed to load audit trail logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search]);

  if (loading && logs.length === 0) {
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
          <span>Security & Compliance Trails</span>
        </div>
        <h2 className="text-2xl font-bold font-display text-slate-800">System Audit Logs</h2>
        <p className="text-xs text-slate-500">Track and monitor administrative actions and authentication logs.</p>
      </div>

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
            placeholder="Search action types, descriptions, operator usernames..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>
      </GlassCard>

      {/* Audit Log Ledger Table */}
      <GlassCard className="border-slate-200/50 bg-white/70 shadow-sm overflow-hidden">
        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Description</th>
                <th className="p-4">Performed By</th>
                <th className="p-4">Client IP</th>
                <th className="p-4 text-right">User Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "medium",
                    })}
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100/50 px-2 py-0.5 rounded uppercase leading-none">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 font-sans max-w-[280px] break-words">
                    {log.description}
                  </td>
                  <td className="p-4">
                    {log.user ? (
                      <div className="flex flex-col gap-0.5 font-sans">
                        <span className="font-semibold text-slate-800 capitalize">{log.user.username}</span>
                        <span className="text-[9px] text-slate-400 font-bold capitalize">{log.user.role.replace("_", " ")}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic font-sans">System Guest</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">{log.ipAddress || "127.0.0.1"}</td>
                  <td className="p-4 text-right text-slate-400 max-w-[150px] truncate font-sans" title={log.userAgent}>
                    {log.userAgent || "Unknown Agent"}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-sans">
                    No system log events recorded matching search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {logs.map((log) => (
            <div key={log._id} className="p-4 flex flex-col gap-2.5 hover:bg-slate-50/50 transition-colors">
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100/50 px-2 py-0.5 rounded uppercase leading-none font-mono">
                  {log.action}
                </span>
                <span className="text-slate-400 text-[10px] font-mono whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString(undefined, {
                    dateStyle: "short",
                    timeStyle: "medium",
                  })}
                </span>
              </div>

              <p className="text-xs text-slate-700 font-sans leading-relaxed">
                {log.description}
              </p>

              <div className="flex justify-between items-center border-t border-slate-50 pt-2 mt-1 text-xs">
                <div>
                  {log.user ? (
                    <div className="flex items-center gap-1 font-sans">
                      <span className="font-semibold text-slate-700 capitalize">{log.user.username}</span>
                      <span className="text-[9px] text-slate-400 font-bold capitalize">({log.user.role.replace("_", " ")})</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic font-sans">System Guest</span>
                  )}
                </div>
                <span className="text-slate-400 text-[10px] font-mono">{log.ipAddress || "127.0.0.1"}</span>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No system log events recorded matching search.
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
