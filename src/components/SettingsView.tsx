import React, { useState, useRef } from 'react';
import {
  ChevronRight,
  ShieldCheck,
  Sparkles,
  LogOut,
  Globe,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { AppSettings, UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from '../context/LanguageContext';
import { CAMPUS_LINKS } from '../utils/urlHelper';

interface DraggableGoalSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  id?: string;
}

const DraggableGoalSlider: React.FC<DraggableGoalSliderProps> = ({
  value,
  min,
  max,
  step = 5,
  onChange,
  id = 'slider-waste-goal',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const clampedValue = Math.min(max, Math.max(min, value));
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  const updateFromPointer = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const rawRatio = (clientX - rect.left) / rect.width;
    const clampedRatio = Math.max(0, Math.min(1, rawRatio));
    const rawValue = min + clampedRatio * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    const finalValue = Math.max(min, Math.min(max, steppedValue));
    onChange(finalValue);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDragging(true);
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateFromPointer(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(min, clampedValue - step));
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(max, clampedValue + step));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(min);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(max);
    }
  };

  return (
    <div className="w-full pt-1 pb-0.5">
      {/* Draggable Track Area with enhanced touch target */}
      <div
        id={id}
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-label="Daily Food Saved Slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clampedValue}
        className="relative py-3 cursor-pointer select-none touch-none group focus:outline-none"
      >
        {/* Track background */}
        <div className="h-3 rounded-full bg-theme-card-subtle border border-theme-card relative overflow-hidden shadow-inner">
          {/* Active filled track */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-theme-primary transition-all duration-75 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Tick markers at 0%, 25%, 50%, 75%, 100% */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-1 pointer-events-none opacity-40">
          <div className="w-1 h-1 rounded-full bg-theme-muted" />
          <div className="w-1 h-1 rounded-full bg-theme-muted" />
          <div className="w-1.5 h-1.5 rounded-full bg-theme-muted" />
          <div className="w-1 h-1 rounded-full bg-theme-muted" />
          <div className="w-1 h-1 rounded-full bg-theme-muted" />
        </div>

        {/* Draggable Thumb / Handle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white dark:bg-zinc-100 border-2 border-theme-primary shadow-lg flex items-center justify-center transition-transform duration-75 ${
            isDragging
              ? 'scale-125 shadow-theme-glow ring-4 ring-theme-primary/30 cursor-grabbing'
              : 'cursor-grab group-hover:scale-110'
          }`}
          style={{ left: `${percentage}%` }}
        >
          {/* Subtle tactile grip center */}
          <div className="w-2 h-2 rounded-full bg-theme-primary" />

          {/* Floating Tooltip Indicator while dragging or hovering */}
          <div
            className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[11px] font-extrabold shadow-md pointer-events-none transition-all duration-150 ${
              isDragging ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
            }`}
          >
            {clampedValue}g
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface SettingsViewProps {
  settings: AppSettings;
  user: UserProfile;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenEditProfile: () => void;
  onOpenChangePassword: () => void;
  onOpenGreetingCustomizer: () => void;
  onOpenThemePicker: () => void;
  onOpenFAQ: () => void;
  onOpenContactUs: () => void;
  onOpenPrivacyPolicy: () => void;
  onSignOut: () => void;
  onRestartMeals?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  user,
  onUpdateSettings,
  onOpenEditProfile,
  onOpenChangePassword,
  onOpenGreetingCustomizer,
  onOpenThemePicker,
  onOpenFAQ,
  onOpenContactUs,
  onOpenPrivacyPolicy,
  onSignOut,
  onRestartMeals,
}) => {
  const { darkMode, setDarkMode, activeTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    onUpdateSettings({ language: newLang });
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-7 pb-28 animate-in fade-in duration-300">
      {/* 1. ACCOUNT Section */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider font-bold text-theme-muted px-1">
          {t('settings_account', 'Account')}
        </h3>

        <div className="bg-theme-card border border-theme-card rounded-3xl overflow-hidden divide-y divide-theme-card shadow-lg">
          {/* Edit Profile & Greeting Name */}
          <div
            id="setting-edit-profile"
            onClick={onOpenEditProfile}
            className="p-4 sm:p-5 flex items-center justify-between hover:bg-theme-card-subtle transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-theme-primary shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-theme-main">{t('settings_edit_profile', 'Edit Profile & Picture')}</h4>
                <p className="text-xs text-theme-muted">
                  Greeting: {user.greetingName || 'Alex'} • {user.name}
                </p>
              </div>
            </div>
            <button
              id="btn-setting-customizable"
              onClick={(e) => {
                e.stopPropagation();
                onOpenEditProfile();
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-theme-primary-bg border border-theme-primary-border text-xs font-bold text-theme-primary hover:bg-theme-primary hover:text-black transition-all cursor-pointer"
            >
              <span>{t('customizable', 'Customizable')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Change Password */}
          <div
            id="setting-change-password"
            onClick={onOpenChangePassword}
            className="p-4 sm:p-5 flex items-center justify-between hover:bg-theme-card-subtle transition-colors cursor-pointer"
          >
            <h4 className="text-sm font-bold text-theme-main">{t('settings_change_password', 'Change Password')}</h4>
            <ChevronRight className="w-4 h-4 text-theme-muted" />
          </div>

          {/* School ID */}
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-theme-main">{t('settings_school_id', 'School ID')}</h4>
              <p className="text-xs text-theme-muted">{settings.schoolName}</p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-primary-bg border border-theme-primary-border text-xs font-bold text-theme-main">
              <ShieldCheck className="w-3.5 h-3.5 text-theme-primary" />
              <span>{t('verified', 'Verified')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PREFERENCES Section */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider font-bold text-theme-muted px-1">
          {t('settings_preferences', 'Preferences')}
        </h3>

        <div className="bg-theme-card border border-theme-card rounded-3xl overflow-hidden divide-y divide-theme-card shadow-lg">
          {/* Meal Reminders Toggle */}
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <h4 className="text-sm font-bold text-theme-main">{t('settings_meal_reminders', 'Meal Reminders')}</h4>
            <button
              id="toggle-meal-reminders"
              onClick={() => onUpdateSettings({ mealReminders: !settings.mealReminders })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                settings.mealReminders ? 'bg-theme-primary' : 'bg-theme-card-subtle border border-theme-card'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.mealReminders ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Challenge Updates Toggle */}
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <h4 className="text-sm font-bold text-theme-main">{t('settings_challenge_updates', 'Challenge Updates')}</h4>
            <button
              id="toggle-challenge-updates"
              onClick={() => onUpdateSettings({ challengeUpdates: !settings.challengeUpdates })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                settings.challengeUpdates ? 'bg-theme-primary' : 'bg-theme-card-subtle border border-theme-card'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.challengeUpdates ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Language Selector */}
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-theme-primary" />
                <h4 className="text-sm font-bold text-theme-main">{t('settings_language', 'Language')}</h4>
              </div>
              <p className="text-xs text-theme-muted">{t('settings_language_desc', 'Choose interface language')}</p>
            </div>
            
            <select
              id="setting-language-select"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              className="bg-theme-card-subtle border border-theme-primary/50 text-theme-main font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary cursor-pointer transition-all hover:border-theme-primary"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.name} value={lang.name} className="bg-theme-card text-theme-main font-medium">
                  {lang.flag} {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Greeting Name & Color Customizer */}
          <div
            id="setting-greeting-color"
            onClick={onOpenGreetingCustomizer}
            className="p-4 sm:p-5 flex items-center justify-between hover:bg-theme-card-subtle transition-colors cursor-pointer"
          >
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-theme-main">{t('settings_greeting_color', 'Greeting Name & Color')}</h4>
              <p className="text-xs text-theme-muted">
                ● {user.greetingName} • {user.greetingColor.toUpperCase()}
              </p>
            </div>
            <button
              id="btn-customize-greeting"
              onClick={(e) => {
                e.stopPropagation();
                onOpenGreetingCustomizer();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-theme-primary-bg border border-theme-primary-border text-xs font-bold text-theme-primary hover:bg-theme-primary hover:text-black transition-all cursor-pointer"
            >
              <span>{t('customize', 'Customize')}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Picker */}
          <div
            id="setting-theme"
            onClick={onOpenThemePicker}
            className="p-4 sm:p-5 flex items-center justify-between hover:bg-theme-card-subtle transition-colors cursor-pointer"
          >
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-theme-main">{t('settings_theme', 'Theme & Appearance')}</h4>
              <p className="text-xs text-theme-muted">
                {activeTheme.name} • {activeTheme.category}
              </p>
            </div>
            <button
              id="btn-change-theme"
              onClick={(e) => {
                e.stopPropagation();
                onOpenThemePicker();
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-theme-primary-bg border border-theme-primary-border text-xs font-bold text-theme-primary hover:bg-theme-primary hover:text-black transition-all cursor-pointer"
            >
              <span>{t('change', 'Change Theme')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-theme-main">{t('settings_dark_mode', 'Dark Mode')}</h4>
              <p className="text-xs text-theme-muted">
                {darkMode ? t('settings_dark_desc', 'High contrast dark theme') : t('settings_light_desc', 'Crisp daylight theme')}
              </p>
            </div>
            <button
              id="toggle-dark-mode"
              onClick={() => {
                const nextMode = !darkMode;
                setDarkMode(nextMode);
                onUpdateSettings({ darkMode: nextMode });
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                darkMode ? 'bg-theme-primary' : 'bg-theme-card-subtle border border-theme-card'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. SUSTAINABILITY Section */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider font-bold text-theme-muted px-1">
          {t('settings_sustainability', 'Sustainability')}
        </h3>

        <div className="bg-theme-card border border-theme-card rounded-3xl overflow-hidden divide-y divide-theme-card shadow-lg">
          {/* Daily Food Saved Slider */}
          <div className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-theme-main">{t('settings_daily_goal', 'Daily Food Saved')}</h4>
                <p className="text-xs text-theme-muted">Daily target of surplus food to save from disposal</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-decrease-food-saved"
                  onClick={() => onUpdateSettings({ dailyWasteGoal: Math.max(0, settings.dailyWasteGoal - 10) })}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-theme-card-subtle hover:bg-theme-card border border-theme-card text-theme-main font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-xs"
                  title="Decrease amount"
                  aria-label="Decrease amount"
                >
                  −
                </button>
                <span className="bg-theme-primary-bg text-theme-primary border border-theme-primary-border text-xs font-extrabold px-3 py-1.5 rounded-full shadow-sm min-w-[58px] text-center">
                  {settings.dailyWasteGoal}g
                </span>
                <button
                  type="button"
                  id="btn-increase-food-saved"
                  onClick={() => onUpdateSettings({ dailyWasteGoal: Math.min(100, settings.dailyWasteGoal + 10) })}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-theme-card-subtle hover:bg-theme-card border border-theme-card text-theme-main font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-xs"
                  title="Increase amount"
                  aria-label="Increase amount"
                >
                  +
                </button>
              </div>
            </div>

            <DraggableGoalSlider
              id="slider-waste-goal"
              min={0}
              max={100}
              step={5}
              value={settings.dailyWasteGoal}
              onChange={(val) => onUpdateSettings({ dailyWasteGoal: val })}
            />
            <div className="flex justify-between text-[10px] text-theme-muted font-semibold">
              <span>0g (Target)</span>
              <span>50g (Middle)</span>
              <span>100g (Ambitious)</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-theme-muted font-medium mr-1">Quick:</span>
              {[0, 25, 50, 75, 100].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  id={`preset-food-saved-${amount}`}
                  onClick={() => onUpdateSettings({ dailyWasteGoal: amount })}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    settings.dailyWasteGoal === amount
                      ? 'bg-theme-primary text-white border-theme-primary shadow-xs'
                      : 'bg-theme-card-subtle text-theme-muted hover:text-theme-main border-theme-card hover:bg-theme-card'
                  }`}
                >
                  {amount}g
                </button>
              ))}
            </div>
          </div>

          {/* Campus Visibility */}
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-theme-main">{t('settings_campus_visibility', 'Campus Visibility')}</h4>
              <p className="text-xs text-theme-muted">{t('settings_campus_visibility_desc', 'Participate in BBS PIK Campus Challenges')}</p>
            </div>
            <button
              id="toggle-campus-visibility"
              onClick={() => onUpdateSettings({ campusVisibility: !settings.campusVisibility })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                settings.campusVisibility ? 'bg-theme-primary' : 'bg-theme-card-subtle border border-theme-card'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.campusVisibility ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. DATA & HISTORY Section */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider font-bold text-theme-muted px-1">
          {t('settings_data_history', 'Data & Meals')}
        </h3>

        <div className="bg-theme-card border border-theme-card rounded-3xl overflow-hidden divide-y divide-theme-card shadow-lg">
          {onRestartMeals && (
            <div
              id="setting-restart-meals"
              onClick={onRestartMeals}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-theme-card-subtle transition-colors cursor-pointer"
            >
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-theme-main">{t('restart_recent_meals', 'Restart Recent Meals Log')}</h4>
                <p className="text-xs text-theme-muted">
                  {t('restart_recent_meals_desc', 'Clear past meal scans and start fresh from 0 meals')}
                </p>
              </div>
              <button
                id="btn-trigger-restart-meals"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestartMeals();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('restart', 'Restart')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. SUPPORT Section */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider font-bold text-theme-muted px-1">
          {t('settings_support', 'Support')}
        </h3>

        <div className="bg-theme-card border border-theme-card rounded-3xl overflow-hidden divide-y divide-theme-card shadow-lg">
          <div
            id="setting-faq"
            onClick={onOpenFAQ}
            className="p-4 sm:p-5 flex items-center justify-between hover:bg-theme-card-subtle transition-colors cursor-pointer"
          >
            <h4 className="text-sm font-bold text-theme-main">{t('settings_faq', 'FAQ')}</h4>
            <ChevronRight className="w-4 h-4 text-theme-muted" />
          </div>

          <div
            id="setting-contact-us"
            onClick={onOpenContactUs}
            className="p-4 sm:p-5 flex items-center justify-between hover:bg-theme-card-subtle transition-colors cursor-pointer"
          >
            <h4 className="text-sm font-bold text-theme-main">{t('settings_contact_us', 'Contact Us')}</h4>
            <ChevronRight className="w-4 h-4 text-theme-muted" />
          </div>

          <div
            id="setting-privacy-policy"
            onClick={onOpenPrivacyPolicy}
            className="p-4 sm:p-5 flex items-center justify-between hover:bg-theme-card-subtle transition-colors cursor-pointer"
          >
            <h4 className="text-sm font-bold text-theme-main">{t('settings_privacy', 'Privacy Policy')}</h4>
            <ChevronRight className="w-4 h-4 text-theme-muted" />
          </div>

          <a
            id="setting-campus-portal"
            href={CAMPUS_LINKS.BBS_PIK_CAMPUS}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 sm:p-5 flex items-center justify-between hover:bg-theme-card-subtle transition-colors cursor-pointer no-underline"
          >
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-theme-main">BBS PIK Campus Portal</h4>
              <p className="text-xs text-theme-muted">Official school sustainability & student center</p>
            </div>
            <ExternalLink className="w-4 h-4 text-theme-primary" />
          </a>

          <a
            id="setting-sustainability-charter"
            href={CAMPUS_LINKS.SUSTAINABILITY_CHARTER}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 sm:p-5 flex items-center justify-between hover:bg-theme-card-subtle transition-colors cursor-pointer no-underline"
          >
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-theme-main">Campus Sustainability Charter</h4>
              <p className="text-xs text-theme-muted">Food waste reduction & diversion guidelines</p>
            </div>
            <ExternalLink className="w-4 h-4 text-theme-primary" />
          </a>
        </div>
      </div>

      {/* 5. Sign Out Button */}
      <div className="pt-2">
        <button
          id="btn-sign-out"
          onClick={onSignOut}
          className="w-full py-4 rounded-full bg-rose-900/30 hover:bg-rose-900/50 active:scale-[0.99] border border-rose-700/50 text-rose-300 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('settings_sign_out', 'Sign Out')}</span>
        </button>
      </div>
    </div>
  );
};
