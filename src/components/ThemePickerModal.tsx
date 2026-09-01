import React from 'react';
import {
  X,
  Check,
  Moon,
  Sun,
  Palette,
  Leaf,
  Waves,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { AppThemeId } from '../theme/themeConfig';

interface ThemePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemePickerModal: React.FC<ThemePickerModalProps> = ({ isOpen, onClose }) => {
  const { themeId, darkMode, setThemeId, setDarkMode, availableThemes } = useTheme();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const renderThemeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Waves':
        return <Waves className="w-5 h-5" />;
      case 'Sun':
        return <Sun className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Leaf':
      default:
        return <Leaf className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div
        id="theme-picker-modal"
        className="bg-theme-card border-t sm:border border-theme-card rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 sm:space-y-6 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
      >
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-theme-muted/40 rounded-full mx-auto sm:hidden -mt-1 mb-1 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-theme-primary-bg border border-theme-primary-border flex items-center justify-center text-theme-primary">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-theme-main">{t('theme_modal_title', 'App Themes & Appearance')}</h3>
              <p className="text-xs text-theme-muted">{t('theme_modal_subtitle', 'Customize campus visual styles and display mode')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full text-theme-muted hover:text-theme-main hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Mode Switcher (Dark Mode vs Light Mode) */}
        <div className="space-y-3">
          <label className="text-xs uppercase font-bold tracking-wider text-theme-muted block">
            {t('display_mode_heading', 'Display Mode')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Dark Mode Card */}
            <button
              id="btn-mode-dark"
              onClick={() => setDarkMode(true)}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                darkMode
                  ? 'bg-theme-card-subtle border-theme-primary shadow-sm ring-1 ring-theme-primary'
                  : 'bg-theme-card border-theme-card hover:border-theme-hover opacity-75'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-300">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-theme-main">{t('dark_mode_title', 'Dark Mode')}</h4>
                  <p className="text-[11px] text-theme-muted">{t('dark_mode_desc', 'Deep contrast, battery saving')}</p>
                </div>
              </div>
              {darkMode && <CheckCircle2 className="w-5 h-5 text-theme-primary shrink-0" />}
            </button>

            {/* Light Mode Card */}
            <button
              id="btn-mode-light"
              onClick={() => setDarkMode(false)}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                !darkMode
                  ? 'bg-theme-card-subtle border-theme-primary shadow-sm ring-1 ring-theme-primary'
                  : 'bg-theme-card border-theme-card hover:border-theme-hover opacity-75'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-theme-main">{t('light_mode_title', 'Light Mode')}</h4>
                  <p className="text-[11px] text-theme-muted">{t('light_mode_desc', 'Clean day layout')}</p>
                </div>
              </div>
              {!darkMode && <CheckCircle2 className="w-5 h-5 text-theme-primary shrink-0" />}
            </button>
          </div>
        </div>

        {/* 2. Color Themes Grid */}
        <div className="space-y-3">
          <label className="text-xs uppercase font-bold tracking-wider text-theme-muted block">
            {t('color_palette_heading', 'Color Palette & Identity')}
          </label>
          <div className="space-y-2.5">
            {availableThemes.map((theme) => {
              const isSelected = themeId === theme.id;
              return (
                <div
                  key={theme.id}
                  id={`theme-card-${theme.id}`}
                  onClick={() => setThemeId(theme.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-theme-card-subtle border-theme-primary shadow-md ring-1 ring-theme-primary'
                      : 'bg-theme-card border-theme-card hover:border-theme-hover'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Theme Icon & Color Swatch */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm relative overflow-hidden"
                      style={{
                        backgroundColor: darkMode ? theme.previewBgDark : theme.previewBgLight,
                        border: `2px solid ${theme.primaryColor}`,
                        color: theme.primaryColor,
                      }}
                    >
                      {renderThemeIcon(theme.icon)}
                      <div
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-tl-md"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                    </div>

                    <div className="space-y-0.5 text-left">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-theme-main">{theme.name}</h4>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: darkMode ? `${theme.primaryColor}22` : `${theme.primaryColor}18`,
                            color: theme.primaryColor,
                            border: `1px solid ${theme.primaryColor}40`,
                          }}
                        >
                          {theme.category}
                        </span>
                      </div>
                      <p className="text-xs text-theme-muted leading-relaxed line-clamp-1">
                        {theme.description}
                      </p>
                    </div>
                  </div>

                  {/* Right side Selection indicator */}
                  <div className="flex items-center gap-2 pl-2">
                    <div className="flex -space-x-1 items-center">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                    </div>
                    {isSelected ? (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-theme-card" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2">
          <button
            id="btn-apply-theme"
            onClick={onClose}
            className="w-full py-3.5 rounded-full bg-theme-primary text-black font-extrabold text-sm hover:opacity-90 active:scale-[0.99] transition-all shadow-md shadow-theme-glow flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('btn_done_apply', 'Done & Apply Appearance')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
