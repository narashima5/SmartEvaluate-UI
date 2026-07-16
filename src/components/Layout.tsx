import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { api } from "../utils/api";
import type { Event } from "../types";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const location = useLocation();

  // Close the sidebar automatically when navigating to a new route on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Fetch active event for the announcement banner
  useEffect(() => {
    const fetchActiveEvent = async () => {
      try {
        const response = await api.get("/api/events/active");
        if (response && response._id) {
          setActiveEvent(response);
        }
      } catch (err) {
        // Silent catch: if no active event is configured, banner remains hidden
        console.log("No active event loaded for banner.");
      }
    };
    fetchActiveEvent();
  }, []);

  const announcement = activeEvent
    ? `Register now for "${activeEvent.title}" at ${activeEvent.venue} on ${new Date(activeEvent.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}!`
    : "";

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/4 left-1/12 w-[300px] h-[300px] bg-blue-400/5 rounded-full blur-[80px] pointer-events-none -z-10 animate-float" />
      <div className="absolute bottom-1/4 right-1/12 w-[350px] h-[350px] bg-indigo-400/5 rounded-full blur-[90px] pointer-events-none -z-10 animate-float" style={{ animationDelay: "2s" }} />

      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} announcement={announcement} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 scroll-smooth w-full relative">
          <div className="max-w-6xl mx-auto pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
