import { BadgeItem } from '../types';

export interface BadgeEvaluationContext {
  cleanMealsCount: number;
  totalMealsCount: number;
  foodSavedKg: number;
  streakDays: number;
  level: number;
  totalXp: number;
  totalCarbonSavedKg: number;
  totalWaterSavedLiters: number;
  allMeals: Array<{
    title?: string;
    foodItems?: string[];
    nutrition?: { calories?: number; proteinGrams?: number; carbsGrams?: number; fatGrams?: number };
    time?: string;
    date?: string;
    cleanPlate?: boolean;
    wasteGrams?: number;
    portion?: string;
  }>;
  isWeekend?: boolean;
  isMorning?: boolean;
}

export interface BadgeRule {
  type:
    | 'clean_meals'
    | 'food_saved_kg'
    | 'streak_days'
    | 'carbon_saved_kg'
    | 'water_saved_liters'
    | 'level'
    | 'total_xp'
    | 'keyword'
    | 'protein_meal'
    | 'morning_meal'
    | 'weekend_meal'
    | 'portion_pro'
    | 'custom';
  target: number;
  unit?: string;
  keywordRegex?: RegExp;
}

export interface ExtendedBadgeItem extends BadgeItem {
  tier?: 'bronze' | 'silver' | 'gold' | 'diamond' | 'mythic';
  rule?: BadgeRule;
}

// ----------------------------------------------------------------------
// GENERATE 300 RICH, THEMED CAMPUS SUSTAINABILITY BADGES
// ----------------------------------------------------------------------

const generateZeroWasteMasteryBadges = (): ExtendedBadgeItem[] => {
  const milestones = [
    { count: 1, name: 'First Clean Plate', xp: 100, tier: 'bronze' as const, icon: 'utensils', desc: 'Log your very first meal with a verified clean plate.' },
    { count: 2, name: 'Double Clean Finisher', xp: 110, tier: 'bronze' as const, icon: 'utensils', desc: 'Finish 2 campus meals without leftover waste.' },
    { count: 3, name: 'Clean Plate Trio', xp: 120, tier: 'bronze' as const, icon: 'sparkles', desc: 'Complete 3 clean plate dining sessions.' },
    { count: 4, name: 'Quad Clean Cadet', xp: 130, tier: 'bronze' as const, icon: 'sparkles', desc: 'Complete 4 clean plates on campus.' },
    { count: 5, name: 'Clean Plate Master', xp: 150, tier: 'bronze' as const, icon: 'sparkles', desc: 'Complete 5 campus meals with 100% clean plates.' },
    { count: 6, name: 'Six-Plate Sentinel', xp: 160, tier: 'bronze' as const, icon: 'shield-check', desc: 'Finish 6 verified zero-waste meals.' },
    { count: 7, name: 'Lucky Seven Finisher', xp: 175, tier: 'bronze' as const, icon: 'trophy', desc: 'Record 7 clean plates in the campus dining hall.' },
    { count: 8, name: 'Octo-Plate Achiever', xp: 190, tier: 'bronze' as const, icon: 'target', desc: 'Hit 8 zero-waste meal completions.' },
    { count: 9, name: 'Nine-Plate Knight', xp: 200, tier: 'silver' as const, icon: 'shield', desc: 'Finish 9 nutritious meals with zero leftover scraps.' },
    { count: 10, name: 'Ten Plate Champion', xp: 220, tier: 'silver' as const, icon: 'award', desc: 'Reach 10 clean plate meal milestones.' },
    { count: 12, name: 'Dozen Clean Record', xp: 250, tier: 'silver' as const, icon: 'award', desc: 'Finish a full dozen zero-waste meals.' },
    { count: 15, name: 'Zero Waste Legend', xp: 300, tier: 'silver' as const, icon: 'award', desc: 'Achieve 15 verified zero-waste dining sessions across campus.' },
    { count: 18, name: 'Eighteen Clean Feat', xp: 350, tier: 'silver' as const, icon: 'shield-check', desc: 'Log 18 clean plate campus meals.' },
    { count: 20, name: 'Plate Perfectionist', xp: 400, tier: 'silver' as const, icon: 'trophy', desc: 'Achieve 20 zero-waste dining records.' },
    { count: 25, name: 'Flawless Finisher', xp: 500, tier: 'gold' as const, icon: 'shield-check', desc: 'Finish 25 campus meals without leaving a single scrap.' },
    { count: 30, name: 'Thirty-Plate Prodigy', xp: 550, tier: 'gold' as const, icon: 'zap', desc: 'Log 30 spotless meals across all school terms.' },
    { count: 35, name: 'Tray Virtuoso', xp: 600, tier: 'gold' as const, icon: 'sparkles', desc: 'Finish 35 meals with zero food waste.' },
    { count: 40, name: 'Forty-Plate Master', xp: 650, tier: 'gold' as const, icon: 'target', desc: 'Reach 40 verified zero-waste dining sessions.' },
    { count: 45, name: 'Campus Plate Virtuoso', xp: 700, tier: 'gold' as const, icon: 'award', desc: 'Hit 45 clean plate milestones.' },
    { count: 50, name: 'Half-Century Zero Waste', xp: 800, tier: 'gold' as const, icon: 'crown', desc: 'Accomplish an outstanding milestone of 50 clean plates.' },
    { count: 60, name: 'Sixty Clean Feats', xp: 900, tier: 'gold' as const, icon: 'trophy', desc: 'Log 60 zero-waste campus meals.' },
    { count: 70, name: 'Seventy Spotless Trays', xp: 1000, tier: 'diamond' as const, icon: 'shield-check', desc: 'Finish 70 campus dining trays with zero leftovers.' },
    { count: 80, name: 'Eighty Plate Vanguard', xp: 1100, tier: 'diamond' as const, icon: 'target', desc: 'Complete 80 clean plate meals.' },
    { count: 90, name: 'Ninety Clean Legend', xp: 1200, tier: 'diamond' as const, icon: 'zap', desc: 'Finish 90 zero-waste meals with distinction.' },
    { count: 100, name: 'Centurion of Clean Plates', xp: 1500, tier: 'diamond' as const, icon: 'crown', desc: 'Achieve 100 zero-waste dining meals on campus.' },
    { count: 120, name: 'Clean Plate Centurion II', xp: 1700, tier: 'diamond' as const, icon: 'crown', desc: 'Complete 120 verified clean plate dining records.' },
    { count: 140, name: 'Grand Tray Artisan', xp: 1900, tier: 'diamond' as const, icon: 'award', desc: 'Finish 140 campus meals with zero waste.' },
    { count: 160, name: 'Campus Plate Luminary', xp: 2100, tier: 'diamond' as const, icon: 'sparkles', desc: 'Log 160 spotless dining sessions.' },
    { count: 180, name: 'Plate Precision Master', xp: 2300, tier: 'diamond' as const, icon: 'shield-check', desc: 'Hit 180 clean plates in your campus journey.' },
    { count: 200, name: 'Bicentennial Clean Eater', xp: 2500, tier: 'mythic' as const, icon: 'crown', desc: 'Log 200 verified zero-waste meals.' },
    { count: 225, name: 'Tray Master Exemplar', xp: 2750, tier: 'mythic' as const, icon: 'trophy', desc: 'Reach 225 clean meals with no food left behind.' },
    { count: 250, name: 'Quarter-Thousand Hero', xp: 3000, tier: 'mythic' as const, icon: 'crown', desc: 'Accomplish 250 zero-waste meals on campus.' },
    { count: 275, name: 'Plate Perfection Paragon', xp: 3300, tier: 'mythic' as const, icon: 'target', desc: 'Achieve 275 clean dining sessions.' },
    { count: 300, name: 'Triple Century Finisher', xp: 3600, tier: 'mythic' as const, icon: 'crown', desc: 'Finish 300 zero-waste campus meals.' },
    { count: 350, name: 'Campus Zero Waste Titan', xp: 4000, tier: 'mythic' as const, icon: 'award', desc: 'Log 350 clean plate records.' },
    { count: 400, name: 'Plate Master Ascendant', xp: 4500, tier: 'mythic' as const, icon: 'crown', desc: 'Reach 400 zero-waste dining sessions.' },
    { count: 450, name: 'Hall of Fame Finisher', xp: 5000, tier: 'mythic' as const, icon: 'trophy', desc: 'Finish 450 campus meals cleanly.' },
    { count: 500, name: 'Half-Thousand Legend', xp: 6000, tier: 'mythic' as const, icon: 'crown', desc: 'Achieve an astounding 500 zero-waste meals.' },
    { count: 750, name: 'Planetary Plate Master', xp: 8000, tier: 'mythic' as const, icon: 'globe', desc: 'Log 750 clean meals in campus sustainability history.' },
    { count: 1000, name: 'Millennium Zero Waste God', xp: 10000, tier: 'mythic' as const, icon: 'crown', desc: 'Achieve 1,000 spotless meals across your academic career.' },
  ];

  return milestones.map((m, idx) => ({
    id: `badge-zw-${idx + 1}`,
    name: m.name,
    icon: m.icon,
    unlocked: false,
    description: m.desc,
    category: 'Zero Waste',
    xpReward: m.xp,
    tier: m.tier,
    rule: { type: 'clean_meals', target: m.count, unit: 'meals' },
  }));
};

