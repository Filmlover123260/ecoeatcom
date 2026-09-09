import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment,
  updateDoc,
  deleteDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, MealRecord, LeaderboardUser, CampusChallengeInfo, ClassRankingItem, ChallengeParticipant } from '../types';
import { getLevelTitle } from '../data/mockData';
import { getAcademicYearPeriod } from '../data/academicYearChallenge';

export function getCampusStatsDocId(academicYear?: string): string {
  if (academicYear) {
    return `bbs-pik-ay-${academicYear.replace('/', '-')}`;
  }
  const period = getAcademicYearPeriod();
  return `bbs-pik-ay-${period.startYear}-${period.endYear}`;
}

// Generate or retrieve persistent unique User ID for this browser / student session
export function getOrCreateUserId(currentUser?: UserProfile): string {
  if (currentUser?.id && currentUser.id.trim()) {
    localStorage.setItem('ecoeat_user_uid', currentUser.id);
    return currentUser.id;
  }
  if (currentUser?.email && currentUser.email.trim()) {
    const uid = 'stu_' + currentUser.email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    localStorage.setItem('ecoeat_user_uid', uid);
    return uid;
  }
  const storedId = localStorage.getItem('ecoeat_user_uid');
  if (storedId && storedId !== 'stu_guest') {
    return storedId;
  }
  // Generate a distinct unique session ID for this browser client so every connected user has their own live identity
  const newUid = `stu_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
        purchasedStickers: user.purchasedStickers || [],
        showcaseStickerId: user.showcaseStickerId || '',
        isOnline: true,
        lastActiveAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error syncing user profile to Firestore:', err);
  }
}

/**
 * Keeps the active user marked online in Firestore with an ongoing heartbeat
 */
export function startOnlinePresenceHeartbeat(user: UserProfile): () => void {
  const userId = getOrCreateUserId(user);
  const userRef = doc(db, 'users', userId);

  // Set online on start
  setDoc(
    userRef,
    {
      uid: userId,
      name: user.name || 'Student',
      greetingName: user.greetingName || user.name?.split(' ')[0] || 'Student',
      grade: user.grade || 'Grade 9',
      section: user.section || 'A',
      homeroom: user.homeroom || `${user.grade || 'Grade 9'}-${user.section || 'A'}`,
      isOnline: true,
      lastActiveAt: new Date().toISOString(),
    },
    { merge: true }
  ).catch(() => {});

  // Send periodic heartbeat every 20 seconds
  const timer = setInterval(() => {
    updateDoc(userRef, {
      isOnline: true,
      lastActiveAt: new Date().toISOString(),
    }).catch(() => {});
  }, 20000);

  const handleUnload = () => {
    updateDoc(userRef, {
      isOnline: false,
      lastActiveAt: new Date().toISOString(),
    }).catch(() => {});
  };

  window.addEventListener('beforeunload', handleUnload);

  return () => {
    clearInterval(timer);
    window.removeEventListener('beforeunload', handleUnload);
    updateDoc(userRef, {
      isOnline: false,
    }).catch(() => {});
  };
}

/**
 * Record a new meal and update the global campus food waste counter in real-time
 */
export async function logMealToCloud(
  arg1: any,
  arg2: any,
  xpEarned: number,
  foodSavedKg: number
): Promise<void> {
  // Support both argument orders (meal, user) and (user, meal)
  const user: UserProfile = arg1 && 'currentXp' in arg1 ? arg1 : arg2;
  const meal: Partial<MealRecord> = arg1 && 'portion' in arg1 ? arg1 : arg2;

  if (!user || !meal) {
    console.error('Invalid parameters passed to logMealToCloud');
    return;
  }

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
      userName: user.name || 'Student',
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

    // 2. Increment global campus stats for current academic year
    const campusStatsRef = doc(db, 'campusStats', getCampusStatsDocId());
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

    // 4. Record as verified active participant in the campus sustainability challenge
    const aySlug = getAcademicYearPeriod().code.replace('/', '-');
    const participantId = `${aySlug}_${userId}`;
    const participantRef = doc(db, 'challengeParticipants', participantId);
    await setDoc(
      participantRef,
      {
        id: participantId,
        academicYear: aySlug,
        userId,
        userName: user.name || 'Student',
        userGrade: grade,
        userSection: section,
        userHomeroom: homeroom,
        avatarUrl: user.avatarUrl || '',
        joinedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch(() => {});
  } catch (err) {
    console.error('Error logging meal to Firestore:', err);
  }
}

export interface LiveCampusActivity {
  id: string;
  userName: string;
  userGrade: string;
  userSection?: string;
  title: string;
  xp: number;
  foodSavedKg: number;
  timeAgo: string;
  cleanPlate?: boolean;
}

/**
 * Real-time listener for campus dining meal and clean-plate activity across all active students
 */
export function subscribeToLiveCampusMeals(
  onMealsUpdate: (meals: LiveCampusActivity[]) => void
): Unsubscribe {
  const mealsRef = collection(db, 'meals');
  const q = query(mealsRef, orderBy('createdAt', 'desc'), limit(8));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: LiveCampusActivity[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        const diffSec = d.createdAt
          ? Math.max(0, Math.floor((Date.now() - new Date(d.createdAt).getTime()) / 1000))
          : 0;
        let timeAgo = 'Just now';
        if (diffSec >= 45 && diffSec < 3600) {
          timeAgo = `${Math.floor(diffSec / 60)}m ago`;
        } else if (diffSec >= 3600 && diffSec < 86400) {
          timeAgo = `${Math.floor(diffSec / 3600)}h ago`;
        }

        items.push({
          id: docSnap.id,
          userName: d.userName || 'BBS Student',
          userGrade: d.userGrade || 'Grade 9',
          userSection: d.userSection || 'A',
          title: d.title || 'Clean Plate Verification',
          xp: d.xp || 0,
          foodSavedKg: d.foodSavedKg || 0,
          timeAgo,
          cleanPlate: d.cleanPlate,
        });
      });
      onMealsUpdate(items);
    },
    (err) => {
      console.warn('Live campus meals subscription note:', err.message);
    }
  );
}

/**
 * Real-time listener for the campus leaderboard.
 * Fetches all real registered students, ranks them by `totalXp` descending.
 */
export function subscribeToLiveLeaderboard(
  currentUserId: string,
  onUpdate: (users: LeaderboardUser[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('totalXp', 'desc'), limit(150));

  return onSnapshot(
    q,
    (snapshot) => {
      const rawList: LeaderboardUser[] = [];
      const seenUids = new Set<string>();

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const rawName = (data.name || '').trim();
        const docId = docSnap.id;
        const uid = data.uid || docId;

        // Skip truly blank identities
        if (!rawName) {
          return;
        }

        // Deduplicate only by unique student UID so all real students connect
        if (seenUids.has(uid)) {
          return;
        }
        seenUids.add(uid);

        const xp = Number(data.totalXp) || 0;
        const level = Number(data.level) || Math.max(1, Math.floor(xp / 200) + 1);
        const grade = data.grade || 'Grade 9';
        const section = data.section || 'A';
        const homeroom = data.homeroom || `${grade}-${section}`;
        const isCurrent = docId === currentUserId || uid === currentUserId;

        // Check if student is active right now (online flag or activity within 2.5 minutes)
        const lastActiveTime = data.lastActiveAt ? new Date(data.lastActiveAt).getTime() : 0;
        const isOnline = Boolean(
          isCurrent || data.isOnline || (lastActiveTime > 0 && Date.now() - lastActiveTime < 150000)
        );

        rawList.push({
          rank: 0,
          uid,
          name: isCurrent ? `${rawName}` : rawName,
          shortName: data.greetingName || rawName.split(' ')[0],
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
          isOnline,
          lastActiveAt: data.lastActiveAt,
        });
      });

      // Sort with deterministic tie-breaking for a pristine restarted leaderboard
      rawList.sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp;
        if (b.foodSavedKg !== a.foodSavedKg) return b.foodSavedKg - a.foodSavedKg;
        return a.name.localeCompare(b.name);
      });

      // Assign ranks starting at 1
      rawList.forEach((u, idx) => {
        u.rank = idx + 1;
      });

      onUpdate(rawList);
    },
    (err) => {
      console.warn('Live leaderboard subscription note:', err.message);
      if (onError) onError(err);
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
 * Join the BBS Campus Challenge in real-time.
 * Saves record in `challengeParticipants` collection.
 */
export async function joinCampusChallenge(
  user: UserProfile,
  academicYear?: string
): Promise<{ success: boolean; isFirstTime: boolean }> {
  const aySlug = academicYear ? academicYear.replace('/', '-') : '2026-2027';
  const userId = getOrCreateUserId(user);
  const participantId = `${aySlug}_${userId}`;
  const participantRef = doc(db, 'challengeParticipants', participantId);

  try {
    const existingSnap = await getDoc(participantRef);
    const isFirstTime = !existingSnap.exists();

    const grade = user.grade || 'Grade 9';
    const section = user.section || 'A';
    const homeroom = user.homeroom || `${grade}-${section}`;

    await setDoc(
      participantRef,
      {
        id: participantId,
        academicYear: aySlug,
        userId,
        userName: user.name || 'Student',
        userGrade: grade,
        userSection: section,
        userHomeroom: homeroom,
        avatarUrl: user.avatarUrl || '',
        joinedAt: existingSnap.exists() ? existingSnap.data()?.joinedAt || new Date().toISOString() : new Date().toISOString(),
      },
      { merge: true }
    );

    // Increment active students on campusStats
    if (isFirstTime) {
      const statsRef = doc(db, 'campusStats', `bbs-pik-ay-${aySlug}`);
      await setDoc(
        statsRef,
        {
          activeStudentsCount: increment(1),
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    }

    return { success: true, isFirstTime };
  } catch (err) {
    console.error('Error joining campus challenge in Firestore:', err);
    return { success: false, isFirstTime: false };
  }
}

/**
 * Leave the BBS Campus Challenge in real-time.
 */
export async function leaveCampusChallenge(
  user: UserProfile,
  academicYear?: string
): Promise<boolean> {
  const aySlug = academicYear ? academicYear.replace('/', '-') : '2026-2027';
  const userId = getOrCreateUserId(user);
  const participantId = `${aySlug}_${userId}`;
  const participantRef = doc(db, 'challengeParticipants', participantId);

  try {
    const existingSnap = await getDoc(participantRef);
    if (existingSnap.exists()) {
      await deleteDoc(participantRef);
      const statsRef = doc(db, 'campusStats', `bbs-pik-ay-${aySlug}`);
      await setDoc(
        statsRef,
        {
          activeStudentsCount: increment(-1),
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    }
    return true;
  } catch (err) {
    console.error('Error leaving campus challenge:', err);
    return false;
  }
}

/**
 * Real-time listener for the Global Campus Challenge progress & participants.
 * Tracks the EXACT number of students that have joined in Firestore in real time.
 */
export function subscribeToCampusStats(
  baseChallenge: CampusChallengeInfo,
  onUpdate: (updatedChallenge: CampusChallengeInfo) => void,
  currentUser?: UserProfile
): Unsubscribe {
  const aySlug = baseChallenge.academicYear ? baseChallenge.academicYear.replace('/', '-') : '2026-2027';
  const statsRef = doc(db, 'campusStats', `bbs-pik-ay-${aySlug}`);
  const participantsRef = collection(db, 'challengeParticipants');
  const participantsQuery = query(participantsRef, where('academicYear', '==', aySlug));

  let latestStatsData: any = null;
  let latestParticipants: ChallengeParticipant[] = [];

  const emitUpdate = () => {
    // Only real food diverted recorded in Firestore from real student meal logs
    const loggedFoodKg = latestStatsData ? Number(latestStatsData.totalFoodDivertedKg) || 0 : 0;
    const currentKg = Math.round(loggedFoodKg * 10) / 10;
    const targetKg = baseChallenge.targetKg || 1500;
    const progressPercentage = Math.min(100, Math.round((currentKg / targetKg) * 100));

    const currentUid = currentUser ? getOrCreateUserId(currentUser) : localStorage.getItem('ecoeat_user_uid');
    const hasJoined = Boolean(currentUid && latestParticipants.some((p) => p.userId === currentUid));

    onUpdate({
      ...baseChallenge,
      currentKg,
      progressPercentage,
      // EXACT REAL COUNT of students that joined in Firestore in real time (never faked):
      studentsParticipating: latestParticipants.length,
      hasJoined,
      participantsList: latestParticipants,
    });
  };

  const unsubStats = onSnapshot(
    statsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        latestStatsData = snapshot.data();
      } else {
        latestStatsData = null;
      }
      emitUpdate();
    },
    (err) => {
      console.warn('Campus stats listener note:', err.message);
      emitUpdate();
    }
  );

  const unsubParticipants = onSnapshot(
    participantsQuery,
    (snapshot) => {
      latestParticipants = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ChallengeParticipant, 'id'>),
      }));
      emitUpdate();
    },
    (err) => {
      console.warn('Challenge participants listener note:', err.message);
      emitUpdate();
    }
  );

  return () => {
    unsubStats();
    unsubParticipants();
  };
}

/**
 * Clean community initializer: maintains empty starting state for fair student competition.
 */
export async function seedInitialCommunityIfEmpty(): Promise<void> {
  // Kept empty so all student accounts start authentically with 0 XP from their real meals.
}

/**
 * Restarts the campus leaderboard for a brand new competition period.
 * Resets all student scores to 0 XP, 0 food diverted, 0 streak, Level 1.
 * Also zeros out the campus dining challenge aggregate and clears participants.
 */
export async function restartLeaderboard(): Promise<{ success: boolean; resetCount: number }> {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    let resetCount = 0;

    for (const docSnap of snapshot.docs) {
      if (docSnap.id.startsWith('student-') || docSnap.data().isBot) {
        await deleteDoc(doc(db, 'users', docSnap.id)).catch(() => {});
        continue;
      }
      await updateDoc(doc(db, 'users', docSnap.id), {
        totalXp: 0,
        currentXp: 0,
        foodSavedKg: 0,
        streakDays: 0,
        level: 1,
        title: 'Eco Novice',
        lastActiveAt: new Date().toISOString(),
      });
      resetCount++;
    }

    // Reset campus challenge aggregate for current academic year
    const campusDoc = doc(db, 'campusStats', getCampusStatsDocId());
    await setDoc(
      campusDoc,
      {
        totalFoodDivertedKg: 0,
        totalMealsLogged: 0,
        totalCarbonSavedKg: 0,
        activeStudentsCount: 0,
        lastUpdatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Clear challenge participants for fresh start
    const participantsRef = collection(db, 'challengeParticipants');
    const participantsSnap = await getDocs(participantsRef);
    for (const pDoc of participantsSnap.docs) {
      await deleteDoc(doc(db, 'challengeParticipants', pDoc.id)).catch(() => {});
    }

    return { success: true, resetCount };
  } catch (err) {
    console.error('Error restarting leaderboard:', err);
    throw err;
  }
}
