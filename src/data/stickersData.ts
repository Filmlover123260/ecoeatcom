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

/**
 * Procedurally generates exactly 1,000 uniquely named, categorized, and themed
 * stickers for students to collect with their clean-plate dining XP.
 */
function generateOneThousandStickers(): StickerItem[] {
  const catalog: StickerItem[] = [...baseIconicStickers];
  const targetTotal = 1000;
  const needed = targetTotal - catalog.length;

  for (let i = 0; i < needed; i++) {
    const globalIndex = catalog.length + 1; // 16 to 1000
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

    // Cost variation within range
    const costRange = rConfig.maxCost - rConfig.minCost;
    const costStep = (i * 19) % (costRange + 1);
    const stepUnit = rarity === 'legendary' ? 10000 : rarity === 'epic' ? 2000 : rarity === 'rare' ? 500 : 50;
    const cost = Math.round((rConfig.minCost + costStep) / stepUnit) * stepUnit;

    // Deterministic selection from curated theme lists
    const prefix = catData.prefixes[i % catData.prefixes.length];
    const noun = catData.nouns[(i * 3 + Math.floor(i / 20)) % catData.nouns.length];
    const emoji = catData.emojis[(i + Math.floor(i / 10)) % catData.emojis.length];
    const unlockReason = catData.unlockReasons[i % catData.unlockReasons.length];
    const baseDesc = catData.descriptors[i % catData.descriptors.length];

    // Create unique, memorable names (e.g. "BBS PIK Spirit #16", "Compost Alchemist IV", etc.)
    const editionNumber = Math.floor(i / (catData.prefixes.length * catData.nouns.length)) + 1;
    const editionSuffix = editionNumber > 1 ? ` Vol. ${editionNumber}` : '';
    const name = `${prefix} ${noun}${editionSuffix}`;

    // Unique custom descriptions
    const description = `${baseDesc} Collector item #${globalIndex} in the official BBS PIK EcoEat Series.`;

    catalog.push({
      id: `sticker_${globalIndex}`,
      name,
      category: cat,
      rarity,
      cost,
      emoji,
      description,
      unlockedWith: unlockReason,
      visualBg: rConfig.visualBg,
      borderColor: rConfig.borderColor,
      accentColor: rConfig.accentColor,
    });
  }

  return catalog;
}

// Generate the 1,000 stickers catalog
export const allStickersCatalog: StickerItem[] = generateOneThousandStickers();

// Fast O(1) Lookup Map
const stickerMap = new Map<string, StickerItem>();
for (const sticker of allStickersCatalog) {
  stickerMap.set(sticker.id, sticker);
}

export function getStickerById(id: string): StickerItem | undefined {
  return stickerMap.get(id);
}
