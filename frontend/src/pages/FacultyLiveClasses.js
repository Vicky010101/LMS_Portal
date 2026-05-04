import React, { useState, useEffect, useCallback } from "react";
import { getFacultyLiveClasses, createLiveClass, updateLiveClass, deleteLiveClass, startLiveClass, endLiveClass, getLiveClassAttendance } from "../api";

const EMPTY = { title: "", description: "", facultyName: "", courseName: "", startTime: "", duration: 60, assignedTo: "all" };

export default function FacultyLiveClasses({ user }) {
  const [classes, setClasses] = useState([]);
  const [view, setView] = useState("list");
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [meeting, setMeeting] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getFacultyLiveClasses();
    setClasses(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.title || !form.startTime) return showToast("Fill title and start time", "error");
    const payload = { ...form, facultyName: user?.name || form.facultyName };
    const res = editId ? await updateLiveClass(editId, payload) : await createLiveClass(payload);
    if (res._id) { showToast(editId ? "Class updated!" : "Class created!"); load(); setView("list"); setEditId(null); setForm(EMPTY); }
    else showToast(res.msg || res.error || "Failed", "error");
  };

  const handleStart = async (cls) => {
    // Request camera/mic permissions before opening meeting
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(t => t.stop()); // release immediately, Jitsi will re-acquire
    } catch (e) {
      if (!window.confirm('Camera/microphone access was denied. The meeting may not work properly. Continue anyway?')) return;
    }
    const res = await startLiveClass(cls._id);
    if (res._id) { setMeeting(res); load(); }
    else showToast("Failed to start", "error");
  };

  const handleEnd = async () => {
    if (meeting) { await endLiveClass(meeting._id); setMeeting(null); load(); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    await deleteLiveClass(id); showToast("Deleted"); load();
  };

  const handleViewAttendance = async (cls) => {
    setSelectedClass(cls);
    const data = await getLiveClassAttendance(cls._id);
    setAttendance(Array.isArray(data) ? data : []);
    setView("attendance");
  };

  const inp = { width: "100%", padding: "9px 12px", border: "1.5px solid var(--lms-border)", borderRadius: 9, fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--lms-input-bg)", color: "var(--lms-text)", boxSizing: "border-box" };
  const lbl = { fontSize: 11, fontWeight: 700, color: "var(--lms-text-muted)", marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: "0.4px" };

  if (meeting) return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#1E293B", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444", animation: "pulse 1.5s ease-in-out infinite" }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{meeting.title}</span>
          <span style={{ background: "#FEE2E2", color: "#DC2626", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>🔴 LIVE</span>
        </div>
        <button onClick={handleEnd} style={{ padding: "8px 20px", background: "#EF4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          ⏹ End Class
        </button>
      </div>
      <div style={{ flex: 1 }}>
        <iframe
          src={`https://meet.jit.si/${meeting.roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.disableDeepLinking=true&config.enableWelcomePage=false&config.requireDisplayName=false&config.enableInsecureRoomNameWarning=false&userInfo.displayName=${encodeURIComponent(user?.name || 'Faculty')}`}
          allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
          allowFullScreen
          style={{ width: "100%", height: "100%", border: "none" }}
          title={meeting.title}
        />
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );

  if (view === "create") return (
    <div className="lms-page">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button className="btn-outline" onClick={() => { setView("list"); setEditId(null); setForm(EMPTY); }} style={{ padding: "7px 14px" }}> Back</button>
        <div><div className="page-title">{editId ? "Edit Class" : "Create Live Class"}</div></div>
      </div>
      <div className="card">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Class Title *</label><input style={inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Java Programming - Live Session" onFocus={e => e.target.style.borderColor = "#4F46E5"} onBlur={e => e.target.style.borderColor = "var(--lms-border)"} /></div>
          <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Description</label><textarea style={{ ...inp, resize: "vertical", minHeight: 80 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What will be covered in this session..." onFocus={e => e.target.style.borderColor = "#4F46E5"} onBlur={e => e.target.style.borderColor = "var(--lms-border)"} /></div>
          <div><label style={lbl}>Course Name</label><input style={inp} value={form.courseName} onChange={e => setForm(f => ({ ...f, courseName: e.target.value }))} placeholder="e.g. Java Programming" onFocus={e => e.target.style.borderColor = "#4F46E5"} onBlur={e => e.target.style.borderColor = "var(--lms-border)"} /></div>
          <div><label style={lbl}>Duration (minutes)</label><input style={inp} type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} onFocus={e => e.target.style.borderColor = "#4F46E5"} onBlur={e => e.target.style.borderColor = "var(--lms-border)"} /></div>
          <div><label style={lbl}>Start Date & Time *</label><input style={inp} type="datetime-local" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} onFocus={e => e.target.style.borderColor = "#4F46E5"} onBlur={e => e.target.style.borderColor = "var(--lms-border)"} /></div>
          <div><label style={lbl}>Assign To</label><select style={inp} value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}><option value="all">All Students</option><option value="specific">Specific Students</option></select></div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button className="btn-primary" onClick={handleSave}> {editId ? "Update Class" : "Schedule Class"}</button>
          <button className="btn-secondary" onClick={() => { setView("list"); setEditId(null); setForm(EMPTY); }}>Cancel</button>
        </div>
      </div>
    </div>
  );

  if (view === "attendance") return (
    <div className="lms-page">
      <button className="btn-outline" onClick={() => setView("list")} style={{ marginBottom: 16, padding: "7px 14px" }}> Back</button>
      <div className="page-header"><div className="page-title"> Attendance — {selectedClass?.title}</div><div className="page-sub">{attendance.length} students attended</div></div>
      <div className="card">
        {attendance.length === 0 ? <div className="empty-state"><div className="empty-icon"></div><p>No attendance records yet.</p></div> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "2px solid var(--lms-border)" }}>
              {["Student", "Email", "Joined At", "Duration"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--lms-text-muted)", textTransform: "uppercase" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {attendance.map(a => (
                <tr key={a._id} style={{ borderBottom: "1px solid var(--lms-border)" }}>
                  <td style={{ padding: "11px 14px", fontWeight: 600, color: "var(--lms-text)" }}>{a.studentId?.name}</td>
                  <td style={{ padding: "11px 14px", color: "var(--lms-text-muted)", fontSize: 12 }}>{a.studentId?.email}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--lms-text-muted)" }}>{new Date(a.joinedAt).toLocaleTimeString()}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--lms-text-muted)" }}>{a.attendanceDuration ? `${a.attendanceDuration} min` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const live = classes.filter(c => c.status === "live");
  const scheduled = classes.filter(c => c.status === "scheduled");
  const done = classes.filter(c => c.status === "completed");

  return (
    <div className="lms-page">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div><div className="page-title"> Live Classes</div><div className="page-sub">Manage and conduct live sessions</div></div>
        <button className="btn-primary" onClick={() => { setForm({ ...EMPTY, facultyName: user?.name || "" }); setEditId(null); setView("create"); }}>+ Create Live Class</button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[[" Live Now", live.length, "red"], [" Scheduled", scheduled.length, "blue"], [" Completed", done.length, "green"], [" Total", classes.length, "purple"]].map(([label, val, color]) => (
          <div key={label} className={`stat-card ${color}`}><div className={`stat-icon-box ${color}`}>{label.split(" ")[0]}</div><div><div className="stat-num">{val}</div><div className="stat-lbl">{label.split(" ").slice(1).join(" ")}</div></div></div>
        ))}
      </div>

      {loading ? <div className="empty-state"><div className="empty-icon" style={{ animation: "spin 1s linear infinite" }}></div><p>Loading...</p></div>
        : classes.length === 0 ? <div className="empty-state"><div className="empty-icon"></div><p>No live classes yet. Create your first session!</p></div>
          : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {classes.map(cls => {
                const isLive = cls.status === "live";
                const isDone = cls.status === "completed";
                return (
                  <div key={cls._id} className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: isLive ? "linear-gradient(135deg,#EF4444,#DC2626)" : "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--lms-text)" }}>{cls.title}</span>
                        {isLive && <span style={{ background: "#FEE2E2", color: "#DC2626", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}> LIVE</span>}
                        {cls.status === "scheduled" && <span style={{ background: "rgba(79,70,229,0.1)", color: "#4F46E5", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>Scheduled</span>}
                        {isDone && <span style={{ background: "rgba(34,197,94,0.1)", color: "#16A34A", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>Completed</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--lms-text-muted)" }}> {new Date(cls.startTime).toLocaleString()}   {cls.duration} min   {cls.participantCount || 0} joined</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                      {!isDone && !isLive && <button className="btn-sm btn-green" onClick={() => handleStart(cls)}> Start</button>}
                      {isLive && <button className="btn-sm btn-red" onClick={() => { setMeeting(cls); }}> Rejoin</button>}
                      {isLive && <button className="btn-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#DC2626" }} onClick={() => { endLiveClass(cls._id).then(load); }}> End</button>}
                      <button className="btn-sm btn-view" onClick={() => handleViewAttendance(cls)}> Attendance</button>
                      {!isDone && <button className="btn-sm btn-edit" onClick={() => { setForm({ ...cls, startTime: cls.startTime?.slice(0, 16) || "" }); setEditId(cls._id); setView("create"); }}></button>}
                      <button className="btn-sm btn-red" onClick={() => handleDelete(cls._id)}></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
