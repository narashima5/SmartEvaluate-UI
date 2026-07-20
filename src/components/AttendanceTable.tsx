import { MapPin, Clock } from "lucide-react";
import type { Student, Event } from "../types";
import GlassCard from "./GlassCard";

interface AttendanceTableProps {
  students: Student[];
  activeEvent: Event | null;
}

export default function AttendanceTable({ students, activeEvent }: AttendanceTableProps) {
  return (
    <GlassCard className="border-slate-200/50 bg-white/70 shadow-sm overflow-hidden">
      {/* Desktop view for larger screens */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
              <th className="p-4">Reg Number</th>
              <th className="p-4">Student Name</th>
              <th className="p-4">School Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Class & Section</th>
              <th className="p-4">Accompanying Teacher</th>
              <th className="p-4 text-center">Entry Gate</th>
              <th className="p-4 text-right">Entry Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
            {students.map((st) => {
              const schoolName = typeof st.school === "object" && st.school?.name ? st.school.name : "N/A";
              return (
                <tr key={st._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-emerald-600">{st.registrationNumber}</td>
                  <td className="p-4 font-bold text-slate-800">{st.name}</td>
                  <td className="p-4 font-semibold text-slate-700">{schoolName}</td>
                  <td className="p-4">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        st.category === "Visitor"
                          ? "bg-slate-50 text-slate-600 border-slate-200"
                          : "bg-blue-50 text-blue-600 border-blue-100"
                      }`}
                    >
                      {st.category}
                    </span>
                  </td>
                  <td className="p-4">
                    Class {st.class}-{st.section}
                  </td>
                  <td className="p-4">{st.teacherName}</td>
                  <td className="p-4 text-center">
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100/50 flex items-center gap-1 w-fit mx-auto">
                      <MapPin className="w-3 h-3" />
                      <span>Gate 1</span>
                    </span>
                  </td>
                  <td className="p-4 text-right text-slate-500 font-mono">
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {st.updatedAt ? new Date(st.updatedAt).toLocaleTimeString(undefined, { timeStyle: "medium" }) : "N/A"}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}

            {students.length === 0 && (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-400">
                  {activeEvent ? "No students have checked in yet." : "No active science exhibition event."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card view for mobile screens */}
      <div className="block sm:hidden divide-y divide-slate-100">
        {students.map((st) => {
          const schoolName = typeof st.school === "object" && st.school?.name ? st.school.name : "N/A";
          return (
            <div key={st._id} className="p-4 flex flex-col gap-2.5 hover:bg-slate-50/50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-emerald-600 font-mono text-xs">{st.registrationNumber}</span>
                  <span className="font-bold text-slate-800 text-sm">{st.name}</span>
                  <span className="text-xs font-semibold text-slate-500">{schoolName}</span>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    st.category === "Visitor"
                      ? "bg-slate-50 text-slate-600 border-slate-200"
                      : "bg-blue-50 text-blue-600 border-blue-100"
                  }`}
                >
                  {st.category}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-50 pt-2 text-slate-500">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Class & Sec</span>
                  <span className="font-semibold text-slate-700">Class {st.class}-{st.section}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Escort Teacher</span>
                  <span className="font-semibold text-slate-700 truncate block">{st.teacherName}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-50 pt-2.5 mt-1">
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100/50 flex items-center gap-1 w-fit">
                  <MapPin className="w-3 h-3" />
                  <span>Gate 1</span>
                </span>
                <div className="flex items-center gap-1 text-slate-500 font-mono text-xs">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {st.updatedAt ? new Date(st.updatedAt).toLocaleTimeString(undefined, { timeStyle: "medium" }) : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {students.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            {activeEvent ? "No students have checked in yet." : "No active science exhibition event."}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
