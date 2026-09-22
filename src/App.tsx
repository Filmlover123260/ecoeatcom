import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TabType,
  UserProfile,
  MealRecord,
  BadgeItem,
  DailyTipItem,
  CampusChallengeInfo,
  AppSettings,
  StickerItem,
} from './types';
import {
  initialUserProfile,
  initialMeals,
  dailyTips,
  getDailyTipsForDate,
  initialBadges,
  campusChallenge,
  defaultSettings,
  getLevelTitle,
} from './data/mockData';
import { getStickerById } from './data/stickersData';
import { evaluateBadgeUnlock, BadgeEvaluationContext, ExtendedBadgeItem } from './data/badgesData';
import {
  syncUserProfileToCloud,
  logMealToCloud,
  subscribeToCampusStats,
  joinCampusChallenge,
  getOrCreateUserId,
  startOnlinePresenceHeartbeat,
} from './lib/campusSyncService';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navigation } from './components/Navigation';
import { SidebarDrawer } from './components/SidebarDrawer';
import { Dashboard } from './components/Dashboard';
import { CaptureMeal } from './components/CaptureMeal';
import { Profile } from './components/Profile';
import { SettingsView } from './components/SettingsView';
import { StickerShop } from './components/StickerShop';
import { ThemePickerModal } from './components/ThemePickerModal';
import { SignIn } from './components/SignIn';
import {
  EditProfileModal,
  GreetingColorModal,
  MealDetailsModal,
  ChallengeModal,
  BadgeDetailsModal,
  BadgeGalleryModal,
  ChangePasswordModal,
  InfoContentModal,
  DailyTipDetailsModal,
} from './components/Modals';
import { AppThemeId } from './theme/themeConfig';

