import React from 'react';
import { LayoutDashboard, Camera, User, Menu, Leaf, ArrowLeft, Moon, Sun, Palette, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { TabType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { EcoEatLogo } from './EcoEatLogo';
import { toAbsoluteHttpsUrl } from '../utils/urlHelper';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenDrawer: () => void;
  onOpenThemePicker: () => void;
  titleOverride?: string;
  showBackArrow?: boolean;
  onBack?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenDrawer,
  onOpenThemePicker,
  titleOverride,
  showBackArrow = false,
  onBack,
}) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { t } = useLanguage();

  const navItems: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: t('nav_dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'capture', label: t('nav_capture', 'Scan Meal'), icon: Camera },
    { id: 'shop', label: t('nav_shop', 'Sticker Shop'), icon: ShoppingBag },
    { id: 'profile', label: t('nav_profile', 'Profile'), icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 nav-theme-bg backdrop-blur-md border-b border-theme-card transition-colors duration-300">
      {/* Top Brand Bar */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackArrow ? (
            <motion.button
              id="nav-back-button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onBack || (() => onSelectTab('dashboard'))}
              aria-label="Go Back"
              className="p-2 rounded-full text-theme-main hover:bg-theme-card-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-theme-primary cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
          ) : (
            <motion.button
              id="nav-menu-button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onOpenDrawer}
              aria-label="Open Menu"
              className="p-2 rounded-full text-theme-main hover:bg-theme-card-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-theme-primary cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </motion.button>
          )}

          {/* Centered Brand / Title as Accessible Absolute HTTPS Anchor */}
          <motion.a
            href={toAbsoluteHttpsUrl('/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer no-underline"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('dashboard');
            }}
            title="EcoEat Dashboard"
          >
            <EcoEatLogo size="sm" />
            <span className="text-xl font-extrabold tracking-tight text-theme-main">
              {titleOverride || t('app_name', 'EcoEat')}
            </span>
          </motion.a>
        </div>

        {/* Navigation Tabs Pill Container (Desktop) */}
        <nav className="flex items-center bg-theme-card-subtle p-1 rounded-full border border-theme-card shadow-inner max-sm:hidden relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <motion.a
                key={item.id}
                id={`tab-btn-${item.id}`}
                href={toAbsoluteHttpsUrl(`/${item.id}`)}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectTab(item.id);
                }}
                className={`relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer no-underline z-10 ${
                  isActive
                    ? 'text-black font-extrabold'
                    : 'text-theme-muted hover:text-theme-main'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPillDesktop"
                    className="absolute inset-0 bg-theme-primary rounded-full shadow-sm shadow-theme-glow -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </motion.a>
            );
          })}
        </nav>

        {/* Quick Theme & Dark Mode Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Palette Button */}
          <motion.button
            id="btn-nav-theme-picker"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpenThemePicker}
            aria-label="Change Theme"
            title="Choose Theme & Palette"
            className="p-2 rounded-full bg-theme-card border border-theme-card text-theme-muted hover:text-theme-main hover:border-theme-primary hover:bg-theme-card-subtle transition-colors cursor-pointer shadow-sm"
          >
            <Palette className="w-4 h-4 text-theme-primary" />
          </motion.button>

          {/* Dark / Light Mode Toggle */}
          <motion.button
            id="btn-nav-mode-toggle"
            whileHover={{ scale: 1.08, rotate: darkMode ? -15 : 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            aria-label="Toggle Dark/Light Mode"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-full bg-theme-card border border-theme-card text-theme-muted hover:text-theme-main hover:border-theme-primary hover:bg-theme-card-subtle transition-colors cursor-pointer shadow-sm"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Floating Bottom Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bottom-theme-bar-bg backdrop-blur-lg border-t border-theme-card px-2 py-1.5 flex items-center justify-around">
        <motion.a
          id="mobile-tab-dashboard"
          href={toAbsoluteHttpsUrl('/dashboard')}
          whileTap={{ scale: 0.88 }}
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('dashboard');
          }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 py-1 px-2 rounded-xl transition-colors cursor-pointer no-underline ${
            currentTab === 'dashboard' ? 'text-theme-primary font-bold' : 'text-theme-muted hover:text-theme-main'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[11px] font-medium leading-none">{t('nav_dashboard', 'Dashboard')}</span>
        </motion.a>

        <motion.a
          id="mobile-tab-capture"
          href={toAbsoluteHttpsUrl('/capture')}
          whileTap={{ scale: 0.88 }}
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('capture');
          }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 py-1 px-2 rounded-xl transition-colors cursor-pointer no-underline ${
            currentTab === 'capture' ? 'text-theme-primary font-bold' : 'text-theme-muted hover:text-theme-main'
          }`}
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 rounded-full bg-theme-primary text-black flex items-center justify-center -mt-4 shadow-lg shadow-theme-glow"
          >
            <Camera className="w-5 h-5" />
          </motion.div>
          <span className="text-[11px] font-medium leading-none">{t('nav_capture', 'Scan')}</span>
        </motion.a>

        <motion.a
          id="mobile-tab-shop"
          href={toAbsoluteHttpsUrl('/shop')}
          whileTap={{ scale: 0.88 }}
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('shop');
          }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 py-1 px-2 rounded-xl transition-colors cursor-pointer no-underline ${
            currentTab === 'shop' ? 'text-theme-primary font-bold' : 'text-theme-muted hover:text-theme-main'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[11px] font-medium leading-none">{t('nav_shop', 'Shop')}</span>
        </motion.a>

        <motion.a
          id="mobile-tab-profile"
          href={toAbsoluteHttpsUrl('/profile')}
          whileTap={{ scale: 0.88 }}
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('profile');
          }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 py-1 px-2 rounded-xl transition-colors cursor-pointer no-underline ${
            currentTab === 'profile' ? 'text-theme-primary font-bold' : 'text-theme-muted hover:text-theme-main'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] font-medium leading-none">{t('nav_profile', 'Profile')}</span>
        </motion.a>

        <motion.button
          id="mobile-tab-menu"
          whileTap={{ scale: 0.88 }}
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 py-1 px-2 rounded-xl text-theme-muted hover:text-theme-main transition-colors cursor-pointer"
          title="Open Campus Menu"
          aria-label="Open Campus Menu"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[11px] font-medium leading-none">{t('nav_menu', 'Menu')}</span>
        </motion.button>
      </div>
    </header>
  );
};