const generateFoodWasteDiversionBadges = (): ExtendedBadgeItem[] => {
  const milestones = [
    { kg: 0.2, name: 'First Scrap Saved', xp: 80, tier: 'bronze' as const, icon: 'recycle', desc: 'Divert your first 200g of food from the landfill bin.' },
    { kg: 0.5, name: 'Half-Kilo Saver', xp: 100, tier: 'bronze' as const, icon: 'recycle', desc: 'Divert 0.5 kg of organic campus food waste.' },
    { kg: 1.0, name: 'Waste Zero Hero', xp: 150, tier: 'bronze' as const, icon: 'recycle', desc: 'Divert 1.0 kg of food from campus landfill bins.' },
    { kg: 1.5, name: 'One & Half Kilo Shield', xp: 175, tier: 'bronze' as const, icon: 'shield-check', desc: 'Divert 1.5 kg of food scraps.' },
    { kg: 2.0, name: 'Double Kilo Defender', xp: 200, tier: 'bronze' as const, icon: 'tree-pine', desc: 'Prevent 2.0 kg of edible food waste.' },
    { kg: 2.5, name: 'Scrap Neutralizer', xp: 220, tier: 'silver' as const, icon: 'sparkles', desc: 'Divert 2.5 kg of dining hall food waste.' },
    { kg: 3.0, name: 'Triple Kilo Champion', xp: 250, tier: 'silver' as const, icon: 'award', desc: 'Reach 3.0 kg total food waste prevented.' },
    { kg: 4.0, name: 'Four Kilo Fortress', xp: 280, tier: 'silver' as const, icon: 'shield', desc: 'Divert 4.0 kg of food waste from landfill methane bins.' },
    { kg: 5.0, name: 'Eco Scholar', xp: 300, tier: 'silver' as const, icon: 'leaf', desc: 'Divert over 5.0 kg of edible food waste.' },
    { kg: 6.0, name: 'Six Kilo Steward', xp: 340, tier: 'silver' as const, icon: 'tree-pine', desc: 'Prevent 6.0 kg of campus food waste.' },
    { kg: 7.5, name: 'Seven-Point-Five Saver', xp: 380, tier: 'silver' as const, icon: 'target', desc: 'Divert 7.5 kg of food waste.' },
    { kg: 10.0, name: 'Landfill Liberator', xp: 500, tier: 'gold' as const, icon: 'tree-pine', desc: 'Divert over 10.0 kg of food waste from landfill methane generation.' },
    { kg: 12.5, name: 'Compost Catalyst', xp: 550, tier: 'gold' as const, icon: 'sprout', desc: 'Divert 12.5 kg of food waste.' },
    { kg: 15.0, name: 'Fifteen Kilo Guardian', xp: 600, tier: 'gold' as const, icon: 'shield-check', desc: 'Prevent 15.0 kg of food waste on campus.' },
    { kg: 17.5, name: 'Earth Preserver', xp: 650, tier: 'gold' as const, icon: 'globe', desc: 'Divert 17.5 kg of food scraps.' },
    { kg: 20.0, name: 'Twenty Kilo Vanguard', xp: 750, tier: 'gold' as const, icon: 'trophy', desc: 'Reach 20.0 kg of total diverted food waste.' },
    { kg: 25.0, name: 'Campus Eco Titan', xp: 1000, tier: 'diamond' as const, icon: 'globe', desc: 'Achieve an extraordinary milestone of 25.0 kg total food diverted.' },
    { kg: 30.0, name: 'Thirty Kilo Sentinel', xp: 1200, tier: 'diamond' as const, icon: 'shield-check', desc: 'Divert 30.0 kg of food waste.' },
    { kg: 35.0, name: 'Landfill Shield Knight', xp: 1350, tier: 'diamond' as const, icon: 'shield', desc: 'Prevent 35.0 kg of food from landfill rotting.' },
    { kg: 40.0, name: 'Forty Kilo Protector', xp: 1500, tier: 'diamond' as const, icon: 'tree-pine', desc: 'Divert 40.0 kg of food waste.' },
    { kg: 45.0, name: 'Campus Scrap Sovereign', xp: 1700, tier: 'diamond' as const, icon: 'crown', desc: 'Prevent 45.0 kg of dining scraps.' },
    { kg: 50.0, name: 'Half-Centner Savior', xp: 2000, tier: 'diamond' as const, icon: 'crown', desc: 'Divert 50.0 kg of total food waste.' },
    { kg: 60.0, name: 'Sixty Kilo Defender', xp: 2200, tier: 'mythic' as const, icon: 'shield-check', desc: 'Divert 60.0 kg of food waste.' },
    { kg: 70.0, name: 'Seventy Kilo Warden', xp: 2500, tier: 'mythic' as const, icon: 'tree-pine', desc: 'Prevent 70.0 kg of food waste from landfill.' },
    { kg: 80.0, name: 'Eighty Kilo Titan', xp: 2800, tier: 'mythic' as const, icon: 'trophy', desc: 'Divert 80.0 kg of food waste.' },
    { kg: 90.0, name: 'Ninety Kilo Preserver', xp: 3100, tier: 'mythic' as const, icon: 'globe', desc: 'Prevent 90.0 kg of campus food waste.' },
    { kg: 100.0, name: 'Century Diversion Master', xp: 3500, tier: 'mythic' as const, icon: 'crown', desc: 'Divert an incredible 100.0 kg of food from landfills.' },
    { kg: 125.0, name: 'Landfill Bane Supreme', xp: 4000, tier: 'mythic' as const, icon: 'shield-check', desc: 'Divert 125.0 kg of organic waste.' },
    { kg: 150.0, name: 'One-Fifty Kilo Sovereign', xp: 4500, tier: 'mythic' as const, icon: 'crown', desc: 'Divert 150.0 kg of food waste.' },
    { kg: 175.0, name: 'Grand Earth Guardian', xp: 5000, tier: 'mythic' as const, icon: 'globe', desc: 'Prevent 175.0 kg of campus food waste.' },
    { kg: 200.0, name: 'Double Centner Paragon', xp: 6000, tier: 'mythic' as const, icon: 'crown', desc: 'Divert 200.0 kg of food waste.' },
    { kg: 250.0, name: 'Quarter-Ton Diverter', xp: 7500, tier: 'mythic' as const, icon: 'trophy', desc: 'Divert a massive 250.0 kg of food waste.' },
    { kg: 300.0, name: 'Tricentennial Green Giant', xp: 9000, tier: 'mythic' as const, icon: 'crown', desc: 'Prevent 300.0 kg of food waste on campus.' },
    { kg: 400.0, name: 'Planetary Waste Reducer', xp: 11000, tier: 'mythic' as const, icon: 'globe', desc: 'Divert 400.0 kg of food waste.' },
    { kg: 500.0, name: 'Half-Ton Eco Legend', xp: 15000, tier: 'mythic' as const, icon: 'crown', desc: 'Divert an astronomical 500.0 kg (Half-Ton) of food waste.' },
  ];

  return milestones.map((m, idx) => ({
    id: `badge-fw-${idx + 1}`,
    name: m.name,
    icon: m.icon,
    unlocked: false,
    description: m.desc,
    category: 'Food Waste Diversion',
    xpReward: m.xp,
    tier: m.tier,
    rule: { type: 'food_saved_kg', target: m.kg, unit: 'kg' },
  }));
};

