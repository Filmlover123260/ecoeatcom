import { CampusChallengeInfo } from '../types';

export interface AcademicYearPeriod {
  startYear: number;
  endYear: number;
  code: string; // e.g. "2026/2027"
  id: string; // e.g. "ay-2026-2027"
  label: string; // e.g. "AY 2026/2027"
  periodLabel: string; // e.g. "July 2026 – June 2027"
  cycleTransitionNote: string; // e.g. "Previous year ended June 2026 • New school year started July 2026"
  startDate: Date;
  endDate: Date;
  startDateStr: string;
  endDateStr: string;
  previousYearEndDateStr: string; // "June 30, 2026"
  nextYearStartDateStr: string; // "July 1, 2027"
  totalDays: number;
  daysLeft: number;
  daysElapsed: number;
  isCurrent: boolean;
}

/**
 * Calculates BBS Academic Year period given any date.
 * BBS Rule: Academic year starts on July 1st and ends on June 30th of next year, then repeats.
 */
export function getAcademicYearPeriod(referenceDate: Date = new Date()): AcademicYearPeriod {
  const d = new Date(referenceDate);
  const currentMonth = d.getMonth(); // 0 = Jan ... 5 = June, 6 = July ... 11 = Dec
  const currentYear = d.getFullYear();

  let startYear: number;
  let endYear: number;

  if (currentMonth >= 6) {
    // July through December
    startYear = currentYear;
    endYear = currentYear + 1;
  } else {
    // January through June
    startYear = currentYear - 1;
    endYear = currentYear;
  }

  const startDate = new Date(startYear, 6, 1, 0, 0, 0, 0); // July 1
  const endDate = new Date(endYear, 5, 30, 23, 59, 59, 999); // June 30

  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / msPerDay);
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - d.getTime()) / msPerDay));
  const daysElapsed = Math.max(0, Math.floor((d.getTime() - startDate.getTime()) / msPerDay));

  // Determine if this is currently ongoing
  const isCurrent = now.getTime() >= startDate.getTime() && now.getTime() <= endDate.getTime();

  const previousYearCode = `${startYear - 1}/${startYear}`;
  const currentYearCode = `${startYear}/${endYear}`;
  const nextYearCode = `${endYear}/${endYear + 1}`;

  const previousYearEndDateStr = `June 30, ${startYear}`;
  const nextYearStartDateStr = `July 1, ${endYear}`;
  const cycleTransitionNote = `AY ${previousYearCode} ended June ${startYear} • AY ${currentYearCode} started July ${startYear} (ends June ${endYear})`;

  return {
    startYear,
    endYear,
    code: `${startYear}/${endYear}`,
    id: `ay-${startYear}-${endYear}`,
    label: `AY ${startYear}/${endYear}`,
    periodLabel: `July ${startYear} – June ${endYear}`,
    cycleTransitionNote,
    startDate,
    endDate,
    startDateStr: `July 1, ${startYear}`,
    endDateStr: `June 30, ${endYear}`,
    previousYearEndDateStr,
    nextYearStartDateStr,
    totalDays,
    daysLeft,
    daysElapsed,
    isCurrent,
  };
}

/**
 * Challenge templates tailored for BBS PIK academic year cycle
 */
interface AcademicYearTemplate {
  title: string;
  subtitle: string;
  targetKg: number;
  description: (period: AcademicYearPeriod) => string;
  rewards: string[];
  themeColor: string;
  motto: string;
}

