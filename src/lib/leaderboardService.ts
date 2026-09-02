import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  increment,
  updateDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, MealRecord, LeaderboardUser, CampusChallengeInfo, ClassRankingItem } from '../types';
import { getLevelTitle } from '../data/mockData';

// Generate or retrieve persistent unique User ID for this browser / student session
export function getOrCreateUserId(currentUser?: UserProfile): string {
  const storedId = localStorage.getItem('ecoeat_user_uid');
  if (storedId) {
    return storedId;
  }
  // Generate deterministic or random ID
  const cleanName = (currentUser?.name || 'student').toLowerCase().replace(/[^a-z0-9]/g, '');
  const newUid = `${cleanName}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  localStorage.setItem('ecoeat_user_uid', newUid);
  return newUid;
}

/**
 * Synchronize the current user's profile to Firestore `users` collection.
 * This ensures they show up live on every other student's device and leaderboard!
 */
export async function syncUserProfileToCloud(user: UserProfile, uid?: string): Promise<void> {
  const userId = uid || getOrCreateUserId(user);
  const userRef = doc(db, 'users', userId);
  const grade = user.grade || 'Grade 9';
  const section = user.section || 'A';
  const homeroom = user.homeroom || `${grade}-${section}`;

  try {
    await setDoc(
      userRef,
      {
        uid: userId,
        name: user.name || 'Anonymous Eco Student',
        greetingName: user.greetingName || user.name?.split(' ')[0] || 'Student',
        grade,
        section,
        homeroom,
        school: user.school || 'BBS PIK',
        avatarUrl:
          user.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        totalXp: Number(user.totalXp) || 0,
        level: Number(user.level) || 1,
        title: user.title || getLevelTitle(user.level || 1),
        streakDays: Number(user.streakDays) || 0,
        foodSavedKg: Number(user.foodSavedKg) || 0,
        lastActiveAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error syncing user profile to Firestore:', err);
  }
}

/**
 * Record a new meal and update the global campus food waste counter in real-time
 */
export async function logMealToCloud(
  meal: MealRecord,
  user: UserProfile,
  xpEarned: number,
  foodSavedKg: number
): Promise<void> {
  const userId = getOrCreateUserId(user);
  const mealId = meal.id || `meal-${Date.now()}`;
  const mealRef = doc(db, 'meals', mealId);
  const grade = user.grade || 'Grade 9';
  const section = user.section || 'A';
  const homeroom = user.homeroom || `${grade}-${section}`;

  try {
    // 1. Write the meal record
    await setDoc(mealRef, {
      id: mealId,
      userId,
      userName: user.name,
      userGrade: grade,
      userSection: section,
      userHomeroom: homeroom,
      title: meal.title || 'Verified Campus Meal',
      time: meal.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: meal.date || new Date().toISOString(),
      portion: meal.portion || 'Regular',
      xp: xpEarned || 0,
      foodSavedKg: foodSavedKg || 0,
      carbonSavedKg: meal.carbonSavedKg || 0,
      cleanPlate: Boolean(meal.cleanPlate),
      imageUrl: meal.imageUrl || '',
      afterImageUrl: meal.afterImageUrl || '',
      createdAt: new Date().toISOString(),
    });

    // 2. Increment global campus stats
    const campusStatsRef = doc(db, 'campusStats', 'bbs-pik-fall-challenge');
    await setDoc(
      campusStatsRef,
      {
        totalFoodDivertedKg: increment(foodSavedKg || 0),
        totalMealsLogged: increment(1),
        totalCarbonSavedKg: increment(meal.carbonSavedKg || 0),
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );

    // 3. Update user profile cumulative values in Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalXp: increment(xpEarned || 0),
      foodSavedKg: increment(foodSavedKg || 0),
      lastActiveAt: new Date().toISOString(),
    }).catch(async () => {
      // If doc didn't exist yet, do full sync
      await syncUserProfileToCloud(user, userId);
    });
  } catch (err) {
    console.error('Error logging meal to Firestore:', err);
  }
}

/**
 * Real-time listener for the campus leaderboard.
 * Fetches all real registered students, ranks them by `totalXp` descending.
 */
export function subscribeToLiveLeaderboard(
  currentUserId: string,
  onUpdate: (users: LeaderboardUser[]) => void
): Unsubscribe {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('totalXp', 'desc'), limit(150));

  return onSnapshot(
    q,
    (snapshot) => {
      const liveList: LeaderboardUser[] = [];
      let rank = 1;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const xp = Number(data.totalXp) || 0;
        const level = Number(data.level) || Math.max(1, Math.floor(xp / 200) + 1);
        const name = data.name || 'Student';
        const grade = data.grade || 'Grade 9';
        const section = data.section || 'A';
        const homeroom = data.homeroom || `${grade}-${section}`;
        const isCurrent = docSnap.id === currentUserId || data.uid === currentUserId;

        liveList.push({
          rank,
          name: isCurrent ? `${name}` : name,
          shortName: data.greetingName || name.split(' ')[0],
          xp,
          xpFormatted: xp >= 1000 ? `${(xp / 1000).toFixed(1)}k XP` : `${xp.toLocaleString()} XP`,
          avatar:
            data.avatarUrl ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          grade,
          section,
          homeroom,
          foodSavedKg: Number(data.foodSavedKg) || 0,
          streakDays: Number(data.streakDays) || 0,
          title: data.title || getLevelTitle(level),
          level,
          isCurrentUser: isCurrent,
        });
        rank++;
      });

      onUpdate(liveList);
    },
    (err) => {
      console.warn('Live leaderboard subscription note:', err.message);
    }
  );
}

/**
 * Computes live Grade Class Rankings dynamically across all real students in Firestore.
 * Groups by homeroom (e.g. "Grade 9-A", "Grade 9-B", "Grade 10-A", etc.)
 * and calculates total XP, food diverted, participant count, and top student contributor.
 */
export function computeLiveGradeClassesRankings(
  allUsers: LeaderboardUser[],
  userHomeroom: string
): ClassRankingItem[] {
  const classMap = new Map<
    string,
    {
      className: string;
      grade: string;
      section: string;
      totalXp: number;
      foodSavedKg: number;
      studentsCount: number;
      topUser: LeaderboardUser | null;
    }
  >();

  // Initialize known grade classes if empty
  const defaultHomerooms = [
    { grade: 'Grade 9', section: 'A' },
    { grade: 'Grade 9', section: 'B' },
    { grade: 'Grade 10', section: 'A' },
    { grade: 'Grade 10', section: 'B' },
    { grade: 'Grade 11', section: 'A' },
    { grade: 'Grade 11', section: 'B' },
    { grade: 'Grade 12', section: 'A' },
    { grade: 'Grade 8', section: 'A' },
    { grade: 'Grade 8', section: 'B' },
    { grade: 'Grade 7', section: 'A' },
    { grade: 'Grade 7', section: 'B' },
    { grade: 'Grade 6', section: 'A' },
    { grade: 'Grade 5', section: 'A' },
    { grade: 'Grade 4', section: 'A' },
    { grade: 'Grade 3', section: 'A' },
  ];

  defaultHomerooms.forEach(({ grade, section }) => {
    const className = `${grade}-${section}`;
    classMap.set(className, {
      className,
      grade,
      section,
      totalXp: 0,
      foodSavedKg: 0,
      studentsCount: 0,
      topUser: null,
    });
  });

  // Aggregate stats from all live users
  allUsers.forEach((u) => {
    const grade = u.grade || 'Grade 9';
    const section = u.section || 'A';
    const className = u.homeroom || `${grade}-${section}`;

    let classEntry = classMap.get(className);
    if (!classEntry) {
      classEntry = {
        className,
        grade,
        section,
        totalXp: 0,
        foodSavedKg: 0,
        studentsCount: 0,
        topUser: null,
      };
      classMap.set(className, classEntry);
    }

    classEntry.totalXp += u.xp;
    classEntry.foodSavedKg += u.foodSavedKg || (u.xp > 0 ? Math.round((u.xp / 400) * 10) / 10 : 0);
    classEntry.studentsCount += 1;

    if (!classEntry.topUser || u.xp > classEntry.topUser.xp) {
      classEntry.topUser = u;
    }
  });

  // Convert map to array and sort by total combined XP descending
  const classList = Array.from(classMap.values())
    .filter((c) => c.studentsCount > 0 || c.className === userHomeroom)
    .sort((a, b) => b.totalXp - a.totalXp);

  return classList.map((item, index) => {
    const isUserClass = item.className === userHomeroom || item.className.replace(/\s+/g, '') === userHomeroom.replace(/\s+/g, '');
    const avgXpPerStudent = item.studentsCount > 0 ? Math.round(item.totalXp / item.studentsCount) : 0;

    return {
      rank: index + 1,
      className: item.className,
      grade: item.grade,
      section: item.section,
      totalXp: item.totalXp,
      xpFormatted: item.totalXp >= 1000 ? `${(item.totalXp / 1000).toFixed(1)}k XP` : `${item.totalXp.toLocaleString()} XP`,
      foodSavedKg: Math.round(item.foodSavedKg * 10) / 10,
      studentsCount: item.studentsCount,
      avgXpPerStudent,
      isUserClass,
      topContributorName: item.topUser?.name || 'Class Participant',
      topContributorAvatar: item.topUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      topContributorTitle: item.topUser?.title || 'Eco Student',
    };
  });
}

/**
 * Real-time listener for the Global Campus Challenge progress
 */
export function subscribeToCampusStats(
  baseChallenge: CampusChallengeInfo,
  onUpdate: (updatedChallenge: CampusChallengeInfo) => void
): Unsubscribe {
  const statsRef = doc(db, 'campusStats', 'bbs-pik-fall-challenge');

  return onSnapshot(
    statsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const currentKg = Math.round(((data.totalFoodDivertedKg || 0) + 640) * 10) / 10;
        const targetKg = baseChallenge.targetKg || 1000;
        const progressPercentage = Math.min(100, Math.round((currentKg / targetKg) * 100));

        onUpdate({
          ...baseChallenge,
          currentKg,
          progressPercentage,
          studentsParticipating: Math.max(
            baseChallenge.studentsParticipating,
            (data.totalMealsLogged || 0) + 214
          ),
        });
      }
    },
    (err) => {
      console.warn('Campus stats listener note:', err.message);
    }
  );
}

/**
 * Seed initial prominent student profiles distributed across diverse grades and class sections
 * if the collection is empty, creating a vibrant online school competition from day one.
 */
export async function seedInitialCommunityIfEmpty(): Promise<void> {
  try {
    const usersRef = collection(db, 'users');
    const existing = await getDocs(query(usersRef, limit(3)));
    if (!existing.empty) {
      return; // Already populated
    }

    const starterStudents = [
      {
        uid: 'student-maya-tan',
        name: 'Maya Tan',
        greetingName: 'Maya',
        grade: 'Grade 12',
        section: 'A',
        homeroom: 'Grade 12-A',
        school: 'BBS PIK',
        totalXp: 5800,
        level: 12,
        title: 'Eco Legend',
        streakDays: 18,
        foodSavedKg: 14.2,
        avatarUrl:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        lastActiveAt: new Date().toISOString(),
      },
      {
        uid: 'student-chloe-wijaya',
        name: 'Chloe Wijaya',
        greetingName: 'Chloe',
        grade: 'Grade 5',
        section: 'A',
        homeroom: 'Grade 5-A',
        school: 'BBS PIK',
        totalXp: 5100,
        level: 10,
        title: 'Zero Waste Titan',
        streakDays: 14,
        foodSavedKg: 11.5,
        avatarUrl:
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
        lastActiveAt: new Date().toISOString(),
      },
      {
        uid: 'student-ethan-lim',
        name: 'Ethan Lim',
        greetingName: 'Ethan',
        grade: 'Grade 9',
        section: 'A',
        homeroom: 'Grade 9-A',
        school: 'BBS PIK',
        totalXp: 4200,
        level: 8,
        title: 'Sustainability Pioneer',
        streakDays: 10,
        foodSavedKg: 9.8,
        avatarUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        lastActiveAt: new Date().toISOString(),
      },
      {
        uid: 'student-taylor-rivera',
        name: 'Taylor Rivera',
        greetingName: 'Taylor',
        grade: 'Grade 9',
        section: 'A',
        homeroom: 'Grade 9-A',
        school: 'BBS PIK',
        totalXp: 3450,
        level: 5,
        title: 'Eco Ambassador',
        streakDays: 7,
        foodSavedKg: 6.2,
        avatarUrl:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        lastActiveAt: new Date().toISOString(),
      },
      {
        uid: 'student-morgan-park',
        name: 'Morgan Park',
        greetingName: 'Morgan',
        grade: 'Grade 9',
        section: 'A',
        homeroom: 'Grade 9-A',
        school: 'BBS PIK',
        totalXp: 2850,
        level: 4,
        title: 'Eco Warrior',
        streakDays: 6,
        foodSavedKg: 5.4,
        avatarUrl:
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
        lastActiveAt: new Date().toISOString(),
      },
      {
        uid: 'student-david-wang',
        name: 'David Wang',
        greetingName: 'David',
        grade: 'Grade 9',
        section: 'A',
        homeroom: 'Grade 9-A',
        school: 'BBS PIK',
        totalXp: 2100,
        level: 3,
        title: 'Eco Apprentice',
        streakDays: 5,
        foodSavedKg: 4.1,
        avatarUrl:
          'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
        lastActiveAt: new Date().toISOString(),
      },
      {
        uid: 'student-jessica-soedirdja',
        name: 'Jessica Soedirdja',
        greetingName: 'Jessica',
        grade: 'Grade 9',
        section: 'B',
        homeroom: 'Grade 9-B',
        school: 'BBS PIK',
        totalXp: 3800,
        level: 6,
        title: 'Waste Nemesis',
        streakDays: 8,
        foodSavedKg: 7.3,
        avatarUrl:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
        lastActiveAt: new Date().toISOString(),
      },
      {
        uid: 'student-kevin-wijaya',
        name: 'Kevin Wijaya',
        greetingName: 'Kevin',
        grade: 'Grade 9',
        section: 'B',
        homeroom: 'Grade 9-B',
        school: 'BBS PIK',
        totalXp: 3100,
        level: 5,
        title: 'Eco Ambassador',
        streakDays: 7,
        foodSavedKg: 6.0,
        avatarUrl:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
        lastActiveAt: new Date().toISOString(),
      },
      {
        uid: 'student-leo-zhang',
        name: 'Leo Zhang',
        greetingName: 'Leo',
        grade: 'Grade 3',
        section: 'A',
        homeroom: 'Grade 3-A',
        school: 'BBS PIK',
        totalXp: 3950,
        level: 7,
        title: 'Week Champion',
        streakDays: 9,
        foodSavedKg: 8.4,
        avatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        lastActiveAt: new Date().toISOString(),
      },
      {
        uid: 'student-marcus-vance',
        name: 'Marcus Vance',
        greetingName: 'Marcus',
        grade: 'Grade 7',
        section: 'A',
        homeroom: 'Grade 7-A',
        school: 'BBS PIK',
        totalXp: 3900,
        level: 6,
        title: 'Waste Nemesis',
        streakDays: 8,
        foodSavedKg: 7.9,
        avatarUrl:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        lastActiveAt: new Date().toISOString(),
      },
      {
        uid: 'student-casey-lim',
        name: 'Casey Lim',
        greetingName: 'Casey',
        grade: 'Grade 10',
        section: 'A',
        homeroom: 'Grade 10-A',
        school: 'BBS PIK',
        totalXp: 3600,
        level: 5,
        title: 'Eco Ambassador',
        streakDays: 7,
        foodSavedKg: 7.1,
        avatarUrl:
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
        lastActiveAt: new Date().toISOString(),
      },
      {
        uid: 'student-olivia-hartanto',
        name: 'Olivia Hartanto',
        greetingName: 'Olivia',
        grade: 'Grade 11',
        section: 'A',
        homeroom: 'Grade 11-A',
        school: 'BBS PIK',
        totalXp: 4100,
        level: 7,
        title: 'Green Defender',
        streakDays: 9,
        foodSavedKg: 8.7,
        avatarUrl:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        lastActiveAt: new Date().toISOString(),
      },
    ];

    for (const student of starterStudents) {
      await setDoc(doc(db, 'users', student.uid), student);
    }
  } catch (err) {
    console.warn('Initial seeding note:', err);
  }
}