const generateStreakAndHabitBadges = (): ExtendedBadgeItem[] => {
  const milestones = [
    { days: 1, name: 'Streak Spark', xp: 50, tier: 'bronze' as const, icon: 'flame', desc: 'Start your zero-waste streak with your first logged day.' },
    { days: 2, name: 'Double Day Flame', xp: 80, tier: 'bronze' as const, icon: 'flame', desc: 'Maintain a 2-day clean plate streak.' },
    { days: 3, name: '3-Day Flame', xp: 120, tier: 'bronze' as const, icon: 'flame', desc: 'Maintain a 3-day consecutive zero-waste streak.' },
    { days: 4, name: 'Four-Day Glow', xp: 150, tier: 'bronze' as const, icon: 'flame', desc: 'Keep your eco dining streak alive for 4 days.' },
    { days: 5, name: 'School Week Champion', xp: 180, tier: 'bronze' as const, icon: 'flame', desc: 'Maintain a clean plate streak throughout a 5-day school week.' },
    { days: 6, name: 'Six-Day Blaze', xp: 210, tier: 'bronze' as const, icon: 'flame', desc: 'Hold a 6-day streak of sustainable dining.' },
    { days: 7, name: 'Week Champion', xp: 250, tier: 'silver' as const, icon: 'trophy', desc: 'Achieve a full 7-day zero-waste dining streak.' },
    { days: 8, name: 'Eight-Day Engine', xp: 270, tier: 'silver' as const, icon: 'zap', desc: 'Keep your streak burning for 8 consecutive days.' },
    { days: 9, name: 'Nine-Day Dynamo', xp: 290, tier: 'silver' as const, icon: 'flame', desc: '9 straight days of zero food waste.' },
    { days: 10, name: 'Decade of Days', xp: 320, tier: 'silver' as const, icon: 'award', desc: 'Sustain a 10-day clean plate streak.' },
    { days: 12, name: 'Dozen Days Dynamo', xp: 360, tier: 'silver' as const, icon: 'zap', desc: '12 straight days of mindful campus eating.' },
    { days: 14, name: 'Habit Master', xp: 400, tier: 'silver' as const, icon: 'flame', desc: 'Sustain a 14-day consecutive zero-waste dining streak.' },
    { days: 16, name: 'Sweet Sixteen Streak', xp: 440, tier: 'silver' as const, icon: 'sparkles', desc: 'Maintain a 16-day dining streak.' },
    { days: 18, name: 'Eighteen Day Blaze', xp: 480, tier: 'silver' as const, icon: 'flame', desc: '18 consecutive days of zero scraps.' },
    { days: 21, name: 'Three-Week Habit Lock', xp: 550, tier: 'gold' as const, icon: 'award', desc: 'Form a lifelong habit with a 21-day clean plate streak.' },
    { days: 25, name: 'Quarter-Century Streak', xp: 650, tier: 'gold' as const, icon: 'shield-check', desc: '25 continuous days of clean trays.' },
    { days: 28, name: 'Four-Week Legend', xp: 720, tier: 'gold' as const, icon: 'trophy', desc: 'Complete 4 solid weeks of zero-waste dining.' },
    { days: 30, name: 'Monthly Sentinel', xp: 800, tier: 'gold' as const, icon: 'crown', desc: 'Achieve a 30-day streak of conscious campus eating.' },
    { days: 35, name: 'Five-Week Flame', xp: 900, tier: 'gold' as const, icon: 'flame', desc: '35 straight days of sustainable meals.' },
    { days: 40, name: 'Fortress of Habits', xp: 1000, tier: 'gold' as const, icon: 'shield', desc: '40 consecutive days of clean dining.' },
    { days: 45, name: 'Six-Week Virtuoso', xp: 1150, tier: 'diamond' as const, icon: 'sparkles', desc: 'Maintain a 45-day clean streak.' },
    { days: 50, name: 'Golden Half-Century', xp: 1300, tier: 'diamond' as const, icon: 'crown', desc: '50 straight days of clean plate dining.' },
    { days: 60, name: 'Two-Month Titan', xp: 1500, tier: 'diamond' as const, icon: 'trophy', desc: 'Sustain a 60-day streak with flawless consistency.' },
    { days: 70, name: 'Ten-Week Master', xp: 1750, tier: 'diamond' as const, icon: 'award', desc: '70 straight days of conscious dining.' },
    { days: 75, name: 'Seventy-Five Blaze', xp: 1900, tier: 'diamond' as const, icon: 'flame', desc: '75 days of unbroken zero waste dining.' },
    { days: 80, name: 'Eighty Day Ascendant', xp: 2100, tier: 'diamond' as const, icon: 'zap', desc: '80 consecutive days without wasting food.' },
    { days: 90, name: 'Quarter-Year Sentinel', xp: 2400, tier: 'diamond' as const, icon: 'crown', desc: 'Maintain an unbroken streak for 90 days (1 full quarter).' },
    { days: 100, name: 'Century Flame Master', xp: 2800, tier: 'mythic' as const, icon: 'crown', desc: '100 days of legendary clean plate consistency.' },
    { days: 120, name: 'Four-Month Flame', xp: 3200, tier: 'mythic' as const, icon: 'flame', desc: '120 consecutive days of zero food waste.' },
    { days: 140, name: 'Twenty-Week Champion', xp: 3600, tier: 'mythic' as const, icon: 'trophy', desc: '140 unbroken streak days.' },
    { days: 150, name: 'Five-Month Luminary', xp: 4000, tier: 'mythic' as const, icon: 'sparkles', desc: '150 days of sustainable dining dedication.' },
    { days: 180, name: 'Half-Year Paragon', xp: 5000, tier: 'mythic' as const, icon: 'crown', desc: '180 consecutive days (Half a year) of zero waste.' },
    { days: 200, name: 'Double Century Streak', xp: 5500, tier: 'mythic' as const, icon: 'crown', desc: '200 days unbroken clean streak.' },
    { days: 225, name: 'Iron Will Sentinel', xp: 6200, tier: 'mythic' as const, icon: 'shield-check', desc: '225 consecutive clean plate days.' },
    { days: 250, name: 'Quarter-Thousand Flame', xp: 7000, tier: 'mythic' as const, icon: 'flame', desc: '250 straight days of zero waste dining.' },
    { days: 275, name: 'Three-Quarter Year Hero', xp: 7800, tier: 'mythic' as const, icon: 'award', desc: '275 consecutive days of mindful eating.' },
    { days: 300, name: 'Three-Hundred Day Titan', xp: 8500, tier: 'mythic' as const, icon: 'crown', desc: '300 unbroken streak days on campus.' },
    { days: 330, name: 'Eleven-Month Master', xp: 9200, tier: 'mythic' as const, icon: 'trophy', desc: '330 consecutive days of sustainability.' },
    { days: 365, name: 'Full Orbit Year Hero', xp: 12000, tier: 'mythic' as const, icon: 'crown', desc: 'A full 365-day (1 Year) streak of zero waste dining excellence.' },
    { days: 500, name: 'Immortal Streak Deity', xp: 20000, tier: 'mythic' as const, icon: 'crown', desc: '500 unbroken streak days in school history.' },
  ];

  return milestones.map((m, idx) => ({
    id: `badge-st-${idx + 1}`,
    name: m.name,
    icon: m.icon,
    unlocked: false,
    description: m.desc,
    category: 'Streak & Habits',
    xpReward: m.xp,
    tier: m.tier,
    rule: { type: 'streak_days', target: m.days, unit: 'days' },
  }));
};

