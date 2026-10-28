import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanLine,
  Boxes,
  ShieldCheck,
  BookOpen,
  History,
  BarChart3,
  TrendingUp,
  Truck,
  AlertTriangle,
  Mic,
  ShieldAlert,
  Settings,
  LogOut,
  X,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar({ isOpen, onClose }) {
  const { t } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/detection", label: t("nav.detection"), icon: ScanLine, highlight: true },
    { to: "/categories", label: t("nav.categories"), icon: Boxes },
    { to: "/collection-safety", label: t("nav.collection_safety"), icon: ShieldCheck },
    { to: "/knowledge", label: t("nav.knowledge"), icon: BookOpen },
    { to: "/history", label: t("nav.history"), icon: History },
    { to: "/analytics", label: t("nav.analytics"), icon: BarChart3 },
    { to: "/prediction", label: t("nav.prediction"), icon: TrendingUp },
    { to: "/smart-collection", label: t("nav.smart_collection"), icon: Truck },
    { to: "/incidents", label: t("nav.incidents"), icon: AlertTriangle },
    { to: "/voice-assistant", label: t("nav.voice_assistant"), icon: Mic },
    ...(isAdmin ? [{ to: "/admin", label: t("nav.admin"), icon: ShieldAlert }] : []),
    { to: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                SmartBioWaste
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase leading-none">
                AI Healthcare
              </span>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-semibold'
                      : item.highlight
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User & Logout Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50">
          {user ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title={t('nav.logout')}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition"
            >
              <span>{t('nav.login')}</span>
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
}
