import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { getStudentProfile, updateStudentProfile, uploadProfileImage, uploadResume, setDefaultResume, deleteResume } from "../api";

const API_BASE = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') + '/api'
    : (process.env.REACT_APP_API_BASE || "http://localhost:5001/api");
const SERVER = API_BASE.replace("/api", "");

const SECTIONS = [
    { id: "profile", label: "Profile", icon: "" },
    { id: "academic", label: "Academic", icon: "" },
    { id: "skills", label: "Skills", icon: "" },
    { id: "resume", label: "Resume", icon: "" },
    { id: "password", label: "Change Password", icon: "" },
    { id: "appearance", label: "Appearance", icon: "" },
    { id: "account", label: "Account", icon: "" },
];

export default function Settings({ user, onLogout }) {
    const { isDark, toggleTheme } = useTheme();
    const [section, setSection] = useState("profile");
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [skillInput, setSkillInput] = useState("");
    const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
    const [pwError, setPwError] = useState("");
    const [imgPreview, setImgPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const imgRef = useRef();
    const resumeRef = useRef();

    const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

    useEffect(() => {
        getStudentProfile().then(data => {
            if (data?._id) {
                setProfile(data);
                setForm({
                    fullName: data.fullName || user?.name || "",
                    gender: data.gender || "",
                    mobile: data.mobile || "",
                    whatsapp: data.whatsapp || "",
                    dob: data.dob || "",
                    parentMobile: data.parentMobile || "",
                    linkedin: data.linkedin || "",
                    github: data.github || "",
                    instagram: data.instagram || "",
                    currentState: data.currentState || "",
                    currentCity: data.currentCity || "",
                    nativeState: data.nativeState || "",
                    nativeCity: data.nativeCity || "",
                    address: data.address || "",
                    bio: data.bio || "",
                    college: data.college || "",
                    degree: data.degree || "",
                    branch: data.branch || "",
                    semester: data.semester || "",
                    cgpa: data.cgpa || "",
                    passingYear: data.passingYear || "",
                    skills: data.skills || [],
                });
            }
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const res = await updateStudentProfile(form);
        if (res._id) { setProfile(res); showToast("Profile saved successfully!"); }
        else showToast("Failed to save", "error");
        setSaving(false);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImgPreview(URL.createObjectURL(file));
        setUploading(true);
        const fd = new FormData();
        fd.append("image", file);
        const res = await uploadProfileImage(fd);
        if (res.profileImage) { setProfile(p => ({ ...p, profileImage: res.profileImage })); showToast("Profile photo updated!"); }
        else showToast("Upload failed", "error");
        setUploading(false);
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("resume", file);
        fd.append("name", `Resume ${(profile?.resumes?.length || 0) + 1}`);
        const res = await uploadResume(fd);
        if (res._id) { setProfile(res); showToast("Resume uploaded!"); }
        else showToast("Upload failed", "error");
    };

    const handleSetDefault = async (id) => {
        const res = await setDefaultResume(id);
        if (res._id) { setProfile(res); showToast("Default resume set!"); }
    };

    const handleDeleteResume = async (id) => {
        if (!window.confirm("Delete this resume?")) return;
        const res = await deleteResume(id);
        if (res._id) { setProfile(res); showToast("Resume deleted"); }
    };

    const addSkill = () => {
        const s = skillInput.trim();
        if (!s || form.skills?.includes(s)) return;
        setForm(f => ({ ...f, skills: [...(f.skills || []), s] }));
        setSkillInput("");
    };

    const removeSkill = (s) => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));

    const completion = profile?.profileCompletionPercentage || 0;
    const profileImg = imgPreview || (profile?.profileImage ? SERVER + profile.profileImage : null);

    const inp = { width: "100%", padding: "9px 12px", border: "1.5px solid var(--lms-border)", borderRadius: 9, fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--lms-input-bg)", color: "var(--lms-text)", boxSizing: "border-box", transition: "border-color 0.2s" };
    const lbl = { fontSize: 11, fontWeight: 700, color: "var(--lms-text-muted)", marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: "0.4px" };
    const fg = { display: "flex", flexDirection: "column", gap: 5 };

    return (
        <div className="lms-page">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
            <div className="page-header"><div className="page-title"> Settings</div><div className="page-sub">Manage your profile and preferences</div></div>

            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
                {/* Sidebar */}
                <div className="card" style={{ padding: "10px 8px", height: "fit-content" }}>
                    {SECTIONS.map(s => (
                        <button key={s.id} onClick={() => setSection(s.id)}
                            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", textAlign: "left", transition: "all 0.2s", marginBottom: 2, background: section === s.id ? "linear-gradient(135deg,#4F46E5,#7C3AED)" : "transparent", color: section === s.id ? "#fff" : "var(--lms-text-muted)" }}>
                            <span>{s.icon}</span>{s.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div>

                    {/* PROFILE SECTION */}
                    {section === "profile" && (
                        <div>
                            {/* Cover + Avatar */}
                            <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
                                <div style={{ height: 140, background: "linear-gradient(135deg,#4F46E5,#7C3AED,#06B6D4)", position: "relative" }}>
                                    <div style={{ position: "absolute", bottom: -36, left: 24, display: "flex", alignItems: "flex-end", gap: 14 }}>
                                        <div style={{ position: "relative" }}>
                                            <div style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid var(--lms-card)", overflow: "hidden", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#fff" }}>
                                                {profileImg ? <img src={profileImg} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (user?.name?.[0]?.toUpperCase())}
                                            </div>
                                            <button onClick={() => imgRef.current?.click()} style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: "#4F46E5", border: "2px solid var(--lms-card)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✏️</button>
                                            <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ padding: "48px 24px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--lms-text)" }}>{form.fullName || user?.name}</div>
                                        <span style={{ background: "rgba(79,70,229,0.12)", color: "#4F46E5", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>Student</span>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: 12, color: "var(--lms-text-muted)", marginBottom: 4 }}>Profile Completion</div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div style={{ width: 120, height: 6, background: "var(--lms-border)", borderRadius: 3, overflow: "hidden" }}>
                                                <div style={{ width: `${completion}%`, height: "100%", background: completion >= 70 ? "#22C55E" : "#F59E0B", borderRadius: 3, transition: "width 0.5s" }} />
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 800, color: completion >= 70 ? "#22C55E" : "#F59E0B" }}>{completion}%</span>
                                        </div>
                                        {completion < 70 && <div style={{ fontSize: 11, color: "#F59E0B", marginTop: 4 }}> Complete your profile</div>}
                                    </div>
                                </div>
                            </div>

                            {/* Personal Info */}
                            <div className="card" style={{ marginBottom: 16 }}>
                                <div className="card-title"> Personal Information</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                    {[["fullName", "Full Name", "text"], ["gender", "Gender", "select"], ["mobile", "Mobile Number", "tel"], ["whatsapp", "WhatsApp Number", "tel"], ["dob", "Date of Birth", "date"], ["parentMobile", "Parent/Guardian Mobile", "tel"], ["linkedin", "LinkedIn URL", "url"], ["github", "GitHub URL", "url"], ["instagram", "Instagram Link", "url"], ["currentState", "Current State", "text"], ["currentCity", "Current City", "text"], ["nativeState", "Native State", "text"], ["nativeCity", "Native City", "text"]].map(([key, label, type]) => (
                                        <div key={key} style={fg}>
                                            <label style={lbl}>{label}</label>
                                            {type === "select" ? (
                                                <select style={inp} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}>
                                                    <option value="">Select</option>
                                                    {["Male", "Female", "Other", "Prefer not to say"].map(g => <option key={g}>{g}</option>)}
                                                </select>
                                            ) : (
                                                <input style={inp} type={type} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} onFocus={e => e.target.style.borderColor = "#4F46E5"} onBlur={e => e.target.style.borderColor = "var(--lms-border)"} />
                                            )}
                                        </div>
                                    ))}
                                    <div style={{ ...fg, gridColumn: "1/-1" }}>
                                        <label style={lbl}>Address</label>
                                        <input style={inp} value={form.address || ""} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} onFocus={e => e.target.style.borderColor = "#4F46E5"} onBlur={e => e.target.style.borderColor = "var(--lms-border)"} />
                                    </div>
                                    <div style={{ ...fg, gridColumn: "1/-1" }}>
                                        <label style={lbl}>Bio / About Me</label>
                                        <textarea style={{ ...inp, resize: "vertical", minHeight: 80 }} value={form.bio || ""} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} onFocus={e => e.target.style.borderColor = "#4F46E5"} onBlur={e => e.target.style.borderColor = "var(--lms-border)"} />
                                    </div>
                                </div>
                                <button className="btn-primary" style={{ marginTop: 16 }} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : " Save Profile"}</button>
                            </div>
                        </div>
                    )}

                    {/* ACADEMIC SECTION */}
                    {section === "academic" && (
                        <div className="card">
                            <div className="card-title"> Academic Information</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                {[["college", "College Name"], ["degree", "Degree"], ["branch", "Branch/Stream"], ["semester", "Current Semester"], ["cgpa", "CGPA/Percentage"], ["passingYear", "Passing Year"]].map(([key, label]) => (
                                    <div key={key} style={fg}>
                                        <label style={lbl}>{label}</label>
                                        <input style={inp} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} onFocus={e => e.target.style.borderColor = "#4F46E5"} onBlur={e => e.target.style.borderColor = "var(--lms-border)"} />
                                    </div>
                                ))}
                            </div>
                            <button className="btn-primary" style={{ marginTop: 16 }} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : " Save Academic Info"}</button>
                        </div>
                    )}

                    {/* SKILLS SECTION */}
                    {section === "skills" && (
                        <div className="card">
                            <div className="card-title"> Skills & Technologies</div>
                            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                                <input style={{ ...inp, flex: 1 }} placeholder="Add a skill (e.g. React, Java, Python...)" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()} onFocus={e => e.target.style.borderColor = "#4F46E5"} onBlur={e => e.target.style.borderColor = "var(--lms-border)"} />
                                <button className="btn-primary" style={{ padding: "9px 18px", whiteSpace: "nowrap" }} onClick={addSkill}>+ Add</button>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                                {(form.skills || []).map(s => (
                                    <span key={s} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(79,70,229,0.1)", color: "#4F46E5", padding: "5px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                                        {s}
                                        <button onClick={() => removeSkill(s)} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", fontSize: 14, padding: 0, lineHeight: 1 }}></button>
                                    </span>
                                ))}
                                {(form.skills || []).length === 0 && <div style={{ fontSize: 13, color: "var(--lms-text-muted)" }}>No skills added yet. Add your technical skills above.</div>}
                            </div>
                            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : " Save Skills"}</button>
                        </div>
                    )}

                    {/* RESUME SECTION */}
                    {section === "resume" && (
                        <div className="card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                <div className="card-title" style={{ margin: 0 }}> Resume Management</div>
                                <div style={{ fontSize: 12, color: "var(--lms-text-muted)" }}>{profile?.resumes?.length || 0}/4 uploaded</div>
                            </div>
                            {(profile?.resumes?.length || 0) < 4 && (
                                <div onClick={() => resumeRef.current?.click()} style={{ border: "2px dashed var(--lms-border)", borderRadius: 12, padding: "20px", textAlign: "center", cursor: "pointer", marginBottom: 16, transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#4F46E5"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--lms-border)"}>
                                    <div style={{ fontSize: 28, marginBottom: 6 }}></div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--lms-text)" }}>Click to upload resume</div>
                                    <div style={{ fontSize: 11, color: "var(--lms-text-muted)", marginTop: 3 }}>PDF only  Max 10MB</div>
                                    <input ref={resumeRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handleResumeUpload} />
                                </div>
                            )}
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {(profile?.resumes || []).map((r, i) => (
                                    <div key={r._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--lms-input-bg)", borderRadius: 10, border: "1px solid var(--lms-border)" }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 8, background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}></div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--lms-text)" }}>{r.name}</div>
                                            <div style={{ fontSize: 11, color: "var(--lms-text-muted)" }}>PDF Document  {new Date(r.uploadedAt).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                            {r.isDefault && <span style={{ fontSize: 10, fontWeight: 700, background: "#DCFCE7", color: "#166534", padding: "2px 8px", borderRadius: 6 }}>Default</span>}
                                            <a href={SERVER + r.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#4F46E5", fontWeight: 600, textDecoration: "none" }}>View</a>
                                            {!r.isDefault && <button onClick={() => handleSetDefault(r._id)} style={{ fontSize: 11, color: "#4F46E5", background: "rgba(79,70,229,0.08)", border: "none", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontFamily: "inherit" }}>Set Default</button>}
                                            <button onClick={() => handleDeleteResume(r._id)} style={{ fontSize: 13, color: "#EF4444", background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}></button>
                                        </div>
                                    </div>
                                ))}
                                {(profile?.resumes || []).length === 0 && <div style={{ textAlign: "center", padding: "20px 0", fontSize: 13, color: "var(--lms-text-muted)" }}>No resumes uploaded yet.</div>}
                            </div>
                        </div>
                    )}

                    {/* PASSWORD SECTION */}
                    {section === "password" && (
                        <div className="card">
                            <div className="card-title"> Change Password</div>
                            {pwError && <div style={{ background: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: 8, padding: "10px 14px", color: "#991B1B", fontSize: 13, marginBottom: 14 }}> {pwError}</div>}
                            {[["Current Password", "current"], ["New Password", "newPw"], ["Confirm New Password", "confirm"]].map(([label, key]) => (
                                <div key={key} style={{ ...fg, marginBottom: 14 }}>
                                    <label style={lbl}>{label}</label>
                                    <input type="password" style={inp} value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} onFocus={e => e.target.style.borderColor = "#4F46E5"} onBlur={e => e.target.style.borderColor = "var(--lms-border)"} />
                                </div>
                            ))}
                            <div style={{ background: "#EFF6FF", border: "1px solid #DBEAFE", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#1E40AF", marginBottom: 14 }}>ℹ Password must be at least 8 characters.</div>
                            <button className="btn-primary" onClick={() => {
                                setPwError("");
                                if (!pwForm.current) return setPwError("Enter current password");
                                if (pwForm.newPw.length < 8) return setPwError("New password must be at least 8 characters");
                                if (pwForm.newPw !== pwForm.confirm) return setPwError("Passwords do not match");
                                showToast("Password changed successfully!");
                                setPwForm({ current: "", newPw: "", confirm: "" });
                            }}>Update Password</button>
                        </div>
                    )}

                    {/* APPEARANCE SECTION */}
                    {section === "appearance" && (
                        <div className="card">
                            <div className="card-title"> Appearance</div>
                            <div style={{ background: "var(--lms-input-bg)", border: "1.5px solid var(--lms-border)", borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--lms-text)", marginBottom: 3 }}>{isDark ? " Dark Mode" : " Light Mode"}</div>
                                        <div style={{ fontSize: 12, color: "var(--lms-text-muted)" }}>{isDark ? "Switch to light theme" : "Switch to dark theme"}</div>
                                    </div>
                                    <div onClick={toggleTheme} style={{ width: 52, height: 26, borderRadius: 13, background: isDark ? "#4F46E5" : "#CBD5E1", cursor: "pointer", position: "relative", transition: "background 0.3s", flexShrink: 0 }}>
                                        <div style={{ position: "absolute", top: 3, left: isDark ? 29 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.3s", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{isDark ? "" : ""}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ACCOUNT SECTION */}
                    {section === "account" && (
                        <div className="card">
                            <div className="card-title"> Account Settings</div>
                            <div style={{ background: "var(--lms-input-bg)", border: "1px solid var(--lms-border)", borderRadius: 12, padding: "16px 18px", marginBottom: 14 }}>
                                <div className="card-title" style={{ fontSize: 13, marginBottom: 10 }}>Account Information</div>
                                {[["Name", user?.name], ["Email", user?.email], ["Role", user?.role], ["Profile", `${completion}% complete`]].map(([k, v]) => (
                                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--lms-border)", fontSize: 13 }}>
                                        <span style={{ color: "var(--lms-text-muted)" }}>{k}</span>
                                        <span style={{ fontWeight: 600, color: "var(--lms-text)", textTransform: "capitalize" }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: 12, padding: "16px 18px" }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#991B1B", marginBottom: 6 }}>Danger Zone</div>
                                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>Logging out will end your current session.</div>
                                <button onClick={onLogout} style={{ padding: "9px 20px", background: "#EF4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}> Logout</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
