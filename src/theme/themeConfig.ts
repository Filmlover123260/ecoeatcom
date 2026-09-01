export type AppThemeId = 'eco-green' | 'ocean-teal' | 'solar-amber' | 'lavender-bloom' | 'cyber-obsidian';

export interface ThemeDefinition {
  id: AppThemeId;
  name: string;
  category: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  gradient: string;
  previewBgDark: string;
  previewBgLight: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  icon: string;
}

export const APP_THEMES: ThemeDefinition[] = [
  {
    id: 'eco-green',
    name: 'Eco Emerald',
    category: 'Nature & Campus',
    description: 'Signature vibrant forest emerald palette inspired by campus green initiatives.',
    primaryColor: '#22C55E',
    accentColor: '#4ADE80',
    gradient: 'from-[#22C55E] to-[#4ADE80]',
    previewBgDark: '#0A120C',
    previewBgLight: '#F4F9F5',
    badgeBg: 'bg-[#183D24]',
    badgeBorder: 'border-[#22C55E]/40',
    badgeText: 'text-[#4ADE80]',
    icon: 'Leaf',
  },
  {
    id: 'ocean-teal',
    name: 'Ocean Teal',
    category: 'Marine Conservation',
    description: 'Cool refreshing marine cyan & teal palette for zero-waste ocean protection.',
    primaryColor: '#06B6D4',
    accentColor: '#38BDF8',
    gradient: 'from-[#06B6D4] to-[#38BDF8]',
    previewBgDark: '#071318',
    previewBgLight: '#F0F8FA',
    badgeBg: 'bg-[#0E2833]',
    badgeBorder: 'border-[#06B6D4]/40',
    badgeText: 'text-[#38BDF8]',
    icon: 'Waves',
  },
  {
    id: 'solar-amber',
    name: 'Solar Amber',
    category: 'Clean Energy',
    description: 'Warm golden sunrise and renewable solar energy theme with rich amber tones.',
    primaryColor: '#F59E0B',
    accentColor: '#FBBF24',
    gradient: 'from-[#F59E0B] to-[#FBBF24]',
    previewBgDark: '#14100A',
    previewBgLight: '#FDF8F0',
    badgeBg: 'bg-[#2E1E0B]',
    badgeBorder: 'border-[#F59E0B]/40',
    badgeText: 'text-[#FBBF24]',
    icon: 'Sun',
  },
  {
    id: 'lavender-bloom',
    name: 'Lavender Bloom',
    category: 'Biodiversity Flora',
    description: 'Vibrant wildflower purple & amethyst tones honoring campus botanical gardens.',
    primaryColor: '#A855F7',
    accentColor: '#C084FC',
    gradient: 'from-[#A855F7] to-[#C084FC]',
    previewBgDark: '#110A17',
    previewBgLight: '#FAF5FF',
    badgeBg: 'bg-[#291238]',
    badgeBorder: 'border-[#A855F7]/40',
    badgeText: 'text-[#C084FC]',
    icon: 'Sparkles',
  },
  {
    id: 'cyber-obsidian',
    name: 'Cyber Obsidian',
    category: 'Tech Eco Warrior',
    description: 'High-contrast obsidian slate paired with sharp electric lime highlights.',
    primaryColor: '#10B981',
    accentColor: '#84CC16',
    gradient: 'from-[#10B981] to-[#84CC16]',
    previewBgDark: '#090A0F',
    previewBgLight: '#F1F5F9',
    badgeBg: 'bg-[#14261B]',
    badgeBorder: 'border-[#84CC16]/40',
    badgeText: 'text-[#A3E635]',
    icon: 'Zap',
  },
];
