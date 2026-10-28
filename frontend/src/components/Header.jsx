import React from 'react';
import { Globe, ShieldCheck, User as UserIcon, Menu } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import NotificationDropdown from './NotificationDropdown';

export default function Header({ onMenuClick }) {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-wide">
              {t('app_name')}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              v1.0 Local
            </span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1">
            {t('app_subtitle')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-xl p-1">
          <Globe className="w-4 h-4 text-slate-400 ml-1.5" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-xs text-slate-200 py-1 pr-2 pl-1 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="en" className="bg-slate-900 text-white">English (EN)</option>
            <option value="ta" className="bg-slate-900 text-white">தமிழ் (Tamil)</option>
            <option value="hi" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
          </select>
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Info */}
        {user ? (
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {user.full_name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-white leading-none">{user.full_name}</div>
              <div className="text-[10px] text-emerald-400 mt-0.5 font-medium leading-none">
                {user.role} • {user.department || 'Hospital'}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Staff Portal</span>
          </div>
        )}
      </div>
    </header>
  );
}
