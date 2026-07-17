import { useState, useEffect } from "react";
import { api } from "../utils/api";
import GlassCard from "../components/GlassCard";
import { School as SchoolIcon, Search, Phone, Sparkles, Trash2, Plus, X } from "lucide-react";
import type { School } from "../types";

export default function Schools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Add School form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [inChargeName, setInChargeName] = useState("");
  const [coordinatorEmail, setCoordinatorEmail] = useState("");
  const [coordinatorMobile, setCoordinatorMobile] = useState("");
  const [teachersCount, setTeachersCount] = useState(0);
  const [emergencyContact, setEmergencyContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSchools = async () => {
    try {
      let endpoint = "/api/schools";
      if (search) endpoint += `?search=${encodeURIComponent(search)}`;
      
      const data = await api.get(endpoint);
      setSchools(data);
    } catch (err: any) {
      setError(err.message || "Failed to load schools.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [search]);

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await api.post("/api/schools", {
        name,
        code,
        address,
        district,
        state,
        pincode,
        principalName,
        inChargeName,
        coordinatorEmail,
        coordinatorMobile,
        teachersCount,
        emergencyContact,
      });

      setSuccess("School registered successfully!");
      setShowAddForm(false);
      // Reset form
      setName("");
      setCode("");
      setAddress("");
      setDistrict("");
      setState("");
      setPincode("");
      setPrincipalName("");
      setInChargeName("");
      setCoordinatorEmail("");
      setCoordinatorMobile("");
      setTeachersCount(0);
      setEmergencyContact("");
      
      fetchSchools();
    } catch (err: any) {
      setError(err.message || "Failed to register school.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this school profile? All associated students and projects will need to be re-associated.")) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/api/schools/${id}`);
      setSuccess("School profile removed successfully.");
      fetchSchools();
    } catch (err: any) {
      setError(err.message || "Failed to delete school.");
    }
  };

  if (loading && schools.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Institutes Ledger</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800">Manage Schools</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-500/10 transition-all duration-200 text-sm flex items-center justify-center gap-2 w-fit cursor-pointer"
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add School</span>
            </>
          )}
        </button>
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

      {/* Add School Form */}
      {showAddForm && (
        <GlassCard className="p-6 border-slate-200/50 bg-white/80 shadow-md">
          <form onSubmit={handleAddSchool} className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">Register New School</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">School Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. PEC School of Science"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">School Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. PEC-001"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full school address..."
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">District</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="District"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Pincode</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Pincode"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Principal Name</label>
                <input
                  type="text"
                  required
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  placeholder="Principal's Name"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">In-Charge Coordinator</label>
                <input
                  type="text"
                  required
                  value={inChargeName}
                  onChange={(e) => setInChargeName(e.target.value)}
                  placeholder="In-Charge teacher..."
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Coordinator Email</label>
                <input
                  type="email"
                  required
                  value={coordinatorEmail}
                  onChange={(e) => setCoordinatorEmail(e.target.value)}
                  placeholder="coordinator@school.com"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Coordinator Mobile</label>
                <input
                  type="text"
                  required
                  value={coordinatorMobile}
                  onChange={(e) => setCoordinatorMobile(e.target.value)}
                  placeholder="Mobile number"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Teachers Count</label>
                <input
                  type="number"
                  value={teachersCount}
                  onChange={(e) => setTeachersCount(Number(e.target.value))}
                  placeholder="Number of attending teachers"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Emergency Contact</label>
                <input
                  type="text"
                  required
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Emergency phone number"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md shadow-blue-500/10 transition-all duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {submitting ? "Registering School..." : "Submit Registration"}
            </button>
          </form>
        </GlassCard>
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
            placeholder="Search school name, code, district..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>
      </GlassCard>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schools.map((sch) => (
          <GlassCard
            key={sch._id}
            className="p-5 border-slate-200/50 bg-white/70 shadow-sm flex flex-col justify-between gap-4"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 flex-shrink-0">
                    <SchoolIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-slate-800 text-sm leading-tight truncate max-w-[200px]" title={sch.name}>
                      {sch.name}
                    </h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 font-mono">
                      CODE: {sch.code}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(sch._id)}
                  className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer"
                  title="Remove school profile"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Coordinates details */}
              <div className="grid grid-cols-2 gap-4 text-xs mt-2 border-t border-slate-100 pt-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">District & Location</span>
                  <span className="font-semibold text-slate-700 truncate">
                    {sch.district}, {sch.state}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Principal Head</span>
                  <span className="font-semibold text-slate-700 truncate">{sch.principalName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Escorts Count</span>
                  <span className="font-semibold text-slate-700">{sch.teachersCount} escort(s)</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">In-charge Coordinator</span>
                  <span className="font-semibold text-slate-700 truncate">{sch.inChargeName}</span>
                </div>
              </div>
            </div>

            {/* Footer contact */}
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] font-bold text-blue-600">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                <span>Emergency: {sch.emergencyContact}</span>
              </span>
              <span className="text-slate-400 truncate max-w-[150px] font-medium" title={sch.coordinatorEmail}>
                {sch.coordinatorEmail}
              </span>
            </div>
          </GlassCard>
        ))}

        {schools.length === 0 && (
          <div className="col-span-2 p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-white/70 animate-pulse">
            No schools registered yet. Click "Add School" to add one manually.
          </div>
        )}
      </div>
    </div>
  );
}
