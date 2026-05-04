import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { getLMSNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, clearAllNotifications } from '../api';

const TYPE_ICONS = { course: '📚', quiz: '📝', coding: '💻', test: '🧪', reminder: '⏰', announcement: '📢', result: '🏆', enrollment: '✅' };
const TYPE_COLORS = { course: '#4F46E5', quiz: '#8B5CF6', coding: '#22C55E', test: '#EF4444', reminder: '#F59E0B', announcement: '#3B82F6', result: '#22C55E', enrollment: '#06B6D4' };

function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell({ onNavigate }) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
    const bellRef = useRef(null);
    const dropdownRef = useRef(null);
    const pollRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await getLMSNotifications();
            if (data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch { }
    }, []);

    useEffect(() => {
        fetchNotifications();
        pollRef.current = setInterval(fetchNotifications, 30000);
        return () => clearInterval(pollRef.current);
    }, [fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                bellRef.current && !bellRef.current.contains(e.target)
            ) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Reposition on scroll/resize
    useEffect(() => {
        if (!open) return;
        const reposition = () => {
            if (!bellRef.current) return;
            const rect = bellRef.current.getBoundingClientRect();
            const dropW = 380;
            let left = rect.right - dropW;
            if (left < 8) left = 8;
            if (left + dropW > window.innerWidth - 8) left = window.innerWidth - dropW - 8;
            setDropdownPos({ top: rect.bottom + 10, left });
        };
        reposition();
        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        return () => { window.removeEventListener('scroll', reposition, true); window.removeEventListener('resize', reposition); };
    }, [open]);

    const handleOpen = async () => {
        if (!open && bellRef.current) {
            const rect = bellRef.current.getBoundingClientRect();
            const dropW = 380;
            let left = rect.right - dropW;
            if (left < 8) left = 8;
            if (left + dropW > window.innerWidth - 8) left = window.innerWidth - dropW - 8;
            setDropdownPos({ top: rect.bottom + 10, left });
        }
        setOpen(o => !o);
        if (!open) { setLoading(true); await fetchNotifications(); setLoading(false); }
    };

    const handleMarkRead = async (id) => {
        await markNotificationRead(id);
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(c => Math.max(0, c - 1));
    };

    const handleMarkAllRead = async () => {
        await markAllNotificationsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        const deleted = notifications.find(n => n._id === id);
        await deleteNotification(id);
        setNotifications(prev => prev.filter(n => n._id !== id));
        if (deleted && !deleted.isRead) setUnreadCount(c => Math.max(0, c - 1));
    };

    const handleClearAll = async () => {
        await clearAllNotifications();
        setNotifications([]);
        setUnreadCount(0);
    };

    const handleClick = async (notif) => {
        if (!notif.isRead) await handleMarkRead(notif._id);
        if (notif.redirectTab && onNavigate) onNavigate(notif.redirectTab);
        setOpen(false);
    };

    // Dropdown rendered as portal to escape sidebar overflow
    const dropdown = open ? ReactDOM.createPortal(
        <div
            ref={dropdownRef}
            style={{
                position: 'fixed',
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: 380,
                maxHeight: 520,
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--lms-card, #fff)',
                border: '1px solid var(--lms-border, #E2E8F0)',
                borderRadius: 18,
                boxShadow: '0 24px 64px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                animation: 'notifDropIn 0.22s cubic-bezier(0.16,1,0.3,1)',
            }}>
            {/* Header */}
            <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--lms-border, #E2E8F0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'var(--lms-card, #fff)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--lms-text, #0F172A)' }}>Notifications</span>
                    {unreadCount > 0 && (
                        <span style={{ background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>{unreadCount} new</span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} style={{ fontSize: 11, color: '#4F46E5', background: 'rgba(79,70,229,0.08)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                            Mark all read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button onClick={handleClearAll} style={{ fontSize: 11, color: 'var(--lms-text-muted, #64748B)', background: 'var(--lms-input-bg, #F8FAFC)', border: '1px solid var(--lms-border, #E2E8F0)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                            Clear all
                        </button>
                    )}
                    <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lms-text-muted, #64748B)', fontSize: 18, padding: '2px 6px', borderRadius: 6, lineHeight: 1, fontFamily: 'inherit' }}>✕</button>
                </div>
            </div>

            {/* Notification list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
                {loading ? (
                    <div style={{ padding: '36px', textAlign: 'center', color: 'var(--lms-text-muted, #64748B)', fontSize: 13 }}>
                        <div style={{ fontSize: 24, marginBottom: 8, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
                        <div>Loading notifications...</div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div style={{ padding: '44px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 44, marginBottom: 12 }}>🔔</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--lms-text, #0F172A)', marginBottom: 4 }}>All caught up!</div>
                        <div style={{ fontSize: 12, color: 'var(--lms-text-muted, #64748B)' }}>No notifications yet. We'll notify you when something new happens.</div>
                    </div>
                ) : (
                    notifications.map((n, idx) => (
                        <div key={n._id}
                            onClick={() => handleClick(n)}
                            style={{
                                display: 'flex', gap: 12, padding: '13px 16px',
                                cursor: 'pointer',
                                borderBottom: idx < notifications.length - 1 ? '1px solid var(--lms-border, #E2E8F0)' : 'none',
                                background: n.isRead ? 'transparent' : 'rgba(79,70,229,0.04)',
                                transition: 'background 0.15s',
                                position: 'relative',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--lms-hover, #EEF2FF)'}
                            onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(79,70,229,0.04)'}>
                            {/* Icon */}
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: (TYPE_COLORS[n.type] || '#4F46E5') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                                {TYPE_ICONS[n.type] || '🔔'}
                            </div>
                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: n.isRead ? 500 : 700, color: 'var(--lms-text, #0F172A)', marginBottom: 3, lineHeight: 1.4 }}>{n.title}</div>
                                <div style={{ fontSize: 12, color: 'var(--lms-text-muted, #64748B)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.message}</div>
                                <div style={{ fontSize: 11, color: 'var(--lms-text-dim, #94A3B8)', marginTop: 5 }}>{timeAgo(n.createdAt)}</div>
                            </div>
                            {/* Unread dot */}
                            {!n.isRead && (
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4F46E5', flexShrink: 0, marginTop: 6 }} />
                            )}
                            {/* Delete button */}
                            <button
                                onClick={(e) => handleDelete(e, n._id)}
                                style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lms-text-dim, #94A3B8)', fontSize: 13, padding: '3px 5px', borderRadius: 5, opacity: 0, transition: 'opacity 0.15s, color 0.15s', fontFamily: 'inherit', lineHeight: 1 }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = '0'; e.currentTarget.style.color = 'var(--lms-text-dim, #94A3B8)'; e.currentTarget.style.background = 'none'; }}>
                                ✕
                            </button>
                        </div>
                    ))
                )}
            </div>

            <style>{`
        @keyframes notifDropIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>,
        document.body
    ) : null;

    return (
        <>
            {/* Bell button */}
            <button
                ref={bellRef}
                onClick={handleOpen}
                title="Notifications"
                style={{
                    position: 'relative',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                    minWidth: 36,
                    minHeight: 36,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke={unreadCount > 0 ? '#818CF8' : '#CBD5E1'}
                    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ animation: unreadCount > 0 ? 'bellRing 2.5s ease-in-out infinite' : 'none', display: 'block' }}>
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: -4, right: -4,
                        background: '#EF4444', color: '#fff',
                        fontSize: 9, fontWeight: 800,
                        minWidth: 17, height: 17, borderRadius: 9,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 3px', border: '2px solid #0F172A',
                        animation: 'badgePop 0.3s ease-out',
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {dropdown}

            <style>{`
        @keyframes bellRing {
          0%,100%{transform:rotate(0)}
          8%,24%{transform:rotate(-14deg)}
          16%,32%{transform:rotate(14deg)}
          40%{transform:rotate(0)}
        }
        @keyframes badgePop {
          from{transform:scale(0)}
          to{transform:scale(1)}
        }
      `}</style>
        </>
    );
}
