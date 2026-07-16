import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import GlassCard from "../GlassCard";

interface ClassAttendanceChartProps {
  data?: { name: string; count: number }[];
}

export default function ClassAttendanceChart({ data = [] }: ClassAttendanceChartProps) {
  return (
    <GlassCard className="p-6 border-slate-200/50 bg-white/70 shadow-sm flex flex-col gap-4">
      <h3 className="font-bold text-slate-800 text-sm">Class-wise Attendance Rates</h3>
      <div className="h-64 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No class statistics available.
          </div>
        )}
      </div>
    </GlassCard>
  );
}