const generateCarbonAndClimateBadges = (): ExtendedBadgeItem[] => {
  const milestones = [
    { kg: 0.5, name: 'Carbon Clipper', xp: 75, tier: 'bronze' as const, icon: 'globe', desc: 'Prevent 0.5 kg of greenhouse CO2e emissions.' },
    { kg: 1.0, name: 'One Kilo Carbon Guard', xp: 100, tier: 'bronze' as const, icon: 'globe', desc: 'Prevent 1.0 kg of CO2 emissions through zero waste.' },
    { kg: 1.5, name: 'Climate Caretaker', xp: 130, tier: 'bronze' as const, icon: 'shield', desc: 'Mitigate 1.5 kg of carbon emissions.' },
    { kg: 2.0, name: 'Atmosphere Protector', xp: 160, tier: 'bronze' as const, icon: 'globe', desc: 'Prevent 2.0 kg of carbon pollution.' },
    { kg: 2.5, name: 'Carbon Cutter', xp: 180, tier: 'silver' as const, icon: 'globe', desc: 'Prevent over 2.5 kg of greenhouse CO2e emissions.' },
    { kg: 3.0, name: 'Three Kilo Climate Hero', xp: 210, tier: 'silver' as const, icon: 'leaf', desc: 'Prevent 3.0 kg of carbon emissions.' },
    { kg: 4.0, name: 'Methane Mitigator', xp: 250, tier: 'silver' as const, icon: 'recycle', desc: 'Mitigate 4.0 kg of carbon footprint.' },
    { kg: 5.0, name: 'Five Kilo Sky Sentinel', xp: 300, tier: 'silver' as const, icon: 'shield-check', desc: 'Prevent 5.0 kg of CO2 equivalent emissions.' },
    { kg: 7.5, name: 'Seven-Point-Five Climate Shield', xp: 380, tier: 'silver' as const, icon: 'shield', desc: 'Prevent 7.5 kg of greenhouse emissions.' },
    { kg: 10.0, name: 'Climate Guardian', xp: 450, tier: 'gold' as const, icon: 'shield', desc: 'Prevent over 10.0 kg of carbon emissions through sustainable dining choices.' },
    { kg: 12.5, name: 'Sky Defender', xp: 520, tier: 'gold' as const, icon: 'globe', desc: 'Prevent 12.5 kg of CO2e emissions.' },
    { kg: 15.0, name: 'Fifteen Kilo Atmosphere Guard', xp: 600, tier: 'gold' as const, icon: 'trophy', desc: 'Prevent 15.0 kg of carbon emissions.' },
    { kg: 20.0, name: 'Twenty Kilo Sky Shield', xp: 750, tier: 'gold' as const, icon: 'shield-check', desc: 'Prevent 20.0 kg of greenhouse gases.' },
    { kg: 25.0, name: 'Carbon Neutrality Pioneer', xp: 900, tier: 'gold' as const, icon: 'crown', desc: 'Prevent 25.0 kg of carbon emissions.' },
    { kg: 30.0, name: 'Thirty Kilo Sky Warden', xp: 1100, tier: 'diamond' as const, icon: 'tree-pine', desc: 'Prevent 30.0 kg of greenhouse emissions.' },
    { kg: 35.0, name: 'Climate Action Champion', xp: 1250, tier: 'diamond' as const, icon: 'award', desc: 'Mitigate 35.0 kg of carbon emissions.' },
    { kg: 40.0, name: 'Atmosphere Sovereign', xp: 1450, tier: 'diamond' as const, icon: 'globe', desc: 'Prevent 40.0 kg of CO2e gases.' },
    { kg: 50.0, name: 'Fifty Kilo Climate Titan', xp: 1800, tier: 'diamond' as const, icon: 'crown', desc: 'Prevent 50.0 kg of carbon emissions.' },
    { kg: 60.0, name: 'Sky Preserver', xp: 2100, tier: 'diamond' as const, icon: 'shield-check', desc: 'Prevent 60.0 kg of emissions.' },
    { kg: 75.0, name: 'Seventy-Five Kilo Carbon Hero', xp: 2500, tier: 'diamond' as const, icon: 'trophy', desc: 'Prevent 75.0 kg of CO2e greenhouse emissions.' },
    { kg: 100.0, name: 'Century Carbon Reducer', xp: 3200, tier: 'mythic' as const, icon: 'crown', desc: 'Prevent 100.0 kg of greenhouse carbon emissions.' },
    { kg: 125.0, name: 'Atmospheric Luminary', xp: 3800, tier: 'mythic' as const, icon: 'sparkles', desc: 'Prevent 125.0 kg of carbon gases.' },
    { kg: 150.0, name: 'Climate Vanguard Paragon', xp: 4500, tier: 'mythic' as const, icon: 'globe', desc: 'Prevent 150.0 kg of CO2e emissions.' },
    { kg: 175.0, name: 'Grand Sky Protector', xp: 5200, tier: 'mythic' as const, icon: 'shield', desc: 'Mitigate 175.0 kg of carbon footprint.' },
    { kg: 200.0, name: 'Double Century Carbon Master', xp: 6000, tier: 'mythic' as const, icon: 'crown', desc: 'Prevent 200.0 kg of greenhouse emissions.' },
    { kg: 250.0, name: 'Quarter-Ton Carbon Shield', xp: 7500, tier: 'mythic' as const, icon: 'shield-check', desc: 'Prevent 250.0 kg of greenhouse emissions.' },
    { kg: 300.0, name: 'Three-Hundred Kilo Sky King', xp: 9000, tier: 'mythic' as const, icon: 'crown', desc: 'Prevent 300.0 kg of carbon emissions.' },
    { kg: 350.0, name: 'Atmosphere Legend', xp: 10500, tier: 'mythic' as const, icon: 'award', desc: 'Prevent 350.0 kg of CO2e.' },
    { kg: 400.0, name: 'Climate Deity Paragon', xp: 12000, tier: 'mythic' as const, icon: 'globe', desc: 'Prevent 400.0 kg of carbon emissions.' },
    { kg: 500.0, name: 'Half-Ton Carbon Slayer', xp: 15000, tier: 'mythic' as const, icon: 'crown', desc: 'Prevent 500.0 kg (Half a Ton) of greenhouse CO2e emissions.' },
    { kg: 600.0, name: 'Planetary Sky Restorer', xp: 18000, tier: 'mythic' as const, icon: 'globe', desc: 'Prevent 600.0 kg of carbon pollution.' },
    { kg: 750.0, name: 'Grand Climate Architect', xp: 22000, tier: 'mythic' as const, icon: 'crown', desc: 'Prevent 750.0 kg of greenhouse gases.' },
    { kg: 1000.0, name: 'One-Ton Carbon Sovereign', xp: 30000, tier: 'mythic' as const, icon: 'crown', desc: 'Achieve an astounding 1.0 Metric Ton (1000 kg) of carbon reduction.' },
    { kg: 1500.0, name: 'Climate Demiurge', xp: 45000, tier: 'mythic' as const, icon: 'globe', desc: 'Prevent 1.5 Metric Tons of carbon emissions.' },
    { kg: 2000.0, name: 'Two-Ton Planetary Savior', xp: 60000, tier: 'mythic' as const, icon: 'crown', desc: 'Prevent 2.0 Metric Tons of CO2e emissions across campus lifetime.' },
  ];

  return milestones.map((m, idx) => ({
    id: `badge-cc-${idx + 1}`,
    name: m.name,
    icon: m.icon,
    unlocked: false,
    description: m.desc,
    category: 'Climate & Carbon',
    xpReward: m.xp,
    tier: m.tier,
    rule: { type: 'carbon_saved_kg', target: m.kg, unit: 'kg CO2' },
  }));
};

