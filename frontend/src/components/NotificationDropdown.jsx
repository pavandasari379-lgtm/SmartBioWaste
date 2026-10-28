import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.is_read).length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-40 overflow-hidden flex flex-col max-h-[460px]">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Hospital Safety Alerts</span>
              </div>
              <span className="text-xs text-slate-400">{unreadCount} unread</span>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-800/60 p-1 flex-1">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No notifications recorded.
                </div>
              ) : (
                notifications.map(n => {
                  const isAlert = n.type === 'ALERT';
                  const isWarning = n.type === 'WARNING';
                  return (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl transition flex gap-3 items-start ${
                        n.is_read ? 'opacity-70 hover:opacity-100' : 'bg-slate-800/40'
                      }`}
                      onClick={() => handleMarkAsRead(n.id)}
                    >
                      <div className="mt-0.5">
                        {isAlert ? (
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-semibold text-slate-200">{n.title}</h4>
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                        {n.link && (
                          <Link
                            to={n.link}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 mt-2 font-medium"
                          >
                            Open Alert <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
