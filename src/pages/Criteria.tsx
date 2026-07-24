import { useState, useEffect } from "react";
import { api } from "../utils/api";
import GlassCard from "../components/GlassCard";
import { ClipboardCheck, Plus, Trash2, X, Sparkles, Award, Edit } from "lucide-react";

interface CriteriaItem {
  _id: string;
  name: string;
  maxMarks: number;
  description: string;
}

export default function Criteria() {
  const [criteria, setCriteria] = useState<CriteriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [maxMarks, setMaxMarks] = useState(10);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCriteria = async () => {
    try {
      const data = await api.get("/api/evaluations/criteria");
      setCriteria(data);
    } catch (err: any) {
      setError(err.message || "Failed to load evaluation criteria.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCriteria();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      if (isEditing && editingId) {
        await api.put(`/api/evaluations/criteria/${editingId}`, {
          name,
          maxMarks,
          description,
        });
        setSuccess("Evaluation criteria updated successfully!");
      } else {
        await api.post("/api/evaluations/criteria", {
          name,
          maxMarks,
          description,
        });
        setSuccess("Evaluation criteria added successfully!");
      }

      setShowAddForm(false);
      setIsEditing(false);
      setEditingId(null);
      setName("");
      setMaxMarks(10);
      setDescription("");
      fetchCriteria();
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditing ? "update" : "add"} evaluation criteria.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (item: CriteriaItem) => {
    setIsEditing(true);
    setEditingId(item._id);
    setName(item.name);
    setMaxMarks(item.maxMarks);
    setDescription(item.description);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this criteria? This will affect evaluations using it.")) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/api/evaluations/criteria/${id}`);
      setSuccess("Evaluation criteria deleted successfully.");
      fetchCriteria();
    } catch (err: any) {
      setError(err.message || "Failed to delete criteria.");
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete ALL evaluation criteria? This action cannot be undone and will affect evaluations using them.")) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      await api.delete("/api/evaluations/criteria");
      setSuccess("All evaluation criteria deleted successfully.");
      fetchCriteria();
    } catch (err: any) {
      setError(err.message || "Failed to delete all criteria.");
    }
  };

  if (loading && criteria.length === 0) {
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
            <span>Evaluation Protocol</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800">Evaluation Criteria</h2>
        </div>
        <div className="flex gap-3">
          {criteria.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl shadow-md shadow-red-500/10 transition-all duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete All</span>
            </button>
          )}
          <button
            onClick={() => {
              if (showAddForm) {
                setShowAddForm(false);
                setIsEditing(false);
                setEditingId(null);
                setName("");
                setMaxMarks(10);
                setDescription("");
              } else {
                setShowAddForm(true);
              }
            }}
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
                <span>Add Criteria</span>
              </>
            )}
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

      {/* Add/Edit Criteria Form */}
      {showAddForm && (
        <GlassCard className="p-6 border-slate-200/50 bg-white/80 shadow-md animate-fade-in">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">
              {isEditing ? "Edit Evaluation Criteria" : "Create Evaluation Criteria"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Criteria Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Technical Innovation"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Max Marks</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(Number(e.target.value))}
                  placeholder="e.g. 20"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Define evaluation directives for jury members..."
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500 min-h-[100px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md shadow-blue-500/10 transition-all duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {submitting ? (isEditing ? "Saving Changes..." : "Adding Criteria...") : (isEditing ? "Save Changes" : "Create Criteria")}
            </button>
          </form>
        </GlassCard>
      )}

      {/* Criteria Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {criteria.map((item) => (
          <GlassCard
            key={item._id}
            className="p-5 border-slate-200/50 bg-white/70 shadow-sm flex flex-col justify-between gap-4"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 flex-shrink-0">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-slate-800 text-sm leading-tight truncate max-w-[200px]" title={item.name}>
                      {item.name}
                    </h3>
                    <span className="text-[10px] font-bold text-blue-500 uppercase mt-0.5 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      Max Marks: {item.maxMarks}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg border border-transparent hover:border-blue-100 transition-all cursor-pointer"
                    title="Edit criteria"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer"
                    title="Delete criteria"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
                {item.description}
              </div>
            </div>
          </GlassCard>
        ))}

        {criteria.length === 0 && (
          <div className="col-span-2 p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-white/70 animate-pulse">
            No evaluation criteria configured yet. Click "Add Criteria" to build the evaluation sheet.
          </div>
        )}
      </div>
    </div>
  );
}
