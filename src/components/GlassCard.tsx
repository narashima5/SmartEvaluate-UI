import React from "react";
import { twMerge } from "tailwind-merge";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, glow = false, ...props }) => {
  return (
    <div
      className={twMerge(
        "relative backdrop-blur-md bg-white/70 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.12)]",
        glow && "before:absolute before:inset-0 before:bg-gradient-to-tr before:from-blue-500/5 before:to-indigo-500/5 before:pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
