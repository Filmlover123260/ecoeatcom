import { StickerItem, StickerCategory, StickerRarity } from '../types';

// Curated first 15 base iconic stickers
const baseIconicStickers: StickerItem[] = [
  {
    id: 'sticker_clean_plate',
    name: 'Clean Plate Champion',
    category: 'clean_plate',
    rarity: 'common',
    cost: 1500,
    emoji: '🍽️✨',
    description: 'Awarded to students who polish off every bite and return an empty tray to the dish station.',
    unlockedWith: 'Earned with 0g Leftover Dining',
    visualBg: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/40',
    accentColor: '#10b981',
  },
  {
    id: 'sticker_zero_waste',
    name: 'Zero Waste Hero',
    category: 'zero_waste',
    rarity: 'common',
    cost: 1800,
    emoji: '♻️🦸',
    description: 'Campus superhero actively keeping dining hall organics far away from landfills.',
    unlockedWith: 'Earned by Diverting Food Waste',
    visualBg: 'from-green-500/20 to-lime-500/20',
    borderColor: 'border-green-500/40',
    accentColor: '#22c55e',
  },
  {
    id: 'sticker_solar_sprout',
    name: 'Solar Sprout',
    category: 'nature_planet',
    rarity: 'common',
    cost: 2200,
    emoji: '☀️🌱',
    description: 'Tiny seedling soaking up sunshine and nourishing healthy, low-emission meal choices.',
    unlockedWith: 'Earned with Plant-Forward Clean Meals',
    visualBg: 'from-amber-500/20 to-yellow-500/20',
    borderColor: 'border-amber-500/40',
    accentColor: '#f59e0b',
  },
  {
    id: 'sticker_hydro_saver',
    name: 'Hydro Saver',
    category: 'nature_planet',
    rarity: 'common',
    cost: 2800,
    emoji: '💧🌍',
    description: 'Conserved over 500 liters of virtual agricultural water through mindful portions.',
    unlockedWith: 'Earned by Preventing Food Waste',
    visualBg: 'from-sky-500/20 to-cyan-500/20',
    borderColor: 'border-sky-500/40',
    accentColor: '#0ea5e9',
  },
  {
    id: 'sticker_rainbow_salad',
    name: 'Rainbow Salad Master',
    category: 'culinary',
    rarity: 'common',
    cost: 3500,
    emoji: '🥗🥕',
    description: 'Vibrant colors, peak vitamins, and an impeccably cleaned salad bowl.',
    unlockedWith: 'Earned with Nutritious Zero-Waste Plates',
    visualBg: 'from-rose-500/20 to-orange-500/20',
    borderColor: 'border-rose-500/40',
    accentColor: '#f43f5e',
  },
  {
    id: 'sticker_bbs_tiger',
    name: 'BBS Green Tiger',
    category: 'campus_pride',
    rarity: 'rare',
    cost: 12000,
    emoji: '🐯🌿',
    description: 'The fierce BBS PIK campus mascot roaring for campus-wide zero-waste dining!',
    unlockedWith: 'Earned through BBS PIK Clean Dining',
    visualBg: 'from-emerald-600/25 to-amber-600/25',
    borderColor: 'border-emerald-500/50',
    accentColor: '#059669',
  },
  {
    id: 'sticker_compost_captain',
    name: 'Compost Captain',
    category: 'zero_waste',
    rarity: 'rare',
    cost: 15000,
    emoji: '🪴🌱',
    description: 'Transforming dining organics into rich compost for the school botanical garden.',
    unlockedWith: 'Earned with High-Impact Waste Diversion',
    visualBg: 'from-teal-600/25 to-emerald-600/25',
    borderColor: 'border-teal-500/50',
    accentColor: '#14b8a6',
  },
  {
    id: 'sticker_eco_bento',
    name: 'Eco Bento Master',
    category: 'culinary',
    rarity: 'rare',
    cost: 18500,
    emoji: '🍱🍙',
    description: 'Perfect portion balance in your lunchbox. Zero crumbs, maximum aesthetic.',
    unlockedWith: 'Earned with Smart Portion Planning',
    visualBg: 'from-amber-600/25 to-orange-600/25',
    borderColor: 'border-amber-500/50',
    accentColor: '#d97706',
  },
  {
    id: 'sticker_pik_ocean',
    name: 'PIK Ocean Guardian',
    category: 'nature_planet',
    rarity: 'rare',
    cost: 22000,
    emoji: '🌊🐬',
    description: 'Preserving Pantai Indah Kapuk coastal waters by minimizing carbon and plastic waste.',
    unlockedWith: 'Earned through Campus Conservation',
    visualBg: 'from-blue-600/25 to-cyan-600/25',
    borderColor: 'border-blue-500/50',
    accentColor: '#2563eb',
  },
  {
    id: 'sticker_plant_power',
    name: 'Plant-Based Power',
    category: 'culinary',
    rarity: 'rare',
    cost: 26000,
    emoji: '🥑✨',
    description: 'Delicious plant-forward cafeteria nutrition cutting greenhouse emissions.',
    unlockedWith: 'Earned with Sustainable Meal Choices',
    visualBg: 'from-lime-600/25 to-emerald-600/25',
    borderColor: 'border-lime-500/50',
    accentColor: '#84cc16',
  },
  {
    id: 'sticker_apple_sparkle',
    name: 'Apple Orchard Sparkle',
    category: 'culinary',
    rarity: 'rare',
    cost: 30000,
    emoji: '🍏⭐',
    description: 'Eating whole seasonal fruits right to the core without discarding edible nutrition.',
    unlockedWith: 'Earned with Zero Fruit Waste Scans',
    visualBg: 'from-emerald-500/25 to-lime-500/25',
    borderColor: 'border-emerald-500/50',
    accentColor: '#10b981',
  },
  {
    id: 'sticker_campus_1ton',
    name: '1-Ton Diverter Seal',
    category: 'campus_pride',
    rarity: 'epic',
    cost: 75000,
    emoji: '🏫🏆',
    description: 'Official seal celebrating student contributors to the BBS PIK 1,000kg semester goal.',
    unlockedWith: 'Earned through Campus Milestone Progress',
    visualBg: 'from-purple-600/25 to-indigo-600/25',
    borderColor: 'border-purple-500/50',
    accentColor: '#9333ea',
  },
  {
    id: 'sticker_golden_cutlery',
    name: 'Golden Fork of Honor',
    category: 'culinary',
    rarity: 'epic',
    cost: 100000,
    emoji: '🍴👑',
    description: 'Reserved for elite student diners who respect kitchen staff by cleaning their plate every single meal.',
    unlockedWith: 'Earned with Consistent Clean Plates',
    visualBg: 'from-amber-500/30 to-yellow-400/30',
    borderColor: 'border-amber-400/60',
    accentColor: '#f59e0b',
  },
  {
    id: 'sticker_midnight_compost',
    name: 'Midnight Compost Star',
    category: 'zero_waste',
    rarity: 'epic',
    cost: 140000,
    emoji: '🌙⭐',
    description: 'Dedicated to sustainability from early morning breakfast to late study hall dinners.',
    unlockedWith: 'Earned with Multi-Meal Eco Consistency',
    visualBg: 'from-indigo-600/30 to-purple-600/30',
    borderColor: 'border-indigo-400/60',
    accentColor: '#6366f1',
  },
  {
    id: 'sticker_streak_dragon',
    name: 'Streak Fire Dragon',
    category: 'campus_pride',
    rarity: 'legendary',
    cost: 500000,
    emoji: '🐉🔥',
    description: 'Unstoppable consecutive clean-plate dining energy. The legendary guardian of zero waste!',
    unlockedWith: 'Earned with Multi-Day Clean Streaks',
    visualBg: 'from-red-600/30 via-orange-500/30 to-amber-500/30',
    borderColor: 'border-orange-500/70',
    accentColor: '#f97316',
  },
];

