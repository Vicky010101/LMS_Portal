import React, { useState, useEffect, useCallback } from "react";
import { getStudentLiveClasses, getCompletedLiveClasses, joinLiveClass, leaveLiveClass } from "../api";

function LiveBadge({ status }) {
  if (status === "live") return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#FEE2E2", color: "#DC2626", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#DC2626", animation: "pulse 1.5s ease-in-out infinite" }} />
      LIVE NOW
    </span>
  );
  if (status === "scheduled") return <span style={{ background: "rgba(79,70,229,0.12)", color: "#4F46E5", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>Upcoming</span>;
  return <span style={{ background: "var(--lms-input-bg)", color: "var(--lms-text-muted)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>Completed</span>;
}

function ClassCard({ cls, onJoin }) {
  const now = new Date();
  const start = new Date(cls.startTime);
  const isLive = cls.status === "live";
  const canJoin = isLive; // Only allow joining when faculty has started (status = live)
  const endTime = new Date(start.getTime() + cls.duration * 60000);
  return (
    <div style={{ background: "var(--lms-card)", border: "1.5px solid var(--lms-border)", borderRadius: 16, overflow: "hidden", transition: "all 0.3s", boxShadow: "var(--lms-card-shadow)" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--lms-card-hover-shadow)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "var(--lms-card-shadow)"}>
      <div style={{ height: 120, background: `linear-gradient(135deg, #4F46E5, #7C3AED)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, position: "relative" }}>

        <div style={{ position: "absolute", top: 10, left: 12 }}><LiveBadge status={cls.status} /></div>
        {isLive && <div style={{ position: "absolute", top: 10, right: 12, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 11, padding: "3px 8px", borderRadius: 6 }}> {cls.participantCount || 0}</div>}
      </div>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--lms-text)", marginBottom: 4 }}>{cls.title}</div>
        <div style={{ fontSize: 12, color: "var(--lms-text-muted)", marginBottom: 8 }}> {cls.facultyName || "Faculty"}</div>
        {cls.description && <div style={{ fontSize: 12, color: "var(--lms-text-muted)", marginBottom: 10, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{cls.description}</div>}
        <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--lms-text-muted)", marginBottom: 14, flexWrap: "wrap" }}>
          <span> {start.toLocaleDateString()}</span>
          <span> {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <span> {cls.duration} min</span>
        </div>
        {canJoin ? (
          <button onClick={() => onJoin(cls)} style={{ width: "100%", padding: "10px", background: isLive ? "linear-gradient(135deg,#EF4444,#DC2626)" : "linear-gradient(135deg,#4F46E5,#7C3AED)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: isLive ? "0 4px 14px rgba(239,68,68,0.4)" : "0 4px 14px rgba(79,70,229,0.3)" }}>
            {isLive ? " Join Live Now" : " Join Class"}
          </button>
        ) : (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            {cls.status === "completed"
              ? <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 600 }}>✅ Class Ended</span>
              : <div>
                <div style={{ fontSize: 12, color: "#F59E0B", fontWeight: 600, marginBottom: 3 }}>⏳ Waiting for faculty to start...</div>
                <div style={{ fontSize: 11, color: "var(--lms-text-muted)" }}>Scheduled: {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            }
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentLiveClasses() {
  const [classes, setClasses] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.name || localStorage.getItem("userName") || "Student";

  const load = useCallback(async () => {
    setLoading(true);
    const [a, c] = await Promise.all([getStudentLiveClasses(), getCompletedLiveClasses()]);
    setClasses(Array.isArray(a) ? a : []);
    setCompleted(Array.isArray(c) ? c : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); const iv = setInterval(load, 30000); return () => clearInterval(iv); }, [load]);

  const handleJoin = async (cls) => {
    // Request camera/mic permissions before opening meeting
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(t => t.stop());
    } catch (e) {
      if (!window.confirm('Camera/microphone access was denied. The meeting may not work properly. Continue anyway?')) return;
    }
    const res = await joinLiveClass(cls._id);
    if (res.roomName) setMeeting({ ...cls, roomName: res.roomName });
  };

  const handleLeave = async () => {
    if (meeting) await leaveLiveClass(meeting._id);
    setMeeting(null);
    load();
  };

  const now = new Date();
  const upcoming = classes.filter(c => new Date(c.startTime) > now && c.status === "scheduled");
  const liveNow = classes.filter(c => c.status === "live");

  if (meeting) return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#1E293B", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444", animation: "pulse 1.5s ease-in-out infinite" }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{meeting.title}</span>
          <span style={{ color: "#94A3B8", fontSize: 12 }}> {meeting.facultyName}</span>
        </div>
        <button onClick={handleLeave} style={{ padding: "8px 20px", background: "#EF4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Leave Class
        </button>
      </div>
      <div style={{ flex: 1 }}>
        <iframe
          src={`https://meet.jit.si/${meeting.roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=false&config.disableDeepLinking=true&config.enableWelcomePage=false&config.requireDisplayName=false&config.enableInsecureRoomNameWarning=false&userInfo.displayName=${encodeURIComponent(userName)}`}
          allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
          allowFullScreen
          style={{ width: "100%", height: "100%", border: "none" }}
          title={meeting.title}
        />
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );

  return (
    <div className="lms-page">
      <div className="page-header">
        <div className="page-title"> Live Classes</div>
        <div className="page-sub">Join live sessions with your faculty</div>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {[["upcoming", ` Upcoming (${upcoming.length})`], ["live", ` Live Now (${liveNow.length})`], ["completed", ` Completed`]].map(([id, label]) => (
          <button key={id} className={`tab-btn ${activeTab === id ? "active" : ""}`} onClick={() => setActiveTab(id)}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-icon" style={{ animation: "spin 1s linear infinite" }}></div><p>Loading classes...</p></div>
      ) : activeTab === "live" ? (
        liveNow.length === 0
          ? <div className="empty-state"><div className="empty-icon"></div><p>No live classes right now.</p></div>
          : <div className="courses-grid">{liveNow.map(c => <ClassCard key={c._id} cls={c} onJoin={handleJoin} />)}</div>
      ) : activeTab === "upcoming" ? (
        upcoming.length === 0
          ? <div className="empty-state"><div className="empty-icon"></div><p>No upcoming classes scheduled.</p></div>
          : <div className="courses-grid">{upcoming.map(c => <ClassCard key={c._id} cls={c} onJoin={handleJoin} />)}</div>
      ) : (
        completed.length === 0
          ? <div className="empty-state"><div className="empty-icon"></div><p>No completed classes yet.</p></div>
          : <div className="courses-grid">{completed.map(c => <ClassCard key={c._id} cls={c} onJoin={handleJoin} />)}</div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
