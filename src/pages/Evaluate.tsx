import { useState, useEffect } from "react";
import { api } from "../utils/api";
import GlassCard from "../components/GlassCard";
import {
  Search,
  Lock,
  Loader2,
  Sparkles,
  X,
  Check,
} from "lucide-react";
import type { Project, Evaluation, School, Student } from "../types";

export default function Evaluate() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [myEvaluations, setMyEvaluations] = useState<Evaluation[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Scoring States
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [criteriaList, setCriteriaList] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchJuryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const projData = await api.get("/api/projects");
      setProjects(projData);

      const evalData = await api.get("/api/evaluations/me");
      setMyEvaluations(evalData);

      const schoolData = await api.get("/api/schools").catch(() => []);
      setSchools(schoolData || []);
    } catch (err: any) {
      setError(err.message || "Failed to load projects for evaluation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJuryData();
  }, []);

  const handleOpenEvaluation = async (project: Project) => {
    setSelectedProject(project);
    setRemarks("");
    setScores({});
    setCriteriaList([]);
    setError(null);

    try {
      const criteria = await api.get("/api/evaluations/criteria");
      setCriteriaList(criteria);

      // Check if already evaluated this project
      const existing = myEvaluations.find(
        (e) => (typeof e.project === "object" ? e.project._id : e.project) === project._id
      );

      const initialScores: Record<string, number> = {};
      if (existing) {
        setRemarks(existing.remarks || "");
        if (existing.scores && existing.scores.length > 0) {
          existing.scores.forEach((s: any) => {
            initialScores[s.criteriaId] = s.score;
          });
        }
      }

      criteria.forEach((c: any) => {
        if (initialScores[c._id] === undefined) {
          initialScores[c._id] = 0;
        }
      });

      setScores(initialScores);
    } catch (err: any) {
      setError("Failed to fetch evaluation criteria.");
    }
  };

  const handleScoreChange = (criterionId: string, val: string, max: number) => {
    const num = Math.min(max, Math.max(0, parseInt(val) || 0));
    setScores((prev) => ({
      ...prev,
      [criterionId]: num,
    }));
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const scoresArray = Object.entries(scores).map(([criterionId, score]) => {
      const criteria = criteriaList.find((c) => c._id === criterionId);
      return {
        criteriaId: criterionId,
        criteriaName: criteria?.name || "Criterion",
        score: score,
      };
    });

    try {
      await api.post("/api/evaluations", {
        projectId: selectedProject._id,
        scores: scoresArray,
        remarks,
      });

      setSuccess(`Evaluation score for team ${selectedProject.teamName} locked successfully.`);
      setSelectedProject(null);
      fetchJuryData();
    } catch (err: any) {
      setError(err.message || "Failed to submit project scores.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const filteredProjects = projects.filter((p) => {
    const term = search.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(term) ||
      p.projectId.toLowerCase().includes(term) ||
      p.teamName.toLowerCase().includes(term);

    let matchesSchool = true;
    if (selectedSchool) {
      const firstMember = p.members && p.members.length > 0 ? p.members[0] : null;
      let projSchoolId = null;
      if (firstMember && typeof firstMember === "object") {
        const sch = (firstMember as Student).school;
        projSchoolId = typeof sch === "object" ? sch?._id : sch;
      }
      matchesSchool = String(projSchoolId) === String(selectedSchool);
    }

    return matchesSearch && matchesSchool;
  });

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Rubric Gradebook</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800">Jury Evaluations</h2>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-semibold">
          {success}
        </div>
      )}

      {/* Filter and Search Bar */}
      <GlassCard className="p-4 border-slate-200/50 bg-white/70 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title, code, team..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

        <select
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm sm:w-64 cursor-pointer"
        >
          <option value="">All Participating Schools</option>
          {schools.map((sch) => (
            <option key={sch._id} value={sch._id}>
              {sch.name}
            </option>
          ))}
        </select>
      </GlassCard>

      {/* Project evaluation grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((proj) => {
          const myEval = myEvaluations.find(
            (e) => (typeof e.project === "object" ? e.project._id : e.project) === proj._id
          );
          const isEvaluated = proj.status === "Evaluated";
          const isLocked = myEval?.isLocked || false;

          return (
            <GlassCard
              key={proj._id}
              className="p-5 border-slate-200/50 bg-white/70 shadow-sm flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-blue-600 font-mono tracking-wider">{proj.projectId}</span>
                    <h4 className="font-bold text-slate-800 text-sm leading-snug mt-1">{proj.title}</h4>
                  </div>
                  
                  <div className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                    Stall: {proj.stallNumber || "TBD"}
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mt-1" title={proj.abstract}>
                  {proj.abstract}
                </p>

                <div className="flex flex-wrap gap-2 text-xs font-semibold mt-1">
                  <span className="bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                    Team: {proj.teamName}
                  </span>
                  <span className="bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                    Guide: {proj.guideTeacher}
                  </span>
                </div>
              </div>

              {/* Status and Action bar */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs mt-1">
                <div className="flex items-center gap-1.5 font-medium">
                  {isEvaluated ? (
                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Evaluated ({proj.score} pts)</span>
                    </span>
                  ) : proj.status === "Checked In" ? (
                    <span className="text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">
                      Awaiting Grading
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold bg-slate-50 text-slate-400 border border-slate-100 px-2 py-0.5 rounded-full">
                      Registered
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleOpenEvaluation(proj)}
                  className={`font-bold px-3 py-2 rounded-xl text-[10px] shadow-sm cursor-pointer flex items-center gap-1 transition-all ${
                    isLocked
                      ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isLocked ? "View Scores" : "Evaluate"}
                </button>
              </div>
            </GlassCard>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="col-span-2 p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-white/70 animate-pulse">
            No projects found.
          </div>
        )}
      </div>

      {/* Evaluation Form Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-lg p-6 bg-white border-slate-200/50 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-slate-800 text-base mb-2">
              Evaluate Project Stall: {selectedProject.stallNumber || "TBD"}
            </h3>
            <p className="text-xs text-slate-500 font-bold mb-4 font-mono">{selectedProject.title}</p>

            <form onSubmit={handleSubmitEvaluation} className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto pr-1">
                {criteriaList.map((crit) => {
                  const val = scores[crit._id] || 0;
                  const isLocked = myEvaluations.find(
                    (e) => (typeof e.project === "object" ? e.project._id : e.project) === selectedProject._id
                  )?.isLocked;

                  return (
                    <div key={crit._id} className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-xs font-bold text-slate-700">{crit.name}</span>
                        <span className="text-[10px] font-bold text-slate-400">Max: {crit.maxMarks}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug mb-1">{crit.description}</p>
                      <input
                        type="number"
                        min={0}
                        max={crit.maxMarks}
                        value={val}
                        disabled={isLocked}
                        onChange={(e) => handleScoreChange(crit._id, e.target.value, crit.maxMarks)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  );
                })}

                {criteriaList.length === 0 && (
                  <div className="text-center text-xs text-slate-400 py-4 animate-pulse">
                    No criteria configured for evaluation.
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Jury Review Comments</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Provide brief feedback or remarks..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              {/* Total Summary */}
              <div className="mt-2 p-4 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Calculated Score</span>
                  <span className="text-xs font-semibold text-slate-500">Exhibition Rubrics Aggregate</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-blue-600 font-display">{totalScore}</span>
                </div>
              </div>

              {criteriaList.length > 0 && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs shadow-md mt-2 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Locking Score...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Submit and Lock Grade</span>
                    </>
                  )}
                </button>
              )}
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
