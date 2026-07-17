import { useState } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import GlassCard from "../components/GlassCard";
import ProjectCard from "../components/ProjectCard";
import {
  Search,
  MapPin,
  Sparkles,
  Loader2,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import type { Project, Event, Domain } from "../types";

const DOMAINS: Domain[] = [
  "AI / Generative AI",
  "Cybersecurity",
  "IoT & Smart Cities",
  "Disaster Prediction & Response",
  "Healthcare Technology",
  "Climate & Environmental Intelligence",
  "Open Innovation",
];

export default function Projects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Stall Assignment Modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [stallNumber, setStallNumber] = useState("");
  const [detailProject, setDetailProject] = useState<Project | null>(null);

  // 1. Fetch Active Event Query
  const { data: activeEvent = null, isLoading: isActiveEventLoading } = useQuery<Event | null>({
    queryKey: ["active-event"],
    queryFn: async () => {
      try {
        const data = await api.get("/api/events/active");
        if (data && data._id) {
          return data;
        }
      } catch (err) {
        console.log("No active event loaded.");
      }
      return null;
    },
  });

  // 2. Fetch Projects Query
  const { data: projects = [], isLoading: isProjectsLoading, error: queryError } = useQuery<Project[]>({
    queryKey: ["projects", activeEvent?._id, search, domainFilter, statusFilter],
    queryFn: () => {
      let endpoint = "/api/projects";
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (domainFilter) params.push(`domain=${encodeURIComponent(domainFilter)}`);
      if (statusFilter) params.push(`status=${encodeURIComponent(statusFilter)}`);
      if (activeEvent?._id) params.push(`eventId=${activeEvent._id}`);

      if (params.length > 0) {
        endpoint += `?${params.join("&")}`;
      }
      return api.get(endpoint);
    },
    enabled: !!activeEvent?._id,
  });

  // 3. Assign Stall Mutation
  const assignStallMutation = useMutation({
    mutationFn: ({ projectId, stall }: { projectId: string; stall: string }) =>
      api.post(`/api/projects/${projectId}/stall`, { stallNumber: stall.trim().toUpperCase() }),
    onSuccess: () => {
      setSuccess(`Stall allocated to project successfully.`);
      setSelectedProject(null);
      setStallNumber("");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (err: any) => {
      setError(err.message || "Failed to assign stall.");
    },
  });

  // 4. Auto Allocate Mutation
  const autoAllocateMutation = useMutation({
    mutationFn: (eventId: string) =>
      api.post("/api/projects/auto-allocate", { eventId, prefix: "ST-" }),
    onSuccess: (response) => {
      setSuccess(response.message || "Auto allocation complete.");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (err: any) => {
      setError(err.message || "Failed to auto allocate stalls.");
    },
  });


  const handleOpenStallModal = (project: Project) => {
    setSelectedProject(project);
    setStallNumber(project.stallNumber || "");
  };

  const handleAssignStall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setError(null);
    setSuccess(null);
    assignStallMutation.mutate({ projectId: selectedProject._id, stall: stallNumber });
  };

  const handleAutoAllocate = () => {
    if (!activeEvent) return;

    if (
      !window.confirm(
        "Run automatic stall allocation for all projects that currently have no stall assigned? Stalls will be generated sequentially."
      )
    ) {
      return;
    }

    setError(null);
    setSuccess(null);
    autoAllocateMutation.mutate(activeEvent._id);
  };


  const isAdminOrEventCoordinator = user?.role === "super_admin" || user?.role === "event_coordinator";
  const loading = isActiveEventLoading || (isProjectsLoading && !!activeEvent?._id);
  const displayError = error || (queryError ? (queryError as any).message : null);

  if (loading) {
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
            <span>Exhibition Stalls Mappings</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800">Project Stalls</h2>
          {activeEvent && (
            <p className="text-xs text-slate-500 mt-1">
              Active event: <span className="font-semibold text-slate-700">{activeEvent.title}</span>
            </p>
          )}
        </div>

        {isAdminOrEventCoordinator && activeEvent && (
          <button
            onClick={handleAutoAllocate}
            disabled={autoAllocateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
          >
            {autoAllocateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Allocating Stalls...</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span>Auto-Allocate Stalls</span>
              </>
            )}
          </button>
        )}
      </div>

      {!activeEvent && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-sm">No Active Event Configured</span>
            <span className="text-xs text-amber-700/95 leading-relaxed">
              There is currently no active exhibition event configured in the system. An administrator must activate an event in the <strong>Manage Events</strong> dashboard before project stall allocation or viewing can proceed.
            </span>
          </div>
        </div>
      )}

      {displayError && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold">
          {displayError}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-semibold">
          {success}
        </div>
      )}

      {/* Filter and Search Bar */}
      <GlassCard className="p-4 border-slate-200/50 bg-white/70 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, Project ID, or team name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end ml-auto">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Domain:</label>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="">All Domains</option>
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="">All Statuses</option>
              <option value="Registered">Registered</option>
              <option value="Checked In">Checked In</option>
              <option value="Evaluated">Evaluated</option>
              <option value="Winner">Winner</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Projects Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => (
          <ProjectCard
            key={proj._id}
            proj={proj}
            isAdminOrEventCoordinator={isAdminOrEventCoordinator}
            onOpenStallModal={handleOpenStallModal}
            onViewDetails={setDetailProject}
          />
        ))}

        {projects.length === 0 && (
          <div className="col-span-2 p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-white/70">
            {activeEvent ? "No projects found for current criteria." : "Configure an Active exhibition event to see project teams."}
          </div>
        )}
      </div>

      {/* Manual Stall Assignment Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-sm p-6 bg-white border-slate-200/50 shadow-2xl relative">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-extrabold text-slate-800 text-base mb-2">Assign Stall Number</h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-normal">
              Enter a custom stall coordinates identifier for project <span className="font-bold text-slate-700">{selectedProject.projectId}</span>.
            </p>

            <form onSubmit={handleAssignStall} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Stall Code (e.g. ST-001) *</label>
                <input
                  type="text"
                  value={stallNumber}
                  onChange={(e) => setStallNumber(e.target.value)}
                  placeholder="ST-025"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={assignStallMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md mt-2 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
              >
                {assignStallMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Allocating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Allocate Stall</span>
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Project Details Modal */}
      {detailProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-xl p-6 bg-white border-slate-200/50 shadow-2xl relative my-8 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setDetailProject(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-extrabold text-slate-800 text-base mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{detailProject.projectId}</span>
              <span>Project & Team Details</span>
            </h3>

            <div className="flex flex-col gap-5 text-xs">
              {/* Project Info */}
              <div className="flex flex-col gap-3 bg-slate-50/50 border border-slate-100 p-4 rounded-2xl">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Project Title</span>
                  <span className="font-bold text-slate-800 text-sm leading-snug">{detailProject.title}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                    <span className="font-semibold text-slate-700">{detailProject.status}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Stall Number</span>
                    <span className="font-semibold text-slate-700">{detailProject.stallNumber || "Not Allocated"}</span>
                  </div>
                </div>

                {detailProject.domain && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Domain</span>
                    <span className="font-semibold text-slate-700">{detailProject.domain}</span>
                  </div>
                )}

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Abstract</span>
                  <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{detailProject.abstract}</p>
                </div>

                {detailProject.description && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Description</span>
                    <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{detailProject.description}</p>
                  </div>
                )}
              </div>

              {/* Team Info */}
              <div className="flex flex-col gap-3 bg-slate-50/50 border border-slate-100 p-4 rounded-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Team Name</span>
                    <span className="font-bold text-slate-800">{detailProject.teamName}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Guide Teacher</span>
                    <span className="font-bold text-slate-800">{detailProject.guideTeacher}</span>
                  </div>
                </div>
              </div>

              {/* Team Members List */}
              <div className="flex flex-col gap-2.5">
                <h4 className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider">Team Members Details</h4>
                <div className="flex flex-col gap-3">
                  {detailProject.members && (detailProject.members as any[]).map((m, idx) => (
                    <div key={m._id || idx} className="border border-slate-200/60 rounded-xl p-3.5 bg-white shadow-sm flex flex-col gap-2">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                        <span className="font-bold text-slate-800">{m.name}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">{m.gender}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Class/Sec</span>
                          <span>{m.class} - {m.section}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">DOB</span>
                          <span>{m.dob ? new Date(m.dob).toLocaleDateString() : "-"}</span>
                        </div>
                        <div className="flex flex-col col-span-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Contact Details</span>
                          <span>Ph: {m.phone || "-"}</span>
                          <span>Alt: {m.emergencyContact || "-"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
