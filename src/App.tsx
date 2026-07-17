import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Approvals from "./pages/Approvals";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Schools from "./pages/Schools";
import SchoolProfile from "./pages/SchoolProfile";
import Registrations from "./pages/Registrations";
import Projects from "./pages/Projects";
import Scanner from "./pages/Scanner";
import Attendance from "./pages/Attendance";
import Evaluate from "./pages/Evaluate";
import Reports from "./pages/Reports";
import Audits from "./pages/Audits";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ShieldAlert, LogOut } from "lucide-react";
import GlassCard from "./components/GlassCard";

interface ApprovalPendingProps {
  onLogout: () => void;
}

function ApprovalPending({ onLogout }: ApprovalPendingProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none -z-10 animate-float" />
      <div className="w-full max-w-md flex flex-col gap-6 z-10 text-center">
        <GlassCard className="p-8 border border-white/30 bg-white/70 backdrop-blur-md shadow-xl" glow>
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-100 mb-4">
            <ShieldAlert className="w-8 h-8 animate-bounce" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Approval Pending</h3>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Your account request has been received. Jury and Volunteer roles require administrative approval before getting access to the Smart Evaluate tools.
          </p>
          <p className="text-xs text-slate-400 mt-3 font-semibold">
            Please contact the Event Administrator or check back shortly.
          </p>
          <button
            onClick={onLogout}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </GlassCard>
      </div>
    </div>
  );
}

function HomeRedirect() {
  const { user, logout } = useAuth();
  
  if (!user) {
    return <Landing />;
  }

  // Redirect to pending approval view if not approved
  if (user.isApproved === false) {
    return <ApprovalPending onLogout={logout} />;
  }

  // Redirect based on role
  switch (user.role) {
    case "super_admin":
    case "event_coordinator":
      return <Navigate to="/dashboard" replace />;
    case "school_coordinator":
      return <Navigate to="/school-profile" replace />;
    case "volunteer":
      return <Navigate to="/scanner" replace />;
    case "jury":
      return <Navigate to="/evaluate" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Dashboard Shell Routing */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* Admin & Coordinator Only */}
            <Route element={<ProtectedRoute allowedRoles={["super_admin", "event_coordinator"]} />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="reports" element={<Reports />} />
              <Route path="approvals" element={<Approvals />} />
            </Route>

            {/* Super Admin Only */}
            <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
              <Route path="events" element={<Events />} />
              <Route path="schools" element={<Schools />} />
              <Route path="audits" element={<Audits />} />
            </Route>

            {/* School Coordinator Only */}
            <Route element={<ProtectedRoute allowedRoles={["school_coordinator"]} />}>
              <Route path="school-profile" element={<SchoolProfile />} />
            </Route>

            {/* Shared Registrations & Projects */}
            <Route element={<ProtectedRoute allowedRoles={["school_coordinator", "super_admin", "event_coordinator"]} />}>
              <Route path="registrations" element={<Registrations />} />
              <Route path="projects" element={<Projects />} />
            </Route>

            {/* Volunteer, Admin & Coordinator Check-in */}
            <Route element={<ProtectedRoute allowedRoles={["volunteer", "super_admin", "event_coordinator"]} />}>
              <Route path="scanner" element={<Scanner />} />
              <Route path="attendance" element={<Attendance />} />
            </Route>

            {/* Jury Only */}
            <Route element={<ProtectedRoute allowedRoles={["jury"]} />}>
              <Route path="evaluate" element={<Evaluate />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