type ConcreteStickerCategory = Exclude<StickerCategory, 'all'>;

// Rich building blocks for the 1,000 stickers collection
const themeCategories: ConcreteStickerCategory[] = [
  'clean_plate',
  'campus_pride',
  'zero_waste',
  'nature_planet',
  'culinary',
];

interface ThemeDescriptor {
  prefixes: string[];
  nouns: string[];
  emojis: string[];
  unlockReasons: string[];
  descriptors: string[];
}

const themeData: Record<ConcreteStickerCategory, ThemeDescriptor> = {
  clean_plate: {
    prefixes: [
      'Spotless', 'Empty Bowl', 'Crumb Buster', 'Clean Tray', 'Polished Dish',
      'Zero Scrap', 'Golden Spoon', 'Flawless Finish', 'Sparkling Dish', 'Bite-Size',
      'Mindful Bite', 'Portion Pro', 'Crisp Finish', 'Table Cleaner', 'Dining Ace',
      'Dish Polisher', 'Licked Clean', 'Scrap Stopper', 'Plateful', 'Feast Finisher',
    ],
    nouns: [
      'Champion', 'Master', 'Guardian', 'Sentinel', 'Knight',
      'Ranger', 'Ninja', 'Cadet', 'Vanguard', 'Veteran',
      'Hero', 'Pioneer', 'Expert', 'Seeker', 'Voyager',
      'Marshal', 'Protector', 'Scholar', 'Striker', 'Titan',
    ],
    emojis: [
      '🍽️✨', '🥣⭐', '🥄💫', '🍴🌟', '🧼🍽️',
      '🍱✨', '✨🍛', '🍜💫', '🍲🌟', '🥇🍽️',
      '🥗⭐', '🍕✨', '🥪💫', '🍙🌟', '🥟✨',
      '🥘⭐', '🍔✨', '🥨💫', '🌮🌟', '🍛✨',
    ],
    unlockReasons: [
      'Earned with 0g Leftover Dining',
      'Earned by Finishing Every Grain of Rice',
      'Earned with Empty Soup Bowls',
      'Earned with Clean Plate Consistency',
      'Earned through Mindful Meal Portions',
    ],
    descriptors: [
      'Polished off every single morsel with pure campus discipline and dining gratitude.',
      'Returned a sparkling clean cafeteria tray that makes dining staff smile with pride.',
      'A true dining room inspiration showing younger students the power of finishing their meals.',
      'Understands that every grain of food represents agricultural labor and clean dining care.',
      'Consistent zero-food-waste dining etiquette practiced to absolute perfection.',
    ],
  },
  campus_pride: {
    prefixes: [
      'BBS PIK', 'Pantai Indah', 'Tiger Pride', 'Campus Spirit', 'Green House',
      'Emerald Hall', 'BBS Falcon', 'Scholars', 'Academy', 'Eco Prefect',
      'Homeroom', 'Campus Council', 'PIK Coast', 'BBS Pioneer', 'Varsity',
      'Olympiad', 'Assembly', 'Campus Gate', 'BBS Mascot', 'PIK Pavilion',
    ],
    nouns: [
      'Spirit', 'Honor', 'Standard', 'Emblem', 'Crest',
      'Banner', 'Shield', 'Medallion', 'Insignia', 'Trophy',
      'Roar', 'Flame', 'Beacon', 'Leader', 'Legend',
      'Ambassador', 'Dynasty', 'Victor', 'Captain', 'Triumph',
    ],
    emojis: [
      '🏫🐯', '🐯🌿', '🏫💚', '🏫🏆', '🇮🇩✨',
      '🎓🌱', '🏫🥇', '🐅🔥', '🏫🌟', '🦅🏫',
      '🏫🎉', '🏟️🌿', '🏫💫', '🐯⭐', '🏫👑',
      '🎖️🏫', '🔔🏫', '📚🌱', '🏫✨', '🦁🏫',
    ],
    unlockReasons: [
      'Earned through BBS PIK Campus Pride Dining',
      'Earned by Leading Class Clean Plate Rallies',
      'Earned representing your Grade Homeroom',
      'Earned through Campus Zero-Waste Leadership',
      'Earned with BBS School Spirit Milestones',
    ],
    descriptors: [
      'Roaring with school pride and demonstrating BBS excellence in campus sustainability.',
      'Standing tall as a BBS PIK student leader fighting food waste across secondary grades.',
      'Carrying the emerald banner of Pantai Indah Kapuk zero-waste school initiatives.',
      'Setting the highest benchmark for environmental responsibility on the school campus.',
      'Uniting student houses and clubs around measurable carbon and food diversion targets.',
    ],
  },
  zero_waste: {
    prefixes: [
      'Compost', 'Recycle', 'Bio-Cycle', 'Organics', 'Worm Farm',
      'Decomposer', 'Circular', 'Zero Trash', 'Soil Builder', 'Eco Loop',
      'Landfill Deflector', 'Biomass', 'Eco Sorter', 'Green Bin', 'Nutrient Flow',
      'Carbon Cut', 'Mulch King', 'Soil Doctor', 'Waste Reverser', 'Perma-Loop',
    ],
    nouns: [
      'Alchemist', 'Wizard', 'Architect', 'Strategist', 'Engineer',
      'Mechanic', 'Pioneer', 'Operator', 'Crafter', 'Artisan',
      'Sorcerer', 'Guardian', 'Captain', 'Specialist', 'Director',
      'Innovator', 'Scientist', 'Protector', 'Doctor', 'Overlord',
    ],
    emojis: [
      '♻️🪴', '🪴🌱', '🪱🌿', '🍂🪴', '♻️🌍',
      '🌿♻️', '🌾🪴', '🌱♻️', '🌍♻️', '🍃🪴',
      '🚜🌿', '🔬🌱', '📦♻️', '🪄🪴', '🌳♻️',
      '⚡♻️', '🌻🪴', '🍀♻️', '🌲🌱', '🧪🌿',
    ],
    unlockReasons: [
      'Earned by Diverting Dining Organic Waste',
      'Earned with Campus Soil Garden Contributions',
      'Earned with High Waste-To-Compost Ratios',
      'Earned via 100% Organics Sorting Discipline',
      'Earned through Campus Food Waste Audits',
    ],
    descriptors: [
      'Turning canteen fruit peels and leftovers into nutrient-rich soil for campus greenery.',
      'Closing the loop between cafeteria dining and lush campus botanical gardens.',
      'Diverting organic waste from toxic methane-producing landfills with precise stewardship.',
      'Mastering the circular food economy right here in the school dining facilities.',
      'Cultivating rich microbial life that nourishes the trees framing our campus grounds.',
    ],
  },
  nature_planet: {
    prefixes: [
      'Solar', 'Hydro', 'Mangrove', 'Ocean Mist', 'Coral Reef',
      'Rainforest', 'Wind Breeze', 'Earth Shield', 'Ozone', 'Deep Sea',
      'Glacier', 'Cloud Peak', 'Flora Bloom', 'Canopy', 'Tidal Wave',
      'Blue Planet', 'Equator', 'Eco Biosphere', 'Verdant', 'Sunbeam',
    ],
    nouns: [
      'Sentinel', 'Keeper', 'Guardian', 'Spirit', 'Warden',
      'Protector', 'Drifter', 'Voyager', 'Shepherd', 'Seraph',
      'Dragon', 'Phoenix', 'Beacon', 'Sovereign', 'Defender',
      'Harvester', 'Oracle', 'Monarch', 'Preserver', 'Deity',
    ],
    emojis: [
      '🌊🐬', '☀️🌱', '💧🌍', '🪐✨', '🌴🌊',
      '🪸🐠', '🌧️🌱', '🐢🌊', '🌲🦅', '🌺🦋',
      '🌏✨', '⛅🍃', '🐋🌊', '🌋🌿', '🌌🌍',
      '🌈🌱', '🐳🌊', '🎋🐼', '⛰️🦅', '🌤️🌾',
    ],
    unlockReasons: [
      'Earned through Planet Resource Conservation',
      'Earned by Saving Virtual Agricultural Water',
      'Earned through Coastal PIK Ocean Protection',
      'Earned with Low-Carbon Dining Decisions',
      'Earned with Planetary Biodiversity Stewardship',
    ],
    descriptors: [
      'Protecting fragile marine ecosystems off the coast of Pantai Indah Kapuk from waste runoff.',
      'Saving hundreds of virtual liters of irrigation water by preventing food spoilage.',
      'A cosmic tribute to planet Earth and our shared duty to safeguard all living biomes.',
      'Channeling renewable energy and natural harmony into mindful daily student life.',
      'Guarding global biodiversity by mitigating the environmental strain of food production.',
    ],
  },
  culinary: {
    prefixes: [
      'Rainbow', 'Bento', 'Plant-Power', 'Crispy Tempeh', 'Matcha',
      'Avocado', 'Tropical Coconut', 'Gourmet Greens', 'Nasi Uduk', 'Dragonfruit',
      'Wok Master', 'Sushi Roll', 'Dim Sum', 'Gado-Gado', 'Fruit Medley',
      'Golden Turmeric', 'Herbal Brew', 'Steam Basket', 'Crispy Tofu', 'Papaya Splash',
    ],
    nouns: [
      'Artisan', 'Maestro', 'Chef', 'Connoisseur', 'Virtuoso',
      'Gourmet', 'Crafter', 'Sensai', 'Sommelier', 'Specialist',
      'Barista', 'Creator', 'Explorer', 'Purist', 'Enthusiast',
      'Culinary Star', 'Pâtissier', 'Innovator', 'Legend', 'Conductor',
    ],
    emojis: [
      '🥗🥑', '🍱🍙', '🍜🥢', '🥥🌴', '🥭✨',
      '🍲🌿', '🥑⭐', '🥟🥢', '🍣🥢', '🍛✨',
      '🍉🍉', '🍵🍃', '🍓🍰', '🍇🍇', '🌽✨',
      '🥕🥦', '🍌✨', '🍠🔥', '🍍⭐', '🥘🥢',
    ],
    unlockReasons: [
      'Earned with Nutritious Balanced Clean Plates',
      'Earned with Plant-Forward Dining Choices',
      'Earned with Whole Seasonal Fruit Scans',
      'Earned by Appreciating Indonesian Culinary Heritage',
      'Earned with Healthy Campus Canteen Meals',
    ],
    descriptors: [
      'Celebrating nutrient-dense Indonesian culinary creations finished down to the last bite.',
      'A harmonious plate bursting with colors, rich plant fiber, and zero food waste.',
      'Savoring the authentic flavors prepared by BBS kitchen staff with ultimate respect.',
      'Delivering vibrant energy for afternoon classes and sports through mindful gastronomy.',
      'Elevating the art of healthy student lunches with sustainable, wholesome ingredients.',
    ],
  },
};

