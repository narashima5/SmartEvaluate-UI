import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { useQuery } from "@tanstack/react-query";
import GlassCard from "../components/GlassCard";
import {
  Trophy,
  Search,
  Sparkles,
  Calendar,
  School,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { Event } from "../types";

interface LeaderboardItem {
  _id: string;
  rank: number;
  projectId: string;
  title: string;
  teamName: string;
  guideTeacher?: string;
  schoolName: string;
  schoolCode: string;
  stallNumber?: string;
  score: number;
  evaluationsCount: number;
  status: "Evaluated" | "Pending";
}

export default function Leaderboard() {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [search, setSearch] = useState("");

  // Fetch Events
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: () => api.get("/api/events"),
  });

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

  // Fetch Leaderboard
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardItem[]>({
    queryKey: ["leaderboard", selectedEventId],
    queryFn: () => api.get(`/api/evaluations/leaderboard?eventId=${selectedEventId}`),
    enabled: !!selectedEventId,
  });

  const filtered = leaderboard.filter((item) => {
    const s = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(s) ||
      item.projectId?.toLowerCase().includes(s) ||
      item.teamName?.toLowerCase().includes(s) ||
      item.schoolName?.toLowerCase().includes(s) ||
      item.guideTeacher?.toLowerCase().includes(s)
    );
  });

  const selectedEvent = events.find((e) => e._id === selectedEventId);
  const totalEvaluated = leaderboard.filter((i) => i.evaluationsCount > 0).length;
  const topScore = leaderboard.length > 0 ? leaderboard[0].score : 0;
  const avgScore =
    totalEvaluated > 0
      ? (
          leaderboard.reduce((acc, curr) => acc + curr.score, 0) / totalEvaluated
        ).toFixed(1)
      : "0";

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Exhibition Leaderboard & Scoring</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800">
            Project Leaderboard
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

        {/* Event Selector */}
        {events.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Select Expo Event:</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500 shadow-sm"
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-200/50 flex items-center gap-4">
          <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Score</span>
            <h3 className="text-2xl font-black text-slate-800">{topScore} <span className="text-xs text-slate-400 font-normal">pts</span></h3>
          </div>
        </GlassCard>

        <GlassCard className="p-5 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200/50 flex items-center gap-4">
          <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projects Evaluated</span>
            <h3 className="text-2xl font-black text-slate-800">{totalEvaluated} / {leaderboard.length}</h3>
          </div>
        </GlassCard>

        <GlassCard className="p-5 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-200/50 flex items-center gap-4">
          <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Expo Score</span>
            <h3 className="text-2xl font-black text-slate-800">{avgScore} <span className="text-xs text-slate-400 font-normal">pts</span></h3>
          </div>
        </GlassCard>
      </div>

      {/* Main Leaderboard Table Section */}
      <GlassCard className="p-6 border-slate-200/50 bg-white/80 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-800 text-base">Project Standings</h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {filtered.length} Projects
            </span>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, team, school..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 bg-white"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 text-center">Rank</th>
                  <th className="py-3 px-4">Project ID</th>
                  <th className="py-3 px-4">Project Title & Team</th>
                  <th className="py-3 px-4">School Name</th>
                  <th className="py-3 px-4 text-center">Stall</th>
                  <th className="py-3 px-4 text-center">Jury Evals</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((item) => {
                  let rankBadge = null;
                  if (item.rank === 1) {
                    rankBadge = (
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-black mx-auto shadow-sm border border-amber-200">
                        🥇 1
                      </div>
                    );
                  } else if (item.rank === 2) {
                    rankBadge = (
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-black mx-auto shadow-sm border border-slate-300">
                        🥈 2
                      </div>
                    );
                  } else if (item.rank === 3) {
                    rankBadge = (
                      <div className="w-8 h-8 rounded-full bg-amber-800/10 text-amber-800 flex items-center justify-center font-black mx-auto shadow-sm border border-amber-800/20">
                        🥉 3
                      </div>
                    );
                  } else {
                    rankBadge = (
                      <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center font-bold mx-auto border border-slate-100 text-xs">
                        {item.rank}
                      </div>
                    );
                  }

                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-amber-50/30 transition-colors ${
                        item.rank <= 3 ? "bg-amber-50/10" : ""
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center">{rankBadge}</td>

                      {/* Project ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        <span className="bg-slate-100 border border-slate-200/80 px-2 py-1 rounded-md text-[11px]">
                          {item.projectId}
                        </span>
                      </td>

                      {/* Title & Team */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-extrabold text-slate-800 text-sm leading-snug">
                            {item.title}
                          </span>
                          <span className="text-slate-500 text-[11px] font-semibold">
                            Team: <strong className="text-slate-700">{item.teamName}</strong>
                            {item.guideTeacher && (
                              <span className="text-slate-400"> (Guide: {item.guideTeacher})</span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* School Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50/80 border border-blue-100 px-2.5 py-1 rounded-xl w-fit">
                          <School className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span className="font-bold text-xs truncate max-w-[200px]" title={item.schoolName}>
                            {item.schoolName}
                          </span>
                          <span className="text-[10px] text-blue-400 uppercase font-mono font-bold">
                            ({item.schoolCode})
                          </span>
                        </div>
                      </td>

                      {/* Stall */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-600 font-bold">
                        {item.stallNumber ? (
                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                            {item.stallNumber}
                          </span>
                        ) : (
                          <span className="text-slate-300">TBD</span>
                        )}
                      </td>

                      {/* Jury Evals Count */}
                      <td className="py-3.5 px-4 text-center text-slate-600 font-bold">
                        {item.evaluationsCount}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "Evaluated"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}
                        >
                          {item.status === "Evaluated" ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-500" />
                          )}
                          {item.status}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-base font-black text-amber-600 font-display">
                          {item.score}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold ml-0.5">pts</span>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                      No matching projects found on the leaderboard.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