const challengeTemplatesByYear: Record<string, AcademicYearTemplate> = {
  '2025/2026': {
    title: 'BBS CAMPUS CHALLENGE 2025/2026',
    subtitle: 'Inaugural Zero-Waste Sprint',
    targetKg: 1000,
    description: () =>
      'The foundational challenge of BBS PIK dining sustainability! Students united to prove that cafeteria leftovers can be eliminated through mindfulness, portion control, and campus composting.',
    rewards: [
      'Campus Dining Hall Composting Station',
      'Stainless Steel Reusable Cutlery Kits for Classrooms',
      'Inaugural BBS Eco-Pioneer Plaque',
    ],
    themeColor: '#10b981',
    motto: 'Planting the Seeds of Campus Stewardship',
  },
  '2026/2027': {
    title: 'BBS CAMPUS CHALLENGE 2026/2027',
    subtitle: 'The Solar & Circular Quad Revolution',
    targetKg: 1500,
    description: () =>
      'Unite BBS PIK students across Secondary and Junior College to divert 1,500 kg of food scraps. Every clean plate prevents methane emissions and unlocks solar-powered amenities on campus!',
    rewards: [
      'Solar-Powered Outdoor Charging Benches on BBS Quad',
      'All-Campus Organic Smoothie & Fruit Festival',
      'BBS PIK Sustainability Trophy',
      'Student Council Clean-Campus Green Initiative Grant',
    ],
    themeColor: '#22c55e',
    motto: 'Solar Energy & Zero Dining Waste',
  },
  '2027/2028': {
    title: 'BBS CAMPUS CHALLENGE 2027/2028',
    subtitle: 'Hydroponics & Farm-to-Fork Quest',
    targetKg: 1800,
    description: () =>
      'Turn clean cafeteria habits into living greenery: diverting 1,800 kg of campus food waste funds automated vertical hydroponic towers supplying fresh greens directly to the school cafeteria.',
    rewards: [
      'Vertical Aeroponic & Hydroponic Greens Tower for BBS Canteen',
      'Farm-to-Fork Wood-Fired Pizza Lunch for Top Houses',
      'Annual BBS PIK Green Heritage Banner',
      'Tree Planting Dedication Ceremony on BBS Grounds',
    ],
    themeColor: '#06b6d4',
    motto: 'From Plate to Seed to School Harvest',
  },
  '2028/2029': {
    title: 'BBS CAMPUS CHALLENGE 2028/2029',
    subtitle: 'Food-to-Power & Circular Biodigester',
    targetKg: 2000,
    description: () =>
      'High-tech circularity at BBS PIK! By saving 2,000 kg of cafeteria dining leftovers, BBS PIK installs an on-site educational biodigester converting organic scraps into clean school biogas.',
    rewards: [
      'Smart Educational Biodigester Demonstration Facility',
      'All-School Gelato & Zero-Waste Celebration Day',
      'BBS PIK Circular Economy Honor Shield',
      'Guest Keynote by International Climate Leaders',
    ],
    themeColor: '#3b82f6',
    motto: 'Transforming Cafeteria Scraps into Renewable Energy',
  },
  '2029/2030': {
    title: 'BBS CAMPUS CHALLENGE 2029/2030',
    subtitle: 'Decade of Net-Zero Campus Dining',
    targetKg: 2500,
    description: () =>
      'A monumental milestone celebrating student-led sustainability at BBS PIK. Aiming for 2,500 kg diverted to cement BBS PIK as the premier zero-waste international school in Southeast Asia.',
    rewards: [
      'Permanent Outdoor Eco-Classroom & Sustainability Pavilion',
      'Grand Gala Zero-Waste Feast for Students and Faculty',
      'Decade of Green Dining Hall of Fame Monument',
    ],
    themeColor: '#8b5cf6',
    motto: 'A Decade of Uncompromising Student Leadership',
  },
};

/**
 * Generates an Academic Year challenge for any given year,
 * dynamically repeating the BBS July-to-June cycle indefinitely.
 */
export function getChallengeForAcademicYear(period: AcademicYearPeriod): CampusChallengeInfo {
  const template = challengeTemplatesByYear[period.code] || {
    title: `BBS CAMPUS CHALLENGE ${period.code}`,
    subtitle: `Academic Year ${period.code} Clean Plate Campaign`,
    targetKg: 1000 + ((period.startYear - 2025) % 8) * 250,
    description: () =>
      `Join all students and teachers to divert campus food waste. Every clean plate counts toward school eco-awards and campus improvements!`,
    rewards: [
      `BBS PIK Academic Year ${period.code} Campus Eco Grant`,
      'School-wide Zero-Waste Celebration Day',
      `Official BBS PIK ${period.code} Green Trophy`,
    ],
    themeColor: '#10b981',
    motto: `BBS PIK Clean Plate Excellence ${period.code}`,
  };

  const targetKg = template.targetKg;
  // For the active academic year, progress starts at 0 kg and 0% — every kg comes strictly from real verified student meal diversions
  const initialCurrentKg = period.isCurrent
    ? 0
    : period.daysLeft === 0
    ? targetKg
    : 0;

  const progressPercentage = Math.min(100, Math.round((initialCurrentKg / targetKg) * 100));

  return {
    id: period.id,
    title: template.title,
    subtitle: template.subtitle,
    academicYear: period.code,
    academicYearLabel: `${period.label} (${period.periodLabel})`,
    startMonth: 'July',
    endMonth: 'June',
    startDateStr: period.startDateStr,
    endDateStr: period.endDateStr,
    cycleTransitionNote: period.cycleTransitionNote,
    progressPercentage,
    daysLeft: period.daysLeft,
    totalDaysInYear: period.totalDays,
    daysElapsed: period.daysElapsed,
    studentsParticipating: 0,
    hasJoined: false,
    participantsList: [],
    targetKg,
    currentKg: initialCurrentKg,
    description: template.description(period),
    rewards: template.rewards,
    themeColor: template.themeColor,
    motto: template.motto,
    isCurrentAcademicYear: period.isCurrent,
  };
}

/**
 * Returns the active campus challenge for the current academic year.
 */
export function getCurrentCampusChallenge(): CampusChallengeInfo {
  const currentPeriod = getAcademicYearPeriod();
  return getChallengeForAcademicYear(currentPeriod);
}

/**
 * Returns a list of academic year challenges (past, current, and upcoming)
 * so students can inspect the repeating BBS academic calendar.
 */
export function getAcademicYearChallengeList(): CampusChallengeInfo[] {
  const currentPeriod = getAcademicYearPeriod();
  const currentStartYear = currentPeriod.startYear;

  // Provide 2025/2026, 2026/2027 (current), 2027/2028 (upcoming), 2028/2029
  const years = [
    currentStartYear - 1, // previous
    currentStartYear,     // current
    currentStartYear + 1, // next
    currentStartYear + 2, // future
  ];

  return years.map((yr) => {
    // Generate period for July 15 of that year
    const sampleDate = new Date(yr, 6, 15);
    const period = getAcademicYearPeriod(sampleDate);
    return getChallengeForAcademicYear(period);
  });
}
