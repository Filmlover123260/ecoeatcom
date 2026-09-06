import React from 'react';
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
          {/* Daily Waste Goal Slider */}
          <div className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-theme-main">{t('settings_daily_goal', 'Daily Waste Goal')}</h4>
              <span className="bg-theme-primary-bg text-theme-primary border border-theme-primary-border text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
                {settings.dailyWasteGoal}g
              </span>
            </div>

            <input
              id="slider-waste-goal"
              type="range"
              min="50"
              max="800"
              step="25"
              value={settings.dailyWasteGoal}
              onChange={(e) => onUpdateSettings({ dailyWasteGoal: parseInt(e.target.value, 10) })}
              className="w-full accent-theme-primary progress-theme-track h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-theme-muted font-semibold">
              <span>50g (Strict)</span>
              <span>250g (Target)</span>
              <span>800g (Standard)</span>
            </div>
          </div>

          {/* Campus Visibility */}
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-theme-main">{t('settings_campus_visibility', 'Campus Visibility')}</h4>
              <p className="text-xs text-theme-muted">{t('settings_campus_visibility_desc', 'Show on BBS PIK Leaderboards')}</p>
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
