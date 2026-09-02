import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Star,
  Users,
  Sparkles,
  Filter,
  GraduationCap,
  Leaf,
  Wifi,
  RefreshCw,
  Flame,
  Award,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { UserProfile, CampusChallengeInfo, LeaderboardUser, ClassRankingItem } from '../types';
import {
  leaderboardUsers as fallbackLeaderboardUsers,
  AVAILABLE_GRADES,
  GRADE_DIVISIONS,
  getLevelTitle,
} from '../data/mockData';
import {
  subscribeToLiveLeaderboard,
  computeLiveGradeClassesRankings,
  getOrCreateUserId,
  seedInitialCommunityIfEmpty,
} from '../lib/leaderboardService';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface LeaderboardProps {
  user: UserProfile;
  challenge: CampusChallengeInfo;
}

type SubTab = 'bbs' | 'goal' | 'class';
type ClassViewMode = 'championship' | 'roster';

export const Leaderboard: React.FC<LeaderboardProps> = ({ user, challenge }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('bbs');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const [classDivisionFilter, setClassDivisionFilter] = useState<string>('all');
  const [classViewMode, setClassViewMode] = useState<ClassViewMode>('championship');
  const [selectedClassRoom, setSelectedClassRoom] = useState<string>(
    user.homeroom || `${user.grade || 'Grade 9'}-${user.section || 'A'}`
  );
  const [liveUsers, setLiveUsers] = useState<LeaderboardUser[]>([]);
  const [isLiveOnline, setIsLiveOnline] = useState<boolean>(true);
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  const currentUserId = getOrCreateUserId(user);
  const userHomeroom = user.homeroom || `${user.grade || 'Grade 9'}-${user.section || 'A'}`;

  // Keep selectedClassRoom in sync if user changes grade/section
  useEffect(() => {
    if (userHomeroom) {
      setSelectedClassRoom(userHomeroom);
    }
  }, [userHomeroom]);

  // Subscribe to real-time online updates from Firestore
  useEffect(() => {
    seedInitialCommunityIfEmpty();

    const unsubscribe = subscribeToLiveLeaderboard(currentUserId, (users) => {
      if (users && users.length > 0) {
        setLiveUsers(users);
        setIsLiveOnline(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUserId, user.totalXp, user.foodSavedKg]);

  // Merge live users with current active student data to guarantee real-time reflection
  const baseUsersList: LeaderboardUser[] = liveUsers.length > 0 ? liveUsers : fallbackLeaderboardUsers;

  // Make sure current user is always included with real-time XP and sorted accurately
  const activeCurrentUserInList = baseUsersList.find((u) => u.isCurrentUser || u.name === user.name);

  let mergedRankedUsers: LeaderboardUser[] = [];
  if (!activeCurrentUserInList) {
    mergedRankedUsers = [
      ...baseUsersList,
      {
        rank: 0,
        name: user.name,
        shortName: user.greetingName || user.name.split(' ')[0],
        xp: user.totalXp,
        xpFormatted:
          user.totalXp >= 1000
            ? `${(user.totalXp / 1000).toFixed(1)}k XP`
            : `${user.totalXp.toLocaleString()} XP`,
        avatar:
          user.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        grade: user.grade || 'Grade 9',
        section: user.section || 'A',
        homeroom: userHomeroom,
        foodSavedKg: user.foodSavedKg || 0,
        streakDays: user.streakDays || 0,
        title: user.title || getLevelTitle(user.level),
        level: user.level,
        isCurrentUser: true,
      },
    ];
  } else {
    mergedRankedUsers = baseUsersList.map((u) => {
      if (u.isCurrentUser || u.name === user.name) {
        return {
          ...u,
          name: user.name,
          grade: user.grade,
          section: user.section || 'A',
          homeroom: userHomeroom,
          xp: user.totalXp,
          xpFormatted:
            user.totalXp >= 1000
              ? `${(user.totalXp / 1000).toFixed(1)}k XP`
              : `${user.totalXp.toLocaleString()} XP`,
          level: user.level,
          title: user.title || getLevelTitle(user.level),
          avatar: user.avatarUrl || u.avatar,
          foodSavedKg: user.foodSavedKg || u.foodSavedKg || 0,
          streakDays: user.streakDays || u.streakDays || 0,
          isCurrentUser: true,
        };
      }
      return u;
    });
  }

  // Sort strictly by XP descending and recalculate campus ranks
  mergedRankedUsers.sort((a, b) => b.xp - a.xp);
  const campusRankedUsers = mergedRankedUsers.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  // Filter campus leaderboard users by selected grade or division
  const filteredCampusUsers = campusRankedUsers.filter((u) => {
    if (selectedGradeFilter === 'all') return true;
    if (selectedGradeFilter === 'primary') {
      return ['Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].includes(u.grade);
    }
    if (selectedGradeFilter === 'secondary') {
      return ['Grade 7', 'Grade 8', 'Grade 9'].includes(u.grade);
    }
    if (selectedGradeFilter === 'jc') {
      return ['Grade 10', 'Grade 11', 'Grade 12'].includes(u.grade);
    }
    return u.grade === selectedGradeFilter;
  });

  const campusRank1 = filteredCampusUsers[0];
  const campusRank2 = filteredCampusUsers[1];
  const campusRank3 = filteredCampusUsers[2];
  const campusOtherUsers = filteredCampusUsers.slice(3);

  // Compute live Grade Classes rankings dynamically from online Firestore users
  const allLiveClassRankings = computeLiveGradeClassesRankings(campusRankedUsers, userHomeroom);

  // Filter grade classes by division
  const filteredClassRankings = allLiveClassRankings.filter((c) => {
    if (classDivisionFilter === 'all') return true;
    if (classDivisionFilter === 'primary') {
      return ['Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].includes(c.grade);
    }
    if (classDivisionFilter === 'secondary') {
      return ['Grade 7', 'Grade 8', 'Grade 9'].includes(c.grade);
    }
    if (classDivisionFilter === 'jc') {
      return ['Grade 10', 'Grade 11', 'Grade 12'].includes(c.grade);
    }
    return true;
  });

  // User's own class stats
  const userClassStat = allLiveClassRankings.find((c) => c.isUserClass) || {
    rank: 1,
    className: userHomeroom,
    grade: user.grade || 'Grade 9',
    section: user.section || 'A',
    totalXp: user.totalXp,
    xpFormatted: `${user.totalXp.toLocaleString()} XP`,
    foodSavedKg: user.foodSavedKg || 0,
    studentsCount: 1,
    avgXpPerStudent: user.totalXp,
    isUserClass: true,
  };

  // Class Podium
  const classRank1 = filteredClassRankings[0];
  const classRank2 = filteredClassRankings[1];
  const classRank3 = filteredClassRankings[2];
  const classOtherRanks = filteredClassRankings.slice(3);

  // Live Class Roster for the currently selected class
  const activeClassRoster = campusRankedUsers
    .filter((u) => {
      const uHomeroom = u.homeroom || `${u.grade}-${u.section || 'A'}`;
      return uHomeroom === selectedClassRoom || u.grade === selectedClassRoom;
    })
    .map((u, idx) => ({
      ...u,
      classRank: idx + 1,
    }));

  // Unique list of available homeroom classes
  const availableClassNames = Array.from(
    new Set(allLiveClassRankings.map((c) => c.className))
  ).sort();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24 sm:pb-16 animate-in fade-in duration-300">
      {/* Real-time Online Sync Indicator Banner */}
      <div className="flex items-center justify-between bg-theme-card-subtle border border-theme-card px-4 py-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-theme-main">
            Live Multi-Student Cloud Leaderboard
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-theme-primary">
          <Wifi className="w-3.5 h-3.5" />
          <span>Real-time Sync Active</span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
        <button
          id="leaderboard-tab-bbs"
          onClick={() => setActiveSubTab('bbs')}
          className={`flex-1 py-2.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'bbs'
              ? 'bg-theme-primary text-black shadow-md shadow-theme-glow'
              : 'bg-theme-card text-theme-muted border border-theme-card hover:text-theme-main'
          }`}
        >
          {t('lb_tab_bbs', 'BBS PIK Campus')}
        </button>

        <button
          id="leaderboard-tab-goal"
          onClick={() => setActiveSubTab('goal')}
          className={`flex-1 py-2.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'goal'
              ? 'bg-theme-primary text-black shadow-md shadow-theme-glow'
              : 'bg-theme-card text-theme-muted border border-theme-card hover:text-theme-main'
          }`}
        >
          {t('lb_tab_goal', 'Campus Goal')}
        </button>

        <button
          id="leaderboard-tab-class"
          onClick={() => setActiveSubTab('class')}
          className={`flex-1 py-2.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'class'
              ? 'bg-theme-primary text-black shadow-md shadow-theme-glow'
              : 'bg-theme-card text-theme-muted border border-theme-card hover:text-theme-main'
          }`}
        >
          {t('lb_tab_class', 'Grade Classes')}
        </button>
      </div>

      {/* 1. BBS PIK Campus Leaderboard Tab */}
      {activeSubTab === 'bbs' && (
        <div className="space-y-6">
          {/* Grade Division Filter Pills */}
          <div className="bg-theme-card border border-theme-card rounded-2xl p-3 shadow-md space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-theme-muted uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5 text-theme-primary" />
                <span>Filter Campus Grades (3–12)</span>
              </div>
              <span className="text-[11px] font-semibold text-theme-primary">
                {selectedGradeFilter === 'all'
                  ? 'All Campus Grades (3–12)'
                  : selectedGradeFilter === 'primary'
                  ? 'Primary (Grades 3–6)'
                  : selectedGradeFilter === 'secondary'
                  ? 'Secondary (Grades 7–9)'
                  : selectedGradeFilter === 'jc'
                  ? 'Junior College (Grades 10–12)'
                  : selectedGradeFilter}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
              <button
                onClick={() => setSelectedGradeFilter('all')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedGradeFilter === 'all'
                    ? 'bg-theme-primary text-black shadow-sm'
                    : 'bg-theme-card-subtle text-theme-muted border border-theme-card hover:text-theme-main'
                }`}
              >
                All Grades
              </button>
              <button
                onClick={() => setSelectedGradeFilter('primary')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedGradeFilter === 'primary'
                    ? 'bg-theme-primary text-black shadow-sm'
                    : 'bg-theme-card-subtle text-theme-muted border border-theme-card hover:text-theme-main'
                }`}
              >
                Primary (3–6)
              </button>
              <button
                onClick={() => setSelectedGradeFilter('secondary')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedGradeFilter === 'secondary'
                    ? 'bg-theme-primary text-black shadow-sm'
                    : 'bg-theme-card-subtle text-theme-muted border border-theme-card hover:text-theme-main'
                }`}
              >
                Secondary (7–9)
              </button>
              <button
                onClick={() => setSelectedGradeFilter('jc')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedGradeFilter === 'jc'
                    ? 'bg-theme-primary text-black shadow-sm'
                    : 'bg-theme-card-subtle text-theme-muted border border-theme-card hover:text-theme-main'
                }`}
              >
                JC / Senior (10–12)
              </button>
              {AVAILABLE_GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGradeFilter(g)}
                  className={`px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    selectedGradeFilter === g
                      ? 'bg-theme-primary text-black shadow-sm'
                      : 'bg-theme-card-subtle text-theme-muted border border-theme-card hover:text-theme-main'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Subtitle Banner */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-theme-card-subtle border border-theme-card text-xs font-bold text-theme-main">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="tracking-wider uppercase">
                {t('campus_ranking_title', 'Campus Ranking: Real-time Live')}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-theme-muted">
              {filteredCampusUsers.length} Students Listed
            </span>
          </div>

          {/* Top 3 Podium */}
          <div className="pt-4 pb-2 flex items-end justify-center gap-4 sm:gap-8 max-w-lg mx-auto">
            {/* Rank 2 */}
            {campusRank2 && (
              <div className="flex flex-col items-center space-y-2 flex-1">
                <div className="relative">
                  <img
                    src={campusRank2.avatar}
                    alt={campusRank2.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-slate-300 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-slate-300 text-black font-extrabold text-xs flex items-center justify-center border-2 border-theme-card">
                    2
                  </div>
                </div>
                <div className="text-center space-y-0.5">
                  <h4 className="text-sm font-bold text-theme-main leading-tight">
                    {campusRank2.name} {campusRank2.isCurrentUser ? '(You)' : ''}
                  </h4>
                  <p className="text-[11px] font-semibold text-theme-primary">
                    {campusRank2.title || getLevelTitle(campusRank2.level || 2)}
                  </p>
                  <p className="text-[10px] text-theme-muted">
                    {campusRank2.homeroom || campusRank2.grade}
                  </p>
                  <p className="text-xs font-semibold text-theme-muted">{campusRank2.xpFormatted}</p>
                </div>
              </div>
            )}

            {/* Rank 1 (Taller, Crown, Golden Ring) */}
            {campusRank1 && (
              <div className="flex flex-col items-center space-y-2 flex-1 -translate-y-4">
                <div className="relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Trophy className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />
                  </div>
                  <img
                    src={campusRank1.avatar}
                    alt={campusRank1.name}
                    className="w-22 h-22 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-theme-primary shadow-xl shadow-theme-glow"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-2.5 -right-1 w-7 h-7 rounded-full bg-theme-primary text-black font-black text-xs flex items-center justify-center border-2 border-theme-card">
                    1
                  </div>
                </div>
                <div className="text-center space-y-0.5">
                  <h4 className="text-base font-extrabold text-theme-main leading-tight">
                    {campusRank1.name} {campusRank1.isCurrentUser ? '(You)' : ''}
                  </h4>
                  <p className="text-xs font-bold text-theme-primary">
                    {campusRank1.title || getLevelTitle(campusRank1.level || 10)}
                  </p>
                  <p className="text-[11px] text-theme-muted">
                    {campusRank1.homeroom || campusRank1.grade}
                  </p>
                  <p className="text-xs font-black text-theme-primary">{campusRank1.xpFormatted}</p>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {campusRank3 && (
              <div className="flex flex-col items-center space-y-2 flex-1">
                <div className="relative">
                  <img
                    src={campusRank3.avatar}
                    alt={campusRank3.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-amber-700 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center border-2 border-theme-card">
                    3
                  </div>
                </div>
                <div className="text-center space-y-0.5">
                  <h4 className="text-sm font-bold text-theme-main leading-tight">
                    {campusRank3.name} {campusRank3.isCurrentUser ? '(You)' : ''}
                  </h4>
                  <p className="text-[11px] font-semibold text-theme-primary">
                    {campusRank3.title || getLevelTitle(campusRank3.level || 3)}
                  </p>
                  <p className="text-[10px] text-theme-muted">
                    {campusRank3.homeroom || campusRank3.grade}
                  </p>
                  <p className="text-xs font-semibold text-theme-muted">{campusRank3.xpFormatted}</p>
                </div>
              </div>
            )}
          </div>

          {/* Ranked List below */}
          <div className="space-y-3 pt-2">
            {campusOtherUsers.map((u) => {
              const isCurrentUser = u.isCurrentUser || u.name === user.name;

              if (isCurrentUser) {
                return (
                  <div
                    key={`user-rank-${u.rank}`}
                    id="current-user-rank-card"
                    className="w-full bg-theme-card border-2 border-theme-primary rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-xl transform transition-transform scale-[1.01]"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="font-extrabold text-base w-6 text-center text-theme-primary">
                        #{u.rank}
                      </span>
                      <div className="relative">
                        <img
                          src={user.avatarUrl || u.avatar}
                          alt="You"
                          className="w-11 h-11 rounded-full object-cover border-2 border-theme-primary"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-theme-primary rounded-full border border-theme-card" />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold leading-tight text-theme-main flex items-center gap-1.5">
                          <span>{user.name}</span>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-theme-primary text-black">
                            YOU
                          </span>
                        </h4>
                        <p className="text-xs font-bold text-theme-primary">
                          {user.title || getLevelTitle(user.level)}
                        </p>
                        <p className="text-[11px] text-theme-muted">
                          {u.homeroom || userHomeroom} • Lvl {user.level}
                        </p>
                      </div>
                    </div>

                    <div className="font-black text-sm text-black bg-theme-primary px-3.5 py-1.5 rounded-full shadow-sm">
                      {user.totalXp.toLocaleString()} XP
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`user-${u.rank}-${u.name}`}
                  className="w-full bg-theme-card border border-theme-card rounded-2xl p-3 sm:p-4 flex items-center justify-between hover:border-theme-primary transition-colors shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="font-bold text-sm text-theme-muted w-6 text-center">
                      #{u.rank}
                    </span>
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-11 h-11 rounded-full object-cover border border-theme-card"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-theme-main leading-tight">{u.name}</h4>
                      <p className="text-xs font-semibold text-theme-primary">
                        {u.title || getLevelTitle(u.level || Math.max(1, Math.floor(u.xp / 500)))}
                      </p>
                      <p className="text-[11px] text-theme-muted">{u.homeroom || u.grade}</p>
                    </div>
                  </div>

                  <div className="font-bold text-xs text-theme-main bg-theme-card-subtle px-3.5 py-1.5 rounded-full border border-theme-card">
                    {u.xpFormatted}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Sub-tab: Campus Goal */}
      {activeSubTab === 'goal' && (
        <div className="bg-theme-card border border-theme-card rounded-3xl p-6 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-theme-primary-bg border border-theme-primary-border flex items-center justify-center text-theme-primary">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-theme-main">Campus 1-Ton Food Divert</h3>
              <p className="text-xs text-theme-muted">BBS PIK Grades 3–12 Live Sustainability Goal</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-theme-main">
              <span>{challenge.currentKg} kg Diverted Live</span>
              <span className="text-theme-muted">Goal: {challenge.targetKg} kg</span>
            </div>
            <div className="w-full progress-theme-track h-4 rounded-full overflow-hidden p-0.5 border border-theme-card">
              <div
                className="bg-theme-primary h-full rounded-full transition-all duration-700"
                style={{ width: `${challenge.progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-theme-card-subtle border border-theme-card p-3.5 rounded-2xl">
              <p className="text-[10px] uppercase font-bold text-theme-muted">Students Logged</p>
              <p className="text-lg font-black text-theme-main">{challenge.studentsParticipating}</p>
            </div>
            <div className="bg-theme-card-subtle border border-theme-card p-3.5 rounded-2xl">
              <p className="text-[10px] uppercase font-bold text-theme-muted">CO2 Equivalent</p>
              <p className="text-lg font-black text-theme-primary">
                {Math.round(challenge.currentKg * 2.2).toLocaleString()} kg
              </p>
            </div>
            <div className="bg-theme-card-subtle border border-theme-card p-3.5 rounded-2xl col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-bold text-theme-muted">Days Remaining</p>
              <p className="text-lg font-black text-amber-500">{challenge.daysLeft} Days</p>
            </div>
          </div>

          <div className="space-y-2 border-t border-theme-card pt-4">
            <h4 className="text-xs uppercase tracking-wider font-bold text-theme-muted">
              Unlocked Campus Rewards
            </h4>
            <div className="space-y-2">
              {challenge.rewards.map((reward, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-theme-card-subtle border border-theme-card p-3 rounded-xl text-xs font-semibold text-theme-main"
                >
                  <Sparkles className="w-4 h-4 text-theme-primary" />
                  <span>{reward}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Sub-tab: Grade Classes Leaderboard (Completely Online from Firestore) */}
      {activeSubTab === 'class' && (
        <div className="space-y-6 animate-in fade-in">
          {/* User's Homeroom Class Spotlight Banner */}
          <div className="bg-gradient-to-r from-theme-card to-theme-card-subtle border-2 border-theme-primary rounded-3xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-theme-primary text-black flex items-center justify-center font-black text-lg shadow-md shadow-theme-glow shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-theme-main">
                      {userHomeroom} Homeroom
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-theme-primary text-black">
                      YOUR CLASS
                    </span>
                  </div>
                  <p className="text-xs text-theme-muted">
                    BBS PIK Inter-Class Sustainability Championship
                  </p>
                </div>
              </div>

              {/* Quick Class Stats Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="bg-theme-card border border-theme-card px-3 py-1.5 rounded-xl text-center">
                  <p className="text-[10px] uppercase font-bold text-theme-muted">Class Rank</p>
                  <p className="text-sm font-black text-theme-primary">#{userClassStat.rank}</p>
                </div>
                <div className="bg-theme-card border border-theme-card px-3 py-1.5 rounded-xl text-center">
                  <p className="text-[10px] uppercase font-bold text-theme-muted">Combined XP</p>
                  <p className="text-sm font-black text-theme-main">{userClassStat.xpFormatted}</p>
                </div>
                <div className="bg-theme-card border border-theme-card px-3 py-1.5 rounded-xl text-center">
                  <p className="text-[10px] uppercase font-bold text-theme-muted">Food Diverted</p>
                  <p className="text-sm font-black text-emerald-400">{userClassStat.foodSavedKg} kg</p>
                </div>
                <div className="bg-theme-card border border-theme-card px-3 py-1.5 rounded-xl text-center">
                  <p className="text-[10px] uppercase font-bold text-theme-muted">Students</p>
                  <p className="text-sm font-black text-theme-main">{userClassStat.studentsCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Selector: Inter-Class Championship vs Homeroom Roster */}
          <div className="flex items-center justify-between gap-3 bg-theme-card border border-theme-card p-1.5 rounded-2xl">
            <button
              onClick={() => setClassViewMode('championship')}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                classViewMode === 'championship'
                  ? 'bg-theme-primary text-black shadow-md'
                  : 'text-theme-muted hover:text-theme-main'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Inter-Class Championship</span>
            </button>

            <button
              onClick={() => setClassViewMode('roster')}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                classViewMode === 'roster'
                  ? 'bg-theme-primary text-black shadow-md'
                  : 'text-theme-muted hover:text-theme-main'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Classmates Roster</span>
            </button>
          </div>

          {/* View Mode A: Inter-Class Championship */}
          {classViewMode === 'championship' && (
            <div className="space-y-6">
              {/* Division Filters */}
              <div className="bg-theme-card border border-theme-card rounded-2xl p-3 shadow-md space-y-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-theme-muted uppercase tracking-wider">
                    <Filter className="w-3.5 h-3.5 text-theme-primary" />
                    <span>Filter Homeroom Division</span>
                  </div>
                  <span className="text-[11px] font-semibold text-theme-primary">
                    {filteredClassRankings.length} Classes Ranked Online
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
                  <button
                    onClick={() => setClassDivisionFilter('all')}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                      classDivisionFilter === 'all'
                        ? 'bg-theme-primary text-black shadow-sm'
                        : 'bg-theme-card-subtle text-theme-muted border border-theme-card hover:text-theme-main'
                    }`}
                  >
                    All Classes (3–12)
                  </button>
                  <button
                    onClick={() => setClassDivisionFilter('primary')}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                      classDivisionFilter === 'primary'
                        ? 'bg-theme-primary text-black shadow-sm'
                        : 'bg-theme-card-subtle text-theme-muted border border-theme-card hover:text-theme-main'
                    }`}
                  >
                    Primary Homerooms (3–6)
                  </button>
                  <button
                    onClick={() => setClassDivisionFilter('secondary')}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                      classDivisionFilter === 'secondary'
                        ? 'bg-theme-primary text-black shadow-sm'
                        : 'bg-theme-card-subtle text-theme-muted border border-theme-card hover:text-theme-main'
                    }`}
                  >
                    Secondary Homerooms (7–9)
                  </button>
                  <button
                    onClick={() => setClassDivisionFilter('jc')}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                      classDivisionFilter === 'jc'
                        ? 'bg-theme-primary text-black shadow-sm'
                        : 'bg-theme-card-subtle text-theme-muted border border-theme-card hover:text-theme-main'
                    }`}
                  >
                    JC / Senior Homerooms (10–12)
                  </button>
                </div>
              </div>

              {/* Class Podium */}
              <div className="pt-4 pb-2 flex items-end justify-center gap-3 sm:gap-6 max-w-lg mx-auto">
                {/* Class Rank 2 */}
                {classRank2 && (
                  <div
                    onClick={() => {
                      setSelectedClassRoom(classRank2.className);
                      setClassViewMode('roster');
                    }}
                    className="flex flex-col items-center space-y-2 flex-1 cursor-pointer group"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-theme-card border-4 border-slate-300 shadow-md flex flex-col items-center justify-center text-center p-1 group-hover:border-theme-primary transition-all">
                        <span className="text-xs font-black text-theme-main leading-none">
                          {classRank2.className.replace('Grade ', 'G')}
                        </span>
                        <span className="text-[9px] font-semibold text-theme-muted mt-1">
                          {classRank2.studentsCount} students
                        </span>
                      </div>
                      <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-slate-300 text-black font-extrabold text-xs flex items-center justify-center border-2 border-theme-card">
                        2
                      </div>
                    </div>
                    <div className="text-center space-y-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-theme-main leading-tight">
                        {classRank2.className} {classRank2.isUserClass ? '★' : ''}
                      </h4>
                      <p className="text-[11px] font-bold text-theme-muted">{classRank2.xpFormatted}</p>
                      <p className="text-[10px] text-emerald-400">{classRank2.foodSavedKg} kg diverted</p>
                    </div>
                  </div>
                )}

                {/* Class Rank 1 (Gold Winner) */}
                {classRank1 && (
                  <div
                    onClick={() => {
                      setSelectedClassRoom(classRank1.className);
                      setClassViewMode('roster');
                    }}
                    className="flex flex-col items-center space-y-2 flex-1 -translate-y-4 cursor-pointer group"
                  >
                    <div className="relative">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Trophy className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />
                      </div>
                      <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-theme-card border-4 border-theme-primary shadow-xl shadow-theme-glow flex flex-col items-center justify-center text-center p-2 group-hover:scale-105 transition-all">
                        <span className="text-sm font-black text-theme-main leading-none">
                          {classRank1.className.replace('Grade ', 'G')}
                        </span>
                        <span className="text-[10px] font-bold text-theme-primary mt-1">
                          {classRank1.studentsCount} students
                        </span>
                      </div>
                      <div className="absolute -bottom-2.5 -right-1 w-7 h-7 rounded-full bg-theme-primary text-black font-black text-xs flex items-center justify-center border-2 border-theme-card">
                        1
                      </div>
                    </div>
                    <div className="text-center space-y-0.5">
                      <h4 className="text-sm sm:text-base font-extrabold text-theme-main leading-tight">
                        {classRank1.className} {classRank1.isUserClass ? '★' : ''}
                      </h4>
                      <p className="text-xs font-black text-theme-primary">{classRank1.xpFormatted}</p>
                      <p className="text-[11px] font-semibold text-emerald-400">
                        {classRank1.foodSavedKg} kg diverted
                      </p>
                    </div>
                  </div>
                )}

                {/* Class Rank 3 */}
                {classRank3 && (
                  <div
                    onClick={() => {
                      setSelectedClassRoom(classRank3.className);
                      setClassViewMode('roster');
                    }}
                    className="flex flex-col items-center space-y-2 flex-1 cursor-pointer group"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-theme-card border-4 border-amber-700 shadow-md flex flex-col items-center justify-center text-center p-1 group-hover:border-theme-primary transition-all">
                        <span className="text-xs font-black text-theme-main leading-none">
                          {classRank3.className.replace('Grade ', 'G')}
                        </span>
                        <span className="text-[9px] font-semibold text-theme-muted mt-1">
                          {classRank3.studentsCount} students
                        </span>
                      </div>
                      <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center border-2 border-theme-card">
                        3
                      </div>
                    </div>
                    <div className="text-center space-y-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-theme-main leading-tight">
                        {classRank3.className} {classRank3.isUserClass ? '★' : ''}
                      </h4>
                      <p className="text-[11px] font-bold text-theme-muted">{classRank3.xpFormatted}</p>
                      <p className="text-[10px] text-emerald-400">{classRank3.foodSavedKg} kg diverted</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Full Ranked List of Homeroom Classes */}
              <div className="space-y-3 pt-2">
                {filteredClassRankings.map((c) => {
                  const isUserClass = c.isUserClass;
                  return (
                    <div
                      key={`class-${c.rank}-${c.className}`}
                      onClick={() => {
                        setSelectedClassRoom(c.className);
                        setClassViewMode('roster');
                      }}
                      className={`w-full rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer ${
                        isUserClass
                          ? 'bg-theme-card border-2 border-theme-primary shadow-xl scale-[1.01]'
                          : 'bg-theme-card border border-theme-card hover:border-theme-primary/60 shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span
                          className={`font-black text-base w-7 text-center ${
                            c.rank <= 3 ? 'text-theme-primary' : 'text-theme-muted'
                          }`}
                        >
                          #{c.rank}
                        </span>

                        <div className="w-10 h-10 rounded-xl bg-theme-card-subtle border border-theme-card flex items-center justify-center font-extrabold text-xs text-theme-main">
                          {c.section ? `${c.grade.replace('Grade ', '')}-${c.section}` : c.className}
                        </div>

                        <div>
                          <h4 className="text-sm font-bold leading-tight text-theme-main flex items-center gap-2">
                            <span>{c.className} Homeroom</span>
                            {isUserClass && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-theme-primary text-black">
                                YOUR CLASS
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-theme-muted mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>{c.studentsCount} Active Students</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">
                              {c.foodSavedKg} kg Diverted
                            </span>
                            {c.topContributorName && (
                              <>
                                <span>•</span>
                                <span className="text-theme-primary font-medium">
                                  Lead: {c.topContributorName}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p
                            className={`text-xs font-black px-3 py-1.5 rounded-full ${
                              isUserClass
                                ? 'bg-theme-primary text-black'
                                : 'bg-theme-card-subtle text-theme-main border border-theme-card'
                            }`}
                          >
                            {c.xpFormatted}
                          </p>
                          <p className="text-[10px] text-theme-muted mt-0.5">
                            ~{c.avgXpPerStudent.toLocaleString()} XP/student
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-theme-muted" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* View Mode B: Classmates Roster */}
          {classViewMode === 'roster' && (
            <div className="space-y-4">
              {/* Homeroom Selector Header */}
              <div className="bg-theme-card border border-theme-card rounded-2xl p-4 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-theme-primary" />
                    <h4 className="text-sm font-bold text-theme-main">
                      Select Homeroom Class to View Roster
                    </h4>
                  </div>
                  <button
                    onClick={() => setClassViewMode('championship')}
                    className="text-xs font-bold text-theme-primary hover:underline cursor-pointer"
                  >
                    ← Back to All Classes
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
                  {availableClassNames.map((cName) => {
                    const isSelected = selectedClassRoom === cName;
                    const isMyClass = cName === userHomeroom;
                    return (
                      <button
                        key={cName}
                        onClick={() => setSelectedClassRoom(cName)}
                        className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-theme-primary text-black shadow-md'
                            : 'bg-theme-card-subtle text-theme-muted border border-theme-card hover:text-theme-main'
                        }`}
                      >
                        <span>{cName}</span>
                        {isMyClass && (
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded font-extrabold ${
                              isSelected ? 'bg-black text-theme-primary' : 'bg-theme-primary text-black'
                            }`}
                          >
                            YOU
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Class Header Banner */}
              <div className="flex items-center justify-between px-2">
                <p className="text-xs font-bold text-theme-muted uppercase tracking-wider">
                  Live Students in {selectedClassRoom} ({activeClassRoster.length})
                </p>
                <span className="text-xs font-bold text-theme-primary">
                  {selectedClassRoom === userHomeroom ? 'Your Homeroom Classmates' : 'Class Roster'}
                </span>
              </div>

              {/* Student Roster List */}
              <div className="space-y-2.5">
                {activeClassRoster.length === 0 ? (
                  <div className="bg-theme-card border border-theme-card rounded-2xl p-8 text-center space-y-2">
                    <Users className="w-8 h-8 text-theme-muted mx-auto" />
                    <p className="text-sm font-bold text-theme-main">No students logged in this class yet</p>
                    <p className="text-xs text-theme-muted">
                      Invite your classmates in {selectedClassRoom} to scan meals and put your class on the leaderboard!
                    </p>
                  </div>
                ) : (
                  activeClassRoster.map((u) => {
                    const isMe = u.isCurrentUser || u.name === user.name;
                    return (
                      <div
                        key={`roster-${u.name}-${u.classRank}`}
                        className={`w-full rounded-2xl p-3.5 flex items-center justify-between transition-all ${
                          isMe
                            ? 'bg-theme-card border-2 border-theme-primary text-theme-main shadow-lg scale-[1.01]'
                            : 'bg-theme-card border border-theme-card text-theme-main hover:border-theme-primary/40'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span
                            className={`font-black text-sm w-6 text-center ${
                              isMe ? 'text-theme-primary' : 'text-theme-muted'
                            }`}
                          >
                            #{u.classRank}
                          </span>
                          <img
                            src={isMe ? (user.avatarUrl || u.avatar) : u.avatar}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover border border-theme-card"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="text-sm font-bold leading-tight text-theme-main flex items-center gap-1.5">
                              <span>{isMe ? `${user.name}` : u.name}</span>
                              {isMe && (
                                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-theme-primary text-black">
                                  YOU
                                </span>
                              )}
                            </h4>
                            <p className="text-xs font-semibold text-theme-primary">
                              {isMe
                                ? (user.title || getLevelTitle(user.level))
                                : (u.title || getLevelTitle(u.level || 1))}
                            </p>
                            <p className="text-[11px] text-theme-muted">
                              {selectedClassRoom} • Lvl {isMe ? user.level : u.level || 1}{' '}
                              {u.streakDays ? `• 🔥 ${u.streakDays}d streak` : ''}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`text-xs font-black px-3 py-1.5 rounded-full ${
                            isMe
                              ? 'bg-theme-primary text-black'
                              : 'bg-theme-card-subtle text-theme-main border border-theme-card'
                          }`}
                        >
                          {isMe ? `${user.totalXp.toLocaleString()} XP` : u.xpFormatted}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