function AppContent() {
  const { setThemeId, setDarkMode } = useTheme();
  const { t } = useLanguage();

  // Authentication state - always start at the log-in page upon startup
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Tab state
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  // App Data with local persistence
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ecoeat_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      const level = parsed.level || 1;
      return {
        ...initialUserProfile,
        ...parsed,
        level,
        title: getLevelTitle(level),
        school: 'BBS PIK',
      };
    }
    return { ...initialUserProfile, title: getLevelTitle(initialUserProfile.level) };
  });

  const [meals, setMeals] = useState<MealRecord[]>(() => {
    const saved = localStorage.getItem('ecoeat_meals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasOnlyOldMocks =
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every((m: any) => m.id === 'meal-1' || m.id === 'meal-2');
        if (hasOnlyOldMocks) {
          localStorage.setItem('ecoeat_meals', JSON.stringify([]));
          return [];
        }
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [badges, setBadges] = useState<BadgeItem[]>(() => {
    const saved = localStorage.getItem('ecoeat_badges');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return initialBadges.map((initB) => {
            const match = parsed.find((p: any) => p.id === initB.id);
            return match ? { ...initB, ...match } : initB;
          });
        }
      } catch (e) {
        // fallback
      }
    }
    return initialBadges;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('ecoeat_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      const migratedGoal = (parsed.dailyWasteGoal === 250 || parsed.dailyWasteGoal === 150)
        ? defaultSettings.dailyWasteGoal
        : Math.min(100, Math.max(0, parsed.dailyWasteGoal ?? defaultSettings.dailyWasteGoal));
      return { ...defaultSettings, ...parsed, dailyWasteGoal: migratedGoal, schoolName: 'Linked to BBS PIK' };
    }
    return defaultSettings;
  });

  const [challenge, setChallenge] = useState<CampusChallengeInfo>(campusChallenge);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isGreetingColorOpen, setIsGreetingColorOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isBadgeGalleryOpen, setIsBadgeGalleryOpen] = useState(false);
  const [selectedMealForDetails, setSelectedMealForDetails] = useState<MealRecord | null>(null);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [selectedBadgeForDetails, setSelectedBadgeForDetails] = useState<BadgeItem | null>(null);
  const [selectedTipForDetails, setSelectedTipForDetails] = useState<DailyTipItem | null>(null);
  const [infoModalData, setInfoModalData] = useState<{ title: string; content: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleTipLearned = (tip: DailyTipItem) => {
    const gainedXp = tip.bonusXp || 20;
    setUser((prev) => {
      let newCurrentXp = prev.currentXp + gainedXp;
      let newLevel = prev.level;
      let newNextXp = prev.nextLevelXp;

      if (newCurrentXp >= newNextXp) {
        newLevel += 1;
        newCurrentXp = newCurrentXp - newNextXp;
        newNextXp = Math.round(newNextXp * 1.2);
        const earnedTitle = getLevelTitle(newLevel);
        showToast(t('toast_level_up', '🎉 Level Up! You reached Level {level} ({title})!').replace('{level}', String(newLevel)).replace('{title}', t(earnedTitle, earnedTitle)));
      } else {
        showToast(t('toast_mastered_tip', '✨ Mastered "{title}"! +{xp} XP added').replace('{title}', t(tip.title, tip.title)).replace('{xp}', String(gainedXp)));
      }

      return {
        ...prev,
        currentXp: newCurrentXp,
        nextLevelXp: newNextXp,
        totalXp: prev.totalXp + gainedXp,
        level: newLevel,
        title: getLevelTitle(newLevel),
      };
    });
  };

  // Sync to local storage and Cloud Firestore
  useEffect(() => {
    localStorage.setItem('ecoeat_user', JSON.stringify(user));
    if (isAuthenticated) {
      syncUserProfileToCloud(user);
    }
  }, [user, isAuthenticated]);

  // Maintain real-time online presence heartbeat in Firestore
  useEffect(() => {
    if (isAuthenticated) {
      const stopHeartbeat = startOnlinePresenceHeartbeat(user);
      return () => {
        stopHeartbeat();
      };
    }
  }, [isAuthenticated, user.id, user.name]);

  // Subscribe to live campus challenge stats and real participants from Firestore
  useEffect(() => {
    const unsubChallenge = subscribeToCampusStats(
      campusChallenge,
      (liveChallenge) => {
        setChallenge(liveChallenge);
      },
      user
    );
    return () => unsubChallenge();
  }, [user.id, user.name]);

  useEffect(() => {
    localStorage.setItem('ecoeat_meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('ecoeat_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('ecoeat_settings', JSON.stringify(settings));
  }, [settings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Join the campus challenge in real-time
  const handleJoinChallenge = async () => {
    try {
      const res = await joinCampusChallenge(user, challenge.academicYear);
      if (res.success) {
        if (res.isFirstTime) {
          setUser((prev) => {
            const newCurrentXp = prev.currentXp + 50;
            const newTotalXp = prev.totalXp + 50;
            const newLevel = Math.max(1, Math.floor(newTotalXp / 150) + 1);
            return {
              ...prev,
              currentXp: newCurrentXp,
              totalXp: newTotalXp,
              level: newLevel,
              title: getLevelTitle(newLevel),
            };
          });
          showToast(t('toast_joined_challenge', '🎉 You joined the BBS Campus Challenge! (+50 XP)'));
        } else {
          showToast(t('toast_active_challenge', '✓ You are an active participant in this challenge!'));
        }
      } else {
        showToast(t('toast_could_not_join', 'Could not join challenge. Please try again.'));
      }
    } catch (err) {
      showToast(t('toast_could_not_join', 'Could not join challenge. Please try again.'));
    }
  };

  // Handle meal completion from camera scan / clean plate verification or waste penalty
  const handleCompleteMeal = (newMeal: MealRecord, xpEarned: number, foodSavedKg: number) => {
    setMeals((prev) => [newMeal, ...prev]);

    // Update user stats and streak
    setUser((prev) => {
      const isClean = newMeal.cleanPlate !== false && xpEarned > 0;

      if (!isClean || xpEarned < 0) {
        const penaltyAmount = Math.abs(xpEarned);
        const newCurrentXp = Math.max(0, prev.currentXp - penaltyAmount);
        const newTotalXp = Math.max(0, prev.totalXp - penaltyAmount);
        showToast(t('toast_food_waste_penalty', '⚠️ Food waste penalty: -{xp} XP deducted! Clean plate streak reset to 0.').replace('{xp}', penaltyAmount.toLocaleString()));
        return {
          ...prev,
          currentXp: newCurrentXp,
          totalXp: newTotalXp,
          streakDays: 0,
        };
      }

      const newStreak = prev.streakDays + 1;
      let newCurrentXp = prev.currentXp + xpEarned;
      let newLevel = prev.level;
      let newNextXp = prev.nextLevelXp;

      if (newCurrentXp >= newNextXp) {
        newLevel += 1;
        newCurrentXp = newCurrentXp - newNextXp;
        newNextXp = Math.round(newNextXp * 1.2);
        const earnedTitle = getLevelTitle(newLevel);
        showToast(t('toast_level_up_streak', '🎉 Level Up! You are now Level {level} ({title})! Streak is now {streak} days! 🔥').replace('{level}', String(newLevel)).replace('{title}', t(earnedTitle, earnedTitle)).replace('{streak}', String(newStreak)));
      } else {
        showToast(t('toast_clean_plate_verified', '✨ Clean plate verified! +{xp} XP • Streak increased to {streak} days! 🔥').replace('{xp}', xpEarned.toLocaleString()).replace('{streak}', String(newStreak)));
      }

      return {
        ...prev,
        level: newLevel,
        title: getLevelTitle(newLevel),
        currentXp: newCurrentXp,
        nextLevelXp: newNextXp,
        totalXp: prev.totalXp + xpEarned,
        foodSavedKg: Number((prev.foodSavedKg + foodSavedKg).toFixed(2)),
        foodSavedWeekKg: Number((prev.foodSavedWeekKg + foodSavedKg).toFixed(2)),
        streakDays: newStreak,
      };
    });

    // Auto-evaluate badge milestones across all 300 badges
    const updatedMeals = [newMeal, ...meals];
    const cleanMealsCount = updatedMeals.filter((m) => m.cleanPlate !== false && m.xp > 0).length;
    const totalCarbonSaved = updatedMeals.reduce((sum, m) => sum + (m.carbonSavedKg || 0), 0);
    const totalWaterSaved = updatedMeals.reduce((sum, m) => sum + (m.waterSavedLiters || 0), 0);
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const currentHour = new Date().getHours();
    const isMorning = currentHour < 11;
    const projectedTotalSavedKg = Number((user.foodSavedKg + foodSavedKg).toFixed(2));
    const projectedStreak = user.streakDays + 1;
    const projectedLevel = (user.currentXp + xpEarned >= user.nextLevelXp) ? user.level + 1 : user.level;
    const projectedTotalXp = user.totalXp + xpEarned;

    const evalContext: BadgeEvaluationContext = {
      cleanMealsCount,
      totalMealsCount: updatedMeals.length,
      foodSavedKg: projectedTotalSavedKg,
      streakDays: projectedStreak,
      level: projectedLevel,
      totalXp: projectedTotalXp,
      totalCarbonSavedKg: totalCarbonSaved,
      totalWaterSavedLiters: totalWaterSaved,
      allMeals: updatedMeals,
      isWeekend,
      isMorning,
    };

    setBadges((prevBadges) => {
      let newlyUnlockedBadgeName: string | null = null;
      let unlockedCountThisTurn = 0;

      const updated = prevBadges.map((b) => {
        if (b.unlocked) return b;

        const shouldUnlock = evaluateBadgeUnlock(b as ExtendedBadgeItem, evalContext);

        if (shouldUnlock) {
          unlockedCountThisTurn++;
          if (!newlyUnlockedBadgeName) {
            newlyUnlockedBadgeName = b.name;
          }
          return {
            ...b,
            unlocked: true,
            unlockedDate: t('today', 'Today'),
          };
        }
        return b;
      });

      if (newlyUnlockedBadgeName) {
        setTimeout(() => {
          if (unlockedCountThisTurn > 1) {
            showToast(t('toast_badges_unlocked_multi', '🏆 {count} New Badges Unlocked! First: {name}').replace('{count}', String(unlockedCountThisTurn)).replace('{name}', newlyUnlockedBadgeName));
          } else {
            showToast(t('toast_badge_unlocked_single', '🏆 Badge Unlocked: {name}!').replace('{name}', newlyUnlockedBadgeName));
          }
        }, 1200);
      }

      localStorage.setItem('ecoeat_badges', JSON.stringify(updated));
      return updated;
    });

    // Write real meal record and update global campus food waste counter in Cloud Firestore
    logMealToCloud(newMeal, user, xpEarned, foodSavedKg);

    setCurrentTab('dashboard');
  };

  const handleApplyPenalty = (reason: string, penaltyAmount: number) => {
    setUser((prev) => {
      const newCurrentXp = Math.max(0, prev.currentXp - penaltyAmount);
      const newTotalXp = Math.max(0, prev.totalXp - penaltyAmount);
      const updatedUser = {
        ...prev,
        currentXp: newCurrentXp,
        totalXp: newTotalXp,
        streakDays: 0,
      };
      syncUserProfileToCloud(updatedUser);
      return updatedUser;
    });
    showToast(t('toast_penalty_applied', '⚠️ Non-food item detected: -{penalty} XP penalty applied!').replace('{penalty}', String(penaltyAmount)));
    setCurrentTab('dashboard');
  };

  const handleUpdateUserProfile = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
    if (updated.greetingName) {
      setSettings((prev) => ({ ...prev, greetingName: updated.greetingName! }));
    }
    if (updated.name) {
      setSettings((prev) => ({ ...prev, fullName: updated.name! }));
    }
    showToast(t('toast_profile_updated', 'Profile updated successfully'));
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    if (newSettings.theme) {
      setThemeId(newSettings.theme as AppThemeId);
    }
    if (newSettings.darkMode !== undefined) {
      setDarkMode(newSettings.darkMode);
    }
    // Only show toast notification for discrete preference updates, not continuous slider dragging
    if (!('dailyWasteGoal' in newSettings)) {
      showToast(t('toast_preferences_saved', 'Preferences saved'));
    }
  };

  const handleGreetingColorChange = (color: string) => {
    setUser((prev) => ({ ...prev, greetingColor: color }));
    setSettings((prev) => ({ ...prev, greetingColor: color }));
    showToast(t('toast_greeting_updated', 'Greeting color updated!'));
  };

  const handleRestartMeals = () => {
    setMeals([]);
    localStorage.setItem('ecoeat_meals', JSON.stringify([]));
    showToast(t('toast_meals_restarted', '✨ Recent meals log has been restarted to 0!'));
  };

  const handleOpenWeeklyImpact = () => {
    setCurrentTab('profile');
    // Smoothly scroll and highlight the Weekly Impact section on profile
    setTimeout(() => {
      const impactEl = document.getElementById('weekly-impact-card');
      if (impactEl) {
        impactEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        impactEl.classList.add('ring-2', 'ring-theme-primary', 'shadow-theme-glow');
        setTimeout(() => {
          impactEl.classList.remove('ring-2', 'ring-theme-primary', 'shadow-theme-glow');
        }, 2200);
      }
    }, 80);
  };

  const handleSignInSuccess = (signedInUser: UserProfile) => {
    // Ensure clean initial state for new sign-in
    const userLevel = signedInUser.level || 1;
    const freshUser: UserProfile = {
      ...signedInUser,
      level: userLevel,
      title: getLevelTitle(userLevel),
      currentXp: signedInUser.currentXp ?? 0,
      totalXp: signedInUser.totalXp ?? 0,
      nextLevelXp: signedInUser.nextLevelXp || 100,
      foodSavedKg: signedInUser.foodSavedKg ?? 0,
      foodSavedWeekKg: signedInUser.foodSavedWeekKg ?? 0,
      streakDays: signedInUser.streakDays ?? 0,
      purchasedStickers: signedInUser.purchasedStickers || [],
      showcaseStickerId: signedInUser.showcaseStickerId || '',
    };
    setUser(freshUser);
    localStorage.setItem('ecoeat_user', JSON.stringify(freshUser));
    
    // Clear / restart recent meals on sign-in
    setMeals([]);
    localStorage.setItem('ecoeat_meals', JSON.stringify([]));

    // Reset all badges to locked state on new account / sign in
    const resetBadges = initialBadges.map((b) => ({
      ...b,
      unlocked: false,
      unlockedDate: undefined,
      count: 0,
    }));
    setBadges(resetBadges);
    localStorage.setItem('ecoeat_badges', JSON.stringify(resetBadges));

    setSettings((prev) => ({
      ...prev,
      greetingName: signedInUser.greetingName,
      fullName: signedInUser.name,
    }));
    setIsAuthenticated(true);
    showToast(t('toast_welcome_bbs', '👋 Welcome to BBS PIK EcoEat, {name}!').replace('{name}', signedInUser.greetingName));
  };

  const handleBuySticker = (sticker: StickerItem) => {
    if (user.currentXp < sticker.cost) {
      showToast(t('toast_insufficient_xp', '⚠️ Insufficient XP! You need {amount} more XP.').replace('{amount}', (sticker.cost - user.currentXp).toLocaleString()));
      return;
    }
    const currentPurchased = user.purchasedStickers || [];
    if (currentPurchased.includes(sticker.id)) {
      showToast(t('toast_already_own_sticker', 'You already own "{name}"!').replace('{name}', sticker.name));
      return;
    }

    setUser((prev) => {
      const updatedPurchased = [...(prev.purchasedStickers || []), sticker.id];
      const newCurrentXp = prev.currentXp - sticker.cost;
      const updatedUser: UserProfile = {
        ...prev,
        currentXp: newCurrentXp,
        purchasedStickers: updatedPurchased,
      };

      localStorage.setItem('ecoeat_user', JSON.stringify(updatedUser));
      syncUserProfileToCloud(updatedUser);
      return updatedUser;
    });

    showToast(t('toast_purchased_sticker', '🎉 You purchased "{name}" for {cost} XP!').replace('{name}', sticker.name).replace('{cost}', sticker.cost.toLocaleString()));
  };

  const handleEquipSticker = (stickerId: string | null) => {
    setUser((prev) => {
      const updatedUser: UserProfile = {
        ...prev,
        showcaseStickerId: stickerId || undefined,
      };
      localStorage.setItem('ecoeat_user', JSON.stringify(updatedUser));
      syncUserProfileToCloud(updatedUser);
      return updatedUser;
    });

    if (stickerId) {
      const sticker = getStickerById(stickerId);
      showToast(t('toast_equipped_showcase', '✨ Equipped "{name}" as profile showcase!').replace('{name}', sticker?.name || t('sticker', 'Sticker')));
    } else {
      showToast(t('toast_unequipped_showcase', 'Unequipped showcase sticker.'));
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUser({ ...initialUserProfile, title: getLevelTitle(initialUserProfile.level) });
    localStorage.removeItem('ecoeat_user');
    localStorage.removeItem('ecoeat_user_uid');
    setIsDrawerOpen(false);
    setCurrentTab('dashboard');
    showToast(t('toast_signed_out_bbs', 'Signed out of BBS PIK EcoEat'));
  };

  // If user is not authenticated, render the dedicated SignIn / Student Portal page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen page-theme-bg text-theme-main flex flex-col selection:bg-theme-primary/30 selection:text-theme-main transition-colors duration-300">
        <SignIn
          onSignInSuccess={handleSignInSuccess}
          onOpenThemePicker={() => setIsThemePickerOpen(true)}
        />

        <ThemePickerModal
          isOpen={isThemePickerOpen}
          onClose={() => setIsThemePickerOpen(false)}
        />

        {toastMessage && (
          <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-theme-card text-theme-main border border-theme-primary px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen page-theme-bg text-theme-main flex flex-col selection:bg-theme-primary/30 selection:text-theme-main transition-colors duration-300">
      {/* Top Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenThemePicker={() => setIsThemePickerOpen(true)}
        titleOverride={currentTab === 'settings' ? t('nav_settings', 'Settings') : undefined}
        showBackArrow={currentTab === 'settings' || currentTab === 'capture'}
        onBack={() => setCurrentTab('dashboard')}
      />

      {/* Sidebar Navigation Drawer */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenThemePicker={() => setIsThemePickerOpen(true)}
        onSignOut={handleSignOut}
        user={user}
      />

      {/* Main Content Area with Smooth Page Transition Animations */}
      <main className="flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.995 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {currentTab === 'dashboard' && (
              <Dashboard
                user={user}
                meals={meals}
                tips={getDailyTipsForDate(new Date())}
                challenge={challenge}
                onStartNewMeal={() => setCurrentTab('capture')}
                onOpenMealDetails={(meal) => setSelectedMealForDetails(meal)}
                onOpenChallengeDetails={() => setIsChallengeModalOpen(true)}
                onOpenRecentMealsList={() => setCurrentTab('profile')}
                onRestartMeals={handleRestartMeals}
                onOpenTipDetails={(tip) => setSelectedTipForDetails(tip)}
                onOpenWeeklyImpact={handleOpenWeeklyImpact}
                onNavigateToShop={() => setCurrentTab('shop')}
                onJoinChallenge={handleJoinChallenge}
              />
            )}

            {currentTab === 'capture' && (
              <CaptureMeal
                onCompleteMeal={handleCompleteMeal}
                onApplyPenalty={handleApplyPenalty}
                onCancel={() => setCurrentTab('dashboard')}
                user={user}
              />
            )}

            {currentTab === 'shop' && (
              <StickerShop
                user={user}
                onBuySticker={handleBuySticker}
                onEquipSticker={handleEquipSticker}
                onNavigateToCapture={() => setCurrentTab('capture')}
              />
            )}

            {currentTab === 'profile' && (
              <Profile
                user={user}
                badges={badges}
                meals={meals}
                onOpenEditProfile={() => setIsEditProfileOpen(true)}
                onOpenBadgeDetails={(badge) => setSelectedBadgeForDetails(badge)}
                onOpenBadgeGallery={() => setIsBadgeGalleryOpen(true)}
                onNavigateToShop={() => setCurrentTab('shop')}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                settings={settings}
                user={user}
                onUpdateSettings={handleUpdateSettings}
                onOpenEditProfile={() => setIsEditProfileOpen(true)}
                onOpenChangePassword={() => setIsChangePasswordOpen(true)}
                onOpenGreetingCustomizer={() => setIsGreetingColorOpen(true)}
                onOpenThemePicker={() => setIsThemePickerOpen(true)}
                onRestartMeals={handleRestartMeals}
                onOpenFAQ={() =>
                  setInfoModalData({
                    title: t('faq_title', 'EcoEat Campus FAQ'),
                    content: t(
                      'faq_content',
                      '1. How does meal scanning work?\nSnap a photo before eating, then take a quick clean plate photo after dining to unlock bonus XP.\n\n2. What are the rewards?\nXP unlocks achievement badges and rewards in the Sticker Shop.\n\n3. Can I customize appearance?\nYes! Use the Palette icon to select themes like Eco Emerald, Ocean Teal, Solar Amber, Lavender Bloom, or Cyber Obsidian.'
                    ),
                  })
                }
                onOpenContactUs={() =>
                  setInfoModalData({
                    title: t('contact_title', 'Contact Campus Sustainability'),
                    content: t(
                      'contact_content',
                      'Email: sustainability@bbs-campus.edu\nDining Hall Office: Building North, Room 104\nHelpline: +1 (800) 555-ECOS\nOffice Hours: Mon-Fri 8:00 AM - 5:00 PM'
                    ),
                  })
                }
                onOpenPrivacyPolicy={() =>
                  setInfoModalData({
                    title: t('privacy_title', 'Student Privacy & Data Policy'),
                    content: t(
                      'privacy_content',
                      'EcoEat prioritizes student data security. Meal captures and logs are processed for campus sustainability tracking and verified locally. Personal identifiers remain strictly protected under campus privacy standards.'
                    ),
                  })
                }
                onSignOut={handleSignOut}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Theme Picker Modal */}
      <ThemePickerModal
        isOpen={isThemePickerOpen}
        onClose={() => setIsThemePickerOpen(false)}
      />

      {/* Interactive Modals */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
        onSave={handleUpdateUserProfile}
      />

      <GreetingColorModal
        isOpen={isGreetingColorOpen}
        onClose={() => setIsGreetingColorOpen(false)}
        currentColor={user.greetingColor}
        onSelectColor={handleGreetingColorChange}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <BadgeGalleryModal
        isOpen={isBadgeGalleryOpen}
        onClose={() => setIsBadgeGalleryOpen(false)}
        badges={badges}
        onSelectBadge={(b) => {
          setIsBadgeGalleryOpen(false);
          setSelectedBadgeForDetails(b);
        }}
      />

      <MealDetailsModal
        isOpen={!!selectedMealForDetails}
        onClose={() => setSelectedMealForDetails(null)}
        meal={selectedMealForDetails}
      />

      <ChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        challenge={challenge}
        onJoinChallenge={handleJoinChallenge}
      />

      <BadgeDetailsModal
        isOpen={!!selectedBadgeForDetails}
        onClose={() => setSelectedBadgeForDetails(null)}
        badge={selectedBadgeForDetails}
      />

      <DailyTipDetailsModal
        isOpen={!!selectedTipForDetails}
        onClose={() => setSelectedTipForDetails(null)}
        tip={selectedTipForDetails}
        onTipLearned={handleTipLearned}
      />

      {infoModalData && (
        <InfoContentModal
          isOpen={true}
          onClose={() => setInfoModalData(null)}
          title={infoModalData.title}
          content={infoModalData.content}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-theme-card text-theme-main border border-theme-primary px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
