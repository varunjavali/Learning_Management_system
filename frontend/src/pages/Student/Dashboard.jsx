import { useEffect, useState, useCallback } from "react";
import API from "../../services/api";
import VideoPlayer from "../../components/VideoPlayer";

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState("");
  const [sessionKilled, setSessionKilled] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSecurityBanner, setShowSecurityBanner] = useState(true);

  const handleSessionExpired = useCallback(() => {
    localStorage.removeItem("token");
    setSessionKilled(true);
  }, []);

  const loadData = async () => {
    try {
      setError("");
      const [meRes, enrollRes] = await Promise.all([
        API.get("/auth/me").catch(() => ({ data: null })),
        API.get("/enrollments/me"),
      ]);
      setUser(meRes?.data);
      setEnrollments(enrollRes?.data || []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        handleSessionExpired();
      } else {
        setError("Failed to load your courses. Please try again.");
      }
    }
  };

  // Poll every 15s to detect if session was force-killed by admin
  useEffect(() => {
    loadData();
    const poll = setInterval(async () => {
      try {
        await API.get("/auth/me");
      } catch (err) {
        if (err?.response?.status === 401) {
          handleSessionExpired();
        }
      }
    }, 15000);
    return () => clearInterval(poll);
  }, []);

  // Countdown + auto-redirect when session is killed
  useEffect(() => {
    if (!sessionKilled) return;
    if (countdown <= 0) {
      window.location.href = "/";
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [sessionKilled, countdown]);

  const getVideoId = (url) => {
    if (!url) return "";
    if (url.includes("v=")) return url.split("v=")[1]?.split("&")[0];
    if (url.includes("youtu.be/")) return url.split("youtu.be/")[1];
    return "";
  };

  const username = user?.name || localStorage.getItem("userName") || "Student";

  // SESSION KILLED SCREEN
  if (sessionKilled) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🔒</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Session Terminated</h1>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            Your session has been ended by an administrator.<br />
            Please contact your trainer or admin if you think this is a mistake.
          </p>

          <div className="relative w-20 h-20 mx-auto mb-6">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#1e293b" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke="#ef4444" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - countdown / 5)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{countdown}</span>
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-6">
            Redirecting to login in <span className="text-red-400 font-semibold">{countdown}</span> second{countdown !== 1 ? "s" : ""}...
          </p>

          <button
            onClick={() => { window.location.href = "/"; }}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition text-sm"
          >
            Go to Login Now
          </button>
        </div>
      </div>
    );
  }

  // NORMAL DASHBOARD
  return (
    <div className="bg-[#0f172a] min-h-screen text-white flex flex-col">
      <div className="sticky top-0 z-40 bg-[#0f172a] border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="md:hidden bg-gray-700 px-2 py-1 rounded text-sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <span className="text-green-400 font-bold">🎓 My Courses</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm hidden sm:block">Hi, {username}</span>
          <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
            className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm">
            Logout
          </button>
        </div>
      </div>

      {showSecurityBanner && (
        <div className="bg-yellow-900/60 border border-yellow-500/50 text-yellow-200 px-4 py-2.5 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>
              <strong>Content Protection Notice:</strong> Downloading, recording, sharing, or screenshotting this content is strictly prohibited and monitored.
            </span>
          </div>
          <button onClick={() => setShowSecurityBanner(false)} className="ml-4 text-yellow-400 hover:text-white text-lg leading-none flex-shrink-0">✕</button>
        </div>
      )}

      {error && (
        <div className="mx-4 mt-4 bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-xl flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button onClick={loadData} className="text-sm underline hover:text-white">Retry</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className={`
          ${sidebarOpen ? "block" : "hidden"} md:block
          w-full md:w-72 bg-[#1e293b] border-r border-white/10 overflow-y-auto flex-shrink-0
          ${sidebarOpen ? "fixed inset-0 z-30 md:relative" : ""}
        `}>
          {sidebarOpen && (
            <div className="md:hidden flex justify-between items-center px-4 py-3 border-b border-white/10">
              <span className="text-white font-medium">My Courses</span>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 text-xl">✕</button>
            </div>
          )}
          <div className="p-3">
            {enrollments.length === 0 && !error && (
              <p className="text-gray-400 text-sm p-2">No courses assigned yet.</p>
            )}
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              const videos = course?.videos || [];
              const watched = videos.filter((v) => v?.progress?.length > 0).length;
              const pct = videos.length ? Math.round((watched / videos.length) * 100) : 0;
              const isActive = activeCourse?.id === course?.id;

              return (
                <div key={enrollment.id} className="mb-2">
                  <button
                    onClick={() => { setActiveCourse(course); setActiveVideo(videos[0] || null); setSidebarOpen(false); }}
                    className={`w-full text-left p-3 rounded-lg transition ${isActive ? "bg-green-500/20 border border-green-500/40" : "hover:bg-gray-700/50"}`}>
                    <p className="text-sm font-medium text-white">{course?.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{videos.length} videos · {pct}% done</p>
                    <div className="h-1 bg-gray-700 mt-1.5 rounded">
                      <div className="h-1 bg-green-500 rounded transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </button>

                  {isActive && videos.length > 0 && (
                    <div className="ml-3 mt-1 space-y-1">
                      {videos.map((v, idx) => (
                        <button key={v.id}
                          onClick={() => setActiveVideo(v)}
                          className={`w-full text-left px-3 py-2 rounded text-xs flex items-center gap-2 transition ${activeVideo?.id === v.id ? "bg-blue-500/20 text-blue-300" : "hover:bg-gray-700/40 text-gray-400"}`}>
                          <span className="flex-shrink-0">{v?.progress?.length > 0 ? "✅" : "▶"}</span>
                          <span className="truncate">Video {idx + 1}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {!activeCourse && (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="text-6xl mb-4">🎓</div>
              <h2 className="text-xl text-white mb-2">Welcome, {username}!</h2>
              <p className="text-gray-400 text-sm">Select a course from the sidebar to start learning.</p>
            </div>
          )}

          {activeCourse && (
            <>
              <h1 className="text-xl md:text-2xl font-bold text-green-400 mb-4">{activeCourse.title}</h1>

              <div className="bg-red-900/30 border border-red-500/40 rounded-lg px-4 py-2.5 mb-4 flex items-start gap-2 text-sm text-red-200">
                <span className="text-red-400 flex-shrink-0 mt-0.5">🚫</span>
                <span>
                  <strong>Protected Content:</strong> Do not download, share, screenshot, or distribute this material.
                  All access is logged and watermarked with your identity.
                </span>
              </div>

              {activeVideo ? (
                <VideoPlayer
                url={activeVideo.youtubeUrl}
                user={username}
                videoId={activeVideo.id}
                onProgressSaved={loadData}
              />
              ) : (
                <div className="bg-[#1e293b] rounded-xl h-48 flex items-center justify-center text-gray-400">
                  No videos in this course yet.
                </div>
              )}

              {activeCourse.videos?.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-gray-400 text-sm mb-3 uppercase tracking-wide">Course Videos</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {activeCourse.videos.map((v, idx) => (
                      <button key={v.id} onClick={() => setActiveVideo(v)}
                        className={`rounded-lg overflow-hidden text-left transition hover:scale-105 ${activeVideo?.id === v.id ? "ring-2 ring-green-400" : ""}`}>
                        <img src={`https://img.youtube.com/vi/${getVideoId(v.youtubeUrl)}/mqdefault.jpg`}
                          className="w-full h-20 object-cover" alt={`video ${idx + 1}`} />
                        <div className="bg-[#1e293b] px-2 py-1.5">
                          <p className="text-xs text-gray-300">Video {idx + 1}</p>
                          {v?.progress?.length > 0 && <p className="text-xs text-green-400">✓ Watched</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}