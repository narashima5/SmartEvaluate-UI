import { CheckCircle, Award, QrCode, XCircle, Loader2 } from "lucide-react";
import type { User } from "../types";
import GlassCard from "./GlassCard";

interface PendingApprovalCardProps {
  user: User;
  isActionLoading: boolean;
  onApprove: (userId: string, username: string) => void;
  onReject: (userId: string, username: string) => void;
}

export default function PendingApprovalCard({
  user,
  isActionLoading,
  onApprove,
  onReject,
}: PendingApprovalCardProps) {
  return (
    <GlassCard className="p-6 bg-white/70 border border-slate-200/50 flex flex-col justify-between" glow>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 capitalize text-base">{user.username}</span>
            <span className="text-xs text-slate-400 font-medium mt-0.5">{user.email}</span>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${
              user.role === "jury"
                ? "bg-purple-50 text-purple-600 border-purple-100"
                : "bg-blue-50 text-blue-600 border-blue-100"
            }`}
          >
            {user.role === "jury" ? (
              <>
                <Award className="w-3 h-3" />
                <span>Jury</span>
              </>
            ) : (
              <>
                <QrCode className="w-3 h-3" />
                <span>Volunteer</span>
              </>
            )}
          </span>
        </div>

        <div className="border-t border-slate-100/80 pt-4 flex flex-col gap-2.5 text-xs text-slate-600">
          {user.role === "jury" && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Assigned Domain</span>
              <span className="font-semibold text-slate-700">{user.target_domain || "Open Innovation"}</span>
            </div>
          )}
          {user.role === "volunteer" && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Role Task</span>
              <span className="font-semibold text-slate-700">QR Check-in & Event Logistics</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100/80 pt-4 mt-6 flex gap-2">
        <button
          onClick={() => onReject(user.id, user.username)}
          disabled={isActionLoading}
          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl border border-red-100/50 text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isActionLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </>
          )}
        </button>
        <button
          onClick={() => onApprove(user.id, user.username)}
          disabled={isActionLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md shadow-blue-500/10 text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isActionLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Approving...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Approve</span>
            </>
          )}
        </button>
      </div>
    </GlassCard>
  );
}
