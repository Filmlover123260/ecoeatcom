import React, { useState } from 'react';
import { Trophy, Star, Users, Sparkles, Filter, GraduationCap, Leaf } from 'lucide-react';
import { UserProfile, CampusChallengeInfo } from '../types';
import { leaderboardUsers, classLeaderboardUsers, AVAILABLE_GRADES, GRADE_DIVISIONS, getLevelTitle } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface LeaderboardProps {
  user: UserProfile;
  challenge: CampusChallengeInfo;
}

type SubTab = 'bbs' | 'goal' | 'class';

export const Leaderboard: React.FC<LeaderboardProps> = ({ user, challenge }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('bbs');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  // Filter leaderboard users by selected grade or division
  const filteredUsers = leaderboardUsers.filter((u) => {
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

  const rank1 = filteredUsers[0];
  const rank2 = filteredUsers[1];
  const rank3 = filteredUsers[2];
  const otherUsers = filteredUsers.slice(3);

  const userHomeroom = `${user.grade || 'Grade 9'}-A`;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24 sm:pb-16 animate-in fade-in duration-300">
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
          {t('lb_tab_bbs', 'BBS PIK')}
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
          {t('lb_tab_class', 'My Class')}
        </button>
      </div>

      {activeSubTab === 'bbs' && (
        <div className="space-y-6">
          {/* Grade Division Filter Pills */}
          <div className="bg-theme-card border border-theme-card rounded-2xl p-3 shadow-md space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-theme-muted uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5 text-theme-primary" />
                <span>Filter Grades (3–12)</span>
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
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-theme-card-subtle border border-theme-card text-xs font-bold text-theme-main">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="tracking-wider uppercase">
                {t('campus_ranking_title', 'Campus Ranking: Fall Semester')}
              </span>
            </div>
          </div>

          {/* Top 3 Podium */}
          <div className="pt-4 pb-2 flex items-end justify-center gap-4 sm:gap-8 max-w-lg mx-auto">
            {/* Rank 2 */}
            {rank2 && (
              <div className="flex flex-col items-center space-y-2 flex-1">
                <div className="relative">
                  <img
                    src={rank2.avatar}
                    alt={rank2.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-slate-300 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-slate-300 text-black font-extrabold text-xs flex items-center justify-center border-2 border-theme-card">
                    2
                  </div>
                </div>
                <div className="text-center space-y-0.5">
                  <h4 className="text-sm font-bold text-theme-main leading-tight">{rank2.name}</h4>
                  <p className="text-[11px] font-semibold text-theme-primary">{rank2.title || getLevelTitle(rank2.level || 2)}</p>
                  <p className="text-[10px] text-theme-muted">{rank2.grade}</p>
                  <p className="text-xs font-semibold text-theme-muted">{rank2.xpFormatted}</p>
                </div>
              </div>
            )}

            {/* Rank 1 (Taller, Crown, Golden Ring) */}
            {rank1 && (
              <div className="flex flex-col items-center space-y-2 flex-1 -translate-y-4">
                <div className="relative">
                  {/* Trophy */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Trophy className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />
                  </div>
                  <img
                    src={rank1.avatar}
                    alt={rank1.name}
                    className="w-22 h-22 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-theme-primary shadow-xl shadow-theme-glow"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-2.5 -right-1 w-7 h-7 rounded-full bg-theme-primary text-black font-black text-xs flex items-center justify-center border-2 border-theme-card">
                    1
                  </div>
                </div>
                <div className="text-center space-y-0.5">
                  <h4 className="text-base font-extrabold text-theme-main leading-tight">{rank1.name}</h4>
                  <p className="text-xs font-bold text-theme-primary">{rank1.title || getLevelTitle(rank1.level || 10)}</p>
                  <p className="text-[11px] text-theme-muted">{rank1.grade}</p>
                  <p className="text-xs font-black text-theme-primary">{rank1.xpFormatted}</p>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {rank3 && (
              <div className="flex flex-col items-center space-y-2 flex-1">
                <div className="relative">
                  <img
                    src={rank3.avatar}
                    alt={rank3.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-amber-700 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center border-2 border-theme-card">
                    3
                  </div>
                </div>
                <div className="text-center space-y-0.5">
                  <h4 className="text-sm font-bold text-theme-main leading-tight">{rank3.name}</h4>
                  <p className="text-[11px] font-semibold text-theme-primary">{rank3.title || getLevelTitle(rank3.level || 3)}</p>
                  <p className="text-[10px] text-theme-muted">{rank3.grade}</p>
                  <p className="text-xs font-semibold text-theme-muted">{rank3.xpFormatted}</p>
                </div>
              </div>
            )}
          </div>

          {/* Ranked List below */}
          <div className="space-y-3 pt-2">
            {otherUsers.map((u, index) => {
              const isCurrentUser = u.isCurrentUser || u.rank === 42;
              const displayRank = index + 4;

              if (isCurrentUser) {
                return (
                  <div
                    key={u.rank}
                    id="current-user-rank-card"
                    className="w-full bg-theme-card border-2 border-theme-primary rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-xl transform transition-transform"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="font-extrabold text-base w-6 text-center text-theme-primary">
                        {u.rank}
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
                        <h4 className="text-base font-extrabold leading-tight text-theme-main">
                          {user.name} (You)
                        </h4>
                        <p className="text-xs font-bold text-theme-primary">
                          {user.title || getLevelTitle(user.level)}
                        </p>
                        <p className="text-[11px] text-theme-muted">
                          {user.grade} • Lvl {user.level}
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
                  key={u.rank}
                  className="w-full bg-theme-card border border-theme-card rounded-2xl p-3 sm:p-4 flex items-center justify-between hover:border-theme-primary transition-colors shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="font-bold text-sm text-theme-muted w-6 text-center">
                      {u.rank}
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
                      <p className="text-[11px] text-theme-muted">{u.grade}</p>
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

      {/* Sub-tab: Campus Goal */}
      {activeSubTab === 'goal' && (
        <div className="bg-theme-card border border-theme-card rounded-3xl p-6 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-theme-primary-bg border border-theme-primary-border flex items-center justify-center text-theme-primary">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-theme-main">Campus 1-Ton Food Divert</h3>
              <p className="text-xs text-theme-muted">BBS PIK Grades 3–12 Sustainability Challenge</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-theme-main">
              <span>{challenge.currentKg} kg Diverted</span>
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
              <p className="text-lg font-black text-theme-primary">1,420 kg</p>
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

      {/* Sub-tab: My Class */}
      {activeSubTab === 'class' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-theme-card border border-theme-card rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-theme-primary" />
              <div>
                <h4 className="text-sm font-bold text-theme-main">{userHomeroom} Homeroom</h4>
                <p className="text-xs text-theme-muted">Period 4 Eco Challenge</p>
              </div>
            </div>
            <div className="text-xs font-bold text-theme-primary bg-theme-primary-bg px-3 py-1 rounded-full border border-theme-primary-border">
              Rank #3 in {user.grade || 'Grade 9'}
            </div>
          </div>

          <div className="space-y-2.5">
            {classLeaderboardUsers.map((u) => (
              <div
                key={u.rank}
                className={`w-full rounded-2xl p-3.5 flex items-center justify-between transition-all ${
                  u.isCurrentUser
                    ? 'bg-theme-card border-2 border-theme-primary text-theme-main shadow-lg'
                    : 'bg-theme-card border border-theme-card text-theme-main'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`font-black text-sm w-5 text-center ${
                      u.isCurrentUser ? 'text-theme-primary' : 'text-theme-muted'
                    }`}
                  >
                    {u.rank}
                  </span>
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover border border-theme-card"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-sm font-bold leading-tight text-theme-main">
                      {u.isCurrentUser ? `${user.name} (You)` : u.name}
                    </h4>
                    <p className="text-xs font-semibold text-theme-primary">
                      {u.isCurrentUser ? (user.title || getLevelTitle(user.level)) : (u.title || getLevelTitle(u.level || 1))}
                    </p>
                    <p className="text-[11px] text-theme-muted">
                      {userHomeroom} {u.isCurrentUser ? `• Lvl ${user.level}` : ''}
                    </p>
                  </div>
                </div>

                <div
                  className={`text-xs font-black px-3 py-1.5 rounded-full ${
                    u.isCurrentUser
                      ? 'bg-theme-primary text-black'
                      : 'bg-theme-card-subtle text-theme-main border border-theme-card'
                  }`}
                >
                  {u.isCurrentUser ? `${user.totalXp.toLocaleString()} XP` : u.xpFormatted}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
