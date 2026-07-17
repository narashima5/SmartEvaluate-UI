import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import GlassCard from "../components/GlassCard";
import {
  Users,
  Plus,
  Trash2,
  Search,
  QrCode,
  Check,
  AlertCircle,
  Loader2,
  X,
  Printer,
  Sparkles,
  Upload,
  Download,
} from "lucide-react";
import type { Student, Event } from "../types";

export default function Registrations() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modal Controls
  const [activeModal, setActiveModal] = useState<"visitor" | "project" | "ticket" | "bulk" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [ticketToken, setTicketToken] = useState<string | null>(null);
  const [signingTicket, setSigningTicket] = useState(false);

  // Visitor Form State
  const [vName, setVName] = useState("");
  const [vGender, setVGender] = useState("Male");
  const [vDob, setVDob] = useState("");
  const [vClass, setVClass] = useState("");
  const [vSection, setVSection] = useState("");
  const [vTeacher, setVTeacher] = useState("");
  const [vContact, setVContact] = useState("");
  const [vPhone, setVPhone] = useState("");

  // Project Presenter Form State
  const [pTitle, setPTitle] = useState("");
  const [pAbstract, setPAbstract] = useState("");
  const [pTeamName, setPTeamName] = useState("");
  const [pGuide, setPGuide] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pSchoolId, setPSchoolId] = useState("");

  // Members list (dynamic rows)
  const [members, setMembers] = useState<any[]>([
    { name: "", gender: "Male", dob: "", class: "", section: "", emergencyContact: "", phone: "" },
  ]);

  // Bulk Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");




  const fetchActiveEvent = async () => {
    try {
      const data = await api.get("/api/events/active");
      if (data && data._id) {
        setActiveEvent(data);
      }
    } catch (err) {
      console.log("No active event loaded.");
    }
  };

  const fetchStudents = async () => {
    try {
      let endpoint = "/api/students";
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (categoryFilter) params.push(`category=${encodeURIComponent(categoryFilter)}`);
      if (activeEvent) params.push(`eventId=${activeEvent._id}`);
      
      if (params.length > 0) {
        endpoint += `?${params.join("&")}`;
      }

      const data = await api.get(endpoint);
      setStudents(data);
    } catch (err: any) {
      setError(err.message || "Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveEvent();
    if (user?.role === "super_admin" || user?.role === "school_coordinator") {
      api.get("/api/schools").then(setSchools).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (activeEvent) {
      fetchStudents();
    } else {
      setLoading(false);
    }
  }, [activeEvent, search, categoryFilter]);

  const handleAddMember = () => {
    if (members.length >= 4) return; // Limit 4 per project
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

  // Submit Visitor
  const handleVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!activeEvent) {
      setError("No active science exhibition event available for registration.");
      return;
    }

    if (!vPhone || vPhone.trim().length < 8) {
      setError("Please provide a valid student phone number (mandatory field).");
      return;
    }

    try {
      await api.post("/api/students/register-visitor", {
        name: vName,
        gender: vGender,
        dob: new Date(vDob),
        class: vClass,
        section: vSection,
        teacherName: vTeacher,
        emergencyContact: vContact,
        phone: vPhone.trim(),
        eventId: activeEvent._id,
      });

      setSuccess("Visitor student registered successfully.");
      setActiveModal(null);
      resetVisitorForm();
      fetchStudents();
    } catch (err: any) {
      setError(err.message || "Failed to register visitor.");
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
  };

  // Submit Project Presenters
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!activeEvent) {
      setError("No active science exhibition event available for registration.");
      return;
    }

    // Validate members
    for (const m of members) {
      if (!m.name || !m.dob || !m.class || !m.section || !m.emergencyContact || !m.phone) {
        setError("Please complete details for all project team members. Student phone number is a mandatory field.");
        return;
      }
      if (m.phone.trim().length < 8) {
        setError(`Please provide a valid phone number for student ${m.name}.`);
        return;
      }
    }

    if (!pSchoolId) {
      setError("Please select a school.");
      return;
    }

    try {
      await api.post("/api/students/register-project", {
        projectTitle: pTitle,
        projectAbstract: pAbstract,
        projectDomain: "",
        teamName: pTeamName,
        guideTeacher: pGuide,
        requiredEquipment: "",
        projectDescription: pDesc,
        eventId: activeEvent._id,
        schoolId: pSchoolId,
        members: members.map((m) => ({
          ...m,
          dob: new Date(m.dob),
          phone: m.phone.trim(),
        })),
      });

      setSuccess("Project and team members registered successfully.");
      setActiveModal(null);
      resetProjectForm();
      fetchStudents();
    } catch (err: any) {
      setError(err.message || "Failed to register project.");
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



  // Ticket Modal setup
  const handleOpenTicket = async (student: Student) => {
    setSelectedStudent(student);
    setTicketToken(null);
    setSigningTicket(true);
    setActiveModal("ticket");

    try {
      const data = await api.get(`/api/checkin/sign/${student._id}`);
      setTicketToken(data.token);
    } catch (err: any) {
      setError(err.message || "Failed to generate ticket signature.");
      setActiveModal(null);
    } finally {
      setSigningTicket(false);
    }
  };

  const handlePrintTicket = () => {
    window.print();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this registration? For presenters, this removes their association to their projects.")) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/api/students/${id}`);
      setSuccess("Registration removed successfully.");
      fetchStudents();
    } catch (err: any) {
      setError(err.message || "Failed to remove registration.");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await api.get("/api/students/template");
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Science_Expo_Bulk_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      setError(err.message || "Failed to download template.");
    }
  };

  const handleBulkUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !activeEvent) return;

    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("eventId", activeEvent._id);
    if (user?.role === "super_admin") {
      if (!selectedSchoolId) {
        setError("Please select a school first.");
        setSubmitting(false);
        return;
      }
      formData.append("schoolId", selectedSchoolId);
    }

    try {
      const response = await api.post("/api/students/bulk-upload", formData);
      setSuccess(response.message || "Bulk upload completed successfully.");
      setActiveModal(null);
      setUploadFile(null);
      fetchStudents();
    } catch (err: any) {
      setError(err.message || "Failed to process bulk upload.");
    } finally {
      setSubmitting(false);
    }
  };

  // Coordinator school registration check
  const isCoordinatorUnconfigured = user?.role === "school_coordinator" && !user?.school;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isCoordinatorUnconfigured) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center max-w-sm mx-auto">
        <AlertCircle className="w-12 h-12 text-amber-500" />
        <h3 className="font-bold text-slate-800 text-lg">School Profile Unconfigured</h3>
        <p className="text-xs text-slate-500 leading-normal">
          You must set up your school coordinates profile before registering students or downloading tickets.
        </p>
        <a
          href="/school-profile"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-md"
        >
          Setup Profile Now
        </a>
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
            <span>Registration Management</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800">Registrations Hub</h2>
          {activeEvent && (
            <p className="text-xs text-slate-500 mt-1">
              Active registrations for: <span className="font-semibold text-slate-700">{activeEvent.title}</span>
            </p>
          )}
        </div>

        {/* Action buttons */}
        {activeEvent && activeEvent.status === "active" && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveModal("visitor")}
              className="bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Visitor</span>
            </button>
            <button
              onClick={() => setActiveModal("project")}
              className="bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register Team</span>
            </button>
            <button
              onClick={() => {
                setActiveModal("bulk");
                setUploadFile(null);
              }}
              className="bg-blue-655 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Bulk Upload</span>
            </button>

          </div>
        )}
      </div>

      {!activeEvent && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-sm">No Active Event Configured</span>
            <span className="text-xs text-amber-700/95 leading-relaxed">
              There is currently no active exhibition event configured in the system. An administrator must activate an event in the <strong>Manage Events</strong> dashboard before registrations can proceed.
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold whitespace-pre-line leading-relaxed">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-semibold">
          {success}
        </div>
      )}

      {/* Filter and Search Bar */}
      <GlassCard className="p-4 border-slate-200/50 bg-white/70 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, reg number, class, or escort..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <label className="text-xs font-bold text-slate-400 uppercase">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="">All Categories</option>
            <option value="Visitor">Visitor</option>
            <option value="Project Presenter">Project Presenter</option>
          </select>
        </div>
      </GlassCard>

      {/* Registrations List */}
      <GlassCard className="border-slate-200/50 bg-white/70 shadow-sm overflow-hidden">
        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                <th className="p-4">Reg Number</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Class & Section</th>
                {user?.role === "super_admin" && <th className="p-4">School</th>}
                <th className="p-4">Accompanying Teacher</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
              {students.map((st) => (
                <tr key={st._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-blue-600">{st.registrationNumber}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800">{st.name}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{st.gender}</span>
                    </div>
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
                  <td className="p-4">
                    Class {st.class}-{st.section}
                  </td>
                  {user?.role === "super_admin" && (
                    <td className="p-4 max-w-[150px] truncate" title={typeof st.school === "object" ? st.school.name : ""}>
                      {typeof st.school === "object" ? st.school.name : st.school}
                    </td>
                  )}
                  <td className="p-4">{st.teacherName}</td>
                  <td className="p-4 text-center">
                    {st.checkedIn ? (
                      <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full">
                        Checked In
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold bg-slate-100 text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full">
                        Registered
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenTicket(st)}
                        className="flex items-center gap-1 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer shadow-sm"
                        title="Download digital entry QR ticket"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Ticket</span>
                      </button>
                      
                      {(!activeEvent || activeEvent.status === "active") && (
                        <button
                          onClick={() => handleDelete(st._id)}
                          className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer"
                          title="Remove registration"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {students.length === 0 && (
                <tr>
                  <td colSpan={user?.role === "super_admin" ? 8 : 7} className="p-12 text-center text-slate-400">
                    {activeEvent ? "No registrations match current filters." : "Configure an Active exhibition event to begin."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {students.map((st) => (
            <div key={st._id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-blue-600 font-mono text-xs">{st.registrationNumber}</span>
                  <span className="font-bold text-slate-800 text-sm">{st.name}</span>
                  <span className="text-[10px] text-slate-400 capitalize">{st.gender}</span>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      st.category === "Visitor"
                        ? "bg-slate-50 text-slate-600 border-slate-200"
                        : "bg-blue-50 text-blue-600 border-blue-100"
                    }`}
                  >
                    {st.category}
                  </span>
                  {st.checkedIn ? (
                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full">
                      Checked In
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full">
                      Registered
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs border-t border-slate-50 pt-2.5 text-slate-500">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Class & Sec</span>
                  <span className="font-semibold text-slate-700">Class {st.class}-{st.section}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Teacher Escort</span>
                  <span className="font-semibold text-slate-700 truncate block">{st.teacherName}</span>
                </div>
                {user?.role === "super_admin" && (
                  <div className="col-span-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">School</span>
                    <span className="font-semibold text-slate-700 truncate block" title={typeof st.school === "object" ? st.school.name : ""}>
                      {typeof st.school === "object" ? st.school.name : st.school}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-50 pt-2.5 mt-1">
                <button
                  onClick={() => handleOpenTicket(st)}
                  className="flex items-center justify-center gap-1.5 flex-grow bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Ticket</span>
                </button>
                {(!activeEvent || activeEvent.status === "active") && (
                  <button
                    onClick={() => handleDelete(st._id)}
                    className="flex items-center justify-center bg-white hover:bg-red-50 text-red-500 hover:text-red-600 rounded-xl border border-slate-200 hover:border-red-100 p-2.5 transition-all cursor-pointer"
                    title="Remove registration"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {students.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              {activeEvent ? "No registrations match current filters." : "Configure an Active exhibition event to begin."}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Bulk Upload Modal */}
      {activeModal === "bulk" && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md p-6 bg-white border-slate-200/50 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-extrabold text-slate-800 text-base mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-655" />
              <span>Bulk Student Import</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">Upload an Excel sheet of students. New visitor students will be automatically marked as checked-in.</p>

            <form onSubmit={handleBulkUploadSubmit} className="flex flex-col gap-4">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="w-full border border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Excel Template</span>
              </button>

              {user?.role === "super_admin" && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target School *</label>
                  <select
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
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

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Excel File *</label>
                <input
                  type="file"
                  required
                  accept=".xlsx, .xls"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      setUploadFile(files[0]);
                    }
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !uploadFile}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs shadow-md mt-2 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Upload...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Upload & Import</span>
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Visitor Registration Modal */}
      {activeModal === "visitor" && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md p-6 bg-white border-slate-200/50 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Register Individual Visitor</span>
            </h3>

            <form onSubmit={handleVisitorSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Student Name *</label>
                <input
                  type="text"
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  required
                />
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Class (Numeric) *</label>
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
                  placeholder="Mrs. Susan Green"
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
                    placeholder="9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Student Phone *</label>
                  <input
                    type="text"
                    value={vPhone}
                    onChange={(e) => setVPhone(e.target.value)}
                    placeholder="9876543211"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md mt-2 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Registration</span>
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Project Presenter Team Registration Modal */}
      {activeModal === "project" && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-2xl p-6 bg-white border-slate-200/50 shadow-2xl relative my-8 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Register Project Presenter Team</span>
            </h3>

            <form onSubmit={handleProjectSubmit} className="flex flex-col gap-5">
              {/* Project Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Team Name *</label>
                  <input
                    type="text"
                    value={pTeamName}
                    onChange={(e) => setPTeamName(e.target.value)}
                    placeholder="Team Innovators"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">School *</label>
                  <select
                    value={pSchoolId}
                    onChange={(e) => setPSchoolId(e.target.value)}
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
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Project Title *</label>
                <input
                  type="text"
                  value={pTitle}
                  onChange={(e) => setPTitle(e.target.value)}
                  placeholder="IoT Controlled vertical greenhouse"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Project Abstract *</label>
                <textarea
                  value={pAbstract}
                  onChange={(e) => setPAbstract(e.target.value)}
                  placeholder="Summary of project prototype..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Guide Teacher *</label>
                <input
                  type="text"
                  value={pGuide}
                  onChange={(e) => setPGuide(e.target.value)}
                  placeholder="Mr. Alan Parker"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  required
                />
              </div>

              {/* Members section */}
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-700 text-xs">Team Members (1-4 Students)</h4>
                  {members.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Member</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  {members.map((m, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-3 relative">
                      {members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(idx)}
                          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      
                      <span className="text-[10px] font-bold text-blue-600 uppercase">Student #{idx + 1}</span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-slate-400">Full Name *</label>
                          <input
                            type="text"
                            value={m.name}
                            onChange={(e) => handleMemberChange(idx, "name", e.target.value)}
                            placeholder="Alice Smith"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-bold text-slate-400">Gender *</label>
                            <select
                              value={m.gender}
                              onChange={(e) => handleMemberChange(idx, "gender", e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400">DOB *</label>
                            <input
                              type="date"
                              value={m.dob}
                              onChange={(e) => handleMemberChange(idx, "dob", e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400">Class *</label>
                          <input
                            type="text"
                            value={m.class}
                            onChange={(e) => handleMemberChange(idx, "class", e.target.value)}
                            placeholder="10"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400">Section *</label>
                          <input
                            type="text"
                            value={m.section}
                            onChange={(e) => handleMemberChange(idx, "section", e.target.value)}
                            placeholder="A"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400">Emergency Mobile *</label>
                          <input
                            type="text"
                            value={m.emergencyContact}
                            onChange={(e) => handleMemberChange(idx, "emergencyContact", e.target.value)}
                            placeholder="9998887770"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400">Student Phone *</label>
                          <input
                            type="text"
                            value={m.phone || ""}
                            onChange={(e) => handleMemberChange(idx, "phone", e.target.value)}
                            placeholder="9998887771"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md mt-2 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Submit Team Registration</span>
              </button>
            </form>
          </GlassCard>
        </div>
      )}



      {/* QR Ticket Modal (Printable) */}
      {activeModal === "ticket" && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 ticket-modal-overlay">
          <div className="bg-white border border-slate-200/50 shadow-2xl rounded-3xl p-6 w-full max-w-sm relative flex flex-col gap-6 ticket-card">
            {/* Close */}
            <button
              onClick={() => {
                setActiveModal(null);
                setSelectedStudent(null);
                setTicketToken(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 no-print"
            >
              <X className="w-5 h-5" />
            </button>

            {signingTicket ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-xs text-slate-400 font-medium">Signing ticket signature...</span>
              </div>
            ) : (
              <>
                {/* Print Ticket Layout */}
                <div id="print-area" className="flex flex-col text-center items-center gap-4 relative">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">SCIENCE EXPO TICKET</span>
                    <h4 className="font-extrabold text-slate-800 text-lg leading-tight mt-1">{activeEvent?.title || "National Science Exhibition"}</h4>
                    <span className="text-[9px] font-semibold text-slate-400 leading-none mt-0.5">{activeEvent?.venue}</span>
                  </div>

                  {/* QR Code Container */}
                  <div className="p-3 border-2 border-dashed border-blue-200 bg-blue-50/20 rounded-2xl flex items-center justify-center shadow-inner">
                    {ticketToken ? (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticketToken)}`}
                        alt="Signed QR Ticket"
                        className="w-36 h-36"
                      />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center text-[10px] text-red-500 font-semibold bg-white rounded-xl border border-red-100 p-3 leading-normal">
                        Signature verification failed.
                      </div>
                    )}
                  </div>

                  {/* Ticket Details */}
                  <div className="flex flex-col gap-3 text-xs w-full text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-400">Student Name</span>
                      <span className="font-bold text-slate-800">{selectedStudent.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-400">Class & Section</span>
                      <span className="font-bold text-slate-800">Class {selectedStudent.class}-{selectedStudent.section}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-400">Registration Number</span>
                      <span className="font-mono font-bold text-blue-600">{selectedStudent.registrationNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-400">Category</span>
                      <span className="font-bold text-slate-800">{selectedStudent.category}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-50 pt-2.5">
                      <span className="font-semibold text-slate-400">School Code</span>
                      <span className="font-bold text-slate-800 uppercase">
                        {typeof selectedStudent.school === "object" ? selectedStudent.school.code : "School-101"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Print button */}
                <button
                  onClick={handlePrintTicket}
                  disabled={!ticketToken}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs shadow-md no-print flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Ticket</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CSS printable rule */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 50%;
            top: 40%;
            transform: translate(-50%, -50%);
            width: 100%;
            max-width: 320px;
          }
          .no-print {
            display: none !important;
          }
          .ticket-modal-overlay {
            background: white !important;
            backdrop-filter: none !important;
          }
          .ticket-card {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