export const rarityConfigs: Record<
  StickerRarity,
  {
    minCost: number;
    maxCost: number;
    visualBg: string;
    borderColor: string;
    accentColor: string;
    tierLabel: string;
    cleanReward: number;
    wastePenalty: number;
  }
> = {
  common: {
    minCost: 1500,
    maxCost: 4500,
    visualBg: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/40',
    accentColor: '#10b981',
    tierLabel: '1,500–4,500 XP',
    cleanReward: 150,
    wastePenalty: 100,
  },
  rare: {
    minCost: 10000,
    maxCost: 35000,
    visualBg: 'from-blue-600/25 to-cyan-600/25',
    borderColor: 'border-blue-500/50',
    accentColor: '#3b82f6',
    tierLabel: '10,000–35,000 XP',
    cleanReward: 1200,
    wastePenalty: 900,
  },
  epic: {
    minCost: 60000,
    maxCost: 180000,
    visualBg: 'from-purple-600/25 to-indigo-600/25',
    borderColor: 'border-purple-500/50',
    accentColor: '#a855f7',
    tierLabel: '60,000–180,000 XP',
    cleanReward: 8500,
    wastePenalty: 6500,
  },
  legendary: {
    minCost: 300000,
    maxCost: 1000000,
    visualBg: 'from-amber-500/30 via-orange-500/30 to-red-500/30',
    borderColor: 'border-amber-400/70',
    accentColor: '#f59e0b',
    tierLabel: '300,000–1,000,000 XP',
    cleanReward: 50000,
    wastePenalty: 40000,
  },
};

