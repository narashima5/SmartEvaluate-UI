import { Award } from "lucide-react";
import type { Project } from "../types";
import GlassCard from "./GlassCard";

interface ProjectCardProps {
  proj: Project;
  isAdminOrEventCoordinator: boolean;
  onStatusChange: (projectId: string, newStatus: string) => void;
  onOpenStallModal: (project: Project) => void;
}

export default function ProjectCard({
  proj,
  isAdminOrEventCoordinator,
  onStatusChange,
  onOpenStallModal,
}: ProjectCardProps) {
  return (
    <GlassCard className="p-5 border-slate-200/50 bg-white/70 shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden">
      {/* Status ribbon border */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          proj.status === "Winner"
            ? "bg-gradient-to-r from-yellow-400 to-amber-500"
            : proj.status === "Evaluated"
            ? "bg-blue-500"
            : proj.status === "Checked In"
            ? "bg-emerald-500"
            : "bg-slate-300"
        }`}
      />

      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-blue-600 font-mono tracking-wider">{proj.projectId}</span>
            <h4 className="font-bold text-slate-800 text-sm leading-snug mt-1">{proj.title}</h4>
          </div>

          {/* Stall Number badge */}
          <div
            className={`px-3 py-1.5 rounded-xl border flex flex-col items-center justify-center flex-shrink-0 ${
              proj.stallNumber
                ? "bg-blue-50/50 text-blue-700 border-blue-100"
                : "bg-amber-50 text-amber-700 border-amber-100 border-dashed"
            }`}
          >
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">STALL</span>
            <span className="text-xs font-extrabold leading-none mt-1">{proj.stallNumber || "TBD"}</span>
          </div>
        </div>

        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md w-fit">
          {proj.domain}
        </span>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1" title={proj.abstract}>
          {proj.abstract}
        </p>

        {/* Team details */}
        <div className="grid grid-cols-2 gap-4 text-xs mt-2 border-t border-slate-100 pt-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Team Name</span>
            <span className="font-semibold text-slate-700 truncate">{proj.teamName}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Guide Teacher</span>
            <span className="font-semibold text-slate-700 truncate">{proj.guideTeacher}</span>
          </div>
        </div>

        {/* Members Names */}
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Team Members</span>
          <span className="font-semibold text-slate-600">
            {proj.members && proj.members.length > 0
              ? (proj.members as any[]).map((m) => m.name).join(", ")
              : "No members registered."}
          </span>
        </div>
      </div>

      {/* Actions Panel */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-3 text-xs mt-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Status:</span>
          {isAdminOrEventCoordinator ? (
            <select
              value={proj.status}
              onChange={(e) => onStatusChange(proj._id, e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 font-semibold px-2 py-1 rounded-lg text-xs focus:outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="Registered">Registered</option>
              <option value="Checked In">Checked In</option>
              <option value="Evaluated">Evaluated</option>
              <option value="Winner">Winner</option>
            </select>
          ) : (
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                proj.status === "Winner"
                  ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                  : proj.status === "Evaluated"
                  ? "bg-blue-50 text-blue-600 border-blue-100"
                  : proj.status === "Checked In"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-slate-100 text-slate-400 border-slate-200"
              }`}
            >
              {proj.status}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {proj.score > 0 && (
            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-100 px-2 py-1 rounded-lg font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>{proj.score} pts</span>
            </div>
          )}

          {isAdminOrEventCoordinator && (
            <button
              onClick={() => onOpenStallModal(proj)}
              className="bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 font-bold px-2.5 py-1.5 rounded-lg text-[10px] shadow-sm cursor-pointer"
            >
              Set Stall
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
