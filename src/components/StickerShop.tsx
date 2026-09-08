import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Lock,
  Search,
  Camera,
  Star,
  BookOpen,
  Filter,
  Flame,
  Award,
  Download,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Info,
  X,
  Shuffle,
  ArrowUpDown,
  Tag,
  Grid,
} from 'lucide-react';
import { UserProfile, StickerItem, StickerCategory, StickerRarity } from '../types';
import { allStickersCatalog, getStickerById, rarityConfigs } from '../data/stickersData';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface StickerShopProps {
  user: UserProfile;
  onBuySticker: (sticker: StickerItem) => void;
  onEquipSticker: (stickerId: string | null) => void;
  onNavigateToCapture: () => void;
}

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'rarity' | 'name';
type OwnershipOption = 'all' | 'unowned' | 'owned';

export const StickerShop: React.FC<StickerShopProps> = ({
  user,
  onBuySticker,
  onEquipSticker,
  onNavigateToCapture,
}) => {
  const { t } = useLanguage();
  const { darkMode } = useTheme();
  const gridTopRef = useRef<HTMLDivElement>(null);

  // Navigation & Filtering State
  const [activeTab, setActiveTab] = useState<'shop' | 'album'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<StickerCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<'all' | StickerRarity>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(32);
  const [jumpPageInput, setJumpPageInput] = useState('');

  // Modals & Actions
  const [selectedStickerForModal, setSelectedStickerForModal] = useState<StickerItem | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [isRollingMystery, setIsRollingMystery] = useState(false);

  // Purchased IDs set for fast O(1) lookup
  const purchasedIds = useMemo(() => {
    return new Set(user.purchasedStickers || []);
  }, [user.purchasedStickers]);

  const equippedSticker = useMemo(() => {
    if (!user.showcaseStickerId) return null;
    return getStickerById(user.showcaseStickerId) || null;
  }, [user.showcaseStickerId]);

  // Reset pagination to page 1 whenever search, category, rarity, ownership, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, rarityFilter, ownershipFilter, searchQuery, activeTab, sortBy]);

  // Category counts for badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allStickersCatalog.length,
      clean_plate: 0,
      campus_pride: 0,
      zero_waste: 0,
      nature_planet: 0,
      culinary: 0,
    };
    for (const sticker of allStickersCatalog) {
      if (counts[sticker.category] !== undefined) {
        counts[sticker.category]++;
      }
    }
    return counts;
  }, []);

  // Rarity counts for badges
  const rarityCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allStickersCatalog.length,
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };
    for (const sticker of allStickersCatalog) {
      if (counts[sticker.rarity] !== undefined) {
        counts[sticker.rarity]++;
      }
    }
    return counts;
  }, []);

  // Filtered & Sorted Stickers Catalog
  const filteredStickers = useMemo(() => {
    let result = allStickersCatalog.filter((sticker) => {
      // Category filter
      if (selectedCategory !== 'all' && sticker.category !== selectedCategory) {
        return false;
      }
      // Rarity filter
      if (rarityFilter !== 'all' && sticker.rarity !== rarityFilter) {
        return false;
      }
      // Ownership filter
      const isOwned = purchasedIds.has(sticker.id);
      if (ownershipFilter === 'unowned' && isOwned) return false;
      if (ownershipFilter === 'owned' && !isOwned) return false;

      // Album tab forced ownership
      if (activeTab === 'album' && !isOwned) {
        return false;
      }

      // Search query (matches name, description, category, rarity, unlockedWith, or ID)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = sticker.name.toLowerCase().includes(query);
        const matchesDesc = sticker.description.toLowerCase().includes(query);
        const matchesUnlock = sticker.unlockedWith.toLowerCase().includes(query);
        const matchesId = sticker.id.toLowerCase().includes(query);
        const matchesNumber = query.replace('#', '') && sticker.id.includes(`_${query.replace('#', '')}`);
        if (!matchesName && !matchesDesc && !matchesUnlock && !matchesId && !matchesNumber) {
          return false;
        }
      }

      return true;
    });

    // Sort order
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.cost - b.cost);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.cost - a.cost);
    } else if (sortBy === 'rarity') {
      const rarityRank: Record<StickerRarity, number> = {
        legendary: 4,
        epic: 3,
        rare: 2,
        common: 1,
      };
      result.sort((a, b) => rarityRank[b.rarity] - rarityRank[a.rarity]);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [
    selectedCategory,
    rarityFilter,
    ownershipFilter,
    searchQuery,
    activeTab,
    purchasedIds,
    sortBy,
  ]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredStickers.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredStickers.length);
  const displayedStickers = useMemo(() => {
    return filteredStickers.slice(startIndex, endIndex);
  }, [filteredStickers, startIndex, endIndex]);

  const totalCollectedCount = purchasedIds.size;
  const totalCatalogCount = allStickersCatalog.length;
  const collectionPercent = Math.round((totalCollectedCount / totalCatalogCount) * 100);

  const categories: { id: StickerCategory; label: string; count: number }[] = [
    { id: 'all', label: t('shop_cat_all', 'All Stickers'), count: categoryCounts.all },
    { id: 'clean_plate', label: t('shop_cat_clean_plate', '🍽️ Clean Plate'), count: categoryCounts.clean_plate },
    { id: 'campus_pride', label: t('shop_cat_campus_pride', '🏫 BBS Campus'), count: categoryCounts.campus_pride },
    { id: 'zero_waste', label: t('shop_cat_zero_waste', '♻️ Zero Waste'), count: categoryCounts.zero_waste },
    { id: 'nature_planet', label: t('shop_cat_nature_planet', '🌍 Planet & Ocean'), count: categoryCounts.nature_planet },
    { id: 'culinary', label: t('shop_cat_culinary', '🥗 Culinary'), count: categoryCounts.culinary },
  ];

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum);
      setJumpPageInput('');
    }
  };

  const handlePurchase = (sticker: StickerItem) => {
    if (purchasedIds.has(sticker.id)) return;
    if (user.currentXp < sticker.cost) return;

    setBuyingId(sticker.id);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
    } catch {
      // Confetti fallback
    }

    setTimeout(() => {
      onBuySticker(sticker);
      setBuyingId(null);
    }, 250);
  };

  // Mystery Box / Roll Random Sticker feature
  const handleRollMysterySticker = () => {
    const unownedStickers = allStickersCatalog.filter(
      (s) => !purchasedIds.has(s.id) && s.cost <= user.currentXp
    );
    const minRequiredXp = rarityConfigs.common.minCost;
    if (unownedStickers.length === 0) {
      alert(
        user.currentXp < minRequiredXp
          ? `You need at least ${minRequiredXp.toLocaleString()} XP to roll a mystery sticker! Finish a meal to earn XP.`
          : 'You already own all eligible stickers in your current XP budget!'
      );
      return;
    }

    setIsRollingMystery(true);

    // Pick random sticker
    const randomPick = unownedStickers[Math.floor(Math.random() * unownedStickers.length)];

    setTimeout(() => {
      setIsRollingMystery(false);
      handlePurchase(randomPick);
      setSelectedStickerForModal(randomPick);
    }, 600);
  };

  const handleDownloadSticker = (sticker: StickerItem) => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 500, 500);

    // Radial glow
    const grad = ctx.createRadialGradient(250, 230, 40, 250, 230, 230);
    grad.addColorStop(0, sticker.accentColor + '55');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 500, 500);

    // White outline circle
    ctx.beginPath();
    ctx.arc(250, 220, 150, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = sticker.accentColor;
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(250, 220, 138, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // Emoji
    ctx.font = '100px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sticker.emoji, 250, 220);

    // Sticker Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(sticker.name, 250, 410);

    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('BBS PIK EcoEat • Zero Food Waste', 250, 445);

    const link = document.createElement('a');
    link.download = `${sticker.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const getRarityBadge = (rarity: StickerRarity) => {
    switch (rarity) {
      case 'common':
        return (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
            {t('sticker_rarity_common', 'Common')}
          </span>
        );
      case 'rare':
        return (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {t('sticker_rarity_rare', 'Rare')}
          </span>
        );
      case 'epic':
        return (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {t('sticker_rarity_epic', 'Epic')}
          </span>
        );
      case 'legendary':
        return (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-xs shadow-amber-500/20">
            {t('sticker_rarity_legendary', 'Legendary')}
          </span>
        );
    }
  };

  // Generate pagination numbers array e.g. [1, 2, 3, '...', 10, 11, 12, '...', 32]
  const paginationRange = useMemo(() => {
    const range: (number | string)[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= safeCurrentPage - delta && i <= safeCurrentPage + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    return range;
  }, [safeCurrentPage, totalPages]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Hero / Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-theme-card border border-theme-card p-6 sm:p-8 shadow-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-theme-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-primary/10 border border-theme-primary/20 text-theme-primary text-xs font-extrabold">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('shop_badge_tag', 'BBS PIK Campus Eco Rewards')}</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-theme-main">
                {t('shop_title', 'Campus Eco Sticker Shop')}
              </h1>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold shadow-xs">
                ✨ 1,000 Stickers To Collect!
              </span>
            </div>

            <p className="text-sm text-theme-muted leading-relaxed">
              {t(
                'shop_subtitle',
                'Exchange the XP you earned by finishing your food and returning clean dining plates for official campus eco stickers. Collect across 5 categories and showcase your zero-waste pride!'
              )}
            </p>

            {/* Quick Earn Tip & Mystery Box */}
            <div className="flex items-center gap-4 pt-1 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-theme-muted">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {t(
                    'shop_earn_tip',
                    'Clean your plate to earn +25 to +50 XP per meal!'
                  )}
                </span>
              </div>

              {/* Mystery Sticker Roll Button */}
              <button
                type="button"
                onClick={handleRollMysterySticker}
                disabled={isRollingMystery || user.currentXp < rarityConfigs.common.minCost}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                title="Roll a random affordable sticker from the 1,000 catalog"
              >
                <Shuffle className={`w-3.5 h-3.5 ${isRollingMystery ? 'animate-spin' : ''}`} />
                <span>{isRollingMystery ? 'Rolling...' : 'Mystery Sticker Roll'}</span>
              </button>
            </div>
          </div>

          {/* User Spendable XP Card */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[280px]">
            <div className="p-5 rounded-2xl bg-theme-card-subtle border border-theme-card space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-theme-muted uppercase tracking-wider">
                  {t('shop_spendable_balance', 'Spendable XP Balance')}
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {t('shop_safe_rank', 'Lifetime Rank Safe')}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span
                  id="user-current-xp-counter"
                  className="text-3xl sm:text-4xl font-black text-theme-primary tracking-tight"
                >
                  {user.currentXp.toLocaleString()}
                </span>
                <span className="text-sm font-extrabold text-theme-main">XP</span>
              </div>

              <div className="pt-2 border-t border-theme-card/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-theme-muted">
                  <BookOpen className="w-3.5 h-3.5 text-theme-primary" />
                  <span>
                    {totalCollectedCount} / {totalCatalogCount} {t('shop_stickers_owned', 'Collected')}
                  </span>
                </div>
                <span className="font-extrabold text-theme-primary">{collectionPercent}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-theme-card rounded-full overflow-hidden">
                <div
                  className="h-full bg-theme-primary transition-all duration-500 rounded-full"
                  style={{ width: `${collectionPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Button to Scan Meal to Earn XP */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNavigateToCapture}
              className="w-full py-3 px-4 rounded-2xl bg-theme-primary text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-theme-glow cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>{t('shop_btn_scan_for_xp', 'Scan Meal to Earn More XP')}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs: Shop vs Album */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-theme-card pb-4">
        <div className="flex items-center bg-theme-card-subtle p-1 rounded-2xl border border-theme-card shadow-inner">
          <button
            id="tab-btn-sticker-shop"
            onClick={() => {
              setActiveTab('shop');
              setOwnershipFilter('all');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-theme-primary text-black shadow-sm font-extrabold'
                : 'text-theme-muted hover:text-theme-main'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('shop_tab_store', 'Sticker Store')}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 text-current font-extrabold">
              1,000
            </span>
          </button>

          <button
            id="tab-btn-sticker-album"
            onClick={() => {
              setActiveTab('album');
              setOwnershipFilter('all');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'album'
                ? 'bg-theme-primary text-black shadow-sm font-extrabold'
                : 'text-theme-muted hover:text-theme-main'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t('shop_tab_album', 'My Sticker Album')}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-theme-card text-theme-main font-bold">
              {totalCollectedCount}
            </span>
          </button>
        </div>

        {/* Search Bar & Sorting */}
        <div className="flex items-center gap-3 flex-1 justify-end max-w-lg min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-theme-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('shop_search_placeholder', 'Search 1,000 stickers or ID...')}
              className="w-full bg-theme-card border border-theme-card rounded-2xl py-2 pl-10 pr-8 text-xs sm:text-sm text-theme-main placeholder:text-theme-muted/50 focus:outline-none focus:border-theme-primary transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-main cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-theme-card border border-theme-card rounded-2xl px-3 py-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-theme-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-theme-main font-medium focus:outline-none cursor-pointer"
            >
              <option value="default" className="bg-theme-card text-theme-main">Default #</option>
              <option value="price_asc" className="bg-theme-card text-theme-main">Price: Low to High</option>
              <option value="price_desc" className="bg-theme-card text-theme-main">Price: High to Low</option>
              <option value="rarity" className="bg-theme-card text-theme-main">Rarity First</option>
              <option value="name" className="bg-theme-card text-theme-main">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="space-y-3" ref={gridTopRef}>
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-theme-main text-theme-card border-theme-main shadow-sm'
                  : 'bg-theme-card text-theme-muted border-theme-card hover:border-theme-primary/50 hover:text-theme-main'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat.id
                  ? 'bg-theme-card/30 text-current'
                  : 'bg-theme-card-subtle text-theme-muted'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Secondary Filter Bar: Ownership & Rarity Pills */}
        <div className="flex items-center justify-between text-xs text-theme-muted px-1 flex-wrap gap-3 pt-1">
          {/* Ownership Filter */}
          {activeTab === 'shop' && (
            <div className="flex items-center gap-1 bg-theme-card-subtle p-1 rounded-xl border border-theme-card text-[11px]">
              <button
                onClick={() => setOwnershipFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  ownershipFilter === 'all'
                    ? 'bg-theme-card text-theme-main shadow-xs'
                    : 'text-theme-muted hover:text-theme-main'
                }`}
              >
                All (1,000)
              </button>
              <button
                onClick={() => setOwnershipFilter('unowned')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  ownershipFilter === 'unowned'
                    ? 'bg-theme-card text-theme-main shadow-xs'
                    : 'text-theme-muted hover:text-theme-main'
                }`}
              >
                Unowned ({1000 - totalCollectedCount})
              </button>
              <button
                onClick={() => setOwnershipFilter('owned')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  ownershipFilter === 'owned'
                    ? 'bg-theme-card text-theme-main shadow-xs'
                    : 'text-theme-muted hover:text-theme-main'
                }`}
              >
                Owned ({totalCollectedCount})
              </button>
            </div>
          )}

          {/* Rarity Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-theme-muted/70">{t('shop_rarity_filter', 'Rarity:')}</span>
            {(['all', 'common', 'rare', 'epic', 'legendary'] as const).map((rarity) => (
              <button
                key={rarity}
                onClick={() => setRarityFilter(rarity)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  rarityFilter === rarity
                    ? 'bg-theme-primary/20 text-theme-primary font-extrabold border border-theme-primary/40 shadow-xs'
                    : 'text-theme-muted hover:text-theme-main border border-transparent'
                }`}
              >
                <span>{rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>
                {rarity !== 'all' && (
                  <span className="text-[9px] opacity-75 font-semibold">
                    • {rarityConfigs[rarity].tierLabel}
                  </span>
                )}
                <span className="text-[9px] opacity-70">({rarityCounts[rarity]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Count & Page Info Summary */}
        <div className="flex items-center justify-between text-xs text-theme-muted px-1 flex-wrap gap-2 border-t border-theme-card/60 pt-3">
          <span>
            {t('shop_showing_count', 'Showing')} {filteredStickers.length > 0 ? startIndex + 1 : 0}–{endIndex} of{' '}
            {filteredStickers.length}{' '}
            {activeTab === 'album' ? t('shop_collected_label', 'collected stickers') : t('shop_stickers_label', 'stickers')}
          </span>

          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-theme-muted/70">Per page:</span>
            {[24, 32, 48, 64].map((size) => (
              <button
                key={size}
                onClick={() => setPageSize(size)}
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                  pageSize === size
                    ? 'bg-theme-primary text-black font-extrabold'
                    : 'text-theme-muted hover:text-theme-main'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredStickers.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-theme-card border border-theme-card space-y-4">
          <div className="w-16 h-16 rounded-full bg-theme-card-subtle flex items-center justify-center mx-auto text-3xl">
            {activeTab === 'album' ? '📓' : '🔍'}
          </div>
          <h3 className="text-base font-extrabold text-theme-main">
            {activeTab === 'album'
              ? t('shop_album_empty_title', 'No stickers in your album yet!')
              : t('shop_no_stickers_found', 'No stickers match your filter')}
          </h3>
          <p className="text-xs text-theme-muted max-w-sm mx-auto">
            {activeTab === 'album'
              ? t(
                  'shop_album_empty_desc',
                  'Browse the Sticker Store to purchase your first eco sticker with your dining XP!'
                )
              : t('shop_try_other_filter', 'Try clearing your search query or selecting a different category.')}
          </p>
          {activeTab === 'album' && (
            <button
              onClick={() => setActiveTab('shop')}
              className="py-2.5 px-5 rounded-xl bg-theme-primary text-black font-extrabold text-xs shadow-md cursor-pointer"
            >
              {t('shop_btn_browse_store', 'Browse Sticker Store')}
            </button>
          )}
        </div>
      )}

      {/* Sticker Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {displayedStickers.map((sticker) => {
          const isOwned = purchasedIds.has(sticker.id);
          const isEquipped = user.showcaseStickerId === sticker.id;
          const canAfford = user.currentXp >= sticker.cost;
          const isPurchasing = buyingId === sticker.id;

          return (
            <motion.div
              key={sticker.id}
              id={`sticker-card-${sticker.id}`}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className={`group relative flex flex-col justify-between rounded-3xl bg-theme-card border transition-all duration-300 p-5 overflow-hidden ${
                isEquipped
                  ? 'border-theme-primary ring-2 ring-theme-primary/30 shadow-lg shadow-theme-glow'
                  : isOwned
                  ? 'border-theme-card hover:border-theme-primary/50 shadow-sm'
                  : 'border-theme-card hover:border-theme-card-subtle'
              }`}
            >
              {/* Equipped Ribbon */}
              {isEquipped && (
                <div className="absolute -top-1 -right-1 z-20">
                  <div className="bg-theme-primary text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-black" />
                    <span>{t('shop_equipped_badge', 'Equipped')}</span>
                  </div>
                </div>
              )}

              {/* Card Header: Rarity Tag & Category & ID */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {getRarityBadge(sticker.rarity)}
                  <span className="text-[10px] font-bold text-theme-muted/60">
                    #{sticker.id.replace('sticker_', '')}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">
                  {sticker.category.replace('_', ' ')}
                </span>
              </div>

              {/* Center Sticker Illustration Area */}
              <div
                onClick={() => setSelectedStickerForModal(sticker)}
                className="my-4 py-6 px-4 rounded-2xl bg-gradient-to-b from-theme-card-subtle/80 to-theme-card-subtle/20 border border-theme-card flex flex-col items-center justify-center relative cursor-pointer group-hover:scale-105 transition-transform duration-300"
              >
                {/* Die-cut sticker glow */}
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-xl transition-all relative"
                  style={{
                    backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                    boxShadow: `0 8px 24px -4px ${sticker.accentColor}40`,
                    border: `4px solid ${sticker.accentColor}`,
                  }}
                >
                  <span className="select-none filter drop-shadow-md">{sticker.emoji}</span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
                </div>

                <span className="mt-3 text-[10px] font-bold text-theme-muted group-hover:text-theme-primary transition-colors flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  <span>{t('shop_click_to_inspect', 'Inspect & Download')}</span>
                </span>
              </div>

              {/* Sticker Details */}
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm font-black text-theme-main line-clamp-1">{sticker.name}</h3>
                <p className="text-xs text-theme-muted leading-relaxed line-clamp-2">
                  {sticker.description}
                </p>

                <div className="pt-1 text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span className="line-clamp-1">{sticker.unlockedWith}</span>
                </div>
              </div>

              {/* Card Footer: Action Controls */}
              <div className="pt-4 mt-2 border-t border-theme-card/60 flex items-center justify-between gap-2">
                {isOwned ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onEquipSticker(isEquipped ? null : sticker.id)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isEquipped
                          ? 'bg-theme-card-subtle text-theme-muted hover:text-theme-main border border-theme-card'
                          : 'bg-theme-primary text-black hover:opacity-90 shadow-sm'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isEquipped ? 'fill-theme-muted' : 'fill-black'}`} />
                      <span>
                        {isEquipped
                          ? t('shop_btn_unequip', 'Unequip')
                          : t('shop_btn_equip_showcase', 'Equip Showcase')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadSticker(sticker)}
                      title={t('shop_download_hint', 'Download Sticker PNG')}
                      className="p-2 rounded-xl bg-theme-card-subtle text-theme-muted hover:text-theme-main border border-theme-card transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-base font-black ${
                        sticker.rarity === 'legendary'
                          ? 'text-amber-400'
                          : sticker.rarity === 'epic'
                          ? 'text-purple-400'
                          : sticker.rarity === 'rare'
                          ? 'text-blue-400'
                          : 'text-theme-primary'
                      }`}>
                        {sticker.cost.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-theme-muted">XP</span>
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford || isPurchasing}
                      onClick={() => handlePurchase(sticker)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-theme-primary text-black hover:opacity-90 shadow-md shadow-theme-glow active:scale-95'
                          : 'bg-theme-card-subtle text-theme-muted/60 border border-theme-card cursor-not-allowed'
                      }`}
                    >
                      {isPurchasing ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : canAfford ? (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{t('shop_btn_buy', 'Buy Sticker')}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-theme-muted/50" />
                          <span>
                            {t('shop_need_more_prefix', 'Need')} {(sticker.cost - user.currentXp).toLocaleString()} XP
                          </span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-theme-card mt-6">
          <div className="text-xs text-theme-muted">
            Page <span className="font-bold text-theme-main">{safeCurrentPage}</span> of{' '}
            <span className="font-bold text-theme-main">{totalPages}</span> ({filteredStickers.length} stickers)
          </div>

          {/* Page Buttons Range */}
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={safeCurrentPage === 1}
              className="p-2 rounded-xl bg-theme-card border border-theme-card text-theme-muted hover:text-theme-main disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Prev Page */}
            <button
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="p-2 rounded-xl bg-theme-card border border-theme-card text-theme-muted hover:text-theme-main disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1 px-1">
              {paginationRange.map((item, idx) => {
                if (item === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-xs text-theme-muted">
                      ...
                    </span>
                  );
                }
                const pageNum = Number(item);
                const isActive = pageNum === safeCurrentPage;
                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-theme-primary text-black font-black shadow-sm'
                        : 'bg-theme-card text-theme-muted hover:text-theme-main hover:bg-theme-card-subtle'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className="p-2 rounded-xl bg-theme-card border border-theme-card text-theme-muted hover:text-theme-main disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="p-2 rounded-xl bg-theme-card border border-theme-card text-theme-muted hover:text-theme-main disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          {/* Jump to Page Form */}
          <form onSubmit={handleJumpToPage} className="flex items-center gap-2 text-xs">
            <span className="text-theme-muted">Go to:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              placeholder="#"
              className="w-14 bg-theme-card border border-theme-card rounded-xl py-1 px-2 text-center text-theme-main focus:outline-none focus:border-theme-primary"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-xl bg-theme-card-subtle hover:bg-theme-primary hover:text-black border border-theme-card text-theme-main font-bold cursor-pointer transition-colors"
            >
              Go
            </button>
          </form>
        </div>
      )}

      {/* Inspect & Sticker Details Modal */}
      <AnimatePresence>
        {selectedStickerForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-theme-card border border-theme-card rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedStickerForModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-theme-card-subtle text-theme-muted hover:text-theme-main border border-theme-card cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-2">
                {getRarityBadge(selectedStickerForModal.rarity)}
                <span className="text-xs font-bold text-theme-muted uppercase tracking-wider">
                  {selectedStickerForModal.category.replace('_', ' ')} • #{selectedStickerForModal.id.replace('sticker_', '')}
                </span>
              </div>

              {/* Big Die-Cut Preview */}
              <div className="py-8 px-6 rounded-2xl bg-gradient-to-b from-theme-card-subtle/80 to-theme-card-subtle/20 border border-theme-card flex flex-col items-center justify-center relative">
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-2xl relative"
                  style={{
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                    boxShadow: `0 12px 32px -4px ${selectedStickerForModal.accentColor}50`,
                    border: `5px solid ${selectedStickerForModal.accentColor}`,
                  }}
                >
                  <span className="select-none filter drop-shadow-lg">{selectedStickerForModal.emoji}</span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/25 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-black text-theme-main">{selectedStickerForModal.name}</h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  {selectedStickerForModal.description}
                </p>
                <div className="pt-1 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{selectedStickerForModal.unlockedWith}</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center gap-3">
                {purchasedIds.has(selectedStickerForModal.id) ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const isEquipped = user.showcaseStickerId === selectedStickerForModal.id;
                        onEquipSticker(isEquipped ? null : selectedStickerForModal.id);
                        setSelectedStickerForModal(null);
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-theme-primary text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Star className="w-4 h-4 fill-black" />
                      <span>
                        {user.showcaseStickerId === selectedStickerForModal.id
                          ? t('shop_btn_unequip', 'Unequip Showcase')
                          : t('shop_btn_equip_showcase', 'Equip on Profile')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadSticker(selectedStickerForModal)}
                      className="py-3 px-4 rounded-xl bg-theme-card-subtle text-theme-main border border-theme-card font-bold text-xs flex items-center gap-2 hover:border-theme-primary cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PNG</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={user.currentXp < selectedStickerForModal.cost}
                    onClick={() => {
                      handlePurchase(selectedStickerForModal);
                      setSelectedStickerForModal(null);
                    }}
                    className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                      user.currentXp >= selectedStickerForModal.cost
                        ? 'bg-theme-primary text-black'
                        : 'bg-theme-card-subtle text-theme-muted cursor-not-allowed border border-theme-card'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {user.currentXp >= selectedStickerForModal.cost
                        ? `Buy for ${selectedStickerForModal.cost.toLocaleString()} XP`
                        : `Need ${(selectedStickerForModal.cost - user.currentXp).toLocaleString()} more XP`}
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
