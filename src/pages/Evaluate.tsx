import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import GlassCard from "../components/GlassCard";
import {
  Search,
  Sparkles,
  Loader2,
  Lock,
  X,
  FileText,
  Plus,
  Award,
  BookOpen,
  Check,
} from "lucide-react";
import type { Project, Evaluation } from "../types";

export default function Evaluate() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [myEvaluations, setMyEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Scoring Modal States
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [criteriaList, setCriteriaList] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Spot add states & modals
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [showCritModal, setShowCritModal] = useState(false);
  const [domains, setDomains] = useState<any[]>([]);

  // Add Domain Form
  const [newDomainName, setNewDomainName] = useState("");
  const [newDomainDesc, setNewDomainDesc] = useState("");

  // Add Criteria Form
  const [newCritDomain, setNewCritDomain] = useState("");
  const [newCritName, setNewCritName] = useState("");
  const [newCritMax, setNewCritMax] = useState(20);
  const [newCritDesc, setNewCritDesc] = useState("");

  const fetchDomains = async () => {
    try {
      const response = await api.get("/api/evaluations/domains");
      if (Array.isArray(response)) {
        setDomains(response);
        if (response.length > 0) {
          setNewCritDomain(response[0].name);
        }
      }
    } catch (err) {
      console.error("Failed to load domains list:", err);
    }
  };

  const fetchJuryData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch projects
      let projectEndpoint = "/api/projects";
      // If jury has target_domain, filter by it on frontend to verify
      const projData = await api.get(projectEndpoint);
      if (user?.role === "jury" && user.target_domain) {
        const filtered = projData.filter((p: Project) => p.domain === user.target_domain);
        setProjects(filtered);
      } else {
        setProjects(projData);
      }

      // 2. Fetch my submitted evaluations
      const evalData = await api.get("/api/evaluations/me");
      setMyEvaluations(evalData);
    } catch (err: any) {
      setError(err.message || "Failed to load projects for evaluation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJuryData();
    fetchDomains();
  }, [search]);

  const handleOpenEvaluation = async (project: Project) => {
    setSelectedProject(project);
    setRemarks("");
    setScores({});
    setCriteriaList([]);

    try {
      // Fetch criteria dynamically for the project's domain
      const criteria = await api.get(`/api/evaluations/criteria?domain=${encodeURIComponent(project.domain)}`);
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
            initialScores[s.criterionId] = s.marks;
          });
        }
      }

      // Ensure all criteria have a value of 0 if not previously score-locked
      criteria.forEach((c: any) => {
        if (initialScores[c._id] === undefined) {
          initialScores[c._id] = 0;
        }
      });

      setScores(initialScores);
    } catch (err: any) {
      setError("Failed to fetch evaluation criteria for this domain.");
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

    const scoresArray = Object.entries(scores).map(([criterionId, marks]) => ({
      criterionId,
      marks,
    }));

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

  const handleAddDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.post("/api/evaluations/domains", {
        name: newDomainName,
        description: newDomainDesc,
      });
      setSuccess(`Domain '${newDomainName}' added successfully.`);
      setNewDomainName("");
      setNewDomainDesc("");
      setShowDomainModal(false);
      fetchDomains();
    } catch (err: any) {
      setError(err.message || "Failed to add new domain.");
    }
  };

  const handleAddCriteriaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.post("/api/evaluations/criteria", {
        domain: newCritDomain,
        name: newCritName,
        maxMarks: newCritMax,
        description: newCritDesc,
      });
      setSuccess(`Evaluation criterion '${newCritName}' added successfully.`);
      setNewCritName("");
      setNewCritDesc("");
      setNewCritMax(20);
      setShowCritModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to add new evaluation criteria.");
    }
  };

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
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
          {user?.target_domain && (
            <p className="text-xs text-slate-500 mt-1">
              Evaluating domain: <span className="font-semibold text-slate-700">{user.target_domain}</span>
            </p>
          )}
        </div>

        {/* Spot add options */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDomainModal(true)}
            className="bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 font-bold px-3 py-2 rounded-xl text-[11px] shadow-sm flex items-center gap-1 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Domain</span>
          </button>
          <button
            onClick={() => setShowCritModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-xl text-[11px] shadow-sm flex items-center gap-1 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Rubric Criteria</span>
          </button>
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
      <GlassCard className="p-4 border-slate-200/50 bg-white/70 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects in your domain..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>
      </GlassCard>

      {/* Project evaluation grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => {
          const myEval = myEvaluations.find(
            (e) => (typeof e.project === "object" ? e.project._id : e.project) === proj._id
          );
          const isEvaluated = !!myEval;
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
                    <span className="text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      {isLocked && <Lock className="w-3 h-3" />}
                      <span>Scores Locked ({myEval.totalMarks} pts)</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">
                      Awaiting Grading
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleOpenEvaluation(proj)}
                  disabled={proj.status === "Registered" /* Can't evaluate unless checked in */}
                  className={`font-bold px-3 py-2 rounded-xl text-[10px] shadow-sm cursor-pointer flex items-center gap-1 transition-all ${
                    proj.status === "Registered"
                      ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      : isLocked
                      ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  title={proj.status === "Registered" ? "Team has not checked in at the entry gates yet." : ""}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isLocked ? "View Scores" : isEvaluated ? "Modify Scores" : "Evaluate Team"}</span>
                </button>
              </div>
            </GlassCard>
          );
        })}

        {projects.length === 0 && (
          <div className="col-span-2 p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-white/70">
            No projects registered under your assigned domain.
          </div>
        )}
      </div>

      {/* Rubric Evaluation Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-lg p-6 bg-white border-slate-200/50 shadow-2xl relative my-8 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {(() => {
              const myEval = myEvaluations.find(
                (e) => (typeof e.project === "object" ? e.project._id : e.project) === selectedProject._id
              );
              const isLocked = myEval?.isLocked || false;

              return (
                <>
                  <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 mb-4">
                    <span className="text-[10px] font-bold text-blue-600 uppercase font-mono">{selectedProject.projectId}</span>
                    <h3 className="font-extrabold text-slate-800 text-base leading-snug">{selectedProject.title}</h3>
                    <span className="text-[10px] text-slate-400 font-medium">Team Name: {selectedProject.teamName}</span>
                  </div>

                  {isLocked && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4 flex-shrink-0" />
                      <span>This evaluation score sheet is locked. Contact an administrator to request overrides.</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitEvaluation} className="flex flex-col gap-4">
                    {criteriaList.map((crit) => (
                      <div key={crit._id} className="flex flex-col gap-1.5 bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800">{crit.name}</span>
                          <span className="text-slate-400 font-bold">Max {crit.maxMarks} pts</span>
                        </div>
                        {crit.description && (
                          <p className="text-[10px] text-slate-400 leading-normal">
                            {crit.description}
                          </p>
                        )}
                        <input
                          type="number"
                          min={0}
                          max={crit.maxMarks}
                          value={scores[crit._id] || 0}
                          onChange={(e) => handleScoreChange(crit._id, e.target.value, crit.maxMarks)}
                          disabled={isLocked}
                          className="w-24 px-3 py-1.5 mt-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                          required
                        />
                      </div>
                    ))}

                    {criteriaList.length === 0 && (
                      <div className="p-4 bg-slate-50 border border-slate-100 text-center rounded-xl text-xs text-slate-500 font-semibold">
                        No rubrics criteria defined for domain '{selectedProject.domain}'. Click 'Add Rubric Criteria' at the top to add criteria.
                      </div>
                    )}

                    {/* Remarks */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Jury Review Comments</label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        disabled={isLocked}
                        placeholder="Provide details of prototype performance..."
                        rows={2}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>

                    {/* Total Calculator Summary */}
                    <div className="mt-2 p-4 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Calculated Score</span>
                        <span className="text-xs font-semibold text-slate-500">Exhibition Rubrics Aggregate</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-blue-600 font-display">{totalScore}</span>
                      </div>
                    </div>

                    {!isLocked && criteriaList.length > 0 && (
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
                </>
              );
            })()}
          </GlassCard>
        </div>
      )}

      {/* Spot Add Domain Modal */}
      {showDomainModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md p-6 bg-white border-slate-200/50 shadow-2xl relative">
            <button
              onClick={() => setShowDomainModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Add New Project Domain</span>
            </h3>

            <form onSubmit={handleAddDomainSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Domain Name *</label>
                <input
                  type="text"
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  placeholder="e.g. Smart Cities"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                <textarea
                  value={newDomainDesc}
                  onChange={(e) => setNewDomainDesc(e.target.value)}
                  placeholder="Domain summary description..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md mt-2 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Add Domain</span>
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Spot Add Criteria Modal */}
      {showCritModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md p-6 bg-white border-slate-200/50 shadow-2xl relative">
            <button
              onClick={() => setShowCritModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>Add New Evaluation Criterion</span>
            </h3>

            <form onSubmit={handleAddCriteriaSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Target Domain *</label>
                <select
                  value={newCritDomain}
                  onChange={(e) => setNewCritDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                >
                  {domains.map((d) => (
                    <option key={d._id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Criterion Name *</label>
                <input
                  type="text"
                  value={newCritName}
                  onChange={(e) => setNewCritName(e.target.value)}
                  placeholder="e.g. Originality & Innovation"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Max Marks *</label>
                <input
                  type="number"
                  value={newCritMax}
                  onChange={(e) => setNewCritMax(parseInt(e.target.value) || 0)}
                  min={1}
                  max={100}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                <textarea
                  value={newCritDesc}
                  onChange={(e) => setNewCritDesc(e.target.value)}
                  placeholder="Explain rubric evaluation standard..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md mt-2 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Add Criterion</span>
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
