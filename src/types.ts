export type PortionSize = 'Small' | 'Regular' | 'Large';

export type TabType = 'dashboard' | 'capture' | 'shop' | 'profile' | 'settings';

export type StickerRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type StickerCategory =
  | 'all'
  | 'clean_plate'
  | 'campus_pride'
  | 'zero_waste'
  | 'nature_planet'
  | 'culinary';

export interface StickerItem {
  id: string;
  name: string;
  category: StickerCategory;
  rarity: StickerRarity;
  cost: number; // XP price
  emoji: string;
  iconType?: string;
  description: string;
  unlockedWith: string;
  visualBg: string;
  borderColor: string;
  accentColor: string;
  purchasedDate?: string;
  isEquipped?: boolean;
  cleanReward?: number;
  wastePenalty?: number;
}

export interface UserProfile {
  id?: string;
  email?: string;
  name: string;
  greetingName: string;
  title: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalXp: number;
  profileGoalXp: number;
  streakDays: number;
  foodSavedKg: number;
  foodSavedWeekKg: number;
  grade: string;
  section?: string;
  homeroom?: string;
  school: string;
  avatarUrl: string;
  greetingColor: string;
  purchasedStickers?: string[];
  showcaseStickerId?: string;
}

export interface MealNutrition {
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber: number; // grams
}

export interface DetectedFoodZone {
  label: string;
  category: 'protein' | 'grain' | 'vegetable' | 'fruit' | 'dairy' | 'dressing' | 'other';
  confidence: number;
  estimatedGrams: number;
}

export interface FoodCategoryItem {
  id: string;
  name: string;
  icon: string;
  tag: string;
  description: string;
  popularFoods: string[];
}

export interface MealRecord {
  id: string;
  title: string;
  foodCategory?: string;
  foodItem?: string;
  time: string;
  date?: string;
  portion: PortionSize;
  xp: number;
  imageUrl: string;
  afterImageUrl?: string;
  wasteGrams?: number;
  cleanPlatePercentage?: number;
  cleanPlate?: boolean;
  isFood?: boolean;
  isPenalty?: boolean;
  penaltyReason?: string;
  foodItems?: string[];
  carbonSavedKg?: number;
  calories?: number;
  nutrition?: MealNutrition;
  ecoScore?: string;
  waterSavedLiters?: number;
  confidenceScore?: number;
  detectedZones?: DetectedFoodZone[];
  sustainabilityFeedback?: string;
  studentNotes?: string;
}

export interface ScanAnalysisResult {
  dishName: string;
  foodCategory?: string;
  foodItem?: string;
  isFood?: boolean;
  nonFoodReason?: string;
  confidenceScore: number;
  portionEstimatedGrams: number;
  estimatedCalories: number;
  nutrition: MealNutrition;
  foodItems: string[];
  detectedZones: DetectedFoodZone[];
  carbonSavingsKg: number;
  waterSavedLiters: number;
  ecoScore: string;
  dietaryTags: string[];
  sustainabilityFeedback: string;
  xpEarned: number;
  isPenalty?: boolean;
  cleanPlateConfidence?: number;
  wasteGrams?: number;
  cleanPlateVerified?: boolean;
  bonusXp?: number;
  foodSavedKg?: number;
}

export interface BadgeItem {
  id: string;
  name: string;
  icon: string;
  count?: number;
  unlocked: boolean;
  description: string;
  category: string;
  unlockedDate?: string;
  xpReward: number;
}

export interface LeaderboardUser {
  rank: number;
  uid?: string;
  name: string;
  shortName: string;
  xp: number;
  xpFormatted: string;
  avatar: string;
  grade: string;
  section?: string;
  homeroom?: string;
  foodSavedKg?: number;
  streakDays?: number;
  title?: string;
  level?: number;
  isCurrentUser?: boolean;
  isOnline?: boolean;
  lastActiveAt?: string;
}

export interface ClassRankingItem {
  rank: number;
  className: string;
  grade: string;
  section: string;
  totalXp: number;
  xpFormatted: string;
  foodSavedKg: number;
  studentsCount: number;
  avgXpPerStudent: number;
  isUserClass?: boolean;
  topContributorName?: string;
  topContributorAvatar?: string;
  topContributorTitle?: string;
}

export interface DailyTipItem {
  id: string;
  title: string;
  category: string;
  description: string;
  iconType: 'compost' | 'water' | 'bag' | 'plan' | 'utensils' | 'recycle' | 'plant' | 'sparkles' | 'flame' | 'heart' | 'clock';
  borderColor?: string;
  bgTint?: string;
  actionableSteps: string[];
  didYouKnow: string;
  campusApplication: string;
  impactStat: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayName: string;
  bonusXp?: number;
}

export interface ChallengeParticipant {
  id: string;
  academicYear: string;
  userId: string;
  userName: string;
  userGrade: string;
  userSection?: string;
  userHomeroom?: string;
  avatarUrl?: string;
  joinedAt: string;
}

export interface CampusChallengeInfo {
  id?: string;
  title: string;
  subtitle: string;
  academicYear: string; // e.g. "2026/2027"
  academicYearLabel: string; // e.g. "AY 2026/2027 (July 2026 – June 2027)"
  startMonth: string; // "July"
  endMonth: string; // "June"
  startDateStr: string; // "July 1, 2026"
  endDateStr: string; // "June 30, 2027"
  cycleTransitionNote?: string; // e.g. "Ended June 2026 • Started July 2026"
  progressPercentage: number;
  daysLeft: number;
  totalDaysInYear?: number;
  daysElapsed?: number;
  studentsParticipating: number;
  hasJoined?: boolean;
  participantsList?: ChallengeParticipant[];
  targetKg: number;
  currentKg: number;
  description: string;
  rewards: string[];
  themeColor?: string;
  motto?: string;
  isCurrentAcademicYear?: boolean;
}

export interface AppSettings {
  greetingName: string;
  fullName: string;
  schoolIdLinked: boolean;
  schoolName: string;
  mealReminders: boolean;
  challengeUpdates: boolean;
  language: string;
  greetingColor: string;
  theme: string;
  darkMode: boolean;
  dailyWasteGoal: number; // in grams
  campusVisibility: boolean;
}
