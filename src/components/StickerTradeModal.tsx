import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  ArrowRightLeft,
  Check,
  Search,
  MessageSquare,
  Send,
  AlertCircle,
  HelpCircle,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, LeaderboardUser, StickerItem, StickerTradeItem } from '../types';
import {
  allStickersCatalog,
  getStickerById,
  rarityConfigs,
} from '../data/stickersData';
import { useLanguage } from '../context/LanguageContext';
import { createStickerTradeOffer } from '../lib/campusSyncService';

interface StickerTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  targetUser?: LeaderboardUser | null;
  allUsers: LeaderboardUser[];
  onTradeProposed?: (trade: StickerTradeItem) => void;
  onNavigateToShop?: () => void;
}

export const StickerTradeModal: React.FC<StickerTradeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetUser: initialTargetUser,
  allUsers,
  onTradeProposed,
  onNavigateToShop,
}) => {
  const { t } = useLanguage();

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    initialTargetUser?.uid || ''
  );
  const [selectedOfferedStickerId, setSelectedOfferedStickerId] = useState<string>(
    (currentUser.purchasedStickers && currentUser.purchasedStickers[0]) || ''
  );
  const [selectedRequestedStickerId, setSelectedRequestedStickerId] = useState<string>('cpl_001');
  const [tradeMessage, setTradeMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Filter out self from partner list and sort alphabetically by student name
  const availablePartners = useMemo(() => {
    return allUsers
      .filter((u) => u.uid !== currentUser.id)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [allUsers, currentUser.id]);

  // Current selected partner object
  const selectedPartner = useMemo(() => {
    return availablePartners.find((u) => u.uid === selectedPartnerId) || null;
  }, [availablePartners, selectedPartnerId]);

  // Stickers owned by currentUser that can be offered
  const ownedStickers = useMemo(() => {
    const ids = currentUser.purchasedStickers || [];
    return ids
      .map((id) => getStickerById(id))
      .filter((s): s is StickerItem => Boolean(s));
  }, [currentUser.purchasedStickers]);

  // Available stickers to request from catalog or partner's inventory
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogRarityFilter, setCatalogRarityFilter] = useState<string>('all');

  const filteredCatalogStickers = useMemo(() => {
    let list = allStickersCatalog;
    // If partner has known stickers, show them first or filterable
    if (catalogRarityFilter !== 'all') {
      list = list.filter((s) => s.rarity === catalogRarityFilter);
    }
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 48); // First 48 matching stickers for fast interaction
  }, [catalogSearch, catalogRarityFilter]);

  const offeredSticker = useMemo(() => {
    return getStickerById(selectedOfferedStickerId);
  }, [selectedOfferedStickerId]);

  const requestedSticker = useMemo(() => {
    return getStickerById(selectedRequestedStickerId);
  }, [selectedRequestedStickerId]);

  const handleSubmitTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError(null);

    if (!selectedPartner) {
      setStatusError('Please select a student partner to trade with.');
      return;
    }
    if (!offeredSticker) {
      setStatusError('Please select a sticker from your album to offer.');
      return;
    }
    if (!requestedSticker) {
      setStatusError('Please select a sticker you want to receive.');
      return;
    }
    if (offeredSticker.id === requestedSticker.id) {
      setStatusError('Offered and requested stickers must be different.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createStickerTradeOffer({
        senderUid: currentUser.id || 'stu_me',
        senderName: currentUser.name || 'Student',
        senderAvatar: currentUser.avatarUrl,
        offeredStickerId: offeredSticker.id,
        offeredStickerName: offeredSticker.name,
        offeredStickerEmoji: offeredSticker.emoji,
        offeredStickerRarity: offeredSticker.rarity,
        receiverUid: selectedPartner.uid || 'stu_other',
        receiverName: selectedPartner.name,
        receiverAvatar: selectedPartner.avatar,
        requestedStickerId: requestedSticker.id,
        requestedStickerName: requestedSticker.name,
        requestedStickerEmoji: requestedSticker.emoji,
        requestedStickerRarity: requestedSticker.rarity,
        message: tradeMessage.trim() || undefined,
      });

      if (result.success) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });

        if (onTradeProposed && result.tradeId) {
          onTradeProposed({
            id: result.tradeId,
            senderUid: currentUser.id || 'stu_me',
            senderName: currentUser.name || 'Student',
            senderAvatar: currentUser.avatarUrl,
            offeredStickerId: offeredSticker.id,
            offeredStickerName: offeredSticker.name,
            offeredStickerEmoji: offeredSticker.emoji,
            offeredStickerRarity: offeredSticker.rarity,
            receiverUid: selectedPartner.uid || 'stu_other',
            receiverName: selectedPartner.name,
            receiverAvatar: selectedPartner.avatar,
            requestedStickerId: requestedSticker.id,
            requestedStickerName: requestedSticker.name,
            requestedStickerEmoji: requestedSticker.emoji,
            requestedStickerRarity: requestedSticker.rarity,
            status: 'pending',
            message: tradeMessage.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        onClose();
      } else {
        setStatusError(result.error || 'Failed to send trade proposal.');
      }
    } catch (err: any) {
      setStatusError(err?.message || 'Error communicating with trade service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-theme-card border border-theme-card rounded-3xl shadow-2xl overflow-hidden text-theme-main transition-colors duration-300"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-theme-card flex items-center justify-between gap-4 bg-theme-card-subtle">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-sm">
              🤝
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-theme-main tracking-tight">
                {t('propose_trade_title', 'Propose Sticker Trade')}
              </h2>
              <p className="text-xs text-theme-muted mt-0.5">
                {t('propose_trade_desc', 'Swap collectibles with campus peers & earn collaborative eco bonuses!')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label={t('close', 'Close')}
            className="p-2 rounded-full text-theme-muted hover:text-theme-main hover:bg-theme-card transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmitTrade} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {statusError && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-xs text-rose-400 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusError}</span>
            </div>
          )}

          {/* Step 1: Select Trade Partner */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-theme-muted uppercase tracking-wider block">
              1. {t('select_partner', 'Select Student Partner')}
            </label>
            {availablePartners.length === 0 ? (
              <div className="p-3 bg-theme-card-subtle rounded-xl text-xs text-theme-muted">
                {t('no_partners_yet', 'No other students currently registered on campus. Share EcoEat with classmates!')}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto no-scrollbar p-1">
                {availablePartners.map((u) => {
                  const isSelected = selectedPartnerId === u.uid;
                  return (
                    <button
                      key={u.uid}
                      type="button"
                      onClick={() => setSelectedPartnerId(u.uid || '')}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-theme-primary bg-theme-primary/10 ring-1 ring-theme-primary'
                          : 'border-theme-card bg-theme-card-subtle hover:border-theme-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-xl object-cover shrink-0" />
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-theme-main truncate">{u.name}</h4>
                          <p className="text-[10px] text-theme-muted truncate">
                            ⭐ Level {u.level || 1} • {u.homeroom || 'BBS PIK'}
                          </p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-theme-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Trade Visual Comparison Pill */}
          <div className="bg-theme-card-subtle border border-theme-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* You Offer */}
            <div className="flex-1 w-full text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1.5">
                {t('you_offer', 'You Offer')}
              </span>
              {offeredSticker ? (
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <div
                    className="w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shadow-sm shrink-0"
                    style={{
                      backgroundColor: offeredSticker.visualBg,
                      borderColor: offeredSticker.borderColor,
                    }}
                  >
                    <span>{offeredSticker.emoji}</span>
                  </div>
                  <div className="text-left">
                    <h5 className="text-xs font-extrabold text-theme-main leading-snug">{offeredSticker.name}</h5>
                    <span className="text-[10px] font-bold uppercase" style={{ color: rarityConfigs[offeredSticker.rarity].color }}>
                      {rarityConfigs[offeredSticker.rarity].label}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-theme-muted italic">{t('no_sticker_selected', 'Select a sticker below')}</p>
              )}
            </div>

            {/* Swap Icon */}
            <div className="w-10 h-10 rounded-full bg-theme-card border border-theme-card flex items-center justify-center text-theme-primary shrink-0 shadow-sm">
              <ArrowRightLeft className="w-5 h-5" />
            </div>

            {/* You Receive */}
            <div className="flex-1 w-full text-center sm:text-right">
              <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1.5">
                {t('you_receive', 'You Receive')}
              </span>
              {requestedSticker ? (
                <div className="flex items-center gap-3 justify-center sm:justify-end flex-row-reverse sm:flex-row">
                  <div className="text-right">
                    <h5 className="text-xs font-extrabold text-theme-main leading-snug">{requestedSticker.name}</h5>
                    <span className="text-[10px] font-bold uppercase" style={{ color: rarityConfigs[requestedSticker.rarity].color }}>
                      {rarityConfigs[requestedSticker.rarity].label}
                    </span>
                  </div>
                  <div
                    className="w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shadow-sm shrink-0"
                    style={{
                      backgroundColor: requestedSticker.visualBg,
                      borderColor: requestedSticker.borderColor,
                    }}
                  >
                    <span>{requestedSticker.emoji}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-theme-muted italic">{t('no_sticker_selected', 'Select a sticker below')}</p>
              )}
            </div>
          </div>

          {/* Step 2: Choose which owned sticker to offer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider">
                2. {t('choose_sticker_to_offer', 'Choose a Sticker from your Album to Offer')}
              </label>
              <span className="text-[11px] text-theme-muted font-medium">
                {ownedStickers.length} {t('owned', 'owned')}
              </span>
            </div>

            {ownedStickers.length === 0 ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <p className="text-amber-300 font-medium">
                  {t('no_stickers_to_trade', "You don't own any stickers yet to offer in trades!")}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToShop?.();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-theme-primary text-black font-extrabold text-xs whitespace-nowrap cursor-pointer shadow-sm"
                >
                  {t('visit_shop', 'Shop Stickers')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto p-1 no-scrollbar">
                {ownedStickers.map((sticker) => {
                  const isSelected = selectedOfferedStickerId === sticker.id;
                  return (
                    <button
                      key={sticker.id}
                      type="button"
                      onClick={() => setSelectedOfferedStickerId(sticker.id)}
                      className={`p-2 rounded-2xl border flex flex-col items-center gap-1.5 min-w-[90px] shrink-0 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-theme-primary ring-2 ring-theme-primary bg-theme-primary/10 scale-105'
                          : 'border-theme-card bg-theme-card-subtle hover:border-theme-primary/60'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl border flex items-center justify-center text-xl shadow-sm"
                        style={{ backgroundColor: sticker.visualBg, borderColor: sticker.borderColor }}
                      >
                        <span>{sticker.emoji}</span>
                      </div>
                      <span className="text-[10px] font-bold text-theme-main text-center truncate max-w-[80px]">
                        {sticker.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Choose which sticker to request in return */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider">
                3. {t('choose_requested_sticker', 'Choose Desired Sticker in Return')}
              </label>

              {/* Rarity filter pills */}
              <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
                {['all', 'common', 'rare', 'epic', 'legendary'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setCatalogRarityFilter(r)}
                    className={`px-2 py-0.5 rounded-full font-bold uppercase transition-all cursor-pointer ${
                      catalogRarityFilter === r
                        ? 'bg-theme-primary text-black'
                        : 'bg-theme-card-subtle text-theme-muted hover:text-theme-main border border-theme-card'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Mini Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder={t('search_desired_sticker', 'Search catalog by sticker name or theme...')}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-theme-card-subtle border border-theme-card text-xs text-theme-main placeholder-theme-muted focus:outline-none focus:ring-1 focus:ring-theme-primary"
              />
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 no-scrollbar">
              {filteredCatalogStickers.map((sticker) => {
                const isSelected = selectedRequestedStickerId === sticker.id;
                return (
                  <button
                    key={sticker.id}
                    type="button"
                    onClick={() => setSelectedRequestedStickerId(sticker.id)}
                    className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-theme-primary ring-2 ring-theme-primary bg-theme-primary/10 scale-105'
                        : 'border-theme-card bg-theme-card-subtle hover:border-theme-primary/60'
                    }`}
                    title={`${sticker.name} (${sticker.rarity})`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg border flex items-center justify-center text-lg shadow-sm"
                      style={{ backgroundColor: sticker.visualBg, borderColor: sticker.borderColor }}
                    >
                      <span>{sticker.emoji}</span>
                    </div>
                    <span className="text-[9px] font-bold text-theme-main text-center truncate max-w-[70px]">
                      {sticker.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Optional Note to Student */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-theme-muted uppercase tracking-wider block">
              {t('optional_message', 'Optional Note to Student')}
            </label>
            <div className="relative">
              <MessageSquare className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
              <input
                type="text"
                value={tradeMessage}
                onChange={(e) => setTradeMessage(e.target.value)}
                placeholder="e.g. Let's trade during lunch break!"
                maxLength={120}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-theme-card-subtle border border-theme-card text-xs text-theme-main focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-theme-card flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-theme-card border border-theme-card hover:border-theme-primary text-theme-muted hover:text-theme-main font-bold text-xs cursor-pointer transition-colors"
            >
              {t('cancel', 'Cancel')}
            </button>

            <button
              type="submit"
              disabled={isSubmitting || ownedStickers.length === 0}
              className="px-6 py-2.5 rounded-xl bg-theme-primary text-black font-extrabold text-xs shadow-md shadow-theme-glow hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? t('sending_offer', 'Sending Offer...') : t('send_trade_proposal', 'Send Trade Proposal')}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
