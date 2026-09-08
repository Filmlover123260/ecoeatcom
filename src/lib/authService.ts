import { doc, getDoc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '../types';
import { getLevelTitle, initialUserProfile } from '../data/mockData';

export interface StoredStudentAccount {
  id: string;
  email: string;
  name: string;
  greetingName: string;
  grade: string;
  section: string;
  homeroom: string;
  passwordHash: string;
  avatarUrl: string;
  level: number;
  totalXp: number;
  currentXp: number;
  foodSavedKg: number;
  streakDays: number;
  purchasedStickers?: string[];
  showcaseStickerId?: string;
  createdAt: string;
  lastActiveAt: string;
}

// Simple deterministic hash for demo/student client-side verification
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(36)}`;
}

export function generateStudentUid(email: string): string {
  const cleanEmail = email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  return `stu_${cleanEmail}`;
}

// Local cache helper to ensure offline robustness and anti-copy enforcement
function getLocalAccounts(): StoredStudentAccount[] {
  try {
    const raw = localStorage.getItem('ecoeat_student_accounts');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAccount(account: StoredStudentAccount) {
  try {
    const existing = getLocalAccounts().filter(
      (a) => a.email.toLowerCase() !== account.email.toLowerCase() && a.id !== account.id
    );
    existing.push(account);
    localStorage.setItem('ecoeat_student_accounts', JSON.stringify(existing));
  } catch (err) {
    console.warn('Could not save local student account cache:', err);
  }
}

/**
 * Checks whether an account with the specified email or full name already exists.
 * Prevents account copying, cloning, or duplicate identity registration.
 */
export async function checkIsAccountTaken(
  email: string,
  fullName: string
): Promise<{ taken: boolean; reason?: string }> {
  const normEmail = email.toLowerCase().trim();
  const normName = fullName.toLowerCase().trim();

  // 1. Check local account registry
  const localAccounts = getLocalAccounts();
  const emailMatchLocal = localAccounts.find((a) => a.email.toLowerCase() === normEmail);
  if (emailMatchLocal) {
    return { taken: true, reason: 'This student email is already registered.' };
  }

  const nameMatchLocal = localAccounts.find((a) => a.name.toLowerCase() === normName);
  if (nameMatchLocal) {
    return { taken: true, reason: 'A student account with this exact name already exists.' };
  }

  // 2. Check Firestore database
  try {
    const uid = generateStudentUid(normEmail);
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { taken: true, reason: 'This student email is already registered.' };
    }

    // Check name query across existing students
    const usersRef = collection(db, 'users');
    const nameQuery = query(usersRef, where('name', '==', fullName.trim()));
    const nameSnap = await getDocs(nameQuery);
    if (!nameSnap.empty) {
      return { taken: true, reason: 'A student account with this name already exists.' };
    }
  } catch (err) {
    console.warn('Cloud uniqueness check warning (falling back to local):', err);
  }

  return { taken: false };
}

/**
 * Registers a brand new, unique BBS PIK student account.
 * Rejects any attempted duplicate or copied accounts.
 */
export async function registerStudentAccount(params: {
  fullName: string;
  email: string;
  password: string;
  grade: string;
  section: string;
}): Promise<UserProfile> {
  const { fullName, email, password, grade, section } = params;
  const normEmail = email.toLowerCase().trim();
  const normName = fullName.trim();
  const greeting = normName.split(' ')[0] || normName;
  const uid = generateStudentUid(normEmail);
  const homeroom = `${grade}-${section}`;

  // Anti-Copying Verification
  const uniqueness = await checkIsAccountTaken(normEmail, normName);
  if (uniqueness.taken) {
    throw new Error(
      uniqueness.reason ||
        'Account copying is strictly prohibited. An account with this name or email already exists.'
    );
  }

  const newAccount: StoredStudentAccount = {
    id: uid,
    email: normEmail,
    name: normName,
    greetingName: greeting,
    grade,
    section,
    homeroom,
    passwordHash: hashString(password),
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    level: 1,
    totalXp: 50,
    currentXp: 50,
    foodSavedKg: 0,
    streakDays: 0,
    purchasedStickers: [],
    showcaseStickerId: '',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };

  // 1. Save locally
  saveLocalAccount(newAccount);
  localStorage.setItem('ecoeat_user_uid', uid);

  // 2. Save in Firestore users collection
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      uid,
      id: uid,
      email: normEmail,
      name: normName,
      greetingName: greeting,
      grade,
      section,
      homeroom,
      school: 'BBS PIK',
      avatarUrl: newAccount.avatarUrl,
      level: 1,
      totalXp: 50,
      currentXp: 50,
      foodSavedKg: 0,
      streakDays: 0,
      purchasedStickers: [],
      showcaseStickerId: '',
      title: 'Eco Novice',
      passwordHash: newAccount.passwordHash,
      createdAt: newAccount.createdAt,
      lastActiveAt: newAccount.lastActiveAt,
    });
  } catch (err) {
    console.error('Error saving new student to Firestore:', err);
  }

  const profile: UserProfile = {
    ...initialUserProfile,
    id: uid,
    email: normEmail,
    name: normName,
    greetingName: greeting,
    grade,
    section,
    homeroom,
    school: 'BBS PIK',
    level: 1,
    totalXp: 50,
    currentXp: 50,
    nextLevelXp: 100,
    foodSavedKg: 0,
    foodSavedWeekKg: 0,
    streakDays: 0,
    title: 'Eco Novice',
    avatarUrl: newAccount.avatarUrl,
    purchasedStickers: [],
    showcaseStickerId: '',
  };

  return profile;
}

/**
 * Authenticates a student using their registered credentials.
 * Ensures the student accesses only their authentic account.
 */
export async function authenticateStudentAccount(
  emailOrId: string,
  password: string
): Promise<UserProfile> {
  const normInput = emailOrId.toLowerCase().trim();
  const inputHash = hashString(password);

  // 1. Check local registry first
  const localAccounts = getLocalAccounts();
  const localMatch = localAccounts.find(
    (a) => a.email.toLowerCase() === normInput || a.id === normInput
  );

  if (localMatch) {
    if (localMatch.passwordHash && localMatch.passwordHash !== inputHash) {
      throw new Error('Incorrect password. Please verify your student password.');
    }

    localStorage.setItem('ecoeat_user_uid', localMatch.id);
    return {
      ...initialUserProfile,
      id: localMatch.id,
      email: localMatch.email,
      name: localMatch.name,
      greetingName: localMatch.greetingName,
      grade: localMatch.grade,
      section: localMatch.section,
      homeroom: localMatch.homeroom,
      school: 'BBS PIK',
      level: localMatch.level || 1,
      totalXp: localMatch.totalXp || 0,
      currentXp: localMatch.currentXp ?? localMatch.totalXp ?? 0,
      foodSavedKg: localMatch.foodSavedKg || 0,
      streakDays: localMatch.streakDays || 0,
      purchasedStickers: localMatch.purchasedStickers || [],
      showcaseStickerId: localMatch.showcaseStickerId || '',
      title: getLevelTitle(localMatch.level || 1),
      avatarUrl: localMatch.avatarUrl,
    };
  }

  // 2. Check Firestore
  try {
    const uid = generateStudentUid(normInput);
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.passwordHash && data.passwordHash !== inputHash) {
        throw new Error('Incorrect password. Please verify your student password.');
      }

      const profile: UserProfile = {
        ...initialUserProfile,
        id: uid,
        email: data.email || normInput,
        name: data.name || 'Student',
        greetingName: data.greetingName || data.name?.split(' ')[0] || 'Student',
        grade: data.grade || 'Grade 9',
        section: data.section || 'A',
        homeroom: data.homeroom || 'Grade 9-A',
        school: 'BBS PIK',
        level: Number(data.level) || 1,
        totalXp: Number(data.totalXp) || 0,
        currentXp: Number(data.currentXp ?? data.totalXp ?? 0),
        foodSavedKg: Number(data.foodSavedKg) || 0,
        streakDays: Number(data.streakDays) || 0,
        purchasedStickers: data.purchasedStickers || [],
        showcaseStickerId: data.showcaseStickerId || '',
        title: data.title || getLevelTitle(Number(data.level) || 1),
        avatarUrl: data.avatarUrl || initialUserProfile.avatarUrl,
      };

      // Cache locally
      saveLocalAccount({
        id: uid,
        email: profile.email || normInput,
        name: profile.name,
        greetingName: profile.greetingName,
        grade: profile.grade,
        section: profile.section || 'A',
        homeroom: profile.homeroom || `${profile.grade}-A`,
        passwordHash: data.passwordHash || inputHash,
        avatarUrl: profile.avatarUrl,
        level: profile.level,
        totalXp: profile.totalXp,
        currentXp: profile.currentXp,
        foodSavedKg: profile.foodSavedKg,
        streakDays: profile.streakDays,
        purchasedStickers: profile.purchasedStickers,
        showcaseStickerId: profile.showcaseStickerId,
        createdAt: data.createdAt || new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      });

      localStorage.setItem('ecoeat_user_uid', uid);
      return profile;
    }
  } catch (err: any) {
    if (err.message && err.message.includes('Incorrect password')) {
      throw err;
    }
    console.warn('Cloud sign in note:', err);
  }

  throw new Error(
    'No registered account found with this email. Please register in the Register tab to create your official BBS PIK account.'
  );
}