const generateWaterConservationBadges = (): ExtendedBadgeItem[] => {
  const milestones = [
    { liters: 10, name: 'Water Drop Starter', xp: 60, tier: 'bronze' as const, icon: 'droplet', desc: 'Save 10 Liters of agricultural water embedded in food.' },
    { liters: 25, name: 'Twenty-Five Liter Saver', xp: 90, tier: 'bronze' as const, icon: 'droplet', desc: 'Conserve 25 Liters of virtual water.' },
    { liters: 50, name: 'Fifty Liter Guardian', xp: 120, tier: 'bronze' as const, icon: 'droplets', desc: 'Save 50 Liters of fresh water through mindful dining.' },
    { liters: 75, name: 'Seventy-Five Liter Shield', xp: 150, tier: 'bronze' as const, icon: 'droplets', desc: 'Conserve 75 Liters of agricultural water.' },
    { liters: 100, name: 'Water Saver', xp: 200, tier: 'silver' as const, icon: 'droplets', desc: 'Conserve over 100 liters of virtual embedded agricultural water.' },
    { liters: 150, name: 'Hydration Hero', xp: 240, tier: 'silver' as const, icon: 'droplets', desc: 'Conserve 150 Liters of embedded water.' },
    { liters: 200, name: 'Double Hectoliter Shield', xp: 280, tier: 'silver' as const, icon: 'shield-check', desc: 'Save 200 Liters of freshwater resources.' },
    { liters: 250, name: 'Quarter-Thousand Liter Preserver', xp: 330, tier: 'silver' as const, icon: 'droplets', desc: 'Save 250 Liters of water.' },
    { liters: 300, name: 'Three Hectoliter Defender', xp: 380, tier: 'silver' as const, icon: 'droplets', desc: 'Conserve 300 Liters of virtual water.' },
    { liters: 400, name: 'Four Hectoliter Steward', xp: 450, tier: 'silver' as const, icon: 'shield', desc: 'Save 400 Liters of fresh water.' },
    { liters: 500, name: 'Half-Kiloliter Guardian', xp: 550, tier: 'gold' as const, icon: 'droplets', desc: 'Conserve 500 Liters (Half a Kiloliter) of water.' },
    { liters: 600, name: 'Six Hectoliter Sentinel', xp: 620, tier: 'gold' as const, icon: 'droplets', desc: 'Save 600 Liters of virtual water.' },
    { liters: 750, name: 'Seven-Fifty Liter Vanguard', xp: 750, tier: 'gold' as const, icon: 'award', desc: 'Conserve 750 Liters of water.' },
    { liters: 1000, name: 'One Kiloliter Sovereign', xp: 950, tier: 'gold' as const, icon: 'crown', desc: 'Conserve 1,000 Liters of agricultural water.' },
    { liters: 1250, name: 'Freshwater Champion', xp: 1100, tier: 'gold' as const, icon: 'trophy', desc: 'Save 1,250 Liters of water.' },
    { liters: 1500, name: 'Fifteen Hectoliter Hero', xp: 1300, tier: 'diamond' as const, icon: 'droplets', desc: 'Save 1,500 Liters of virtual water.' },
    { liters: 2000, name: 'Two Kiloliter Defender', xp: 1600, tier: 'diamond' as const, icon: 'shield-check', desc: 'Conserve 2,000 Liters of fresh water.' },
    { liters: 2500, name: 'Aqua Sanctuary Warden', xp: 1950, tier: 'diamond' as const, icon: 'globe', desc: 'Conserve 2,500 Liters of water.' },
    { liters: 3000, name: 'Three Kiloliter Master', xp: 2300, tier: 'diamond' as const, icon: 'award', desc: 'Save 3,000 Liters of water resources.' },
    { liters: 4000, name: 'Aquifer Protector', xp: 2800, tier: 'diamond' as const, icon: 'shield', desc: 'Conserve 4,000 Liters of water.' },
    { liters: 5000, name: 'Five Kiloliter Titan', xp: 3500, tier: 'mythic' as const, icon: 'crown', desc: 'Conserve 5,000 Liters (5 cubic meters) of water.' },
    { liters: 6000, name: 'Six Kiloliter Sovereign', xp: 4000, tier: 'mythic' as const, icon: 'droplets', desc: 'Save 6,000 Liters of agricultural water.' },
    { liters: 7500, name: 'Water Vanguard Paragon', xp: 4800, tier: 'mythic' as const, icon: 'trophy', desc: 'Conserve 7,500 Liters of freshwater.' },
    { liters: 10000, name: 'Ten Kiloliter Grandmaster', xp: 6000, tier: 'mythic' as const, icon: 'crown', desc: 'Conserve 10,000 Liters of embedded water.' },
    { liters: 12500, name: 'Hydrologic Luminary', xp: 7500, tier: 'mythic' as const, icon: 'sparkles', desc: 'Save 12,500 Liters of water.' },
    { liters: 15000, name: 'Fifteen Kiloliter Sovereign', xp: 9000, tier: 'mythic' as const, icon: 'globe', desc: 'Conserve 15,000 Liters of water.' },
    { liters: 20000, name: 'Twenty Kiloliter Titan', xp: 12000, tier: 'mythic' as const, icon: 'crown', desc: 'Save 20,000 Liters of fresh water.' },
    { liters: 25000, name: 'Quarter-Pool Preserver', xp: 15000, tier: 'mythic' as const, icon: 'trophy', desc: 'Conserve 25,000 Liters (a small swimming pool worth) of water.' },
    { liters: 30000, name: 'Thirty Kiloliter Legend', xp: 18000, tier: 'mythic' as const, icon: 'award', desc: 'Save 30,000 Liters of embedded water.' },
    { liters: 50000, name: 'Fifty Kiloliter Aqua Deity', xp: 25000, tier: 'mythic' as const, icon: 'crown', desc: 'Conserve an astonishing 50,000 Liters of agricultural water.' },
  ];

  return milestones.map((m, idx) => ({
    id: `badge-wc-${idx + 1}`,
    name: m.name,
    icon: m.icon,
    unlocked: false,
    description: m.desc,
    category: 'Water Conservation',
    xpReward: m.xp,
    tier: m.tier,
    rule: { type: 'water_saved_liters', target: m.liters, unit: 'Liters' },
  }));
};

const generateCampusLevelAndPrestigeBadges = (): ExtendedBadgeItem[] => {
  const levels = [
    { lvl: 1, name: 'Campus Green Initiate', xp: 50, tier: 'bronze' as const, icon: 'sprout', desc: 'Begin your sustainability journey as Level 1 student.' },
    { lvl: 2, name: 'Eco Apprentice', xp: 100, tier: 'bronze' as const, icon: 'leaf', desc: 'Advance to Level 2 in campus environmental status.' },
    { lvl: 3, name: 'Level 3 Explorer', xp: 200, tier: 'bronze' as const, icon: 'zap', desc: 'Advance your student sustainability ranking to Level 3.' },
    { lvl: 4, name: 'Green Scout', xp: 250, tier: 'bronze' as const, icon: 'target', desc: 'Attain Level 4 campus eco rank.' },
    { lvl: 5, name: 'BBS PIK Eco Ambassador', xp: 500, tier: 'silver' as const, icon: 'shield-check', desc: 'Reach Level 5 and inspire campus peers as an official ambassador.' },
    { lvl: 6, name: 'Campus Vanguard', xp: 600, tier: 'silver' as const, icon: 'award', desc: 'Advance to Level 6 student ranking.' },
    { lvl: 7, name: 'Sustainability Captain', xp: 750, tier: 'silver' as const, icon: 'trophy', desc: 'Attain Level 7 campus environmental captaincy.' },
    { lvl: 8, name: 'Campus Grandmaster', xp: 1000, tier: 'gold' as const, icon: 'crown', desc: 'Reach Level 8 with exemplary campus environmental leadership.' },
    { lvl: 9, name: 'Eco Prefect', xp: 1200, tier: 'gold' as const, icon: 'shield', desc: 'Attain Level 9 sustainability standing.' },
    { lvl: 10, name: 'Decade Level Master', xp: 1500, tier: 'gold' as const, icon: 'crown', desc: 'Reach Level 10 of campus environmental excellence.' },
    { lvl: 11, name: 'Green Governor', xp: 1700, tier: 'gold' as const, icon: 'award', desc: 'Ascend to Level 11 on campus.' },
    { lvl: 12, name: 'Earth Custodian', xp: 2000, tier: 'gold' as const, icon: 'globe', desc: 'Reach Level 12 leadership rank.' },
    { lvl: 13, name: 'BBS Senior Steward', xp: 2300, tier: 'gold' as const, icon: 'shield-check', desc: 'Attain Level 13 ranking.' },
    { lvl: 14, name: 'Campus Luminary', xp: 2600, tier: 'diamond' as const, icon: 'sparkles', desc: 'Achieve Level 14 sustainability distinction.' },
    { lvl: 15, name: 'High Council Member', xp: 3000, tier: 'diamond' as const, icon: 'crown', desc: 'Ascend to Level 15 in campus green rankings.' },
    { lvl: 16, name: 'Planetary Champion', xp: 3400, tier: 'diamond' as const, icon: 'globe', desc: 'Attain Level 16 status.' },
    { lvl: 17, name: 'Eco Laureate', xp: 3800, tier: 'diamond' as const, icon: 'award', desc: 'Achieve Level 17 honors.' },
    { lvl: 18, name: 'Grand Warden of Earth', xp: 4200, tier: 'diamond' as const, icon: 'shield', desc: 'Reach Level 18 standing.' },
    { lvl: 19, name: 'High Sovereign of BBS', xp: 4600, tier: 'diamond' as const, icon: 'trophy', desc: 'Attain Level 19 distinction.' },
    { lvl: 20, name: 'Double Decade Grandmaster', xp: 5000, tier: 'diamond' as const, icon: 'crown', desc: 'Reach Level 20 in campus sustainability.' },
    { lvl: 22, name: 'Grand Scholar of Earth', xp: 5800, tier: 'mythic' as const, icon: 'award', desc: 'Attain Level 22 status.' },
    { lvl: 24, name: 'Planetary Chancellor', xp: 6600, tier: 'mythic' as const, icon: 'globe', desc: 'Reach Level 24 excellence.' },
    { lvl: 26, name: 'Green Sovereign Prime', xp: 7400, tier: 'mythic' as const, icon: 'crown', desc: 'Attain Level 26 standing.' },
    { lvl: 28, name: 'Earth Archon', xp: 8200, tier: 'mythic' as const, icon: 'shield-check', desc: 'Achieve Level 28 status.' },
    { lvl: 30, name: 'Thirty Level Sovereign', xp: 10000, tier: 'mythic' as const, icon: 'crown', desc: 'Achieve Level 30 in the Campus Hall of Fame.' },
    { lvl: 32, name: 'Planetary Overlord', xp: 11500, tier: 'mythic' as const, icon: 'globe', desc: 'Attain Level 32 honors.' },
    { lvl: 35, name: 'Legendary Eco Titan', xp: 13500, tier: 'mythic' as const, icon: 'crown', desc: 'Reach Level 35 sustainability leadership.' },
    { lvl: 38, name: 'Master of Zero Scraps', xp: 15500, tier: 'mythic' as const, icon: 'trophy', desc: 'Achieve Level 38 ranking.' },
    { lvl: 40, name: 'Four-Star Sovereign', xp: 18000, tier: 'mythic' as const, icon: 'crown', desc: 'Reach Level 40 campus standing.' },
    { lvl: 42, name: 'Campus Earth Emperor', xp: 20000, tier: 'mythic' as const, icon: 'globe', desc: 'Attain Level 42 status.' },
    { lvl: 45, name: 'Grandmaster Ascendant', xp: 24000, tier: 'mythic' as const, icon: 'crown', desc: 'Achieve Level 45 prestige.' },
    { lvl: 48, name: 'Solaris Sovereign', xp: 28000, tier: 'mythic' as const, icon: 'sun', desc: 'Attain Level 48 distinction.' },
    { lvl: 50, name: 'Campus Eco Immortal', xp: 35000, tier: 'mythic' as const, icon: 'crown', desc: 'Reach Level 50 and attain eternal status in BBS PIK sustainability history.' },
    { lvl: 60, name: 'Supreme Planetary Deity', xp: 50000, tier: 'mythic' as const, icon: 'crown', desc: 'Reach Level 60 pinnacle of excellence.' },
    { lvl: 75, name: 'Universal Zero Waste Avatar', xp: 75000, tier: 'mythic' as const, icon: 'crown', desc: 'Reach Level 75 in universal environmental mastery.' },
  ];

  return levels.map((l, idx) => ({
    id: `badge-lvl-${idx + 1}`,
    name: l.name,
    icon: l.icon,
    unlocked: false,
    description: l.desc,
    category: 'Leadership & Levels',
    xpReward: l.xp,
    tier: l.tier,
    rule: { type: 'level', target: l.lvl, unit: 'Level' },
  }));
};