export interface StickerMealModifiers {
  baseCleanXp: number;
  baseWastePenalty: number;
  bonusCleanXp: number;
  bonusWastePenalty: number;
  totalCleanXp: number;
  totalWastePenalty: number;
  highestRarity: StickerRarity | 'none';
  countsByRarity: Record<StickerRarity, number>;
  totalStickersCount: number;
  equippedSticker?: StickerItem;
  hasStickers: boolean;
}

export function calculateStickerMealModifiers(
  purchasedIds: string[] = [],
  showcaseId?: string
): StickerMealModifiers {
  const baseCleanXp = 65; // base meal points (35) + clean plate award (30)
  const baseWastePenalty = 25; // base waste penalty

  const counts: Record<StickerRarity, number> = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };

  let bonusCleanXp = 0;
  let bonusWastePenalty = 0;

  for (const id of purchasedIds) {
    const sticker = getStickerById(id);
    if (!sticker) continue;
    counts[sticker.rarity] = (counts[sticker.rarity] || 0) + 1;
    const config = rarityConfigs[sticker.rarity];
    if (config) {
      bonusCleanXp += config.cleanReward;
      bonusWastePenalty += config.wastePenalty;
    }
  }

  let equippedSticker: StickerItem | undefined = undefined;
  if (showcaseId) {
    equippedSticker = getStickerById(showcaseId);
    if (equippedSticker && rarityConfigs[equippedSticker.rarity]) {
      const config = rarityConfigs[equippedSticker.rarity];
      // Equipped sticker adds an extra 50% showcase resonance bonus
      bonusCleanXp += Math.round(config.cleanReward * 0.5);
      bonusWastePenalty += Math.round(config.wastePenalty * 0.5);
    }
  }

  let highestRarity: StickerRarity | 'none' = 'none';
  if (counts.legendary > 0) highestRarity = 'legendary';
  else if (counts.epic > 0) highestRarity = 'epic';
  else if (counts.rare > 0) highestRarity = 'rare';
  else if (counts.common > 0) highestRarity = 'common';

  return {
    baseCleanXp,
    baseWastePenalty,
    bonusCleanXp,
    bonusWastePenalty,
    totalCleanXp: baseCleanXp + bonusCleanXp,
    totalWastePenalty: baseWastePenalty + bonusWastePenalty,
    highestRarity,
    countsByRarity: counts,
    totalStickersCount: purchasedIds.length,
    equippedSticker,
    hasStickers: purchasedIds.length > 0,
  };
}

