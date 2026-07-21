import { useState, useEffect } from "react";
import { api } from "../utils/api";
import GlassCard from "../components/GlassCard";
import {
  Users as UsersIcon,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  X,
  Award,
  Loader2,
  Sparkles,
  Layers,
} from "lucide-react";
import type { User, School } from "../types";

export default function Users() {
  const [activeTab, setActiveTab] = useState<"users" | "jury">("users");

  const [usersList, setUsersList] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // User Add/Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("jury");
  const [schoolId, setSchoolId] = useState("");
  const [targetDomain, setTargetDomain] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Jury Evaluation Modal state
  const [selectedJury, setSelectedJury] = useState<User | null>(null);
  const [juryEvals, setJuryEvals] = useState<any[]>([]);
  const [loadingEvals, setLoadingEvals] = useState(false);

  // Fetch Users & Schools
  const fetchUsersData = async () => {
    setLoadingUsers(true);
    try {
      const data = await api.get("/api/auth/users");
      setUsersList(data || []);
    } catch (err: any) {
      console.error("Failed to fetch users", err);
      setError(err.message || "Failed to load users list.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchSchoolsData = async () => {
    try {
      const data = await api.get("/api/schools");
      setSchools(data || []);
    } catch (err) {
      console.error("Failed to fetch schools", err);
    }
  };

  useEffect(() => {
    fetchUsersData();
    fetchSchoolsData();
  }, []);

  const resetForm = () => {
    setEditingUser(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("jury");
    setSchoolId("");
    setTargetDomain("");
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setUsername(u.username || "");
    setEmail(u.email || "");
    setPassword(""); // Keep blank unless resetting
    setRole(u.role || "jury");
    setSchoolId(typeof u.school === "object" ? u.school?._id || "" : u.school || "");
    setTargetDomain(u.target_domain || "");
    setShowModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      if (editingUser) {
        // Update user
        const payload: any = {
          username,
          email,
          role,
          schoolId: schoolId || null,
          target_domain: targetDomain || null,
        };
        if (password.trim()) {
          payload.password = password.trim();
        }

        await api.put(`/api/auth/users/${editingUser.id || (editingUser as any)._id}`, payload);
        setSuccess(`User '${username}' updated successfully.`);
      } else {
        // Create user
        await api.post("/api/auth/create-user", {
          username,
          email,
          password,
          role,
          schoolId: schoolId || null,
          target_domain: targetDomain || null,
        });
        setSuccess(`New user '${username}' created successfully.`);
      }

      setShowModal(false);
      resetForm();
      fetchUsersData();
    } catch (err: any) {
      console.error("Save User Error:", err);
      setError(err.message || "Failed to save user.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (u: User) => {
    const userId = u.id || (u as any)._id;
    if (!window.confirm(`Are you sure you want to delete user '${u.username}'? This action cannot be undone.`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/api/auth/users/${userId}`);
      setSuccess(`User '${u.username}' deleted successfully.`);
      fetchUsersData();
    } catch (err: any) {
      setError(err.message || "Failed to delete user.");
    }
  };

  // View Jury Evaluated Students
  const handleViewJuryEvaluations = async (juryUser: User) => {
    setSelectedJury(juryUser);
    setJuryEvals([]);
    setLoadingEvals(true);
    const juryId = juryUser.id || (juryUser as any)._id;

    try {
      const data = await api.get(`/api/evaluations/jury/${juryId}`);
      setJuryEvals(data || []);
    } catch (err: any) {
      console.error("Failed to load jury evaluations", err);
    } finally {
      setLoadingEvals(false);
    }
  };

  // Filtered users list
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const juryMembers = usersList.filter((u) => u.role === "jury");

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Administrative Controls</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800">User Management & Jury Hub</h2>
          <p className="text-xs text-slate-500">
            Create, edit, delete system users and review detailed student evaluations per jury member.
          </p>
        </div>

        {/* Tab Navigation & Add User Button */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "users" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All Users ({usersList.length})
            </button>
            <button
              onClick={() => setActiveTab("jury")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "jury" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Jury Evaluations ({juryMembers.length})
            </button>
          </div>

          {activeTab === "users" && (
            <button
              onClick={handleOpenAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-semibold leading-relaxed flex items-center gap-2">
          <X className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-semibold leading-relaxed flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* TAB 1: ALL USERS */}
      {activeTab === "users" && (
        <div className="flex flex-col gap-4">
          {/* Filters */}
          <GlassCard className="p-4 border-slate-200/50 bg-white/70 shadow-sm flex flex-col md:flex-row items-center gap-3 justify-between">
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-blue-500 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-xs font-bold text-slate-400 uppercase">Filter Role:</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 shadow-sm"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="event_coordinator">Event Coordinator</option>
                <option value="school_coordinator">School Coordinator</option>
                <option value="jury">Jury Member</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
          </GlassCard>

          {/* Users Table */}
          <GlassCard className="p-0 border-slate-200/50 bg-white/80 shadow-sm overflow-hidden">
            {loadingUsers ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-xs text-slate-400">Loading system users...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">School / Domain</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const schoolName = typeof u.school === "object" ? u.school?.name : "N/A";
                      return (
                        <tr key={u.id || (u as any)._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center uppercase">
                              {u.username.charAt(0)}
                            </div>
                            <span>{u.username}</span>
                          </td>
                          <td className="p-4 text-slate-600 font-medium">{u.email}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                u.role === "super_admin"
                                  ? "bg-purple-50 text-purple-700 border-purple-100"
                                  : u.role === "jury"
                                  ? "bg-blue-50 text-blue-700 border-blue-100"
                                  : u.role === "school_coordinator"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : u.role === "event_coordinator"
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                  : "bg-amber-50 text-amber-700 border-amber-100"
                              }`}
                            >
                              {u.role.replace("_", " ")}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 max-w-[200px] truncate">
                            {u.role === "school_coordinator"
                              ? schoolName
                              : u.target_domain || "All Domains"}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                u.isApproved !== false
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : "bg-amber-50 text-amber-600 border-amber-100"
                              }`}
                            >
                              {u.isApproved !== false ? "Approved" : "Pending"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditModal(u)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit User"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-400 text-xs">
                          No users found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* TAB 2: JURY MEMBERS & EVALUATED STUDENTS */}
      {activeTab === "jury" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {juryMembers.map((j) => (
              <GlassCard
                key={j.id || (j as any)._id}
                className="p-5 border-slate-200/50 bg-white/70 shadow-sm flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 font-extrabold text-sm flex items-center justify-center uppercase">
                        {j.username.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-bold text-slate-800 text-sm leading-snug">{j.username}</h4>
                        <span className="text-xs text-slate-500">{j.email}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 uppercase">
                      Jury
                    </span>
                  </div>

                  {j.target_domain && (
                    <div className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 p-2 rounded-xl flex items-center gap-1.5 mt-2">
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      <span>Domain: <strong>{j.target_domain}</strong></span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleViewJuryEvaluations(j)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>View Evaluated Students & Marks</span>
                </button>
              </GlassCard>
            ))}

            {juryMembers.length === 0 && (
              <div className="col-span-full bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
                No Jury members registered in the system.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-md p-6 bg-white border-slate-200/50 shadow-2xl relative my-8">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <UsersIcon className="w-5 h-5 text-blue-600" />
              <span>{editingUser ? "Edit User Account" : "Create New User Account"}</span>
            </h3>

            <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Username *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="john_doe"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  {editingUser ? "Password (Leave blank to keep existing)" : "Password *"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  required={!editingUser}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">User Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white font-semibold"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="event_coordinator">Event Coordinator</option>
                  <option value="school_coordinator">School Coordinator</option>
                  <option value="jury">Jury Member</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>

              {role === "school_coordinator" && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Assigned School *</label>
                  <select
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                    required
                  >
                    <option value="">Select a school...</option>
                    {schools.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {role === "jury" && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Domain Filter (Optional)</label>
                  <input
                    type="text"
                    value={targetDomain}
                    onChange={(e) => setTargetDomain(e.target.value)}
                    placeholder="e.g. Robotics, Environmental Science"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md mt-2 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Saving..." : editingUser ? "Update Account" : "Create Account"}
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Jury Evaluated Students & Marks Breakdown Modal */}
      {selectedJury && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-3xl p-6 bg-white border-slate-200/50 shadow-2xl relative my-8 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedJury(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 font-extrabold text-sm flex items-center justify-center uppercase">
                {selectedJury.username.charAt(0)}
              </div>
              <div className="flex flex-col">
                <h3 className="font-extrabold text-slate-800 text-base leading-snug">
                  Evaluated Students & Projects — {selectedJury.username}
                </h3>
                <span className="text-xs text-slate-500 font-medium">{selectedJury.email}</span>
              </div>
            </div>

            {loadingEvals ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-xs text-slate-400 font-medium">Fetching evaluation records...</span>
              </div>
            ) : juryEvals.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
                This jury member has not submitted any project evaluations yet.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {juryEvals.map((ev, idx) => {
                  const proj = ev.project || {};
                  const members = proj.members || [];
                  return (
                    <div key={ev._id || idx} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col gap-4">
                      {/* Project Header */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200/80 pb-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {proj.projectId || "PRJ"}
                            </span>
                            <span className="font-bold text-slate-800 text-sm">{proj.title || "Untitled Project"}</span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium">Team: {proj.teamName || "N/A"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-3 py-1 rounded-xl border border-blue-200 font-mono">
                            Awarded: {ev.totalMarks} pts
                          </span>
                        </div>
                      </div>

                      {/* Criteria breakdown */}
                      {ev.scores && ev.scores.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {ev.scores.map((s: any, sIdx: number) => (
                            <span key={sIdx} className="text-[10px] font-semibold bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-600">
                              {s.criteriaName || `Criteria ${sIdx + 1}`}: <strong className="text-slate-800 font-bold">{s.score}</strong>
                            </span>
                          ))}
                        </div>
                      )}

                      {ev.remarks && (
                        <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 italic">
                          "{ev.remarks}"
                        </p>
                      )}

                      {/* Students List */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Evaluated Students ({members.length})
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {members.map((m: any, mIdx: number) => {
                            const schoolName = typeof m.school === "object" ? m.school?.name : "N/A";
                            return (
                              <div key={m._id || mIdx} className="bg-white border border-slate-200/80 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-800">{m.name}</span>
                                  <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                    {m.registrationNumber || "N/A"}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                                  <span>Class: <strong>{m.class ? `${m.class}-${m.section}` : "N/A"}</strong></span>
                                  <span>Phone: <strong>{m.phone || m.emergencyContact || "N/A"}</strong></span>
                                </div>
                                <span className="text-[10px] text-slate-400 truncate">School: {schoolName}</span>
                              </div>
                            );
                          })}

                          {members.length === 0 && (
                            <span className="text-xs text-slate-400 italic">No student members found for this project.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