const generateHealthyDietBadges = (): ExtendedBadgeItem[] => {
  const nutritionBadges = [
    { name: 'Plant Pioneer', icon: 'leaf', xp: 100, tier: 'bronze' as const, desc: 'Scan and finish a delicious plant-forward or veggie meal.', regex: /salad|veggie|broccoli|quinoa|greens|spinach|carrot|tofu|fruit|avocado|plant|bean|cucumber/i },
    { name: 'Rainbow Plate', icon: 'apple', xp: 150, tier: 'bronze' as const, desc: 'Enjoy a colorful meal featuring crisp greens, fruit, or balanced veggies.', regex: /fruit|apple|banana|berry|tomato|kale|carrot|pepper|orange|grape/i },
    { name: 'Nutrient Balance', icon: 'sprout', xp: 180, tier: 'silver' as const, desc: 'Log a meal with balanced macro-nutrients and high nutritional density.', regex: /protein|chicken|fish|egg|tofu|tempeh|salmon|beef|quinoa|rice/i },
    { name: 'Green Salad Master', icon: 'leaf', xp: 140, tier: 'bronze' as const, desc: 'Finish a fresh leafy bowl with zero leftovers.', regex: /salad|lettuce|arugula|spinach|kale/i },
    { name: 'Fruit Bowl Enthusiast', icon: 'apple', xp: 150, tier: 'bronze' as const, desc: 'Enjoy a healthy fresh fruit snack on campus.', regex: /fruit|apple|banana|orange|watermelon|melon|papaya|berries/i },
    { name: 'Protein Powerhouse', icon: 'zap', xp: 190, tier: 'silver' as const, desc: 'Finish a nutritious protein bowl with zero scraps.', regex: /chicken|fish|beef|tofu|tempeh|egg|protein/i },
    { name: 'Superfood Scout', icon: 'sparkles', xp: 200, tier: 'silver' as const, desc: 'Enjoy a meal packed with nutrient-rich grains, seeds, or greens.', regex: /quinoa|chia|avocado|berries|spinach|kale|almond/i },
    { name: 'Whole Grain Warrior', icon: 'sprout', xp: 170, tier: 'silver' as const, desc: 'Choose fiber-rich brown rice, oats, or whole grain bread.', regex: /brown rice|oats|oatmeal|whole wheat|grain|quinoa|sourdough/i },
    { name: 'Veggie Variety Champion', icon: 'leaf', xp: 220, tier: 'silver' as const, desc: 'Log a meal packed with at least three distinct vegetables.', regex: /broccoli|carrot|corn|tomato|cucumber|spinach|mushroom|cabbage/i },
    { name: 'Hydration Steward', icon: 'droplet', xp: 150, tier: 'bronze' as const, desc: 'Carry a refillable flask and choose zero single-use plastic drinks.', regex: /water|tea|juice|hydration|flask/i },
    { name: 'Soup Finisher', icon: 'utensils', xp: 160, tier: 'bronze' as const, desc: 'Finish every drop of a warm, comforting soup bowl.', regex: /soup|broth|ramen|soto|miso/i },
    { name: 'Crisp & Clean Greens', icon: 'leaf', xp: 180, tier: 'silver' as const, desc: 'Enjoy crisp broccoli or greens with 100% clean plate.', regex: /broccoli|asparagus|beans|bok choy|greens/i },
    { name: 'Low-Sugar Luminary', icon: 'sparkles', xp: 200, tier: 'silver' as const, desc: 'Choose wholesome unsweetened campus dining options.', regex: /salad|grilled|steamed|fruit|plain/i },
    { name: 'Herbivore Hero', icon: 'sprout', xp: 250, tier: 'gold' as const, desc: 'Complete 3 plant-only meals with verified clean plates.', regex: /tofu|tempeh|vegetable|salad|plant|vegan/i },
    { name: 'Macro Perfectionist', icon: 'target', xp: 280, tier: 'gold' as const, desc: 'Log a meal with balanced carbs, protein, and dietary fiber.', regex: /rice|chicken|beef|egg|broccoli|salad|quinoa/i },
    { name: 'Fiber Champion', icon: 'sprout', xp: 220, tier: 'silver' as const, desc: 'Enjoy a meal packed with high-fiber grains and legumes.', regex: /beans|lentils|oats|chickpeas|broccoli/i },
    { name: 'Avocado Aficionado', icon: 'apple', xp: 190, tier: 'silver' as const, desc: 'Log a fresh meal featuring healthy unsaturated fats.', regex: /avocado|guacamole|nuts|olive/i },
    { name: 'Tofu & Tempeh Titan', icon: 'leaf', xp: 230, tier: 'silver' as const, desc: 'Enjoy a delicious sustainable soy-protein meal.', regex: /tofu|tempeh|soy|edamame/i },
    { name: 'Citrus Sunburst', icon: 'sun', xp: 160, tier: 'bronze' as const, desc: 'Enjoy Vitamin C rich citrus fruits or juices.', regex: /orange|lemon|lime|grapefruit|tangerine/i },
    { name: 'Nut & Seed Forager', icon: 'sparkles', xp: 210, tier: 'silver' as const, icon2: 'leaf', desc: 'Add healthy crunch to your meal with walnuts, almonds, or seeds.', regex: /walnut|almond|peanut|chia|flax|sesame|sunflower/i },
    { name: 'Steamed & Clean', icon: 'shield-check', xp: 180, tier: 'silver' as const, desc: 'Choose lightly steamed dining options and finish every bite.', regex: /steamed|dumpling|dim sum|boiled|poached/i },
    { name: 'Berry Bounty', icon: 'apple', xp: 190, tier: 'silver' as const, desc: 'Enjoy antioxidant-rich berries on campus.', regex: /strawberry|blueberry|raspberry|blackberry|berry/i },
    { name: 'Root Vegetable Explorer', icon: 'sprout', xp: 170, tier: 'bronze' as const, desc: 'Enjoy carrots, sweet potatoes, or beets.', regex: /carrot|sweet potato|potato|beet|radish/i },
    { name: 'Green Smoothie Connoisseur', icon: 'droplets', xp: 200, tier: 'silver' as const, desc: 'Log a nutritious green blended beverage.', regex: /smoothie|shake|juice|matcha/i },
    { name: 'Legume Luminary', icon: 'sprout', xp: 240, tier: 'gold' as const, desc: 'Enjoy fiber-dense lentils, chickpeas, or kidney beans.', regex: /lentil|chickpea|bean|edamame/i },
    { name: 'Clean Carb Conscious', icon: 'target', xp: 220, tier: 'silver' as const, desc: 'Opt for complex carbs like roasted sweet potato or wild rice.', regex: /sweet potato|quinoa|wild rice|oats/i },
    { name: 'Mindful Chewer', icon: 'heart', xp: 180, tier: 'silver' as const, desc: 'Savor your meal with conscious, measured eating pace.', regex: /salad|rice|bowl|plate/i },
    { name: 'Nourish Bowl Ace', icon: 'trophy', xp: 260, tier: 'gold' as const, desc: 'Create a complete nourish bowl with greens, grains, and protein.', regex: /bowl|quinoa|salmon|chicken|tofu|avocado/i },
    { name: 'Zero-Junk Champion', icon: 'shield-check', xp: 300, tier: 'gold' as const, desc: 'Log 5 consecutive whole-food, nutrient-dense meals.', regex: /salad|soup|grilled|steamed|fruit|veggie/i },
    { name: 'Campus Nutrition Grandmaster', icon: 'crown', xp: 500, tier: 'diamond' as const, desc: 'Achieve exceptional dietary balance across your school journey.', regex: /salad|fruit|quinoa|veggie|protein/i },
  ];

  return nutritionBadges.map((b, idx) => ({
    id: `badge-nut-${idx + 1}`,
    name: b.name,
    icon: b.icon,
    unlocked: false,
    description: b.desc,
    category: 'Healthy Diet & Nutrition',
    xpReward: b.xp,
    tier: b.tier,
    rule: { type: 'keyword', target: 1, keywordRegex: b.regex },
  }));
};

