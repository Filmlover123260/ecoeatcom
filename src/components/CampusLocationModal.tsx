import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Users,
  Compass,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Radio,
  Search,
  Building2,
  Coffee,
  X,
  Clock,
  Send,
  RefreshCw,
  Navigation,
  ChevronRight,
  Info,
  Map as MapIcon,
} from 'lucide-react';
import { UserProfile, LeaderboardUser, GroundedDiningPlace, StickerTradeItem } from '../types';
import { getStickerById } from '../data/stickersData';
import { useLanguage } from '../context/LanguageContext';
import { updateUserCampusLocation } from '../lib/campusSyncService';
import { CampusRealtimeMap } from './CampusRealtimeMap';

interface CampusLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allUsers: LeaderboardUser[];
  onOpenTradeWithUser: (targetUser: LeaderboardUser) => void;
  onUserLocationUpdated?: (locationName: string, mapUri?: string) => void;
}

export const CampusLocationModal: React.FC<CampusLocationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onOpenTradeWithUser,
  onUserLocationUpdated,
}) => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'map' | 'students' | 'dining_spots'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpotFilter, setSelectedSpotFilter] = useState<string>('all');
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [currentSelectedLocation, setCurrentSelectedLocation] = useState(
    currentUser.locationName || 'BBS PIK Main Student Dining Hall'
  );
  const [isLoadingGrounded, setIsLoadingGrounded] = useState(false);
  const [groundedPlaces, setGroundedPlaces] = useState<GroundedDiningPlace[]>([]);
  const [groundedSummary, setGroundedSummary] = useState<string>('');
  const [groundedSource, setGroundedSource] = useState<string>('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(
    currentUser.latitude && currentUser.longitude
      ? { lat: currentUser.latitude, lng: currentUser.longitude }
      : { lat: -6.1085, lng: 106.7412 }
  );
  const [locationStatusMessage, setLocationStatusMessage] = useState<string | null>(null);

  // Fetch Google Maps grounded dining spots on mount or refresh
  const fetchNearbyDiningSpots = async (coords?: { lat: number; lng: number }, queryText?: string) => {
    setIsLoadingGrounded(true);
    try {
      const payload: any = {};
      if (coords) {
        payload.latitude = coords.lat;
        payload.longitude = coords.lng;
      }
      if (queryText) {
        payload.query = queryText;
      }

      const res = await fetch('/api/campus/nearby-dining-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.places)) {
          setGroundedPlaces(data.places);
        }
        if (data.markdownSummary) {
          setGroundedSummary(data.markdownSummary);
        }
        if (data.source) {
          setGroundedSource(data.source);
        }
      }
    } catch (err) {
      console.log('Notice fetching campus dining spots:', (err as any)?.message || err);
    } finally {
      setIsLoadingGrounded(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNearbyDiningSpots(userCoords || undefined);
    }
  }, [isOpen]);

  // Request device GPS location via browser navigator.geolocation
  const handleDetectDeviceLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatusMessage('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatusMessage('Acquiring your campus coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setLocationStatusMessage('GPS coordinates updated! Searching nearby dining spots...');
        fetchNearbyDiningSpots(coords);
        setTimeout(() => setLocationStatusMessage(null), 4000);
      },
      (err) => {
        console.log('Geolocation prompt status:', err.message);
        setLocationStatusMessage('Using BBS PIK Campus coordinates (Pantai Indah Kapuk, Jakarta).');
        setTimeout(() => setLocationStatusMessage(null), 3500);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Change student's current campus check-in location
  const handleCheckInLocation = async (place: { title: string; uri?: string; latitude?: number; longitude?: number }) => {
    setIsUpdatingLocation(true);
    try {
      await updateUserCampusLocation(currentUser, {
        locationName: place.title,
        locationMapUri: place.uri,
        latitude: place.latitude,
        longitude: place.longitude,
      });
      setCurrentSelectedLocation(place.title);
      onUserLocationUpdated?.(place.title, place.uri);
      setLocationStatusMessage(`Checked in to "${place.title}"! Other students can now see you here.`);
      setTimeout(() => setLocationStatusMessage(null), 4000);
    } catch (err) {
      console.error('Failed to update location:', err);
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  // Filter students based on location or search
  const filteredUsers = allUsers.filter((u) => {
    const isSelf = u.uid === currentUser.id;
    if (isSelf) return false;

    const matchesSearch =
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.locationName && u.locationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.grade && u.grade.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpot =
      selectedSpotFilter === 'all' ||
      (u.locationName && u.locationName.toLowerCase().includes(selectedSpotFilter.toLowerCase()));

    return matchesSearch && matchesSpot;
  });

  // Calculate distinct location spots for filter chips
  const distinctLocations = Array.from(
    new Set(allUsers.map((u) => u.locationName || 'BBS PIK Main Student Dining Hall'))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="w-full h-[100dvh] sm:h-auto max-w-4xl sm:max-h-[92vh] flex flex-col bg-theme-card border-0 sm:border border-theme-card rounded-none sm:rounded-3xl shadow-2xl overflow-hidden text-theme-main transition-colors duration-300"
      >
        {/* Desktop Header - removed on mobile screen so mobile turns into pure full-screen map */}
        <div className="hidden sm:flex p-4 sm:p-6 border-b border-theme-card items-center justify-between gap-4 bg-theme-card-subtle shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-theme-primary/15 border border-theme-primary/30 flex items-center justify-center text-theme-primary shadow-sm">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-theme-main tracking-tight">
                  {t('campus_radar_title', 'Campus Student Locations & Dining Radar')}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-ping" />
                  <span>{t('live', 'Live')}</span>
                </span>
              </div>
              <p className="text-xs text-theme-muted mt-0.5">
                {t(
                  'campus_radar_desc',
                  "See other students' dining locations, meet for clean plates, and trade collectible stickers!"
                )}
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

        {/* Current User Check-in Strip ("Your location" part - kept on both mobile and desktop) */}
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 bg-theme-primary/10 border-b border-theme-card flex items-center justify-between gap-2 text-xs shrink-0 z-20">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-theme-primary text-black flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
              📍
            </div>
            <div className="truncate">
              <span className="text-theme-muted font-medium">{t('your_location', 'Your Location:')} </span>
              <strong className="text-theme-main font-bold">{currentSelectedLocation}</strong>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleDetectDeviceLocation}
              disabled={isUpdatingLocation}
              className="px-2.5 py-1.5 rounded-xl bg-theme-card border border-theme-card hover:border-theme-primary text-theme-main font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm text-xs"
              title={t('detect_gps', 'Update with Device GPS')}
            >
              <Navigation className="w-3.5 h-3.5 text-theme-primary" />
              <span className="hidden sm:inline">{t('use_gps', 'Device GPS')}</span>
              <span className="sm:hidden font-bold">GPS</span>
            </button>

            <button
              onClick={() => fetchNearbyDiningSpots(userCoords || undefined)}
              disabled={isLoadingGrounded}
              className="p-1.5 rounded-xl bg-theme-card border border-theme-card hover:border-theme-primary text-theme-muted hover:text-theme-main transition-colors cursor-pointer"
              title={t('refresh_radar', 'Refresh Radar')}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGrounded ? 'animate-spin text-theme-primary' : ''}`} />
            </button>

            {/* Close button on mobile directly in the "Your Location" bar */}
            <button
              onClick={onClose}
              aria-label={t('close', 'Close')}
              className="sm:hidden p-1.5 rounded-xl bg-theme-card border border-theme-card text-theme-muted hover:text-theme-main hover:bg-theme-card-subtle transition-colors cursor-pointer ml-1"
              title={t('close', 'Close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {locationStatusMessage && (
          <div className="px-4 sm:px-6 py-1.5 sm:py-2 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 shrink-0 z-20">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{locationStatusMessage}</span>
          </div>
        )}

        {/* Tab Switcher & Search Bar (Desktop only, so mobile is 100% full screen map) */}
        <div className="hidden sm:flex p-4 sm:px-6 sm:pt-4 sm:pb-2 flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-theme-card/60 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-theme-card-subtle p-1 rounded-2xl border border-theme-card shrink-0">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-theme-primary text-black shadow-sm'
                  : 'text-theme-muted hover:text-theme-main'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{t('live_map_tab', 'Real-Time Map')}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-theme-primary text-black shadow-sm'
                  : 'text-theme-muted hover:text-theme-main'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>
                {t('students_nearby', 'Students List')} ({allUsers.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab('dining_spots')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'dining_spots'
                  ? 'bg-theme-primary text-black shadow-sm'
                  : 'text-theme-muted hover:text-theme-main'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t('dining_spots_tab', 'Dining Halls')}</span>
              {groundedPlaces.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-theme-card text-theme-primary border border-theme-card">
                  {groundedPlaces.length}
                </span>
              )}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'students'
                  ? t('search_students_placeholder', 'Search students by name, grade, or dining spot...')
                  : t('search_spots_placeholder', 'Search dining halls or eateries...')
              }
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-theme-card border border-theme-card text-xs text-theme-main placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-main"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Location Spot Filters (if on students tab) */}
        {activeTab === 'students' && distinctLocations.length > 1 && (
          <div className="px-4 sm:px-6 py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-theme-card/40 text-xs">
            <span className="text-theme-muted font-bold text-[11px] whitespace-nowrap mr-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-theme-primary" />
              {t('filter_by_spot', 'Spot:')}
            </span>
            <button
              onClick={() => setSelectedSpotFilter('all')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedSpotFilter === 'all'
                  ? 'bg-theme-primary text-black shadow-sm'
                  : 'bg-theme-card text-theme-muted hover:text-theme-main border border-theme-card'
              }`}
            >
              {t('all_locations', 'All Locations')}
            </button>
            {distinctLocations.map((spot) => (
              <button
                key={spot}
                onClick={() => setSelectedSpotFilter(spot)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedSpotFilter === spot
                    ? 'bg-theme-primary text-black shadow-sm'
                    : 'bg-theme-card text-theme-muted hover:text-theme-main border border-theme-card'
                }`}
              >
                {spot}
              </button>
            ))}
          </div>
        )}

        {/* Content Area - on mobile turns 100% into the map */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden sm:overflow-y-auto p-0 sm:p-6">
          {activeTab === 'map' ? (
            <div className="flex-1 flex flex-col h-full w-full min-h-0">
              <CampusRealtimeMap
                currentUser={currentUser}
                allUsers={allUsers}
                diningSpots={groundedPlaces}
                onOpenTradeWithUser={onOpenTradeWithUser}
                onUserLocationUpdated={onUserLocationUpdated}
              />
            </div>
          ) : activeTab === 'students' ? (
            /* Student Location Cards */
            <div className="p-4 sm:p-0 space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center bg-theme-card-subtle rounded-2xl border border-theme-card space-y-2">
                  <div className="text-3xl">📡</div>
                  <h4 className="text-sm font-bold text-theme-main">
                    {t('no_students_found', 'No students found at this location.')}
                  </h4>
                  <p className="text-xs text-theme-muted max-w-sm mx-auto">
                    {t(
                      'no_students_sub',
                      'Try choosing "All Locations" or tell classmates to log into EcoEat to appear on the live radar!'
                    )}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredUsers.map((u) => {
                    const showcaseSticker = u.showcaseStickerId ? getStickerById(u.showcaseStickerId) : null;
                    const stickerCount = (u.purchasedStickers || []).length;
                    const userLocation = u.locationName || 'BBS PIK Main Student Dining Hall';
                    const mapLink =
                      u.locationMapUri ||
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(userLocation)}`;

                    return (
                      <div
                        key={u.uid}
                        className="bg-theme-card border border-theme-card hover:border-theme-primary/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group relative overflow-hidden"
                      >
                        {/* Top: Student Profile Info */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-12 h-12 rounded-2xl object-cover border border-theme-card group-hover:scale-105 transition-transform"
                              />
                              {u.isOnline && (
                                <span
                                  className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-theme-card"
                                  title="Online right now"
                                />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-extrabold text-theme-main leading-tight group-hover:text-theme-primary transition-colors">
                                  {u.name}
                                </h4>
                                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-theme-card-subtle text-theme-muted border border-theme-card">
                                  {u.grade || 'Grade 9'}
                                </span>
                              </div>
                              <p className="text-xs text-theme-muted mt-0.5">
                                {u.title || 'Eco Student'} • {u.xpFormatted}
                              </p>
                            </div>
                          </div>

                          {/* Showcase sticker badge if equipped */}
                          {showcaseSticker && (
                            <div
                              className="w-10 h-10 rounded-xl border flex items-center justify-center text-xl shrink-0 shadow-sm"
                              style={{
                                backgroundColor: showcaseSticker.visualBg,
                                borderColor: showcaseSticker.borderColor,
                              }}
                              title={`Showcasing: ${showcaseSticker.name} (${showcaseSticker.rarity})`}
                            >
                              <span>{showcaseSticker.emoji}</span>
                            </div>
                          )}
                        </div>

                        {/* Middle: Student Dining Location Strip with Google Maps link */}
                        <div className="bg-theme-card-subtle border border-theme-card rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-4 h-4 text-theme-primary shrink-0" />
                            <span className="font-semibold text-theme-main truncate">{userLocation}</span>
                          </div>
                          <a
                            href={mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-theme-primary hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                            title="Open in Google Maps"
                          >
                            <span>Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        {/* Bottom: Sticker Inventory & Trade Button */}
                        <div className="flex items-center justify-between pt-1 border-t border-theme-card/60 gap-2">
                          <div className="flex items-center gap-1 text-[11px] text-theme-muted">
                            <span>🏷️</span>
                            <span>
                              {stickerCount > 0
                                ? `${stickerCount} ${stickerCount === 1 ? 'sticker' : 'stickers'} owned`
                                : 'No stickers yet'}
                            </span>
                          </div>

                          <button
                            onClick={() => onOpenTradeWithUser(u)}
                            className="px-3.5 py-1.5 rounded-xl bg-theme-primary text-black font-extrabold text-xs shadow-sm flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                          >
                            <span>🤝 {t('trade_stickers_btn', 'Trade Stickers')}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Google Maps Grounded Campus Dining Halls & Eco Spots */
            <div className="space-y-4">
              {groundedSummary && (
                <div className="p-4 bg-theme-primary/10 border border-theme-primary/30 rounded-2xl text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-theme-primary">
                    <Sparkles className="w-4 h-4" />
                    <span>{t('maps_grounded_intel', 'Google Maps Grounded Dining Data')}</span>
                  </div>
                  <p className="text-theme-main leading-relaxed">{groundedSummary}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {groundedPlaces.map((place, idx) => {
                  const isCurrent = currentSelectedLocation.toLowerCase() === place.title.toLowerCase();

                  return (
                    <div
                      key={idx}
                      className={`bg-theme-card border rounded-2xl p-4 shadow-sm transition-all flex flex-col justify-between gap-3 ${
                        isCurrent
                          ? 'border-theme-primary ring-1 ring-theme-primary bg-theme-card/90'
                          : 'border-theme-card hover:border-theme-primary/60'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-extrabold text-theme-main leading-tight flex items-center gap-1.5">
                              <span>{place.title}</span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-theme-primary text-black">
                                  {t('current', 'You are here')}
                                </span>
                              )}
                            </h4>
                            {place.category && (
                              <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">
                                {place.category}
                              </span>
                            )}
                          </div>

                          {/* Official Google Maps URI Link */}
                          <a
                            href={place.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl bg-theme-card-subtle border border-theme-card hover:border-theme-primary text-theme-primary transition-all cursor-pointer shrink-0"
                            title={t('view_on_google_maps', 'View on Google Maps')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>

                        {place.address && (
                          <div className="flex items-center gap-1.5 text-xs text-theme-muted">
                            <MapPin className="w-3.5 h-3.5 text-theme-primary shrink-0" />
                            <span className="truncate">{place.address}</span>
                          </div>
                        )}

                        {place.description && (
                          <p className="text-xs text-theme-muted line-clamp-2 leading-relaxed">
                            {place.description}
                          </p>
                        )}

                        {/* Review Snippets from GroundingChunks if available */}
                        {Array.isArray(place.reviewSnippets) && place.reviewSnippets.length > 0 && (
                          <div className="mt-2 p-2 bg-theme-card-subtle rounded-xl border border-theme-card text-[11px] text-theme-muted italic">
                            "{place.reviewSnippets[0]}"
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-theme-card flex items-center justify-between gap-2">
                        <a
                          href={place.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>{t('open_google_maps', 'Open Google Maps')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <button
                          onClick={() => handleCheckInLocation(place)}
                          disabled={isCurrent || isUpdatingLocation}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isCurrent
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                              : 'bg-theme-primary text-black hover:opacity-90 active:scale-95 shadow-sm'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isCurrent ? t('checked_in', 'Checked In') : t('check_in_here', 'Check In Here')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 sm:px-6 bg-theme-card-subtle border-t border-theme-card flex items-center justify-between text-xs text-theme-muted">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-theme-primary shrink-0" />
            <span className="text-[11px]">
              {t(
                'location_privacy_note',
                'Locations are verified with Google Maps data to promote real-world student interaction and clean plate challenges.'
              )}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-theme-card border border-theme-card hover:border-theme-primary text-theme-main font-bold text-xs cursor-pointer transition-colors"
          >
            {t('done', 'Done')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
