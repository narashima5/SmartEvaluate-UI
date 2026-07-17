import GlassCard from "../GlassCard";

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
        <h3 className="font-bold text-slate-800 text-sm">School-wise Engagement Rates</h3>
        <span className="text-[10px] font-semibold text-slate-400">Top Registered Institutes</span>
      </div>
      <div className="overflow-x-auto min-h-64 max-h-64">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold">
              <th className="py-2.5">School Name</th>
              <th className="py-2.5">Code</th>
              <th className="py-2.5 text-center">Registrations</th>
              <th className="py-2.5 text-center">Attendance</th>
              <th className="py-2.5 text-right">Check-in %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
            {data.slice(0, 5).map((sch, idx) => {
              const rate = sch.studentsCount > 0 ? ((sch.attendanceCount / sch.studentsCount) * 100).toFixed(0) : "0";
              const isClickable = !!sch.schoolId && !!onSchoolClick;
              return (
                <tr
                  key={idx}
                  onClick={() => isClickable && onSchoolClick(sch.schoolId!)}
                  className={`transition-colors ${isClickable ? "cursor-pointer hover:bg-slate-100/60" : "hover:bg-slate-50/50"}`}
                >
                  <td className="py-3 font-semibold text-slate-700 truncate max-w-[200px]" title={sch.schoolName}>
                    {sch.schoolName}
                  </td>
                  <td className="py-3 text-slate-500 uppercase">{sch.code}</td>
                  <td className="py-3 text-center">{sch.studentsCount}</td>
                  <td className="py-3 text-center">{sch.attendanceCount}</td>
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
