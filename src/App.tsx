import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PortionSize,
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
  getOrCreateUserId,
  startOnlinePresenceHeartbeat,
} from './lib/leaderboardService';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navigation } from './components/Navigation';
import { SidebarDrawer } from './components/SidebarDrawer';
import { Dashboard } from './components/Dashboard';
import { CaptureMeal } from './components/CaptureMeal';
import { Leaderboard } from './components/Leaderboard';
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
  MealHallSpecialModal,
  ChangePasswordModal,
  InfoContentModal,
  DailyTipDetailsModal,
} from './components/Modals';
import { AppThemeId } from './theme/themeConfig';

function AppContent() {
  const { setThemeId, setDarkMode } = useTheme();

  // Authentication state - always start at the log-in page upon startup
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Tab state
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [selectedPortion, setSelectedPortion] = useState<PortionSize>('Regular');

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
      return { ...defaultSettings, ...parsed, schoolName: 'Linked to BBS PIK' };
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
  const [isSpecialModalOpen, setIsSpecialModalOpen] = useState(false);
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
        showToast(`🎉 Level Up! You reached Level ${newLevel} (${earnedTitle})!`);
      } else {
        showToast(`✨ Mastered "${tip.title}"! +${gainedXp} XP added`);
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

  // Subscribe to live campus challenge stats from Firestore
  useEffect(() => {
    const unsubChallenge = subscribeToCampusStats(campusChallenge, (liveChallenge) => {
      setChallenge(liveChallenge);
    });
    return () => unsubChallenge();
  }, []);

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
        showToast(`⚠️ Waste penalty: -${penaltyAmount} XP deducted! Clean plate streak reset.`);
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
        showToast(`🎉 Level Up! You are now Level ${newLevel} (${earnedTitle})! Streak is now ${newStreak} days! 🔥`);
      } else {
        showToast(`✨ Clean plate verified! +${xpEarned} XP • Streak increased to ${newStreak} days! 🔥`);
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
            unlockedDate: 'Today',
          };
        }
        return b;
      });

      if (newlyUnlockedBadgeName) {
        setTimeout(() => {
          if (unlockedCountThisTurn > 1) {
            showToast(`🏆 ${unlockedCountThisTurn} New Badges Unlocked! First: ${newlyUnlockedBadgeName}`);
          } else {
            showToast(`🏆 Badge Unlocked: ${newlyUnlockedBadgeName}!`);
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
    showToast(`⚠️ Non-food item detected: -${penaltyAmount} XP penalty applied!`);
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
    showToast('Profile updated successfully');
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    if (newSettings.theme) {
      setThemeId(newSettings.theme as AppThemeId);
    }
    if (newSettings.darkMode !== undefined) {
      setDarkMode(newSettings.darkMode);
    }
    showToast('Preferences saved');
  };

  const handleGreetingColorChange = (color: string) => {
    setUser((prev) => ({ ...prev, greetingColor: color }));
    setSettings((prev) => ({ ...prev, greetingColor: color }));
    showToast(`Greeting color updated!`);
  };

  const handleRestartMeals = () => {
    setMeals([]);
    localStorage.setItem('ecoeat_meals', JSON.stringify([]));
    showToast('✨ Recent meals log has been restarted to 0!');
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
    showToast(`👋 Welcome to BBS PIK EcoEat, ${signedInUser.greetingName}!`);
  };

  const handleBuySticker = (sticker: StickerItem) => {
    if (user.currentXp < sticker.cost) {
      showToast(`⚠️ Insufficient XP! You need ${(sticker.cost - user.currentXp).toLocaleString()} more XP.`);
      return;
    }
    const currentPurchased = user.purchasedStickers || [];
    if (currentPurchased.includes(sticker.id)) {
      showToast(`You already own "${sticker.name}"!`);
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

    showToast(`🎉 You purchased "${sticker.name}" for ${sticker.cost.toLocaleString()} XP!`);
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
      showToast(`✨ Equipped "${sticker?.name || 'Sticker'}" as profile showcase!`);
    } else {
      showToast('Unequipped showcase sticker.');
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setIsDrawerOpen(false);
    setCurrentTab('dashboard');
    showToast('Signed out of BBS PIK EcoEat');
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
        titleOverride={currentTab === 'settings' ? 'Settings' : undefined}
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
                selectedPortion={selectedPortion}
                onSelectPortion={setSelectedPortion}
                onStartNewMeal={() => setCurrentTab('capture')}
                onOpenMealDetails={(meal) => setSelectedMealForDetails(meal)}
                onOpenChallengeDetails={() => setIsChallengeModalOpen(true)}
                onOpenRecentMealsList={() => setCurrentTab('profile')}
                onOpenMealHallSpecial={() => setIsSpecialModalOpen(true)}
                onRestartMeals={handleRestartMeals}
                onOpenTipDetails={(tip) => setSelectedTipForDetails(tip)}
                onOpenWeeklyImpact={handleOpenWeeklyImpact}
                onNavigateToShop={() => setCurrentTab('shop')}
              />
            )}

            {currentTab === 'capture' && (
              <CaptureMeal
                initialPortion={selectedPortion}
                onCompleteMeal={handleCompleteMeal}
                onApplyPenalty={handleApplyPenalty}
                onCancel={() => setCurrentTab('dashboard')}
                user={user}
              />
            )}

            {currentTab === 'leaderboard' && (
              <Leaderboard user={user} challenge={challenge} />
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
                    title: 'EcoEat Campus FAQ',
                    content:
                      '1. How does meal scanning work?\nSnap a photo before eating to verify portions, then take a quick clean plate photo after dining to unlock bonus XP.\n\n2. What are the rewards?\nXP unlocks badges, campus leaderboards, and exclusive campus dining credits.\n\n3. Can I customize appearance?\nYes! Use the Palette icon to select themes like Eco Emerald, Ocean Teal, Solar Amber, Lavender Bloom, or Cyber Obsidian.',
                  })
                }
                onOpenContactUs={() =>
                  setInfoModalData({
                    title: 'Contact Campus Sustainability',
                    content:
                      'Email: sustainability@bbs-campus.edu\nDining Hall Office: Building North, Room 104\nHelpline: +1 (800) 555-ECOS\nOffice Hours: Mon-Fri 8:00 AM - 5:00 PM',
                  })
                }
                onOpenPrivacyPolicy={() =>
                  setInfoModalData({
                    title: 'Student Privacy & Data Policy',
                    content:
                      'EcoEat prioritizes student data security. Meal captures and logs are processed for campus sustainability tracking and verified locally. Personal identifiers remain strictly protected under campus privacy standards.',
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
      />

      <BadgeDetailsModal
        isOpen={!!selectedBadgeForDetails}
        onClose={() => setSelectedBadgeForDetails(null)}
        badge={selectedBadgeForDetails}
      />

      <MealHallSpecialModal
        isOpen={isSpecialModalOpen}
        onClose={() => setIsSpecialModalOpen(false)}
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
