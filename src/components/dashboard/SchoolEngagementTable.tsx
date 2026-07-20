import GlassCard from "../GlassCard";
import { ExternalLink } from "lucide-react";

interface SchoolEngagementTableProps {
  data?: {
    schoolId?: string;
    schoolName: string;
    code: string;
    studentsCount: number;
    attendanceCount: number;
  }[];
  onSchoolClick?: (schoolId: string) => void;
}

export default function SchoolEngagementTable({ data = [], onSchoolClick }: SchoolEngagementTableProps) {
  return (
    <GlassCard className="p-6 border-slate-200/50 bg-white/70 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">School-wise Engagement Rates</h3>
          <p className="text-[10px] text-slate-400 font-medium">Click any school name to view student registration details</p>
        </div>
        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
          Interactive View
        </span>
      </div>
      <div className="overflow-x-auto min-h-64 max-h-72">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold sticky top-0 bg-white/90">
              <th className="py-2.5">School Name</th>
              <th className="py-2.5">Code</th>
              <th className="py-2.5 text-center">Registrations</th>
              <th className="py-2.5 text-center">Attendance</th>
              <th className="py-2.5 text-right">Check-in %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
            {data.map((sch, idx) => {
              const rate = sch.studentsCount > 0 ? ((sch.attendanceCount / sch.studentsCount) * 100).toFixed(0) : "0";
              const isClickable = !!sch.schoolId && !!onSchoolClick;
              return (
                <tr
                  key={idx}
                  onClick={() => isClickable && onSchoolClick(sch.schoolId!)}
                  className={`transition-colors ${isClickable ? "cursor-pointer hover:bg-blue-50/40" : "hover:bg-slate-50/50"}`}
                >
                  <td className="py-3 font-semibold truncate max-w-[240px]" title={sch.schoolName}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isClickable) onSchoolClick(sch.schoolId!);
                      }}
                      className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-bold text-left transition-colors group"
                    >
                      <span className="truncate">{sch.schoolName}</span>
                      <ExternalLink className="w-3 h-3 text-blue-400 group-hover:text-blue-600 flex-shrink-0" />
                    </button>
                  </td>
                  <td className="py-3 text-slate-500 uppercase font-mono text-[11px]">{sch.code}</td>
                  <td className="py-3 text-center font-bold text-slate-700">{sch.studentsCount}</td>
                  <td className="py-3 text-center text-slate-600">{sch.attendanceCount}</td>
                  <td className="py-3 text-right text-blue-600 font-bold">{rate}%</td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No schools active in current event registrations.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