const generateMindfulDiningBadges = (): ExtendedBadgeItem[] => {
  const mindfulBadges = [
    { name: 'Morning Green Fuel', icon: 'sun', xp: 120, tier: 'bronze' as const, desc: 'Log and finish a nutritious morning breakfast before class starts.', regex: /breakfast|morning|oats|pancake|toast|egg|cereal|waffle/i },
    { name: 'Weekend Green', icon: 'heart', xp: 140, tier: 'bronze' as const, desc: 'Log a conscious zero-waste meal over the weekend.', regex: /meal|lunch|dinner|breakfast|food/i },
    { name: 'Portion Pro', icon: 'target', xp: 150, tier: 'bronze' as const, desc: 'Select appropriate portion sizes and finish every bite without overserving.', regex: /meal|lunch|dinner|breakfast/i },
    { name: 'Midday Fuel Ace', icon: 'sun', xp: 130, tier: 'bronze' as const, desc: 'Finish your campus cafeteria lunch with zero leftover scraps.', regex: /lunch|midday|rice|noodle|sandwich/i },
    { name: 'Evening Eco Finisher', icon: 'sparkles', xp: 140, tier: 'bronze' as const, desc: 'Complete a calm, waste-free evening dinner.', regex: /dinner|evening|supper|pasta|curry/i },
    { name: 'Compost King', icon: 'recycle', xp: 200, tier: 'silver' as const, desc: 'Sort and divert organic scraps at campus recycling stations.', regex: /compost|recycle|scrap|organic/i },
    { name: 'Homeroom Pride', icon: 'users', xp: 180, tier: 'silver' as const, desc: 'Contribute active dining XP to your class homeroom championship.', regex: /meal|food/i },
    { name: 'Dining Hall Regular', icon: 'utensils', xp: 160, tier: 'bronze' as const, desc: 'Log 5 dining hall meals with zero plate scraps.', regex: /meal|lunch|dinner/i },
    { name: 'Speed Sorter', icon: 'zap', xp: 170, tier: 'silver' as const, desc: 'Return your tray and clean up within 60 seconds of finishing dining.', regex: /meal|food/i },
    { name: 'Photo Accuracy Ace', icon: 'shield-check', xp: 190, tier: 'silver' as const, desc: 'Capture clear, well-lit before-and-after dining photos.', regex: /meal|plate/i },
    { name: 'Reusable Mug Maestro', icon: 'droplet', xp: 150, tier: 'bronze' as const, desc: 'Bring your own thermal tumbler for hot drinks.', regex: /coffee|tea|mug|tumbler|drink/i },
    { name: 'Eco Cutlery Champion', icon: 'utensils', xp: 160, tier: 'bronze' as const, desc: 'Use reusable stainless steel or bamboo dining cutlery.', regex: /cutlery|fork|spoon|chopsticks/i },
    { name: 'No-Straw Steward', icon: 'shield', xp: 140, tier: 'bronze' as const, desc: 'Sip directly from your cup to save single-use plastics.', regex: /drink|juice|water|tea/i },
    { name: 'Table Courtesy Star', icon: 'heart', xp: 175, tier: 'silver' as const, desc: 'Leave your dining table spotless for fellow students.', regex: /meal|lunch|table/i },
    { name: 'Snack Portion Master', icon: 'target', xp: 130, tier: 'bronze' as const, desc: 'Pick the right snack size to prevent half-eaten packaged waste.', regex: /snack|biscuit|bar|fruit/i },
    { name: 'Campus Cafeteria Scout', icon: 'award', xp: 180, tier: 'silver' as const, desc: 'Explore all sustainable dining counters on campus.', regex: /cafeteria|canteen|counter|meal/i },
    { name: 'Zero-Spill Finisher', icon: 'shield-check', xp: 190, tier: 'silver' as const, desc: 'Finish a soup or sauce bowl without leaving residue or spills.', regex: /soup|curry|sauce|pasta/i },
    { name: 'Peer Encourager', icon: 'users', xp: 210, tier: 'silver' as const, desc: 'Dine with classmates and encourage 100% clean plates.', regex: /lunch|friends|classmate|meal/i },
    { name: 'BBS Green Citizen', icon: 'globe', xp: 250, tier: 'gold' as const, desc: 'Actively uphold campus sustainability standards.', regex: /meal|campus|food/i },
    { name: 'Tray Sorting Champion', icon: 'recycle', xp: 220, tier: 'silver' as const, desc: 'Sort trays accurately into compost, recyclables, and trash.', regex: /tray|sort|compost|trash/i },
    { name: 'Mindful Savorer', icon: 'heart', xp: 200, tier: 'silver' as const, desc: 'Take time to appreciate and finish whole balanced meals.', regex: /meal|food|plate/i },
    { name: 'Clean Tray Artist', icon: 'sparkles', xp: 230, tier: 'silver' as const, desc: 'Return a tray so clean it could be framed.', regex: /tray|plate|meal/i },
    { name: 'Campus Eco Mentor', icon: 'crown', xp: 350, tier: 'gold' as const, desc: 'Demonstrate leadership in waste reduction to younger grades.', regex: /mentor|leader|grade|class/i },
    { name: 'Pantry Optimizer', icon: 'target', xp: 240, tier: 'gold' as const, desc: 'Eat what you take and avoid hoarding excess food items.', regex: /snack|meal|pantry/i },
    { name: 'Zero Waste Study Fuel', icon: 'zap', xp: 190, tier: 'silver' as const, desc: 'Fuel up for study sessions with zero discarded snacks.', regex: /snack|fruit|oats|toast/i },
    { name: 'Eco Dining Connoisseur', icon: 'award', xp: 280, tier: 'gold' as const, desc: 'Log 20 verified zero-waste dining sessions across terms.', regex: /meal|food/i },
    { name: 'Clean Sweep Specialist', icon: 'shield-check', xp: 320, tier: 'gold' as const, desc: 'Never leave a single rice grain or veggie piece behind.', regex: /rice|grain|meal/i },
    { name: 'Campus Dining Ambassador', icon: 'crown', xp: 450, tier: 'diamond' as const, desc: 'Recognized by campus sustainability team for dining conduct.', regex: /campus|dining|ambassador/i },
    { name: 'Hall of Honor Finisher', icon: 'trophy', xp: 600, tier: 'diamond' as const, desc: 'Distinguished dining hall honor roll member.', regex: /honor|hall|plate/i },
    { name: 'Planetary Dining Grandmaster', icon: 'crown', xp: 1000, tier: 'mythic' as const, icon2: 'globe', desc: 'Mastery of all mindful dining arts and campus etiquette.', regex: /master|dining|green/i },
  ];

  return mindfulBadges.map((b, idx) => ({
    id: `badge-md-${idx + 1}`,
    name: b.name,
    icon: b.icon,
    unlocked: false,
    description: b.desc,
    category: 'Mindful Dining & Campus Life',
    xpReward: b.xp,
    tier: b.tier,
    rule: { type: 'keyword', target: 1, keywordRegex: b.regex },
  }));
};

