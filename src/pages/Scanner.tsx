import { useState, useEffect } from "react";
import { api } from "../utils/api";
import GlassCard from "../components/GlassCard";
import {
  Users,
  Plus,
  Search,
  Sparkles,
  Loader2,
  X,
  PlusCircle,
  Trash2,
} from "lucide-react";
import type { Student, Event, School } from "../types";

export default function Scanner() {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  // Modals
  const [activeModal, setActiveModal] = useState<"visitor" | "project" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Visitor Form State
  const [vName, setVName] = useState("");
  const [vGender, setVGender] = useState("Male");
  const [vDob, setVDob] = useState("");
  const [vClass, setVClass] = useState("");
  const [vSection, setVSection] = useState("");
  const [vTeacher, setVTeacher] = useState("");
  const [vContact, setVContact] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vSchoolId, setVSchoolId] = useState("");

  // Presenter Form State
  const [pTitle, setPTitle] = useState("");
  const [pAbstract, setPAbstract] = useState("");
  const [pTeamName, setPTeamName] = useState("");
  const [pGuide, setPGuide] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pSchoolId, setPSchoolId] = useState("");
  const [members, setMembers] = useState<any[]>([
    { name: "", gender: "Male", dob: "", class: "", section: "", emergencyContact: "", phone: "" },
  ]);

  const fetchData = async () => {
    try {
      const evt = await api.get("/api/events/active").catch(() => null);
      if (evt && evt._id) setActiveEvent(evt);

      const schList = await api.get("/api/schools").catch(() => []);
      setSchools(schList);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      let endpoint = "/api/students";
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (categoryFilter) params.push(`category=${encodeURIComponent(categoryFilter)}`);
      if (schoolFilter) params.push(`schoolId=${encodeURIComponent(schoolFilter)}`);
      if (classFilter) params.push(`class=${encodeURIComponent(classFilter)}`);
      if (activeEvent) params.push(`eventId=${activeEvent._id}`);

      if (params.length > 0) {
        endpoint += `?${params.join("&")}`;
      }

      const data = await api.get(endpoint);
      setStudents(data);
    } catch (err: any) {
      setError("Failed to fetch students list.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [activeEvent, search, categoryFilter, schoolFilter, classFilter]);

  const handleAddMember = () => {
    if (members.length >= 4) return;
    setMembers((prev) => [
      ...prev,
      { name: "", gender: "Male", dob: "", class: "", section: "", emergencyContact: "", phone: "" },
    ]);
  };

  const handleRemoveMember = (idx: number) => {
    if (members.length === 1) return;
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMemberChange = (idx: number, field: string, val: string) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: val } : m))
    );
  };

  const handleVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) {
      setError("No active exhibition event selected.");
      return;
    }
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await api.post("/api/students/register-visitor", {
        name: vName,
        gender: vGender,
        dob: new Date(vDob),
        class: vClass,
        section: vSection,
        teacherName: vTeacher,
        emergencyContact: vContact,
        phone: vPhone,
        eventId: activeEvent._id,
        schoolId: vSchoolId,
      });

      setSuccess("Visitor registered and checked in successfully.");
      setActiveModal(null);
      resetVisitorForm();
      fetchStudents();
    } catch (err: any) {
      setError(err.message || "Failed to register visitor.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetVisitorForm = () => {
    setVName("");
    setVGender("Male");
    setVDob("");
    setVClass("");
    setVSection("");
    setVTeacher("");
    setVContact("");
    setVPhone("");
    setVSchoolId("");
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) {
      setError("No active exhibition event selected.");
      return;
    }
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const formattedMembers = members.map((m) => ({
      ...m,
      dob: new Date(m.dob),
      emergencyContact: m.emergencyContact || m.phone || "N/A",
      phone: (m.phone || m.emergencyContact || "N/A").trim(),
    }));

    try {
      await api.post("/api/students/register-project", {
        projectTitle: pTitle,
        projectAbstract: pAbstract,
        teamName: pTeamName,
        guideTeacher: pGuide,
        projectDescription: pDesc,
        members: formattedMembers,
        eventId: activeEvent._id,
        schoolId: pSchoolId,
      });

      setSuccess(`Project Team "${pTeamName}" registered successfully.`);
      setActiveModal(null);
      resetProjectForm();
      fetchStudents();
    } catch (err: any) {
      setError(err.message || "Failed to register presenter team.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetProjectForm = () => {
    setPTitle("");
    setPAbstract("");
    setPTeamName("");
    setPGuide("");
    setPDesc("");
    setPSchoolId("");
    setMembers([{ name: "", gender: "Male", dob: "", class: "", section: "", emergencyContact: "", phone: "" }]);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Volunteer Portal</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800">Student Entry Desk</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setError(null);
              setSuccess(null);
              resetVisitorForm();
              setActiveModal("visitor");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Register Visitor</span>
          </button>

          <button
            onClick={() => {
              setError(null);
              setSuccess(null);
              resetProjectForm();
              setActiveModal("project");
            }}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span>Register Presenter Team</span>
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
      <GlassCard className="p-4 border-slate-200/50 bg-white/70 shadow-sm flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, reg no, class..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
          >
            <option value="">All Schools</option>
            {schools.map((sch) => (
              <option key={sch._id} value={sch._id}>
                {sch.name}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Visitor">Visitor</option>
            <option value="Project Presenter">Project Presenter</option>
          </select>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
          >
            <option value="">All Classes</option>
            {["6", "7", "8", "9", "10", "11", "12"].map((cls) => (
              <option key={cls} value={cls}>
                Class {cls}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Registrations List */}
      <GlassCard className="border-slate-200/50 bg-white/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                <th className="p-4">Reg Number</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">School Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Class & Section</th>
                <th className="p-4">Accompanying Teacher</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
              {students.map((st) => {
                const schoolName = typeof st.school === "object" && st.school?.name ? st.school.name : "N/A";
                return (
                  <tr key={st._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-blue-600 font-mono">{st.registrationNumber}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800">{st.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{st.gender}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 max-w-[200px] truncate" title={schoolName}>
                      {schoolName}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          st.category === "Visitor"
                            ? "bg-slate-50 text-slate-600 border-slate-200"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}
                      >
                        {st.category}
                      </span>
                    </td>
                    <td className="p-4">Class {st.class}-{st.section}</td>
                    <td className="p-4">{st.teacherName}</td>
                    <td className="p-4 text-center">
                      <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full">
                        Checked In
                      </span>
                    </td>
                  </tr>
                );
              })}

              {students.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No student registrations found for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Visitor Modal */}
      {activeModal === "visitor" && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-md p-6 bg-white border-slate-200/50 shadow-2xl relative my-8">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Register Visitor Student</span>
            </h3>

            <form onSubmit={handleVisitorSubmit} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Student Name *</label>
                <input
                  type="text"
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  placeholder="Student Full Name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">School *</label>
                <select
                  value={vSchoolId}
                  onChange={(e) => setVSchoolId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                  required
                >
                  <option value="">Select School</option>
                  {schools.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Gender *</label>
                  <select
                    value={vGender}
                    onChange={(e) => setVGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth *</label>
                  <input
                    type="date"
                    value={vDob}
                    onChange={(e) => setVDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Class *</label>
                  <input
                    type="text"
                    value={vClass}
                    onChange={(e) => setVClass(e.target.value)}
                    placeholder="8"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Section *</label>
                  <input
                    type="text"
                    value={vSection}
                    onChange={(e) => setVSection(e.target.value)}
                    placeholder="A"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Accompanying Teacher *</label>
                <input
                  type="text"
                  value={vTeacher}
                  onChange={(e) => setVTeacher(e.target.value)}
                  placeholder="Teacher Name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Emergency Contact *</label>
                  <input
                    type="text"
                    value={vContact}
                    onChange={(e) => setVContact(e.target.value)}
                    placeholder="Parent/Guardian Phone"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Student Mobile *</label>
                  <input
                    type="text"
                    value={vPhone}
                    onChange={(e) => setVPhone(e.target.value)}
                    placeholder="Student Mobile Number"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs shadow-md mt-2 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Register & Check In</span>}
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Project Presenter Team Modal */}
      {activeModal === "project" && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-2xl p-6 bg-white border-slate-200/50 shadow-2xl relative my-8">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Register Project Presenter Team</span>
            </h3>

            <form onSubmit={handleProjectSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Project Title *</label>
                  <input
                    type="text"
                    value={pTitle}
                    onChange={(e) => setPTitle(e.target.value)}
                    placeholder="E.g. Smart Solar Grid"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">School *</label>
                  <select
                    value={pSchoolId}
                    onChange={(e) => setPSchoolId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                    required
                  >
                    <option value="">Select School</option>
                    {schools.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Team Name *</label>
                  <input
                    type="text"
                    value={pTeamName}
                    onChange={(e) => setPTeamName(e.target.value)}
                    placeholder="E.g. Innovators Team A"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Guide Teacher Name *</label>
                  <input
                    type="text"
                    value={pGuide}
                    onChange={(e) => setPGuide(e.target.value)}
                    placeholder="Guide Teacher Name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Project Abstract *</label>
                <textarea
                  value={pAbstract}
                  onChange={(e) => setPAbstract(e.target.value)}
                  placeholder="Brief summary of the project innovation..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  required
                />
              </div>

              {/* Members */}
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Team Members (Max 4)</label>
                  {members.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Member</span>
                    </button>
                  )}
                </div>

                {members.map((m, idx) => (
                  <div key={idx} className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-xl flex flex-col gap-2 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Member #{idx + 1}</span>
                      {members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(idx)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Student Name *"
                        value={m.name}
                        onChange={(e) => handleMemberChange(idx, "name", e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                        required
                      />
                      <select
                        value={m.gender}
                        onChange={(e) => handleMemberChange(idx, "gender", e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <input
                        type="date"
                        value={m.dob}
                        onChange={(e) => handleMemberChange(idx, "dob", e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Class *"
                        value={m.class}
                        onChange={(e) => handleMemberChange(idx, "class", e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Section *"
                        value={m.section}
                        onChange={(e) => handleMemberChange(idx, "section", e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Student Mobile *"
                        value={m.phone}
                        onChange={(e) => handleMemberChange(idx, "phone", e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs shadow-md mt-2 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Register Presenter Team</span>}
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