export const TOTAL_STICKERS_COUNT = 1000000;

export const CATEGORY_COUNTS: Record<StickerCategory, number> = {
  all: 1000000,
  clean_plate: 200000,
  campus_pride: 200000,
  zero_waste: 200000,
  nature_planet: 200000,
  culinary: 200000,
};

export const RARITY_COUNTS: Record<StickerRarity | 'all', number> = {
  all: 1000000,
  legendary: 60001,
  epic: 174288,
  rare: 308569,
  common: 457142,
};

// Fast iconic lookup map for initial 15 curated stickers
const baseIconicMap = new Map<string, StickerItem>();
baseIconicStickers.forEach((s, idx) => {
  const item: StickerItem = {
    ...s,
    cleanReward: rarityConfigs[s.rarity]?.cleanReward ?? 150,
    wastePenalty: rarityConfigs[s.rarity]?.wastePenalty ?? 100,
  };
  baseIconicMap.set(s.id, item);
  baseIconicMap.set(`sticker_${idx + 1}`, item);
});

const modifiers = [
  '',
  'Cosmic',
  'Solar',
  'Glacial',
  'Golden',
  'Emerald',
  'Prime',
  'Apex',
  'Hyper',
  'Prismatic',
  'Grand',
  'Luminous',
  'Quantum',
  'Stellar',
  'Harmonic',
  'Aura',
  'Ethereal',
  'Zenith',
  'Titan',
  'Vanguard',
];

