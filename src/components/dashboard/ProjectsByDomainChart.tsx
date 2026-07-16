import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import GlassCard from "../GlassCard";

const COLORS = ["#3b82f6", "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6"];

interface ProjectsByDomainChartProps {
  data?: { name: string; value: number }[];
}

export default function ProjectsByDomainChart({ data = [] }: ProjectsByDomainChartProps) {
  return (
    <GlassCard className="p-6 md:col-span-2 border-slate-200/50 bg-white/70 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-sm">Projects Distribution by Domain</h3>
        <span className="text-[10px] font-semibold text-slate-400">Total Registered Teams</span>
      </div>
      <div className="h-64 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -10, right: 10, top: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} interval={0} angle={-15} textAnchor="end" />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No project data available.
          </div>
        )}
      </div>
    </GlassCard>
  );
}