const generateSpecialHonorsAndEliteBadges = (): ExtendedBadgeItem[] => {
  const eliteBadges = [
    { name: 'Golden Plate of Honor', icon: 'crown', xp: 500, tier: 'gold' as const, desc: 'Earned for outstanding clean-plate perfection across multiple campus seasons.' },
    { name: 'Silver Sprout of BBS', icon: 'sprout', xp: 400, tier: 'silver' as const, desc: 'Awarded for active daily participation in the school food waste mission.' },
    { name: 'Emerald Shield Defender', icon: 'shield-check', xp: 600, tier: 'gold' as const, desc: 'Achieve total protection of food resources with zero recorded penalties.' },
    { name: 'Ruby Flame of Dedication', icon: 'flame', xp: 750, tier: 'gold' as const, desc: 'Sustained fire and commitment to zero-waste school dining.' },
    { name: 'Sapphire Drop of Purity', icon: 'droplet', xp: 700, tier: 'gold' as const, desc: 'Recognized for immense virtual water conservation efforts.' },
    { name: 'Diamond Earth Guardian', icon: 'globe', xp: 1200, tier: 'diamond' as const, desc: 'Elite honor conferred on top 5% of campus waste reducers.' },
    { name: 'BBS PIK Sustainability Trophy', icon: 'trophy', xp: 1500, tier: 'diamond' as const, desc: 'The most prestigious campus environmental honor.' },
    { name: 'Zero Scrap Mastermind', icon: 'target', xp: 850, tier: 'gold' as const, desc: 'A master strategist who orders precise portions every single day.' },
    { name: 'Plate Perfection Paragon', icon: 'sparkles', xp: 950, tier: 'gold' as const, desc: 'Exemplary plate presentation and spotless tray cleanliness.' },
    { name: 'Campus Green Pioneer', icon: 'leaf', xp: 1100, tier: 'diamond' as const, desc: 'Among the first to adopt digital meal scanning and zero-waste tracking.' },
    { name: 'Earth Day Vanguard', icon: 'globe', xp: 800, tier: 'gold' as const, desc: 'Celebrated Earth Day on campus with full zero-waste dining participation.' },
    { name: 'Class Homeroom MVP', icon: 'users', xp: 1000, tier: 'diamond' as const, desc: 'Top overall XP contributor to your class section ranking.' },
    { name: 'Zero Waste Scholar of the Year', icon: 'award', xp: 2000, tier: 'diamond' as const, desc: 'Exceptional cumulative record of food waste prevention and peer leadership.' },
    { name: 'The Unbroken Finisher', icon: 'shield-check', xp: 1300, tier: 'diamond' as const, desc: 'Logged over 50 meals without a single food scrap penalty.' },
    { name: 'Solar Zenith Hero', icon: 'sun', xp: 1400, tier: 'diamond' as const, icon2: 'trophy', desc: 'Radiant environmental champion in campus dining sustainability.' },
    { name: 'Compost Vanguard Supreme', icon: 'recycle', xp: 1250, tier: 'diamond' as const, desc: 'Sorted organic food waste with surgical accuracy.' },
    { name: 'The Eco Luminary', icon: 'sparkles', xp: 1600, tier: 'diamond' as const, desc: 'A shining beacon of environmental mindfulness in the dining hall.' },
    { name: 'Planetary Custodian General', icon: 'globe', xp: 2500, tier: 'mythic' as const, desc: 'Commanding leader in campus ecological stewardship.' },
    { name: 'Grandmaster of the Clean Tray', icon: 'crown', xp: 3000, tier: 'mythic' as const, desc: 'The ultimate symbol of flawless dining tray execution.' },
    { name: 'BBS PIK Earth Vanguard Sovereign', icon: 'crown', xp: 5000, tier: 'mythic' as const, desc: 'Supreme planetary honors awarded to master campus environmental stewards.' },
    { name: 'Master Chef Respect', icon: 'heart', xp: 900, tier: 'gold' as const, desc: 'Honoring the cafeteria culinary team by finishing every morsel.' },
    { name: 'Zero-Waste Speedrunner', icon: 'zap', xp: 750, tier: 'gold' as const, desc: 'Quickly scanned, enjoyed, and verified a spotless clean plate.' },
    { name: 'The Green Sentinel', icon: 'shield', xp: 1050, tier: 'diamond' as const, desc: 'Guarding campus biodiversity through food waste reduction.' },
    { name: 'Hall of Titans Immortal', icon: 'crown', xp: 6000, tier: 'mythic' as const, desc: 'Permanent enshrinement into the Campus Sustainability Hall of Titans.' },
    { name: 'Universal Eco Celestial', icon: 'globe', xp: 10000, tier: 'mythic' as const, desc: 'Transcended all levels with 300 badges unlocked across the galaxy.' },
  ];

  return eliteBadges.map((b, idx) => ({
    id: `badge-el-${idx + 1}`,
    name: b.name,
    icon: b.icon,
    unlocked: false,
    description: b.desc,
    category: 'Elite Honors & Special',
    xpReward: b.xp,
    tier: b.tier,
    rule: { type: 'total_xp', target: (idx + 1) * 200, unit: 'XP' },
  }));
};

// ----------------------------------------------------------------------
// COMBINE ALL 300 BADGES
// ----------------------------------------------------------------------

export const allBadgesList: ExtendedBadgeItem[] = [
  ...generateZeroWasteMasteryBadges(),        // 40 badges
  ...generateFoodWasteDiversionBadges(),       // 35 badges
  ...generateStreakAndHabitBadges(),           // 40 badges
  ...generateCarbonAndClimateBadges(),         // 35 badges
  ...generateWaterConservationBadges(),        // 30 badges
  ...generateCampusLevelAndPrestigeBadges(),   // 35 badges
  ...generateHealthyDietBadges(),              // 30 badges
  ...generateMindfulDiningBadges(),            // 30 badges
  ...generateSpecialHonorsAndEliteBadges(),    // 25 badges
]; // Total: 300 Badges!

// Quick unlock evaluator helper for all 300 badges
export function evaluateBadgeUnlock(badge: ExtendedBadgeItem, ctx: BadgeEvaluationContext): boolean {
  if (badge.unlocked) return true;
  if (!badge.rule) return false;

  const r = badge.rule;
  switch (r.type) {
    case 'clean_meals':
      return ctx.cleanMealsCount >= r.target;
    case 'food_saved_kg':
      return ctx.foodSavedKg >= r.target;
    case 'streak_days':
      return ctx.streakDays >= r.target;
    case 'carbon_saved_kg':
      return ctx.totalCarbonSavedKg >= r.target;
    case 'water_saved_liters':
      return ctx.totalWaterSavedLiters >= r.target;
    case 'level':
      return ctx.level >= r.target;
    case 'total_xp':
      return ctx.totalXp >= r.target;
    case 'keyword':
      if (!r.keywordRegex) return false;
      return ctx.allMeals.some((m) =>
        m.cleanPlate !== false &&
        (
          (m.title && r.keywordRegex?.test(m.title)) ||
          m.foodItems?.some((item) => r.keywordRegex?.test(item))
        )
      );
    default:
      return false;
  }
}