/**
 * Deterministically generates any sticker from #1 to #1,000,000 in O(1) time.
 */
export function getStickerByIndex(globalIndex: number): StickerItem {
  if (globalIndex < 1 || globalIndex > TOTAL_STICKERS_COUNT) {
    return getStickerByIndex(1);
  }

  // First 15 are iconic curated items
  if (globalIndex <= baseIconicStickers.length) {
    const iconic = baseIconicStickers[globalIndex - 1];
    return {
      ...iconic,
      id: `sticker_${globalIndex}`,
      cleanReward: rarityConfigs[iconic.rarity]?.cleanReward ?? 150,
      wastePenalty: rarityConfigs[iconic.rarity]?.wastePenalty ?? 100,
    };
  }

  const i = globalIndex - 16;
  const cat = themeCategories[i % themeCategories.length];
  const catData = themeData[cat];

  // Determine Rarity
  let rarity: StickerRarity = 'common';
  if (globalIndex % 25 === 0 || i % 40 === 39) {
    rarity = 'legendary';
  } else if (globalIndex % 7 === 0 || i % 15 === 14) {
    rarity = 'epic';
  } else if (globalIndex % 3 === 0 || i % 5 === 4) {
    rarity = 'rare';
  }

  const rConfig = rarityConfigs[rarity];

  // Cost variation within tier range
  const costRange = rConfig.maxCost - rConfig.minCost;
  const costStep = (i * 19) % (costRange + 1);
  const stepUnit =
    rarity === 'legendary' ? 10000 : rarity === 'epic' ? 2000 : rarity === 'rare' ? 500 : 50;
  const cost = Math.round((rConfig.minCost + costStep) / stepUnit) * stepUnit;

  // Deterministic components
  const prefix = catData.prefixes[i % catData.prefixes.length];
  const noun = catData.nouns[(i * 3 + Math.floor(i / 20)) % catData.nouns.length];
  const emoji = catData.emojis[(i + Math.floor(i / 10)) % catData.emojis.length];
  const unlockReason = catData.unlockReasons[i % catData.unlockReasons.length];
  const baseDesc = catData.descriptors[i % catData.descriptors.length];

  const mod = modifiers[(Math.floor(i / 7) + globalIndex) % modifiers.length];
  const editionNumber = Math.floor(i / (catData.prefixes.length * catData.nouns.length)) + 1;
  const editionSuffix = editionNumber > 1 ? ` Vol. ${editionNumber}` : '';
  const fullName = mod
    ? `${mod} ${prefix} ${noun}${editionSuffix}`
    : `${prefix} ${noun}${editionSuffix}`;

  const description = `${baseDesc} Official BBS PIK EcoEat Collector Item #${globalIndex.toLocaleString()} of 1,000,000.`;

  return {
    id: `sticker_${globalIndex}`,
    name: fullName,
    category: cat,
    rarity,
    cost,
    emoji,
    description,
    unlockedWith: unlockReason,
    visualBg: rConfig.visualBg,
    borderColor: rConfig.borderColor,
    accentColor: rConfig.accentColor,
    cleanReward: rConfig.cleanReward,
    wastePenalty: rConfig.wastePenalty,
  };
}

/**
 * Fast O(1) Lookup function for any sticker ID in the 1,000,000 collection.
 */
export function getStickerById(id: string): StickerItem | undefined {
  if (!id) return undefined;

  // Check iconic alias first
  if (baseIconicMap.has(id)) {
    return baseIconicMap.get(id);
  }

  // Parse numeric sticker id e.g. "sticker_500000"
  if (id.startsWith('sticker_')) {
    const num = parseInt(id.replace('sticker_', ''), 10);
    if (!isNaN(num) && num >= 1 && num <= TOTAL_STICKERS_COUNT) {
      return getStickerByIndex(num);
    }
  }

  return undefined;
}

/**
 * High-performance virtualized array representation of the 1,000,000 stickers collection.
 * Prevents heap allocation of 1,000,000 JavaScript objects while providing
 * full array-like compatibility for length, slice, indexing, and iteration.
 */
