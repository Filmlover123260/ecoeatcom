import React from 'react';
import {
  Star,
  Sparkles,
  Award,
  Utensils,
  Recycle,
  Lock,
  Edit3,
  BarChart2,
  Leaf,
  TrendingUp,
  Camera,
  Flame,
  Trophy,
  Globe,
  Zap,
  Heart,
  ShieldCheck,
  Shield,
  Calendar,
  TreePine,
  Crown,
  Apple,
  Sprout,
  Droplets,
  Droplet,
  Sun,
  Target,
  Users,
  ShoppingBag,
} from 'lucide-react';
import { UserProfile, BadgeItem, MealRecord, StickerItem } from '../types';
import { getStickerById } from '../data/stickersData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface ProfileProps {
  user: UserProfile;
  badges: BadgeItem[];
  meals?: MealRecord[];
  onOpenEditProfile: () => void;
  onOpenBadgeDetails: (badge: BadgeItem) => void;
  onOpenBadgeGallery: () => void;
  onNavigateToShop?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({
  user,
  badges,
  meals = [],
  onOpenEditProfile,
  onOpenBadgeDetails,
  onOpenBadgeGallery,
  onNavigateToShop,
}) => {
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  // Profile Level Progress
  const profileProgressPercent = Math.min(
    100,
    Math.round((user.totalXp / user.profileGoalXp) * 100)
  );

  // Dynamic Weekly Impact calculation based on what day it is today
  const today = new Date();
  const todayDayIndex = (today.getDay() + 6) % 7; // Monday = 0, Tuesday = 1, ..., Sunday = 6

  // Find Monday of the current week
  const monday = new Date(today);
  monday.setDate(today.getDate() - todayDayIndex);
  monday.setHours(0, 0, 0, 0);

  const dayNames = [
    { short: 'M', full: 'Mon' },
    { short: 'T', full: 'Tue' },
    { short: 'W', full: 'Wed' },
    { short: 'T', full: 'Thu' },
    { short: 'F', full: 'Fri' },
    { short: 'S', full: 'Sat' },
    { short: 'S', full: 'Sun' },
  ];

  // Calculate grams saved for each day of the current week from actual logged meals
  const weekDayData = dayNames.map((dayMeta, index) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + index);
    const dayDateStr = dayDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const isToday = index === todayDayIndex;
    const isPast = index < todayDayIndex;
    const isUpcoming = index > todayDayIndex;

    // Filter meals for this day
    const dayMeals = meals.filter((m) => {
      if (!m.date) {
        // If meal has no date string, assign to today if logged in this session
        return isToday;
      }
      return m.date === dayDateStr || (isToday && m.date.startsWith(dayDateStr));
    });

    let grams = 0;
    dayMeals.forEach((m) => {
      if (m.cleanPlate !== false && m.xp > 0) {
        // Estimate grams saved from meal portion / wasteGrams / foodSavedKg
        if (m.foodItems && m.foodItems.length > 0) {
          grams += 350;
        } else {
          grams += 300;
        }
      }
    });

    // If today and user has foodSavedKg but no recorded dates yet, reflect user's current session savings
    if (isToday && grams === 0 && user.foodSavedKg > 0 && meals.length > 0) {
      grams = Math.round(user.foodSavedKg * 1000);
    }

    return {
      index,
      shortDay: dayMeta.short,
      fullDay: dayMeta.full,
      dateFormatted: dayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      grams,
      isToday,
      isPast,
      isUpcoming,
    };
  });

  const maxGramsInWeek = Math.max(...weekDayData.map((d) => d.grams), 500);
  const totalGramsWeek = weekDayData.reduce((acc, d) => acc + d.grams, 0);
  const calculatedWeekKg = (totalGramsWeek / 1000).toFixed(1);

  const weeklyDays = weekDayData.map((item) => {
    const heightPct = item.grams > 0 ? Math.min(100, Math.max(16, Math.round((item.grams / maxGramsInWeek) * 100))) : 8;
    return {
      ...item,
      heightPct,
    };
  });

  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'utensils':
        return <Utensils className="w-5 h-5 text-theme-primary" />;
      case 'recycle':
        return <Recycle className="w-5 h-5 text-emerald-400" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-amber-300" />;
      case 'flame':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'leaf':
        return <Leaf className="w-5 h-5 text-emerald-400" />;
      case 'trophy':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'globe':
        return <Globe className="w-5 h-5 text-sky-400" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-amber-300" />;
      case 'heart':
        return <Heart className="w-5 h-5 text-rose-400" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-sky-400" />;
      case 'shield-check':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'tree-pine':
        return <TreePine className="w-5 h-5 text-emerald-500" />;
      case 'crown':
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 'apple':
        return <Apple className="w-5 h-5 text-rose-400" />;
      case 'sprout':
        return <Sprout className="w-5 h-5 text-emerald-400" />;
      case 'droplets':
        return <Droplets className="w-5 h-5 text-cyan-400" />;
      case 'droplet':
        return <Droplet className="w-5 h-5 text-cyan-400" />;
      case 'sun':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'target':
        return <Target className="w-5 h-5 text-emerald-400" />;
      case 'users':
        return <Users className="w-5 h-5 text-indigo-400" />;
      case 'lock':
        return <Lock className="w-5 h-5 text-theme-muted" />;
      default:
        return <Award className="w-5 h-5 text-theme-primary" />;
    }
  };

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24 sm:pb-16 animate-in fade-in duration-300">
      {/* Profile Header & Level Progress */}
      <div
        id="profile-hero-card"
        className="bg-theme-card border border-theme-card rounded-3xl p-6 shadow-xl space-y-6"
      >
        {/* User Info with Avatar & Edit Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              onClick={onOpenEditProfile}
              title={t('profile_edit_picture_hint', 'Click to change photo')}
              className="relative group cursor-pointer"
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover border-3 border-theme-primary shadow-lg shadow-theme-glow group-hover:opacity-85 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <Camera className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-theme-primary border-2 border-theme-card rounded-full flex items-center justify-center">
                <Camera className="w-2.5 h-2.5 text-black" />
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-theme-main tracking-tight leading-tight">
                {user.name}
              </h2>
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-theme-primary-bg border border-theme-primary-border text-xs font-semibold text-theme-primary">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>{user.title}</span>
                </div>
                {user.showcaseStickerId && (
                  (() => {
                    const showcase = getStickerById(user.showcaseStickerId);
                    if (!showcase) return null;
                    return (
                      <div
                        onClick={onNavigateToShop}
                        title={`Active Showcase Sticker: ${showcase.name}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-theme-card-subtle border border-theme-primary/40 text-xs font-extrabold text-theme-main shadow-xs cursor-pointer hover:border-theme-primary"
                      >
                        <span className="text-sm">{showcase.emoji}</span>
                        <span className="text-[11px]">{showcase.name}</span>
                      </div>
                    );
                  })()
                )}
                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    user.streakDays === 0
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : user.streakDays === 1
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  <Flame className="w-3 h-3 fill-current" />
                  <span>
                    {user.streakDays === 0
                      ? '0d Streak 😢'
                      : `${user.streakDays}d Streak ${user.streakDays === 1 ? '🌱' : '🔥'}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            id="btn-edit-profile"
            onClick={onOpenEditProfile}
            aria-label={t('profile_edit_btn', 'Edit Profile')}
            className="w-10 h-10 rounded-full bg-theme-card-subtle border border-theme-card text-theme-muted hover:text-theme-main hover:border-theme-primary flex items-center justify-center transition-all shadow-md cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Level XP Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-theme-card">
          <div className="flex items-center justify-between text-sm font-bold">
            <div className="flex items-center gap-2">
              <span className="text-theme-main text-base">{t('level', 'Lvl')} {user.level}</span>
              <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-500 flex items-center justify-center border border-amber-400/40">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </div>
            </div>
            <span className="text-theme-muted text-xs">
              {user.totalXp.toLocaleString()} / {user.profileGoalXp.toLocaleString()} {t('xp', 'XP')}
            </span>
          </div>

          <div className="w-full progress-theme-track h-3.5 rounded-full overflow-hidden p-0.5 border border-theme-card">
            <div
              className="bg-theme-primary h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${profileProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Card */}
      <div
        id="badges-card"
        className="bg-theme-card border border-theme-card rounded-3xl p-6 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-extrabold text-theme-main tracking-tight">{t('profile_badges_heading', 'Badges')}</h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-theme-card-subtle border border-theme-card text-theme-primary">
              {unlockedCount} / {badges.length} {t('unlocked', 'Unlocked')}
            </span>
          </div>
          <button
            id="btn-view-all-badges"
            onClick={onOpenBadgeGallery}
            className="text-xs font-bold text-theme-primary hover:underline cursor-pointer"
          >
            {t('profile_view_all_badges', 'View All')} ({badges.length})
          </button>
        </div>

        {/* Badges Grid (Showing first 8) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
          {badges.slice(0, 8).map((badge) => (
            <div
              key={badge.id}
              onClick={() => onOpenBadgeDetails(badge)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center justify-between space-y-2 card-hover-tap ${
                badge.unlocked
                  ? 'bg-theme-card-subtle border-theme-card hover:border-theme-primary shadow-sm'
                  : 'bg-theme-card border-theme-card opacity-45 hover:opacity-60'
              }`}
            >
              <div className="relative">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                    badge.unlocked
                      ? 'bg-theme-primary-bg border-theme-primary-border shadow-md'
                      : 'bg-theme-card border-theme-card'
                  }`}
                >
                  {renderBadgeIcon(badge.icon)}
                </div>

                {badge.count && badge.count > 1 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full border border-theme-card shadow-sm">
                    x{badge.count}
                  </span>
                )}
              </div>

              <div className="w-full">
                <h4 className="text-[11px] font-bold text-theme-main leading-tight truncate">{badge.name}</h4>
                <p className="text-[9px] font-semibold text-theme-muted mt-0.5">
                  {badge.unlocked ? t('unlocked', 'Unlocked') : `${badge.xpReward} XP`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Eco Stickers Showcase Section */}
      <div className="bg-theme-card border border-theme-card rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-theme-primary-bg border border-theme-primary-border flex items-center justify-center text-theme-primary">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-theme-main tracking-tight">
                {t('profile_stickers_title', 'Campus Eco Stickers')}
              </h3>
              <p className="text-xs text-theme-muted">
                {t('profile_stickers_desc', 'Purchased with clean dining & zero food waste XP')}
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToShop}
            className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t('profile_btn_visit_shop', 'Sticker Store')}</span>
            <Sparkles className="w-3 h-3" />
          </button>
        </div>

        {/* Stickers Display Grid */}
        {user.purchasedStickers && user.purchasedStickers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {user.purchasedStickers.slice(0, 12).map((stickerId) => {
              const sticker = getStickerById(stickerId);
              if (!sticker) return null;
              const isEquipped = user.showcaseStickerId === sticker.id;

              return (
                <div
                  key={sticker.id}
                  onClick={onNavigateToShop}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center justify-between space-y-2 relative group ${
                    isEquipped
                      ? 'bg-theme-card-subtle border-theme-primary shadow-sm shadow-theme-glow ring-1 ring-theme-primary/30'
                      : 'bg-theme-card-subtle border-theme-card hover:border-theme-primary/50'
                  }`}
                >
                  {isEquipped && (
                    <span className="absolute top-1.5 right-1.5 text-[8px] font-black uppercase tracking-wider bg-theme-primary text-black px-1.5 py-0.2 rounded-full shadow-xs">
                      Active
                    </span>
                  )}

                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-md transition-transform group-hover:scale-110"
                    style={{
                      border: `2px solid ${sticker.accentColor}`,
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                    }}
                  >
                    <span>{sticker.emoji}</span>
                  </div>

                  <div className="w-full">
                    <h4 className="text-[11px] font-bold text-theme-main truncate">{sticker.name}</h4>
                    <span className="text-[9px] font-semibold text-emerald-400 capitalize block">
                      {sticker.rarity}
                    </span>
                  </div>
                </div>
              );
            })}

            {user.purchasedStickers.length > 12 && (
              <div
                onClick={onNavigateToShop}
                className="p-3 rounded-2xl border border-dashed border-theme-card hover:border-theme-primary/60 bg-theme-card-subtle/50 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-1 group"
              >
                <span className="text-base font-black text-theme-primary group-hover:scale-110 transition-transform">
                  +{user.purchasedStickers.length - 12}
                </span>
                <span className="text-[10px] font-bold text-theme-muted group-hover:text-theme-main">
                  More in Album
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-theme-card-subtle border border-theme-card text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-theme-card flex items-center justify-center mx-auto text-2xl">
              🎨
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-theme-main">
                {t('profile_no_stickers_title', 'No Stickers in Your Collection Yet')}
              </h4>
              <p className="text-[11px] text-theme-muted max-w-sm mx-auto">
                {t(
                  'profile_no_stickers_desc',
                  'Exchange your clean plate dining XP for cool BBS campus stickers in the Sticker Shop!'
                )}
              </p>
            </div>
            <button
              onClick={onNavigateToShop}
              className="py-2 px-4 rounded-xl bg-theme-primary text-black font-extrabold text-xs shadow-sm cursor-pointer"
            >
              {t('profile_btn_browse_stickers', 'Browse Sticker Shop')}
            </button>
          </div>
        )}
      </div>

      {/* Weekly Impact Section - Based on what day it is today */}
      <div
        id="weekly-impact-card"
        className="bg-theme-card border border-theme-card rounded-3xl p-6 shadow-xl space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-theme-main tracking-tight">{t('weekly_impact', 'Weekly Impact')}</h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-theme-primary-bg text-theme-primary border border-theme-primary-border flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Today: {today.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </span>
            </div>
            <p className="text-xs text-theme-muted mt-1">
              {t('weekly_impact_desc', 'Campus food diversion & clean plate tracking by weekday')}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-theme-primary-bg border border-theme-primary-border flex items-center justify-center text-theme-primary">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>

        {/* Visual Bar Chart for Mon through Sun based on today */}
        <div className="h-48 pt-6 flex items-end justify-around gap-2 px-1 border-b border-theme-card pb-4">
          {weeklyDays.map((item) => (
            <div key={item.index} className="flex flex-col items-center gap-1.5 flex-1 max-w-[52px] group relative">
              {/* Grams Tooltip / Label */}
              <span
                className={`text-[10px] font-extrabold transition-opacity duration-200 ${
                  item.isToday
                    ? 'text-theme-primary opacity-100'
                    : 'text-theme-main opacity-0 group-hover:opacity-100'
                }`}
              >
                {item.grams}g
              </span>

              {/* Bar Track */}
              <div
                className={`w-full progress-theme-track h-28 rounded-xl flex items-end p-1 border transition-all ${
                  item.isToday
                    ? 'border-theme-primary shadow-sm shadow-theme-glow ring-2 ring-theme-primary/20'
                    : 'border-theme-card'
                }`}
              >
                <div
                  className={`w-full rounded-lg transition-all duration-500 ${
                    item.isToday
                      ? 'bg-theme-primary shadow-md shadow-theme-glow'
                      : item.grams > 0
                      ? 'bg-emerald-500/80 group-hover:bg-theme-primary'
                      : 'bg-theme-card-subtle opacity-30'
                  }`}
                  style={{ height: `${item.heightPct}%` }}
                />
              </div>

              {/* Day Label & Today Badge */}
              <div className="flex flex-col items-center">
                <span
                  className={`text-xs font-bold transition-colors ${
                    item.isToday
                      ? 'text-theme-primary font-black'
                      : item.isPast
                      ? 'text-theme-main'
                      : 'text-theme-muted'
                  }`}
                >
                  {item.fullDay}
                </span>
                {item.isToday && (
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-theme-primary text-black mt-0.5">
                    Today
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Stats Summary */}
        <div className="flex flex-wrap items-center justify-between pt-1 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-theme-primary" />
            <span className="text-theme-muted">
              {t('total_saved', 'Total Saved')}:{' '}
              <strong className="text-theme-main">
                {Number(calculatedWeekKg) > 0 ? calculatedWeekKg : user.foodSavedWeekKg.toFixed(1)} kg this week
              </strong>
            </span>
          </div>
          <span className="text-theme-primary font-bold bg-theme-primary-bg px-2.5 py-1 rounded-full border border-theme-primary-border">
            {today.toLocaleDateString(undefined, { weekday: 'long' })} Active Focus
          </span>
        </div>
      </div>
    </div>
  );
};

