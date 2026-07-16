import { Link } from "react-router-dom";
import { ArrowRight, Award, ShieldAlert, Cpu, Leaf, BrainCircuit, HeartPulse, Sparkles } from "lucide-react";

export default function Landing() {
  const domainIcons: Record<string, any> = {
    "AI / Generative AI": BrainCircuit,
    "IoT & Smart Cities": Cpu,
    "Climate & Environmental Intelligence": Leaf,
    Cybersecurity: ShieldAlert,
    "Healthcare Technology": HeartPulse,
    "Open Innovation": Sparkles,
    "Disaster Prediction & Response": Award,
  };

  const domains = [
    { name: "AI / Generative AI", desc: "Building next-gen intelligent agents, deep learning, and transformer architectures." },
    { name: "IoT & Smart Cities", desc: "Sensors, smart automation, smart grids, and connected system designs." },
    { name: "Climate & Environmental Intelligence", desc: "Green tech, pollution tracking, and climate prediction models." },
    { name: "Cybersecurity", desc: "Network defenses, cryptography, secure systems, and threat mitigation." },
    { name: "Healthcare Technology", desc: "Biomedical sensors, diagnostics assistance, and health monitoring innovations." },
    { name: "Open Innovation", desc: "Cross-disciplinary solutions solving unique real-world pain points." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative selection:bg-blue-500/20 selection:text-blue-900 overflow-x-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-float" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-float" style={{ animationDelay: "3s" }} />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
            <Award className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-slate-800">Smart Evaluate (Prayoga'26 Edition)</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="bg-white/80 border border-slate-200 hover:border-blue-300 hover:bg-white text-slate-700 hover:text-blue-600 font-semibold px-4 py-2 rounded-xl shadow-sm backdrop-blur-md transition-all duration-200 text-sm flex items-center gap-2"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-500/10 transition-all duration-200 text-sm flex items-center gap-2"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 pt-10 pb-20 flex flex-col md:flex-row items-center gap-12 z-10">
        <div className="flex-1 flex flex-col gap-6 text-left max-w-xl">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COLLEGE SCIENCE EXHIBITION HUB</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-900 leading-tight">
            Ignite Innovation, <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Shape the Future.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Welcome to the Science Expo portal. We manage registrations, projects, live attendance, and digital jury evaluations for young scientists showcasing revolutionary ideas.
          </p>
        </div>

        {/* Portal Actions Visual Panel */}
        <div className="flex-1 w-full max-w-md bg-white/80 border border-slate-200/50 shadow-xl rounded-3xl p-8 backdrop-blur-lg flex flex-col gap-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />

          <div className="flex flex-col gap-2">
            <h3 className="font-extrabold text-slate-800 text-lg">Smart Evaluate Portal</h3>
            <p className="text-xs text-slate-400">Access your coordinator, volunteer, or jury member dashboard.</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Sign In to Platform</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/signup"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <span>Create Coordinator or Jury Account</span>
            </Link>
            <p className="text-[11px] text-slate-400 leading-normal">
              School Coordinators: Log in to register your school, manage students, and download QR codes.
            </p>
          </div>
        </div>
      </main>

      {/* Domains Section */}
      <section className="bg-slate-100/50 border-t border-slate-200 py-20 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
          <div className="text-center max-w-lg mx-auto flex flex-col gap-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">Exhibition Domains</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Jury evaluations will be conducted across these specialized categories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((dom, idx) => {
              const Icon = domainIcons[dom.name] || Sparkles;
              return (
                <div key={idx} className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h4 className="font-bold text-slate-800 text-sm">{dom.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{dom.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-400 z-10">
        <p>&copy; 2026 Smart Evaluate. All Rights Reserved. Production-Grade Science Exhibition Portal.</p>
      </footer>
    </div>
  );
}
