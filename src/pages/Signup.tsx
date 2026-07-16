import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Mail, Lock, User, ArrowRight, Loader2, Home, Phone, MapPin, Building, KeyRound, Sparkles } from "lucide-react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import GlassCard from "../components/GlassCard";

export default function Signup() {
  const [role, setRole] = useState("school_coordinator");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // School fields
  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolDistrict, setSchoolDistrict] = useState("");
  const [schoolState, setSchoolState] = useState("");
  const [schoolPincode, setSchoolPincode] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [inChargeName, setInChargeName] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [coordinatorMobile, setCoordinatorMobile] = useState("");

  // Jury fields
  const [targetDomain, setTargetDomain] = useState("");
  const [domainsList, setDomainsList] = useState<string[]>([]);

  // OTP phase
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch active domains for jury setup
    const fetchDomains = async () => {
      try {
        const response = await api.get("/api/evaluations/domains");
        if (Array.isArray(response)) {
          setDomainsList(response.map((d: any) => d.name));
          if (response.length > 0) {
            setTargetDomain(response[0].name);
          }
        }
      } catch (err) {
        console.error("Failed to load domains:", err);
      }
    };
    fetchDomains();
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        role,
        username: username.trim(),
        email: email.trim(),
        password,
      };

      if (role === "school_coordinator") {
        Object.assign(payload, {
          schoolName: schoolName.trim(),
          schoolCode: schoolCode.trim(),
          schoolAddress: schoolAddress.trim(),
          schoolDistrict: schoolDistrict.trim(),
          schoolState: schoolState.trim(),
          schoolPincode: schoolPincode.trim(),
          principalName: principalName.trim(),
          inChargeName: inChargeName.trim(),
          emergencyContact: emergencyContact.trim(),
          coordinatorMobile: coordinatorMobile.trim(),
        });
      } else if (role === "jury") {
        payload.target_domain = targetDomain;
      }

      const response = await api.post("/api/auth/signup", payload);
      setInfo(response.message || "OTP has been sent to your email.");
      setShowOtpScreen(true);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const response = await api.post("/api/auth/verify-otp", {
        email: email.trim(),
        otp: otpCode.trim(),
      });

      if (response && response.token && response.user) {
        login(response.token, response.user);

        // Redirect based on role and approval status
        if (!response.user.isApproved) {
          navigate("/"); // Will render pending approval state
        } else if (response.user.role === "school_coordinator") {
          navigate("/school-profile");
        } else {
          navigate("/");
        }
      } else {
        setError("Invalid response format from server.");
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 sm:p-6 md:p-8 relative selection:bg-blue-500/20 selection:text-blue-900 overflow-y-auto">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none -z-10 animate-float" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none -z-10 animate-float" style={{ animationDelay: "2s" }} />

      <div className="w-full max-w-2xl flex flex-col gap-6 z-10 my-8">
        <div className="text-center flex flex-col items-center gap-3">
          <Link to="/" className="flex p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/25 transition-transform hover:scale-105">
            <ShieldCheck className="w-8 h-8" />
          </Link>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">Create Account</h2>
            <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest mt-1">Smart Evaluate Expo Portal</span>
          </div>
        </div>

        <GlassCard className="p-8 border border-white/30 bg-white/70 backdrop-blur-md shadow-xl" glow>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}

          {info && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl text-xs font-semibold leading-relaxed">
              {info}
            </div>
          )}

          {!showOtpScreen ? (
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-6">
              {/* Role selector tabs */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Select Your Registration Role</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: "school_coordinator", label: "School" },
                    { id: "jury", label: "Jury Member" },
                    { id: "volunteer", label: "Volunteer" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setRole(tab.id)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        role === tab.id
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Login Credentials Group */}
              <div className="bg-white/40 p-5 rounded-2xl border border-slate-200/50 flex flex-col gap-4">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Login Credentials</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Username</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="john_doe"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Confirm Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* School Coordinator details */}
              {role === "school_coordinator" && (
                <div className="bg-white/40 p-5 rounded-2xl border border-slate-200/50 flex flex-col gap-4">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Building className="w-3.5 h-3.5 text-blue-500" />
                    <span>School Profile Details</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">School Name</label>
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="Greenwood High School"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">School Code (Optional)</label>
                      <input
                        type="text"
                        value={schoolCode}
                        onChange={(e) => setSchoolCode(e.target.value)}
                        placeholder="GHS-101"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">School Address</label>
                      <input
                        type="text"
                        value={schoolAddress}
                        onChange={(e) => setSchoolAddress(e.target.value)}
                        placeholder="83, Sarjapur Main Road"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">District</label>
                      <input
                        type="text"
                        value={schoolDistrict}
                        onChange={(e) => setSchoolDistrict(e.target.value)}
                        placeholder="Bangalore"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">State</label>
                      <input
                        type="text"
                        value={schoolState}
                        onChange={(e) => setSchoolState(e.target.value)}
                        placeholder="Karnataka"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Pincode</label>
                      <input
                        type="text"
                        value={schoolPincode}
                        onChange={(e) => setSchoolPincode(e.target.value)}
                        placeholder="560087"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Principal Name</label>
                      <input
                        type="text"
                        value={principalName}
                        onChange={(e) => setPrincipalName(e.target.value)}
                        placeholder="Dr. Caroline Roy"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">In-Charge Coordinator Name</label>
                      <input
                        type="text"
                        value={inChargeName}
                        onChange={(e) => setInChargeName(e.target.value)}
                        placeholder="Mrs. Susan Green"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Coordinator Mobile Number</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <Phone className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={coordinatorMobile}
                          onChange={(e) => setCoordinatorMobile(e.target.value)}
                          placeholder="9876543210"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Emergency Contact Number</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <Phone className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={emergencyContact}
                          onChange={(e) => setEmergencyContact(e.target.value)}
                          placeholder="9876543219"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Jury specific domain filtering */}
              {role === "jury" && (
                <div className="bg-white/40 p-5 rounded-2xl border border-slate-200/50 flex flex-col gap-4">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>Jury Evaluation Domain Selection</span>
                  </h4>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Select Target Domain</label>
                    <select
                      value={targetDomain}
                      onChange={(e) => setTargetDomain(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                      required
                    >
                      {domainsList.map((dom) => (
                        <option key={dom} value={dom}>
                          {dom}
                        </option>
                      ))}
                      {domainsList.length === 0 && <option value="">Loading domains...</option>}
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-500/15 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Request Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
              <div className="text-center flex flex-col gap-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                  <KeyRound className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">Enter Verification OTP</h3>
                <p className="text-xs text-slate-500">We have sent a 6-digit OTP code to <strong className="text-slate-700">{email}</strong>. Please enter it below to complete your registration.</p>
              </div>

              <div className="flex flex-col gap-1.5 max-w-xs mx-auto w-full">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide text-center">6-Digit OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-center tracking-[0.5em] font-mono text-lg focus:outline-none focus:border-blue-500 shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-500/15 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowOtpScreen(false)}
                  className="w-full text-slate-500 hover:text-slate-700 text-xs font-semibold py-2 transition-all cursor-pointer text-center"
                >
                  Back to Registration Details
                </button>
              </div>
            </form>
          )}
        </GlassCard>

        <div className="text-center flex flex-col gap-2">
          <p className="text-xs text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-500 hover:underline">
              Sign In
            </Link>
          </p>
          <Link to="/" className="text-xs font-semibold text-slate-400 hover:text-slate-600 inline-flex items-center gap-1.5 justify-center">
            <Home className="w-3.5 h-3.5" />
            <span>Back to landing portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
