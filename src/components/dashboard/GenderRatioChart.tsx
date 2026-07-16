import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import GlassCard from "../GlassCard";

const COLORS = ["#3b82f6", "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6"];

interface GenderRatioChartProps {
  data?: { name: string; value: number }[];
}

export default function GenderRatioChart({ data = [] }: GenderRatioChartProps) {
  return (
    <GlassCard className="p-6 border-slate-200/50 bg-white/70 shadow-sm flex flex-col gap-4">
      <h3 className="font-bold text-slate-800 text-sm">Participant Gender Ratio</h3>
      <div className="h-64 w-full relative flex items-center justify-center">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} Students`, "Count"]} />
              <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-xs text-slate-400">No gender statistics available.</div>
        )}
      </div>
    </GlassCard>
  );
}