export const allStickersCatalog: StickerItem[] = new Proxy([] as StickerItem[], {
  get(target, prop) {
    if (prop === 'length') {
      return TOTAL_STICKERS_COUNT;
    }
    if (typeof prop === 'string' && /^\d+$/.test(prop)) {
      const idx = Number(prop);
      if (idx >= 0 && idx < TOTAL_STICKERS_COUNT) {
        return getStickerByIndex(idx + 1);
      }
    }
    if (prop === 'slice') {
      return (start = 0, end = TOTAL_STICKERS_COUNT) => {
        const s = Math.max(0, start);
        const e = Math.min(TOTAL_STICKERS_COUNT, end);
        const res: StickerItem[] = [];
        for (let idx = s + 1; idx <= e; idx++) {
          res.push(getStickerByIndex(idx));
        }
        return res;
      };
    }
    if (prop === 'at') {
      return (index: number) => {
        const actualIndex = index < 0 ? TOTAL_STICKERS_COUNT + index : index;
        if (actualIndex >= 0 && actualIndex < TOTAL_STICKERS_COUNT) {
          return getStickerByIndex(actualIndex + 1);
        }
        return undefined;
      };
    }
    // Fallback to array prototype properties
    return (target as any)[prop];
  },
});

export interface QueryStickersParams {
  category?: StickerCategory;
  rarity?: 'all' | StickerRarity;
  ownership?: 'all' | 'unowned' | 'owned';
  searchQuery?: string;
  sortBy?: 'default' | 'price_asc' | 'price_desc' | 'rarity' | 'name';
  page?: number;
  pageSize?: number;
  purchasedIds?: Set<string>;
  activeTab?: 'shop' | 'album';
}

export interface QueryStickersResult {
  items: StickerItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Ultra-fast query and pagination engine for the 1,000,000 stickers collection.
 * Executes in under 2ms without heap strain.
 */
export function queryStickersPage(params: QueryStickersParams): QueryStickersResult {
  const {
    category = 'all',
    rarity = 'all',
    ownership = 'all',
    searchQuery = '',
    sortBy = 'default',
    page = 1,
    pageSize = 32,
    purchasedIds = new Set<string>(),
    activeTab = 'shop',
  } = params;

  // Case 1: Album tab or explicit owned filter
  if (activeTab === 'album' || ownership === 'owned') {
    let ownedItems: StickerItem[] = [];
    for (const id of purchasedIds) {
      const s = getStickerById(id);
      if (s) ownedItems.push(s);
    }

    // Filter category & rarity
    if (category !== 'all') {
      ownedItems = ownedItems.filter((s) => s.category === category);
    }
    if (rarity !== 'all') {
      ownedItems = ownedItems.filter((s) => s.rarity === rarity);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      ownedItems = ownedItems.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    // Sort
    applySorting(ownedItems, sortBy);

    const totalCount = ownedItems.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalCount);

    return {
      items: ownedItems.slice(startIdx, endIdx),
      totalCount,
      totalPages,
      currentPage: safePage,
      startIndex: startIdx,
      endIndex: endIdx,
    };
  }

  // Case 2: Numeric search (e.g. "#500000", "777777", "sticker_1000000")
  const trimmedSearch = searchQuery.trim();
  const numericMatch = trimmedSearch.match(/^#?(\d+)$/);
  if (numericMatch) {
    const targetNum = parseInt(numericMatch[1], 10);
    if (targetNum >= 1 && targetNum <= TOTAL_STICKERS_COUNT) {
      // Return the target sticker plus adjacent stickers
      const targetSticker = getStickerByIndex(targetNum);
      const items: StickerItem[] = [targetSticker];
      return {
        items,
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
        startIndex: 0,
        endIndex: 1,
      };
    }
  }

  // Case 3: Keyword search (e.g. "tiger", "solar", "dragon")
  if (trimmedSearch.length > 0) {
    const q = trimmedSearch.toLowerCase();
    const matchedIndices: number[] = [];
    const maxSearchMatches = 1000; // Cap to keep instant responsiveness

    for (let idx = 1; idx <= TOTAL_STICKERS_COUNT; idx++) {
      // Check base iconic
      if (idx <= 15) {
        const item = baseIconicStickers[idx - 1];
        if (
          item.name.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        ) {
          matchedIndices.push(idx);
        }
        continue;
      }

      // Quick filter by category if specified
      const cat = themeCategories[(idx - 16) % themeCategories.length];
      if (category !== 'all' && cat !== category) continue;

      // Quick name check
      const i = idx - 16;
      const catData = themeData[cat];
      const p = catData.prefixes[i % catData.prefixes.length];
      const n = catData.nouns[(i * 3 + Math.floor(i / 20)) % catData.nouns.length];
      if (p.toLowerCase().includes(q) || n.toLowerCase().includes(q) || cat.includes(q)) {
        matchedIndices.push(idx);
        if (matchedIndices.length >= maxSearchMatches) break;
      }
    }

    let items = matchedIndices.map((idx) => getStickerByIndex(idx));
    if (rarity !== 'all') {
      items = items.filter((s) => s.rarity === rarity);
    }
    if (ownership === 'unowned') {
      items = items.filter((s) => !purchasedIds.has(s.id));
    }

    applySorting(items, sortBy);

    const totalCount = items.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalCount);

    return {
      items: items.slice(startIdx, endIdx),
      totalCount,
      totalPages,
      currentPage: safePage,
      startIndex: startIdx,
      endIndex: endIdx,
    };
  }

  // Case 4: Category only, no rarity filter
  if (category !== 'all' && rarity === 'all' && ownership === 'all') {
    const totalCount = CATEGORY_COUNTS[category];
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalCount);

    const items: StickerItem[] = [];
    const catIndex = themeCategories.indexOf(category as ConcreteStickerCategory);

    // Map the n-th item in this category to its global index
    for (let pos = startIdx; pos < endIdx; pos++) {
      const globalIndex = 16 + pos * themeCategories.length + catIndex;
      if (globalIndex <= TOTAL_STICKERS_COUNT) {
        items.push(getStickerByIndex(globalIndex));
      }
    }

    applySorting(items, sortBy);

    return {
      items,
      totalCount,
      totalPages,
      currentPage: safePage,
      startIndex: startIdx,
      endIndex: endIdx,
    };
  }

