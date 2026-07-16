import { useState } from "react";
import { CheckCircle, AlertCircle, Users, Loader2 } from "lucide-react";
import { api } from "../utils/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "../types";
import PendingApprovalCard from "../components/PendingApprovalCard";

export default function Approvals() {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch pending users using useQuery
  const {
    data: pendingUsers = [],
    isLoading,
    error: queryError,
  } = useQuery<User[]>({
    queryKey: ["pending-approvals"],
    queryFn: () => api.get("/api/auth/pending-approvals"),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (userId: string) => api.post(`/api/auth/approve-user/${userId}`),
    onSuccess: (_, userId) => {
      const approvedUser = pendingUsers.find((u) => u.id === userId);
      setSuccess(`User ${approvedUser?.username || "Selected user"} has been approved successfully.`);
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
    },
    onError: (err: any) => {
      setError(err.message || "Failed to approve user.");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (userId: string) => api.post(`/api/auth/reject-user/${userId}`),
    onSuccess: (_, userId) => {
      const rejectedUser = pendingUsers.find((u) => u.id === userId);
      setSuccess(`User ${rejectedUser?.username || "Selected user"} has been rejected and removed successfully.`);
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
    },
    onError: (err: any) => {
      setError(err.message || "Failed to reject user.");
    },
  });

  const handleApprove = (userId: string, _username: string) => {
    setError(null);
    setSuccess(null);
    approveMutation.mutate(userId);
  };

  const handleReject = (userId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to reject the registration of ${username}? This will delete the user permanently.`)) {
      return;
    }
    setError(null);
    setSuccess(null);
    rejectMutation.mutate(userId);
  };

  const isActionLoading = (userId: string) =>
    (approveMutation.isPending && approveMutation.variables === userId) ||
    (rejectMutation.isPending && rejectMutation.variables === userId);

  const displayError = error || (queryError ? (queryError as any).message : null);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900">User Registrations Approvals</h1>
          <p className="text-sm text-slate-500 mt-1">Review and approve pending registrations for Jury and Volunteer members.</p>
        </div>
      </div>

      {displayError && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-semibold leading-relaxed flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl text-xs font-semibold leading-relaxed flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Fetching pending approvals...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingUsers.length === 0 ? (
            <div className="bg-white/80 border border-dashed border-slate-300 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <Users className="w-12 h-12 text-slate-300" />
              <h3 className="font-bold text-slate-700">No Pending Approvals</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-normal">
                All signup requests for Jury members and Volunteers have been approved.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingUsers.map((user) => (
                <PendingApprovalCard
                  key={user.id}
                  user={user}
                  isActionLoading={isActionLoading(user.id)}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
