import { useState, useEffect } from "react";
import { api } from "../utils/api";
import GlassCard from "../components/GlassCard";
import { Calendar, MapPin, Trash2, Edit3, Check, ToggleRight, Loader2, Sparkles } from "lucide-react";
import type { Event } from "../types";

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/events");
      setEvents(data);
    } catch (err: any) {
      setError(err.message || "Failed to load events list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEditClick = (event: Event) => {
    setIsEditing(true);
    setEditId(event._id);
    setTitle(event.title);
    setDescription(event.description || "");
    setDate(event.date.split("T")[0]);
    setVenue(event.venue);
    setDeadline(event.registrationDeadline.split("T")[0]);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditId(null);
    setTitle("");
    setDescription("");
    setDate("");
    setVenue("");
    setDeadline("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (!title || !date || !venue || !deadline) {
      setError("Please fill in all required fields.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        title,
        description,
        date: new Date(date),
        venue,
        registrationDeadline: new Date(deadline),
      };

      if (isEditing && editId) {
        await api.put(`/api/events/${editId}`, payload);
        setSuccess("Event updated successfully.");
      } else {
        await api.post("/api/events", payload);
        setSuccess("Event created successfully.");
      }
      
      handleCancel();
      fetchEvents();
    } catch (err: any) {
      setError(err.message || "Failed to save event details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetActive = async (id: string) => {
    setError(null);
    setSuccess(null);
    try {
      await api.post(`/api/events/${id}/active`);
      setSuccess("Event status updated to ACTIVE successfully.");
      fetchEvents();
    } catch (err: any) {
      setError(err.message || "Failed to set event active.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently remove this event and all associated student registrations? This action cannot be undone.")) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/api/events/${id}`);
      setSuccess("Event deleted successfully.");
      fetchEvents();
    } catch (err: any) {
      setError(err.message || "Failed to delete event.");
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Configuration Hub</span>
        </div>
        <h2 className="text-2xl font-bold font-display text-slate-800">Event Configuration</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <GlassCard className="p-6 border-slate-200/50 bg-white/70 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 text-sm mb-4">
            {isEditing ? "Modify Event Details" : "Create New Exhibition Event"}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Event Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="National Expo 2026"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white/60"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about the science exhibition..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Event Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white/60"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Deadline *</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white/60"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Venue Address *</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Main Campus Hall"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white/60"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-sm text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{isEditing ? "Update Event" : "Create Event"}</span>
                  </>
                )}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </GlassCard>

        {/* List Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {events.map((ev) => (
            <GlassCard
              key={ev._id}
              className={`p-5 border-slate-200/50 bg-white/70 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden ${
                ev.status === "active" ? "ring-2 ring-blue-500/30" : ""
              }`}
            >
              {ev.status === "active" && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
              )}

              <div className="flex flex-col gap-2.5 max-w-md">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 text-base">{ev.title}</h4>
                  {ev.status === "active" ? (
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Active Event
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {ev.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{ev.description || "No description provided."}</p>
                
                <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-400 mt-1 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Expo: {new Date(ev.date).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>{ev.venue}</span>
                  </span>
                </div>

                <div className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg w-fit mt-1">
                  Registration Closes: {new Date(ev.registrationDeadline).toLocaleDateString(undefined, { dateStyle: "medium" })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:self-center border-t border-slate-100 sm:border-0 pt-3 sm:pt-0">
                {ev.status !== "active" ? (
                  <button
                    onClick={() => handleSetActive(ev._id)}
                    className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100/50 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer"
                    title="Activate event for current registrations"
                  >
                    <ToggleRight className="w-4 h-4" />
                    <span>Set Active</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
                    <Check className="w-4 h-4" />
                    <span>Live Portal</span>
                  </span>
                )}

                <button
                  onClick={() => handleEditClick(ev)}
                  className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl border border-transparent hover:border-slate-200 transition-all"
                  title="Modify event"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(ev._id)}
                  className="p-2 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-xl border border-transparent hover:border-red-100 transition-all"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))}

          {events.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-white/70">
              No exhibition events configured. Create one using the form on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
