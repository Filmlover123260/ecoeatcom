import React from 'react';
import {
  X,
  LayoutDashboard,
  Camera,
  BarChart3,
  User,
  Settings,
  Leaf,
  Moon,
  Sun,
  Palette,
  LogOut,
  ShoppingBag,
} from 'lucide-react';
import { TabType, UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { EcoEatLogo } from './EcoEatLogo';
import { toAbsoluteHttpsUrl, CAMPUS_LINKS } from '../utils/urlHelper';
import { ExternalLink } from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenThemePicker?: () => void;
  onSignOut?: () => void;
  user: UserProfile;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  onOpenThemePicker,
  onSignOut,
  user,
}) => {
  const { darkMode, toggleDarkMode, activeTheme } = useTheme();
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch justify-center sm:justify-start animate-in fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer / Bottom Sheet Panel */}
      <div
        id="sidebar-drawer-panel"
        className="relative flex flex-col w-full sm:w-80 max-w-full sm:max-w-xs max-h-[85vh] sm:max-h-full overflow-y-auto bg-theme-card border-t sm:border-t-0 sm:border-r border-theme-card rounded-t-3xl sm:rounded-none shadow-2xl p-5 sm:p-6 space-y-5 sm:space-y-6 z-10 transition-all duration-300 animate-in slide-in-from-bottom sm:slide-in-from-left"
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="w-12 h-1.5 bg-theme-muted/40 rounded-full mx-auto sm:hidden -mt-1 mb-1 shrink-0" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <EcoEatLogo size="sm" />
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-theme-main block leading-tight">
                {t('app_name', 'EcoEat')}
              </span>
              <span className="text-[11px] text-theme-muted">
                {t('drawer_student_hub', 'BBS PIK Student Hub & Options')}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-full text-theme-muted hover:text-theme-main hover:bg-theme-card-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Mini Profile Card */}
        <div className="p-4 rounded-2xl bg-theme-card-subtle border border-theme-card flex items-center gap-3">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-theme-primary"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-theme-main truncate">{user.name}</h4>
            <p className="text-xs text-theme-primary font-bold">{t('level', 'Lvl')} {user.level} {user.title}</p>
            <p className="text-[11px] text-theme-muted truncate">{user.school}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-1 flex-1">
          <a
            id="drawer-link-dashboard"
            href={toAbsoluteHttpsUrl('/dashboard')}
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('dashboard');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer no-underline ${
              currentTab === 'dashboard'
                ? 'bg-theme-primary text-black font-extrabold shadow-sm shadow-theme-glow'
                : 'text-theme-main hover:bg-theme-card-subtle'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>{t('nav_dashboard', 'Dashboard')}</span>
          </a>

          <a
            id="drawer-link-capture"
            href={toAbsoluteHttpsUrl('/capture')}
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('capture');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer no-underline ${
              currentTab === 'capture'
                ? 'bg-theme-primary text-black font-extrabold shadow-sm shadow-theme-glow'
                : 'text-theme-main hover:bg-theme-card-subtle'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span>{t('nav_capture', 'Scan Meal')}</span>
          </a>

          <a
            id="drawer-link-leaderboard"
            href={toAbsoluteHttpsUrl('/leaderboard')}
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('leaderboard');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer no-underline ${
              currentTab === 'leaderboard'
                ? 'bg-theme-primary text-black font-extrabold shadow-sm shadow-theme-glow'
                : 'text-theme-main hover:bg-theme-card-subtle'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>{t('nav_leaderboard', 'Leaderboard')}</span>
          </a>

          <a
            id="drawer-link-shop"
            href={toAbsoluteHttpsUrl('/shop')}
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('shop');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer no-underline ${
              currentTab === 'shop'
                ? 'bg-theme-primary text-black font-extrabold shadow-sm shadow-theme-glow'
                : 'text-theme-main hover:bg-theme-card-subtle'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>{t('nav_shop', 'Sticker Shop')}</span>
          </a>

          <a
            id="drawer-link-profile"
            href={toAbsoluteHttpsUrl('/profile')}
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('profile');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer no-underline ${
              currentTab === 'profile'
                ? 'bg-theme-primary text-black font-extrabold shadow-sm shadow-theme-glow'
                : 'text-theme-main hover:bg-theme-card-subtle'
            }`}
          >
            <User className="w-5 h-5" />
            <span>{t('nav_profile', 'Profile')}</span>
          </a>

          <a
            id="drawer-link-settings"
            href={toAbsoluteHttpsUrl('/settings')}
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('settings');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer no-underline ${
              currentTab === 'settings'
                ? 'bg-theme-primary text-black font-extrabold shadow-sm shadow-theme-glow'
                : 'text-theme-main hover:bg-theme-card-subtle'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>{t('nav_settings', 'Settings')}</span>
          </a>
        </div>

        {/* Appearance & Themes Quick Switch Section in Drawer */}
        <div className="p-4 rounded-2xl bg-theme-card-subtle border border-theme-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-theme-main">
              <Palette className="w-4 h-4 text-theme-primary" />
              <span>{activeTheme.name}</span>
            </div>
            {onOpenThemePicker && (
              <button
                onClick={() => {
                  onClose();
                  onOpenThemePicker();
                }}
                className="text-[11px] font-bold text-theme-primary hover:underline cursor-pointer"
              >
                {t('change', 'Change')}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-theme-card">
            <span className="text-xs text-theme-muted">{t('settings_dark_mode', 'Dark Mode')}</span>
            <button
              id="drawer-toggle-mode"
              onClick={toggleDarkMode}
              className={`p-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 text-amber-300'
                  : 'bg-amber-100 border-amber-300 text-amber-800'
              }`}
            >
              {darkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span>{darkMode ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </div>

        {/* Drawer Sign Out */}
        {onSignOut && (
          <button
            id="drawer-btn-sign-out"
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('settings_sign_out', 'Sign Out')}</span>
          </button>
        )}

        {/* Campus Portal & Sustainability Links - all explicit https:// */}
        <div className="pt-2 border-t border-theme-card/60 space-y-1.5 text-[11px] text-theme-muted">
          <div className="flex items-center justify-between px-1">
            <span className="font-bold text-theme-main">BBS PIK Campus Hub</span>
            <span className="text-[10px] text-theme-primary font-bold">2026</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <a
              id="drawer-link-campus"
              href={CAMPUS_LINKS.BBS_PIK_CAMPUS}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-xl bg-theme-card-subtle hover:bg-theme-card text-theme-muted hover:text-theme-primary transition-colors cursor-pointer no-underline border border-theme-card"
            >
              <span>Campus Site</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
            <a
              id="drawer-link-sustainability"
              href={CAMPUS_LINKS.SUSTAINABILITY_CHARTER}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-xl bg-theme-card-subtle hover:bg-theme-card text-theme-muted hover:text-theme-primary transition-colors cursor-pointer no-underline border border-theme-card"
            >
              <span>Charter</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
          <div className="text-center pt-2">
            <a
              id="drawer-link-privacy"
              href={CAMPUS_LINKS.PRIVACY_POLICY}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-theme-muted hover:text-theme-main underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>Student Privacy Guidelines</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Version Footer */}
        <div className="pt-1 text-center text-xs text-theme-muted">
          EcoEat • BBS PIK Campus Dining
        </div>
      </div>
    </div>
  );
};
