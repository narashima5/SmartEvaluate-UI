import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import GlassCard from "../components/GlassCard";
import { School as SchoolIcon, Edit3, ArrowRight, ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import type { School } from "../types";

export default function SchoolProfile() {
  const { user, updateUserSchool } = useAuth();
  const [profile, setProfile] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Wizard Flow States
  const [step, setStep] = useState(1);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [inChargeName, setInChargeName] = useState("");
  const [coordinatorMobile, setCoordinatorMobile] = useState("");
  const [teachersCount, setTeachersCount] = useState(1);
  const [teacherNamesText, setTeacherNamesText] = useState(""); // Comma-separated names
  const [emergencyContact, setEmergencyContact] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/schools/me");
      if (data && data._id) {
        setProfile(data);
        populateFields(data);
      }
    } catch (err: any) {
      console.log("No school profile registered yet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const populateFields = (s: School) => {
    setName(s.name);
    setCode(s.code);
    setAddress(s.address);
    setDistrict(s.district);
    setState(s.state);
    setPincode(s.pincode);
    setPrincipalName(s.principalName);
    setInChargeName(s.inChargeName);
    setCoordinatorMobile(s.coordinatorMobile);
    setTeachersCount(s.teachersCount || 1);
    setTeacherNamesText(s.teacherNames ? s.teacherNames.join(", ") : "");
    setEmergencyContact(s.emergencyContact);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name || !code || !address || !district || !state || !pincode) {
        setError("Please complete all school location fields.");
        return;
      }
    }
    if (step === 2) {
      if (!principalName || !inChargeName || !coordinatorMobile) {
        setError("Please complete coordinator details.");
        return;
      }
    }
    setError(null);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (!emergencyContact) {
      setError("Emergency contact mobile is required.");
      setSubmitting(false);
      return;
    }

    const listTeachers = teacherNamesText
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      name,
      code,
      address,
      district,
      state,
      pincode,
      principalName,
      inChargeName,
      coordinatorEmail: user?.email || "",
      coordinatorMobile,
      teachersCount: Number(teachersCount),
      teacherNames: listTeachers,
      emergencyContact,
    };

    try {
      if (profile?._id) {
        const response = await api.put(`/api/schools/${profile._id}`, payload);
        setSuccess("Profile details updated successfully.");
        setProfile(response.school);
        updateUserSchool(response.school);
      } else {
        const response = await api.post("/api/schools", payload);
        setSuccess("School profile registered successfully.");
        setProfile(response.school);
        updateUserSchool(response.school);
      }
      setEditing(false);
      setStep(1);
    } catch (err: any) {
      setError(err.message || "Failed to save profile information.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Display details view if profile exists and not editing
  if (profile && !editing) {
    return (
      <div className="flex flex-col gap-6">
        <div className="border-b border-slate-200 pb-5 flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Institute Hub</span>
            </div>
            <h2 className="text-2xl font-bold font-display text-slate-800">School Profile</h2>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Modify Profile</span>
          </button>
        </div>

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-semibold">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6 border-slate-200/50 bg-white/70 shadow-sm flex flex-col gap-5 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <SchoolIcon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{profile.name}</h3>
                <span className="text-xs text-slate-400 font-bold uppercase mt-1">CODE: {profile.code}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs mt-2 border-t border-slate-100 pt-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Principal Head</span>
                <span className="font-semibold text-slate-700">{profile.principalName}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Exhibition In-Charge</span>
                <span className="font-semibold text-slate-700">{profile.inChargeName}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Address</span>
                <span className="font-semibold text-slate-700 leading-normal">{profile.address}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Location Details</span>
                <span className="font-semibold text-slate-700">
                  {profile.district}, {profile.state} - {profile.pincode}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-slate-200/50 bg-white/70 shadow-sm flex flex-col gap-5">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Accompanying Staff</h4>
            
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Teacher Escorts</span>
                <span className="font-semibold text-slate-700">{profile.teachersCount} Escorts</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Staff Members List</span>
                <span className="font-semibold text-slate-700 leading-relaxed">
                  {profile.teacherNames && profile.teacherNames.length > 0 ? profile.teacherNames.join(", ") : "None specified."}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Emergency Contact Number</span>
                <span className="font-bold text-blue-600">{profile.emergencyContact}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Display creation/editing wizard flow
  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <div className="border-b border-slate-200 pb-5 text-center flex flex-col gap-1">
        <h2 className="text-2xl font-bold font-display text-slate-800">Configure School Profile</h2>
        <p className="text-xs text-slate-400">Complete this configuration before registering students.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              step === s ? "w-8 bg-blue-600" : "w-2.5 bg-slate-200"
            }`}
          />
        ))}
      </div>

      <GlassCard className="p-8 border-slate-200/50 bg-white/70 shadow-lg" glow>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Step 1: Location & Identity */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 text-sm mb-2">Step 1: Institute Credentials & Address</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">School Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Greenwood High School"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white/60"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">School ID / Registration Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="GHS-101"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white/60"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Street Address *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white/60"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5 col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">District *</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Bangalore"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white/60"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">State *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white/60"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pincode *</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560087"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white/60"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Authorities */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 text-sm mb-2">Step 2: Authority Details</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Principal Name *</label>
                <input
                  type="text"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  placeholder="Dr. Roy"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white/60"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Science In-Charge Name *</label>
                <input
                  type="text"
                  value={inChargeName}
                  onChange={(e) => setInChargeName(e.target.value)}
                  placeholder="Mrs. Green"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white/60"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Coordinator Mobile *</label>
                <input
                  type="text"
                  value={coordinatorMobile}
                  onChange={(e) => setCoordinatorMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white/60"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Staff & Emergency */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 text-sm mb-2">Step 3: Accompanying Staff & Escorts</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Teachers Escort Count *</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={teachersCount}
                  onChange={(e) => setTeachersCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white/60"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Teacher Escorts Names (Comma Separated)</label>
                <input
                  type="text"
                  value={teacherNamesText}
                  onChange={(e) => setTeacherNamesText(e.target.value)}
                  placeholder="Mrs. Green, Mr. Alan, Ms. Emma"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white/60"
                />
                <span className="text-[9px] text-slate-400">Separate names of escorts using commas.</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Emergency Mobile Contact *</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="9876543219"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white/60"
                  required
                />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer ml-auto"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer ml-auto disabled:opacity-75"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{profile?._id ? "Update Profile" : "Register Profile"}</span>
                  </>
                )}
              </button>
            )}

            {profile?._id && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setStep(1);
                  populateFields(profile);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