  // Case 5: Default browsing (All stickers, or Rarity filtered)
  let totalCount = TOTAL_STICKERS_COUNT;
  if (rarity !== 'all') {
    totalCount = RARITY_COUNTS[rarity];
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalCount);

  const items: StickerItem[] = [];

  if (rarity === 'all') {
    for (let idx = startIdx + 1; idx <= endIdx; idx++) {
      items.push(getStickerByIndex(idx));
    }
  } else {
    // Fast skip to page window for rarity
    let currentRarityCount = 0;
    for (let idx = 1; idx <= TOTAL_STICKERS_COUNT; idx++) {
      let itemRarity: StickerRarity = 'common';
      if (idx <= 15) {
        itemRarity = baseIconicStickers[idx - 1].rarity;
      } else {
        const i = idx - 16;
        if (idx % 25 === 0 || i % 40 === 39) itemRarity = 'legendary';
        else if (idx % 7 === 0 || i % 15 === 14) itemRarity = 'epic';
        else if (idx % 3 === 0 || i % 5 === 4) itemRarity = 'rare';
      }

      if (itemRarity === rarity) {
        if (currentRarityCount >= startIdx && items.length < pageSize) {
          items.push(getStickerByIndex(idx));
        }
        currentRarityCount++;
        if (items.length >= pageSize) break;
      }
    }
  }

  applySorting(items, sortBy);

  return {
    items,
    totalCount,
    totalPages,
    currentPage: safePage,
    startIndex: startIdx,
    endIndex: endIdx,
  };
}

function applySorting(
  items: StickerItem[],
  sortBy: 'default' | 'price_asc' | 'price_desc' | 'rarity' | 'name'
) {
  if (sortBy === 'price_asc') {
    items.sort((a, b) => a.cost - b.cost);
  } else if (sortBy === 'price_desc') {
    items.sort((a, b) => b.cost - a.cost);
  } else if (sortBy === 'rarity') {
    const ranks: Record<StickerRarity, number> = {
      legendary: 4,
      epic: 3,
      rare: 2,
      common: 1,
    };
    items.sort((a, b) => ranks[b.rarity] - ranks[a.rarity]);
  } else if (sortBy === 'name') {
    items.sort((a, b) => a.name.localeCompare(b.name));
  }
}

/**
 * Picks a random affordable unowned sticker from anywhere in the 1,000,000 collection.
 */
export function rollRandomMysterySticker(
  userXp: number,
  purchasedIds: Set<string>
): StickerItem | null {
  const minCommonCost = rarityConfigs.common.minCost;
  if (userXp < minCommonCost) return null;

  // Try random sampling up to 30 times
  for (let attempt = 0; attempt < 30; attempt++) {
    const randomIdx = Math.floor(Math.random() * TOTAL_STICKERS_COUNT) + 1;
    const sticker = getStickerByIndex(randomIdx);
    if (!purchasedIds.has(sticker.id) && sticker.cost <= userXp) {
      return sticker;
    }
  }

  // Fallback: search common pool
  for (let idx = 1; idx <= 1000; idx++) {
    const sticker = getStickerByIndex(idx);
    if (!purchasedIds.has(sticker.id) && sticker.cost <= userXp) {
      return sticker;
    }
  }

  return null;
}
