import React, { useState } from 'react';
import {
  Flame,
  TrendingUp,
  Trophy,
  Users,
  Utensils,
  Leaf,
  Droplets,
  ShoppingBag,
  BookOpen,
  Plus,
  Sparkles,
  Recycle,
  Clock,
  Heart,
  Calendar,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  Zap,
  Crown,
} from 'lucide-react';
import { PortionSize, UserProfile, MealRecord, DailyTipItem, CampusChallengeInfo } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { allWeeklyTips } from '../data/mockData';

interface DashboardProps {
  user: UserProfile;
  meals: MealRecord[];
  tips: DailyTipItem[];
  challenge: CampusChallengeInfo;
  selectedPortion: PortionSize;
  onSelectPortion: (portion: PortionSize) => void;
  onStartNewMeal: () => void;
  onOpenMealDetails: (meal: MealRecord) => void;
  onOpenChallengeDetails: () => void;
  onOpenRecentMealsList: () => void;
  onOpenMealHallSpecial: () => void;
  onOpenTipDetails: (tip: DailyTipItem) => void;
  onOpenWeeklyImpact?: () => void;
  onRestartMeals?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  meals,
  tips,
  challenge,
  selectedPortion,
  onSelectPortion,
  onStartNewMeal,
  onOpenMealDetails,
  onOpenChallengeDetails,
  onOpenRecentMealsList,
  onOpenMealHallSpecial,
  onOpenTipDetails,
  onOpenWeeklyImpact,
  onRestartMeals,
}) => {
  const { t } = useLanguage();

  // Progress calculations
  const levelProgressPercent = Math.min(100, Math.round((user.currentXp / user.nextLevelXp) * 100));

  const getGreetingColorClass = () => {
    switch (user.greetingColor) {
      case 'green':
        return 'text-emerald-500';
      case 'emerald':
        return 'text-emerald-400';
      case 'amber':
        return 'text-amber-500';
      case 'cyan':
        return 'text-cyan-500';
      default:
        return 'text-theme-main';
    }
  };

  const todayDayOfWeek = new Date().getDay();
  const [activeDayFilter, setActiveDayFilter] = useState<number>(todayDayOfWeek);

  const WEEK_DAYS = [
    { day: 1, name: 'Mon', fullName: 'Monday', focus: 'Plant-Rich Power' },
    { day: 2, name: 'Tue', fullName: 'Tuesday', focus: 'Smart Portions' },
    { day: 3, name: 'Wed', fullName: 'Wednesday', focus: 'Freshness & Storage' },
    { day: 4, name: 'Thu', fullName: 'Thursday', focus: 'Carbon & Water' },
    { day: 5, name: 'Fri', fullName: 'Friday', focus: 'Campus Action' },
    { day: 6, name: 'Sat', fullName: 'Saturday', focus: 'Weekend Kitchen' },
    { day: 0, name: 'Sun', fullName: 'Sunday', focus: 'Meal Planning' },
  ];

  const displayedTips = allWeeklyTips.filter((t) => t.dayOfWeek === activeDayFilter);
  const activeDayInfo = WEEK_DAYS.find((w) => w.day === activeDayFilter) || WEEK_DAYS[0];

  const renderTipIcon = (type: DailyTipItem['iconType']) => {
    switch (type) {
      case 'compost':
      case 'plant':
        return <Leaf className="w-5 h-5 text-emerald-400" />;
      case 'water':
        return <Droplets className="w-5 h-5 text-sky-400" />;
      case 'bag':
        return <ShoppingBag className="w-5 h-5 text-teal-400" />;
      case 'plan':
        return <BookOpen className="w-5 h-5 text-indigo-400" />;
      case 'utensils':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      case 'recycle':
        return <Recycle className="w-5 h-5 text-emerald-400" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-amber-300" />;
      case 'flame':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'heart':
        return <Heart className="w-5 h-5 text-rose-400" />;
      case 'clock':
        return <Clock className="w-5 h-5 text-purple-400" />;
      default:
        return <Leaf className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getStreakDetails = (streakDays: number) => {
    if (streakDays <= 0) {
      return {
        title: '0 Days (Streak Broken)',
        message: 'The landfill is crying right now 😢 Don\'t let good food go to waste today! Eat clean to start your redemption.',
        badgeText: '⚠️ 0 Streak • Need Redemption',
        badgeStyle: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
        iconBg: 'bg-rose-500/15',
        iconBorder: 'border-rose-500/30',
        cardBorder: 'border-rose-500/30 hover:border-rose-500/50',
        levelTip: '⚠️ Streak is currently 0. Finish your plate today to restore your eco momentum!',
      };
    }
    if (streakDays === 1) {
      return {
        title: '1 Day Streak',
        message: 'First step down! Keep pushing — don\'t let the momentum slip away tomorrow! 🚀',
        badgeText: '🌱 Fresh Start • Keep Pushing!',
        badgeStyle: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
        iconBg: 'bg-emerald-500/15',
        iconBorder: 'border-emerald-500/30',
        cardBorder: 'border-emerald-500/30 hover:border-emerald-500/50',
        levelTip: '🌱 1-Day streak started! Clean your plate tomorrow to keep the flame alive.',
      };
    }
    if (streakDays === 2) {
      return {
        title: '2 Days Strong',
        message: 'Back-to-back clean plates! You\'re building serious momentum — keep the fire burning! 🔥',
        badgeText: '🔥 Sparks Flying • 2 In A Row',
        badgeStyle: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
        icon: <Flame className="w-5 h-5 text-orange-400 fill-orange-400/20" />,
        iconBg: 'bg-orange-500/15',
        iconBorder: 'border-orange-500/30',
        cardBorder: 'border-orange-500/30 hover:border-orange-500/50',
        levelTip: '🔥 2-Day streak active! Reach 3 days to unlock the 3-Day Flame badge!',
      };
    }
    if (streakDays === 3) {
      return {
        title: '3 Days Strong',
        message: '3-Day Hat Trick! The zero-waste habit is locking in. Don\'t break the chain now! ⚡',
        badgeText: '⚡ Hat Trick • Locked In',
        badgeStyle: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        icon: <Zap className="w-5 h-5 text-amber-400 fill-amber-400/20" />,
        iconBg: 'bg-amber-500/15',
        iconBorder: 'border-amber-500/30',
        cardBorder: 'border-amber-500/30 hover:border-amber-500/50',
        levelTip: '⚡ 3-Day Hat Trick active! Every clean plate earns +25% bonus eco XP.',
      };
    }
    if (streakDays >= 4 && streakDays <= 6) {
      return {
        title: `${streakDays} Days Strong`,
        message: 'Unstoppable eco warrior! You\'re crushing cafeteria food waste day after day! 🌟',
        badgeText: '🌟 Waste Nemesis • Blazing Hot',
        badgeStyle: 'bg-theme-primary/20 text-theme-primary border-theme-primary/40',
        icon: <Flame className="w-5 h-5 text-theme-primary fill-theme-primary/30" />,
        iconBg: 'bg-theme-primary-bg',
        iconBorder: 'border-theme-primary-border',
        cardBorder: 'border-theme-card hover:border-theme-primary',
        levelTip: `🌟 ${streakDays}-Day streak! You're only ${7 - streakDays} day${7 - streakDays > 1 ? 's' : ''} away from Week Champion!`,
      };
    }
    if (streakDays >= 7 && streakDays <= 13) {
      return {
        title: `${streakDays} Days Strong`,
        message: '1+ Week of Zero Waste! Pure discipline. BBS PIK campus legend status unlocked! 🏆',
        badgeText: '🏆 Campus Legend • 1+ Week',
        badgeStyle: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
        icon: <Trophy className="w-5 h-5 text-amber-400 fill-amber-400/30" />,
        iconBg: 'bg-amber-500/15',
        iconBorder: 'border-amber-500/30',
        cardBorder: 'border-amber-500/30 hover:border-amber-400',
        levelTip: '🏆 1+ Week Zero Waste streak active! You are setting the gold standard for BBS PIK.',
      };
    }
    if (streakDays >= 14 && streakDays <= 29) {
      return {
        title: `${streakDays} Days Strong`,
        message: '2+ Weeks of pristine plates! You are single-handedly lowering campus carbon emissions! 👑',
        badgeText: '👑 Zero Waste Titan • 2+ Weeks',
        badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        icon: <Crown className="w-5 h-5 text-purple-400 fill-purple-400/30" />,
        iconBg: 'bg-purple-500/15',
        iconBorder: 'border-purple-500/30',
        cardBorder: 'border-purple-500/30 hover:border-purple-400',
        levelTip: '👑 2+ Weeks streak! You are an elite eco guardian of the campus.',
      };
    }
    return {
      title: `${streakDays} Days Strong`,
      message: 'God-tier eco consistency! 30+ days of spotless plates. You are BBS PIK royalty! 💎',
      badgeText: '💎 Eco Royalty • Diamond Tier',
      badgeStyle: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      icon: <Sparkles className="w-5 h-5 text-cyan-400 fill-cyan-400/30" />,
      iconBg: 'bg-cyan-500/15',
      iconBorder: 'border-cyan-500/30',
      cardBorder: 'border-cyan-500/30 hover:border-cyan-400',
      levelTip: '💎 30+ Days Diamond streak! You have achieved legendary zero-waste status.',
    };
  };

  const streakInfo = getStreakDetails(user.streakDays);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6 pb-24 sm:pb-16 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-theme-muted">{t('welcome_back', 'Welcome back,')}</p>
        <h1 className={`text-4xl font-extrabold tracking-tight ${getGreetingColorClass()}`}>
          {user.greetingName || user.name.split(' ')[0]}
        </h1>
        <p className="text-sm font-medium text-theme-muted pt-0.5">
          {t('tagline', 'Eat Smart. Save More. Go Green.')}
        </p>
      </div>

      {/* Current Streak Banner */}
      <div
        id="streak-card"
        className={`w-full bg-theme-card border ${streakInfo.cardBorder} rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-md transition-all duration-300 relative overflow-hidden`}
      >
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl ${streakInfo.iconBg} border ${streakInfo.iconBorder} flex items-center justify-center shrink-0 shadow-sm`}>
            {streakInfo.icon}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider text-theme-muted font-bold">
                {t('current_streak', 'Current Streak')}
              </span>
              <span className="text-xl sm:text-2xl font-black text-theme-main tracking-tight">
                {streakInfo.title}
              </span>
            </div>
            <p className="text-xs text-theme-main/90 font-medium leading-relaxed max-w-xl">
              {streakInfo.message}
            </p>
          </div>
        </div>

        <div className="shrink-0 self-end sm:self-center">
          <span className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold border ${streakInfo.badgeStyle} flex items-center gap-1.5 shadow-sm whitespace-nowrap`}>
            {streakInfo.badgeText}
          </span>
        </div>
      </div>

      {/* Metric Cards Row (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Card: Food Saved */}
        <div
          id="food-saved-card"
          onClick={onOpenWeeklyImpact}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenWeeklyImpact?.();
            }
          }}
          title={t('view_weekly_impact_tooltip', 'Click to view Weekly Impact breakdown')}
          className="bg-theme-card border border-theme-card rounded-3xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300 hover:border-theme-primary hover:scale-[1.01] cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-theme-primary-bg border border-theme-primary-border flex items-center justify-center text-theme-primary group-hover:scale-105 transition-transform">
                <Leaf className="w-5 h-5 fill-current/30" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-theme-main group-hover:text-theme-primary transition-colors">
                  {t('food_saved', 'Food Saved')}
                </h3>
                <p className="text-xs text-theme-muted">{t('eco_diversion_metric', 'Eco diversion metric')}</p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-theme-card-subtle border border-theme-card flex items-center justify-center text-theme-muted group-hover:text-theme-primary group-hover:border-theme-primary transition-all">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-theme-main tracking-tight">
                {user.foodSavedKg.toFixed(1)}
              </span>
              <span className="text-2xl font-semibold text-theme-muted">{t('kg', 'kg')}</span>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-primary-badge bg-theme-primary-bg px-3 py-1 rounded-full border border-theme-primary-border">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{user.foodSavedWeekKg.toFixed(1)}{t('kg_this_week', 'kg this week')}</span>
              </div>

              <span className="text-[11px] font-extrabold text-theme-primary flex items-center gap-1 opacity-90 group-hover:opacity-100 group-hover:underline">
                <span>{t('view_weekly_impact_action', 'Weekly Impact')}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Current Level */}
        <div
          id="current-level-card"
          className="bg-theme-card border border-theme-card rounded-3xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300 hover:border-theme-primary"
        >
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-theme-primary-bg border border-theme-primary-border flex items-center justify-center text-theme-primary">
              <Sparkles className="w-5 h-5 fill-current/30" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-theme-main">{t('current_level', 'Current Level')}</h3>
              <p className="text-xs text-theme-muted">{t('xp_milestone_rank', 'XP milestone rank')}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-theme-main tracking-tight">
                  {t('level', 'Lvl')} {user.level}
                </span>
                <span className="text-xs font-bold text-theme-primary px-2 py-0.5 rounded-md bg-theme-primary-bg border border-theme-primary-border">
                  {user.title}
                </span>
              </div>
              <span className="text-xs font-semibold text-theme-muted">
                {user.currentXp} / {user.nextLevelXp} {t('xp', 'XP')}
              </span>
            </div>

            {/* Level Progress Bar */}
            <div className="w-full progress-theme-track h-3.5 rounded-full overflow-hidden p-0.5 border border-theme-card">
              <div
                className="bg-theme-primary h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>

            {/* Sub-banner pill */}
            <div className="bg-theme-card-subtle border border-theme-card rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-theme-muted">
              <Leaf className="w-4 h-4 text-theme-primary shrink-0" />
              <span className="leading-snug">{streakInfo.levelTip}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campus Challenge Card */}
      <div
        id="campus-challenge-card"
        className="bg-theme-card border border-theme-card rounded-3xl p-6 shadow-lg space-y-4 transition-all duration-300 hover:border-theme-primary"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-theme-primary-bg border border-theme-primary-border flex items-center justify-center text-theme-primary">
              <Trophy className="w-5 h-5 fill-current/30" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-theme-muted font-bold">
                {challenge.title}
              </p>
              <h3 className="text-xl font-bold text-theme-main tracking-tight">
                {challenge.subtitle}
              </h3>
            </div>
          </div>

          <button
            id="btn-view-challenge-details"
            onClick={onOpenChallengeDetails}
            className="text-xs font-bold text-theme-primary hover:underline transition-colors cursor-pointer"
          >
            {t('view_details', 'View Details')}
          </button>
        </div>

        {/* Challenge Progress */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-theme-main">
              {challenge.progressPercentage}% {t('of_campus_goal', 'of Campus Goal Reached')}
            </span>
            <span className="text-theme-muted">{challenge.daysLeft} {t('days_left', 'days left')}</span>
          </div>

          <div className="w-full progress-theme-track h-3.5 rounded-full overflow-hidden p-0.5 border border-theme-card">
            <div
              className="bg-theme-primary h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${challenge.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Participating banner pill */}
        <div className="bg-theme-card-subtle border border-theme-card rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-theme-main font-medium">
          <Users className="w-4 h-4 text-theme-primary shrink-0" />
          <span>{t('join_challenge_msg', `Join ${challenge.studentsParticipating.toLocaleString()} students saving food today!`)}</span>
        </div>
      </div>

      {/* Campus Meal Hall Pill Banner */}
      <div className="flex justify-center pt-1">
        <button
          id="btn-campus-meal-hall"
          onClick={onOpenMealHallSpecial}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-theme-card border border-theme-card text-xs font-semibold text-theme-main hover:bg-theme-card-subtle hover:border-theme-primary transition-all shadow-md cursor-pointer"
        >
          <Utensils className="w-4 h-4 text-theme-primary" />
          <span>{t('campus_meal_hall_special', "Campus Meal Hall: Today's Special: Garden Salad")}</span>
        </button>
      </div>

      {/* Portion Size Selection */}
      <div className="space-y-3 pt-2">
        <label className="text-xs uppercase tracking-wider font-bold text-theme-muted block">
          {t('select_portion_size', 'Select Portion Size')}
        </label>
        <div className="flex items-center gap-3">
          {(['Small', 'Regular', 'Large'] as PortionSize[]).map((portion) => {
            const isSelected = selectedPortion === portion;
            const portionLabel =
              portion === 'Small'
                ? t('portion_small', 'Small')
                : portion === 'Regular'
                ? t('portion_regular', 'Regular')
                : t('portion_large', 'Large');

            return (
              <button
                key={portion}
                id={`portion-btn-${portion.toLowerCase()}`}
                onClick={() => onSelectPortion(portion)}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-theme-primary text-black shadow-md shadow-theme-glow ring-2 ring-theme-primary'
                    : 'bg-theme-card text-theme-muted border border-theme-card hover:border-theme-primary hover:text-theme-main'
                }`}
              >
                {portionLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Big Action Button: Start New Meal */}
      <div>
        <button
          id="btn-start-new-meal"
          onClick={onStartNewMeal}
          className="w-full py-4 rounded-full bg-theme-primary text-black font-extrabold text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] shadow-lg shadow-theme-glow cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>{t('start_new_meal', 'Start New Meal')}</span>
        </button>
      </div>

      {/* Daily Tips Section */}
      <div className="space-y-3.5 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-theme-primary" />
              <h2 className="text-xl font-extrabold text-theme-main tracking-tight">
                {t('daily_tips', 'Daily Eco Tips')}
              </h2>
              {activeDayFilter === todayDayOfWeek && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-theme-muted pt-0.5">
              {activeDayInfo.fullName} Theme: <strong className="text-theme-main">{activeDayInfo.focus}</strong>
            </p>
          </div>

          {/* Weekday Switcher Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            {WEEK_DAYS.map((w) => {
              const isSelected = activeDayFilter === w.day;
              const isToday = todayDayOfWeek === w.day;
              return (
                <button
                  key={w.day}
                  onClick={() => setActiveDayFilter(w.day)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    isSelected
                      ? 'bg-theme-primary text-black shadow-md shadow-theme-glow ring-1 ring-theme-primary'
                      : 'bg-theme-card text-theme-muted hover:text-theme-main border border-theme-card hover:border-theme-primary'
                  }`}
                  title={`${w.fullName}: ${w.focus}`}
                >
                  <span>{w.name}</span>
                  {isToday && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-theme-primary'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Daily Tip Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {displayedTips.map((tip) => (
            <div
              key={tip.id}
              onClick={() => onOpenTipDetails(tip)}
              className="bg-theme-card border border-theme-card hover:border-theme-primary rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-all cursor-pointer shadow-md group relative overflow-hidden"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-theme-card-subtle border border-theme-card flex items-center justify-center group-hover:border-theme-primary transition-colors">
                    {renderTipIcon(tip.iconType)}
                  </div>
                  <span className="text-[10px] font-bold text-theme-muted bg-theme-card-subtle px-2 py-0.5 rounded-full border border-theme-card">
                    {tip.category}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-theme-main leading-snug group-hover:text-theme-primary transition-colors">
                    {tip.title}
                  </h4>
                  <p className="text-xs text-theme-muted line-clamp-2 leading-relaxed pt-1">
                    {tip.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-theme-card mt-3 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-bold truncate max-w-[130px]">
                  {tip.impactStat ? tip.impactStat.replace('Saves ', 'Save ') : `+${tip.bonusXp || 20} XP`}
                </span>
                <span className="text-theme-primary font-extrabold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Details <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Meals Section */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-theme-main tracking-tight">{t('recent_meals', 'Recent Meals')}</h2>
            {meals.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-theme-card-subtle text-theme-muted border border-theme-card">
                {meals.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {meals.length > 0 && onRestartMeals && (
              <button
                id="btn-restart-meals"
                onClick={onRestartMeals}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:underline cursor-pointer transition-colors"
                title="Restart and reset recent meals"
              >
                {t('restart', 'Restart')}
              </button>
            )}
            <button
              id="btn-view-all-meals"
              onClick={onOpenRecentMealsList}
              className="text-xs font-bold text-theme-primary hover:underline cursor-pointer"
            >
              {t('view_all', 'View All')}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {meals.length === 0 ? (
            <div
              id="empty-meals-card"
              onClick={onStartNewMeal}
              className="w-full bg-theme-card border-2 border-dashed border-theme-card hover:border-theme-primary rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 transition-all cursor-pointer group shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-theme-primary-bg border border-theme-primary-border flex items-center justify-center text-theme-primary group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-base font-bold text-theme-main">No meals logged yet</h4>
                <p className="text-xs text-theme-muted leading-relaxed">
                  Scan your campus dining plate before & after eating to verify zero waste, earn XP, and start your clean plate streak!
                </p>
              </div>
              <button
                type="button"
                className="mt-2 text-xs font-bold px-4 py-2 rounded-full bg-theme-primary text-black shadow-md shadow-theme-glow group-hover:opacity-95"
              >
                Scan First Meal
              </button>
            </div>
          ) : (
            meals.map((meal) => (
              <div
                key={meal.id}
                id={`meal-row-${meal.id}`}
                onClick={() => onOpenMealDetails(meal)}
                className="w-full bg-theme-card border border-theme-card hover:border-theme-primary rounded-2xl p-3 sm:p-4 flex items-center justify-between transition-all cursor-pointer shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={meal.imageUrl}
                    alt={meal.title}
                    className="w-14 h-14 rounded-xl object-cover border border-theme-card shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-base font-bold text-theme-main leading-tight">{meal.title}</h4>
                    <p className="text-xs text-theme-muted mt-1">
                      {meal.time} • {meal.portion}
                    </p>
                  </div>
                </div>

                <div
                  className={`font-black text-xs px-3.5 py-1.5 rounded-full shadow-sm ${
                    meal.xp < 0
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-theme-primary text-black'
                  }`}
                >
                  {meal.xp >= 0 ? `+${meal.xp}` : `${meal.xp}`} {t('xp', 'XP')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
