import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import GlassCard from "../components/GlassCard";

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!usernameOrEmail.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/api/auth/login", {
        usernameOrEmail: usernameOrEmail.trim(),
        password: password.trim(),
      });

      if (response && response.token && response.user) {
        login(response.token, response.user);

        // Redirect based on role
        const role = response.user.role;
        if (role === "super_admin" || role === "event_coordinator") {
          navigate("/dashboard");
        } else if (role === "school_coordinator") {
          navigate("/school-profile");
        } else if (role === "volunteer") {
          navigate("/scanner");
        } else if (role === "jury") {
          navigate("/evaluate");
        } else {
          navigate("/");
        }
      } else {
        setError("Invalid server response format.");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 sm:p-6 md:p-8 relative selection:bg-blue-500/20 selection:text-blue-900 overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none -z-10 animate-float" style={{ animationDelay: "2.5s" }} />

      <div className="w-full max-w-md flex flex-col gap-6 z-10">
        <div className="text-center flex flex-col items-center gap-3">
          <Link to="/" className="flex p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/25 transition-transform hover:scale-105">
            <ShieldCheck className="w-8 h-8" />
          </Link>
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">Smart Evaluate</h2>
            <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest mt-1">Science Exhibition Portal</span>
          </div>
        </div>

        <GlassCard className="p-8 border border-white/30 bg-white/70 backdrop-blur-md shadow-xl" glow>
          <div className="flex flex-col gap-2 mb-6 text-center">
            <h3 className="font-bold text-slate-800 text-base">Coordinator Log In</h3>
            <p className="text-xs text-slate-500">Enter your coordinator credentials to access your dashboard.</p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Username or Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/60 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Password</label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/60 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-500/15 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </GlassCard>

        <div className="text-center flex flex-col gap-2">
          <p className="text-xs text-slate-500">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
          <Link to="/" className="text-xs font-semibold text-slate-400 hover:text-slate-600 inline-flex items-center gap-1.5 justify-center mt-1">
            <span>Back to landing portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
