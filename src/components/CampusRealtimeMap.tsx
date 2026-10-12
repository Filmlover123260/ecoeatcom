import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  Crosshair,
  Compass,
  Users,
  Radio,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Building2,
  Utensils,
  Maximize2,
  Minimize2,
  Clock,
  ArrowRightLeft,
  X,
} from 'lucide-react';
import { UserProfile, LeaderboardUser, GroundedDiningPlace } from '../types';
import { getStickerById } from '../data/stickersData';
import { useLanguage } from '../context/LanguageContext';
import { updateUserCampusLocation } from '../lib/campusSyncService';

interface CampusRealtimeMapProps {
  currentUser: UserProfile;
  allUsers: LeaderboardUser[];
  diningSpots?: GroundedDiningPlace[];
  onOpenTradeWithUser: (targetUser: LeaderboardUser) => void;
  onUserLocationUpdated?: (locationName: string, mapUri?: string) => void;
  className?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// BBS PIK Default Campus Coordinates
const BBS_CAMPUS_DEFAULT = { lat: -6.1085, lng: 106.7412 };

export const CampusRealtimeMap: React.FC<CampusRealtimeMapProps> = ({
  currentUser,
  allUsers,
  diningSpots = [],
  onOpenTradeWithUser,
  onUserLocationUpdated,
  className = '',
  isExpanded = false,
  onToggleExpand,
}) => {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const spotsLayerRef = useRef<L.LayerGroup | null>(null);

  // Real-time tracking state
  const [isWatchActive, setIsWatchActive] = useState<boolean>(true);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(currentUser.locationAccuracy || null);
  const [lastPingTime, setLastPingTime] = useState<Date | null>(
    currentUser.locationUpdatedAt ? new Date(currentUser.locationUpdatedAt) : new Date()
  );
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<GroundedDiningPlace | null>(null);
  const [tileStyle, setTileStyle] = useState<'dark' | 'streets' | 'satellite'>('dark');
  const [filterQuery, setFilterQuery] = useState('');
  const [showSpots, setShowSpots] = useState<boolean>(true);
  const [showStudents, setShowStudents] = useState<boolean>(true);

  // Current live coordinates of the user
  const [myCoords, setMyCoords] = useState<{ lat: number; lng: number }>({
    lat: typeof currentUser.latitude === 'number' ? currentUser.latitude : BBS_CAMPUS_DEFAULT.lat,
    lng: typeof currentUser.longitude === 'number' ? currentUser.longitude : BBS_CAMPUS_DEFAULT.lng,
  });

  // Track last resolved coordinates to avoid redundant network/database writes
  const lastResolvedCoordsRef = useRef<{ lat: number; lng: number } | null>(
    typeof currentUser.latitude === 'number' && typeof currentUser.longitude === 'number'
      ? { lat: currentUser.latitude, lng: currentUser.longitude }
      : null
  );
  const lastResolveTimeRef = useRef<number>(Date.now());

  // Calculate distance in meters between two lat/lng points
  const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // Reverse geocode real coordinates to real place name
  const resolveRealLocation = async (lat: number, lng: number, accuracy?: number) => {
    lastResolvedCoordsRef.current = { lat, lng };
    lastResolveTimeRef.current = Date.now();
    setIsGeocoding(true);
    try {
      const res = await fetch('/api/reverse-geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });

      if (res.ok) {
        const data = await res.json();
        const locName = data.locationName || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        const mapUri = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

        // Sync real coordinates and authentic resolved place to Firestore
        await updateUserCampusLocation(currentUser, {
          locationName: locName,
          latitude: lat,
          longitude: lng,
          locationAccuracy: accuracy,
          locationAddress: data.formattedAddress,
          locationMapUri: mapUri,
        });

        onUserLocationUpdated?.(locName, mapUri);
        setLastPingTime(new Date());
      }
    } catch (err) {
      console.log('Real reverse geocode note:', (err as any)?.message || err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Continuous real-time GPS tracking using navigator.geolocation.watchPosition
  useEffect(() => {
    if (!isWatchActive) {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      return;
    }

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    let isSubscribed = true;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        if (!isSubscribed) return;
        const { latitude, longitude, accuracy } = pos.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setMyCoords(newCoords);
        setGpsAccuracy(Math.round(accuracy));
        setGpsError(null);
        setLastPingTime(new Date());

        // Check if movement exceeds 12 meters or if 30s elapsed since last sync
        const lastCoords = lastResolvedCoordsRef.current;
        const timeSinceLastResolve = Date.now() - lastResolveTimeRef.current;
        const movedMeters = lastCoords
          ? calculateDistanceMeters(lastCoords.lat, lastCoords.lng, latitude, longitude)
          : Infinity;

        if (!lastCoords || movedMeters >= 12 || timeSinceLastResolve >= 30000) {
          resolveRealLocation(latitude, longitude, Math.round(accuracy));
        }
      },
      (err) => {
        if (!isSubscribed) return;
        console.log('Geolocation watch status:', err.message);
        setGpsError(
          err.code === 1
            ? 'Location permission needed to mark your live position.'
            : 'Acquiring GPS fix...'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );

    setWatchId(id);

    return () => {
      isSubscribed = false;
      navigator.geolocation.clearWatch(id);
    };
  }, [isWatchActive]);

  // One-shot manual GPS refresh
  const handleManualGpsPing = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsError(null);
    setIsGeocoding(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setMyCoords({ lat: latitude, lng: longitude });
        setGpsAccuracy(Math.round(accuracy));
        setLastPingTime(new Date());
        resolveRealLocation(latitude, longitude, Math.round(accuracy));

        // Pan map smoothly to new position
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 17, { duration: 1.2 });
        }
      },
      (err) => {
        setIsGeocoding(false);
        setGpsError(err.message || 'Could not acquire GPS position.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = myCoords.lat || BBS_CAMPUS_DEFAULT.lat;
      const initialLng = myCoords.lng || BBS_CAMPUS_DEFAULT.lng;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      // Layer groups for markers
      const spotsLayer = L.layerGroup().addTo(map);
      const markersLayer = L.layerGroup().addTo(map);

      spotsLayerRef.current = spotsLayer;
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Add zoom control in top right
      L.control.zoom({ position: 'topright' }).addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Invalidate map size so Leaflet fills full screen without gray gaps on mobile & resize
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    const t1 = setTimeout(handleResize, 100);
    const t2 = setTimeout(handleResize, 350);
    const t3 = setTimeout(handleResize, 800);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isExpanded]);

  // Update map tile layer based on tileStyle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let subdomains = 'abcd';
    let maxZoom = 20;

    if (tileStyle === 'streets') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
      maxZoom = 19;
    } else if (tileStyle === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = '';
      maxZoom = 19;
    }

    L.tileLayer(tileUrl, {
      subdomains,
      maxZoom,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    }).addTo(map);
  }, [tileStyle]);

  // Combine current user with all users for rendering
  const activeStudentList = useMemo(() => {
    const list: (LeaderboardUser | (UserProfile & { uid: string; isCurrentUser: true }))[] = [];

    // Add current user with live coordinates
    list.push({
      ...currentUser,
      uid: currentUser.id,
      isCurrentUser: true,
      latitude: myCoords.lat,
      longitude: myCoords.lng,
      isOnline: true,
    } as any);

    // Add other active students
    allUsers.forEach((u) => {
      if (u.uid !== currentUser.id) {
        list.push(u);
      }
    });

    // Filter if query is set
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      return list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.locationName && u.locationName.toLowerCase().includes(q)) ||
          (u.grade && u.grade.toLowerCase().includes(q))
      );
    }

    return list;
  }, [currentUser, allUsers, myCoords, filterQuery]);

  // Render Real-time Student & Dining Spot Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const spotsLayer = spotsLayerRef.current;

    if (!map || !markersLayer || !spotsLayer) return;

    // Clear previous markers
    markersLayer.clearLayers();
    spotsLayer.clearLayers();

    // 1. Render Dining Spots
    if (showSpots && diningSpots.length > 0) {
      diningSpots.forEach((spot) => {
        if (typeof spot.latitude !== 'number' || typeof spot.longitude !== 'number') return;

        // Custom dining spot icon
        const spotIcon = L.divIcon({
          className: 'custom-dining-marker',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          html: `
            <div style="
              width: 36px;
              height: 36px;
              border-radius: 12px;
              background: #15803d;
              border: 2px solid #4ade80;
              box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 16px;
              cursor: pointer;
              transition: transform 0.2s;
            " class="hover:scale-110">
              🍴
            </div>
          `,
        });

        const spotMarker = L.marker([spot.latitude, spot.longitude], { icon: spotIcon });
        spotMarker.on('click', () => {
          setSelectedSpot(spot);
          setSelectedUser(null);
        });
        spotsLayer.addLayer(spotMarker);
      });
    }

    // 2. Render Student Markers at Real Coordinates
    if (showStudents) {
      // Group nearby coordinates to apply microscopic jitter/spiral so overlapping users are each visible
      const coordCounts: { [key: string]: number } = {};

      activeStudentList.forEach((student, index) => {
        let lat = typeof student.latitude === 'number' ? student.latitude : BBS_CAMPUS_DEFAULT.lat;
        let lng = typeof student.longitude === 'number' ? student.longitude : BBS_CAMPUS_DEFAULT.lng;

        // Key based on 4 decimals (~11m resolution)
        const coordKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        coordCounts[coordKey] = (coordCounts[coordKey] || 0) + 1;
        const count = coordCounts[coordKey];

        // If duplicate at same spot, apply a tiny spiral offset (0.00008 deg ~ 8 meters)
        if (count > 1) {
          const angle = (count - 1) * 1.25;
          const radius = 0.000085 * Math.sqrt(count);
          lat += radius * Math.cos(angle);
          lng += radius * Math.sin(angle);
        }

        const isMe = student.uid === currentUser.id;
        const showcaseSticker = student.showcaseStickerId ? getStickerById(student.showcaseStickerId) : null;
        const avatarUrl =
          student.avatarUrl ||
          (student as any).avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

        const firstName = student.name.split(' ')[0];

        // Marker HTML
        const markerHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            ${
              isMe
                ? `
              <div style="
                position: absolute;
                top: -8px;
                left: -8px;
                width: 52px;
                height: 52px;
                border-radius: 50%;
                background: rgba(34, 197, 94, 0.25);
                animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
            `
                : ''
            }
            <div style="
              width: ${isMe ? '38px' : '34px'};
              height: ${isMe ? '38px' : '34px'};
              border-radius: 50%;
              border: ${isMe ? '3px solid #22c55e' : '2px solid #38bdf8'};
              background: #0f172a;
              box-shadow: 0 4px 14px rgba(0,0,0,0.5);
              overflow: hidden;
              position: relative;
            ">
              <img src="${avatarUrl}" alt="${student.name}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>

            ${
              showcaseSticker
                ? `
              <div style="
                position: absolute;
                top: -4px;
                right: -4px;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: ${showcaseSticker.visualBg};
                border: 1px solid ${showcaseSticker.borderColor};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
              ">
                ${showcaseSticker.emoji}
              </div>
            `
                : ''
            }

            <div style="
              margin-top: 3px;
              background: rgba(15, 23, 42, 0.9);
              color: ${isMe ? '#4ade80' : '#f8fafc'};
              font-size: 10px;
              font-weight: 800;
              padding: 1px 6px;
              border-radius: 999px;
              border: 1px solid ${isMe ? 'rgba(34, 197, 94, 0.5)' : 'rgba(56, 189, 248, 0.4)'};
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            ">
              ${isMe ? '📍 You' : firstName}
            </div>
          </div>
        `;

        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          iconSize: [40, 52],
          iconAnchor: [20, 26],
          html: markerHtml,
        });

        const marker = L.marker([lat, lng], {
          icon: userIcon,
          zIndexOffset: isMe ? 1000 : 100 - index,
        });

        marker.on('click', () => {
          setSelectedUser(student as LeaderboardUser);
          setSelectedSpot(null);
        });

        markersLayer.addLayer(marker);
      });
    }
  }, [activeStudentList, diningSpots, showSpots, showStudents, currentUser]);

  // Center map on user
  const handleCenterOnMe = () => {
    if (mapInstanceRef.current && myCoords) {
      mapInstanceRef.current.flyTo([myCoords.lat, myCoords.lng], 17, { duration: 1.2 });
    }
  };

  // Fit all users on the map
  const handleFitAllUsers = () => {
    const map = mapInstanceRef.current;
    if (!map || activeStudentList.length === 0) return;

    const bounds = L.latLngBounds([]);
    activeStudentList.forEach((u) => {
      if (typeof u.latitude === 'number' && typeof u.longitude === 'number') {
        bounds.extend([u.latitude, u.longitude]);
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
    }
  };

  return (
    <div
      className={`relative flex flex-col bg-theme-card border-0 sm:border border-theme-card rounded-none sm:rounded-3xl overflow-hidden shadow-xl h-full flex-1 w-full min-h-0 ${
        isExpanded ? 'fixed inset-0 sm:inset-4 z-50 rounded-none sm:rounded-3xl' : className
      }`}
    >
      {/* Top Map Bar (Desktop only, so mobile is edge-to-edge full screen map) */}
      <div className="hidden sm:flex p-3 sm:p-4 bg-theme-card-subtle border-b border-theme-card flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-theme-primary/15 border border-theme-primary/30 flex items-center justify-center text-theme-primary">
            <Radio className="w-4 h-4 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-theme-main">
                {t('live_campus_map', 'Real-Time Campus Student Map')}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {activeStudentList.length} Active
              </span>
            </div>
            <p className="text-[11px] text-theme-muted">
              {isWatchActive ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span>🟢 Live GPS Tracking Active</span>
                  {gpsAccuracy ? `(±${gpsAccuracy}m)` : ''}
                </span>
              ) : (
                <span className="text-amber-400">🟡 GPS Paused</span>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Live Watch Toggle */}
          <button
            onClick={() => setIsWatchActive(!isWatchActive)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isWatchActive
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-theme-card text-theme-muted border-theme-card hover:text-theme-main'
            }`}
            title={isWatchActive ? 'Pause real-time GPS updates' : 'Resume real-time GPS tracking'}
          >
            <Radio className={`w-3.5 h-3.5 ${isWatchActive ? 'animate-pulse' : ''}`} />
            <span>{isWatchActive ? 'Tracking: ON' : 'Tracking: OFF'}</span>
          </button>

          {/* Manual Ping */}
          <button
            onClick={handleManualGpsPing}
            disabled={isGeocoding}
            className="p-1.5 rounded-xl bg-theme-card border border-theme-card hover:border-theme-primary text-theme-muted hover:text-theme-main transition-colors cursor-pointer"
            title="Refresh GPS & reverse geocode location"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeocoding ? 'animate-spin text-theme-primary' : ''}`} />
          </button>

          {/* Center on Me */}
          <button
            onClick={handleCenterOnMe}
            className="p-1.5 rounded-xl bg-theme-card border border-theme-card hover:border-theme-primary text-theme-muted hover:text-theme-main transition-colors cursor-pointer"
            title="Center on my location"
          >
            <Crosshair className="w-3.5 h-3.5 text-theme-primary" />
          </button>

          {/* Fit All */}
          <button
            onClick={handleFitAllUsers}
            className="p-1.5 rounded-xl bg-theme-card border border-theme-card hover:border-theme-primary text-theme-muted hover:text-theme-main transition-colors cursor-pointer"
            title="Fit all students in view"
          >
            <Users className="w-3.5 h-3.5" />
          </button>

          {/* Tile Style Switcher */}
          <button
            onClick={() => {
              if (tileStyle === 'dark') setTileStyle('streets');
              else if (tileStyle === 'streets') setTileStyle('satellite');
              else setTileStyle('dark');
            }}
            className="p-1.5 rounded-xl bg-theme-card border border-theme-card hover:border-theme-primary text-theme-muted hover:text-theme-main transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
            title={`Switch map layer (Current: ${tileStyle})`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="capitalize hidden sm:inline">{tileStyle}</span>
          </button>

          {/* Expand / Minimize */}
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1.5 rounded-xl bg-theme-card border border-theme-card hover:border-theme-primary text-theme-muted hover:text-theme-main transition-colors cursor-pointer"
              title={isExpanded ? 'Minimize map' : 'Maximize map'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* GPS Status / Error Banner */}
      {gpsError && (
        <div className="px-4 py-2 bg-amber-500/15 border-b border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2 shrink-0 z-20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{gpsError}</span>
          </div>
          <button
            onClick={handleManualGpsPing}
            className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-bold text-[11px] cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Map Interactive Canvas (fills 100% of available height on mobile) */}
      <div className="relative w-full flex-1 h-full min-h-[300px] sm:min-h-[420px]">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

        {/* Mobile Floating Action Controls */}
        <div className="sm:hidden absolute top-3 right-3 z-20 flex items-center gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-1 bg-theme-card/90 backdrop-blur-md p-1 rounded-2xl border border-theme-card shadow-xl">
            <button
              onClick={handleCenterOnMe}
              className="p-2 rounded-xl text-theme-primary hover:bg-theme-card-subtle transition-colors cursor-pointer"
              title="Center on my location"
            >
              <Crosshair className="w-4 h-4" />
            </button>
            <button
              onClick={handleFitAllUsers}
              className="p-2 rounded-xl text-theme-muted hover:text-theme-main hover:bg-theme-card-subtle transition-colors cursor-pointer"
              title="Fit all students"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (tileStyle === 'dark') setTileStyle('streets');
                else if (tileStyle === 'streets') setTileStyle('satellite');
                else setTileStyle('dark');
              }}
              className="p-2 rounded-xl text-theme-muted hover:text-theme-main hover:bg-theme-card-subtle transition-colors cursor-pointer"
              title="Change map style"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsWatchActive(!isWatchActive)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isWatchActive ? 'text-emerald-400 bg-emerald-500/20' : 'text-theme-muted'
              }`}
              title={isWatchActive ? 'GPS Live Tracking' : 'GPS Paused'}
            >
              <Radio className={`w-4 h-4 ${isWatchActive ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-20 bg-theme-card/90 backdrop-blur-md border border-theme-card p-2 rounded-xl text-[11px] space-y-1 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-2 font-bold text-theme-main">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>You (Live Marker)</span>
          </div>
          <div className="flex items-center gap-2 text-theme-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span>Other Students ({activeStudentList.length - 1})</span>
          </div>
          <div className="flex items-center gap-2 text-theme-muted">
            <span>🍴</span>
            <span>Campus Dining Spots ({diningSpots.length})</span>
          </div>
        </div>

        {/* Search floating box */}
        <div className="absolute top-3 left-3 z-20 max-w-xs w-full pointer-events-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Find student on map..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-theme-card/90 backdrop-blur-md border border-theme-card text-xs text-theme-main placeholder-theme-muted shadow-lg focus:outline-none focus:ring-1 focus:ring-theme-primary"
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-main cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Selected Student Popup Card */}
        {selectedUser && (
          <div className="absolute bottom-3 right-3 left-3 sm:left-auto sm:w-80 z-30 bg-theme-card border border-theme-primary/60 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 pointer-events-auto">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.avatar || selectedUser.avatarUrl}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-xl object-cover border border-theme-card"
                />
                <div>
                  <h4 className="text-sm font-extrabold text-theme-main leading-tight flex items-center gap-1.5">
                    <span>{selectedUser.name}</span>
                    {selectedUser.uid === currentUser.id && (
                      <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase bg-theme-primary text-black">
                        You
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-theme-muted mt-0.5">
                    {selectedUser.grade || 'Grade 9'} • {selectedUser.xpFormatted || `${selectedUser.xp || 0} XP`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-theme-muted hover:text-theme-main hover:bg-theme-card cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Location Details */}
            <div className="mt-3 bg-theme-card-subtle rounded-xl p-2.5 space-y-1.5 border border-theme-card text-xs">
              <div className="flex items-center gap-2 text-theme-main font-semibold">
                <MapPin className="w-3.5 h-3.5 text-theme-primary shrink-0" />
                <span className="truncate">{selectedUser.locationName || 'BBS PIK Campus'}</span>
              </div>

              {selectedUser.locationAddress && (
                <p className="text-[11px] text-theme-muted truncate pl-5.5">
                  {selectedUser.locationAddress}
                </p>
              )}

              <div className="flex items-center justify-between text-[11px] text-theme-muted pl-5.5 pt-1 border-t border-theme-card/60">
                <span>
                  {typeof selectedUser.latitude === 'number' && typeof selectedUser.longitude === 'number'
                    ? `${selectedUser.latitude.toFixed(4)}, ${selectedUser.longitude.toFixed(4)}`
                    : 'Coordinates unavailable'}
                </span>

                {typeof selectedUser.latitude === 'number' &&
                  typeof selectedUser.longitude === 'number' &&
                  selectedUser.uid !== currentUser.id && (
                    <span className="text-theme-primary font-bold">
                      ~
                      {calculateDistanceMeters(
                        myCoords.lat,
                        myCoords.lng,
                        selectedUser.latitude,
                        selectedUser.longitude
                      )}
                      m away
                    </span>
                  )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 flex items-center gap-2">
              {selectedUser.uid !== currentUser.id && (
                <button
                  onClick={() => {
                    onOpenTradeWithUser(selectedUser);
                    setSelectedUser(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-theme-primary text-black font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Trade Stickers</span>
                </button>
              )}

              <a
                href={
                  selectedUser.locationMapUri ||
                  `https://www.google.com/maps/search/?api=1&query=${selectedUser.latitude || myCoords.lat},${
                    selectedUser.longitude || myCoords.lng
                  }`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-theme-card border border-theme-card hover:border-theme-primary text-theme-primary flex items-center justify-center cursor-pointer"
                title="Open in Google Maps"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Selected Dining Spot Popup Card */}
        {selectedSpot && (
          <div className="absolute bottom-3 right-3 left-3 sm:left-auto sm:w-80 z-30 bg-theme-card border border-emerald-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 pointer-events-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Campus Dining Spot
                </span>
                <h4 className="text-sm font-extrabold text-theme-main mt-1 leading-tight">{selectedSpot.title}</h4>
                <p className="text-xs text-theme-muted mt-0.5">{selectedSpot.address}</p>
              </div>

              <button
                onClick={() => setSelectedSpot(null)}
                className="p-1 rounded-lg text-theme-muted hover:text-theme-main hover:bg-theme-card cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedSpot.description && (
              <p className="text-xs text-theme-muted mt-2 leading-relaxed">{selectedSpot.description}</p>
            )}

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={async () => {
                  await updateUserCampusLocation(currentUser, {
                    locationName: selectedSpot.title,
                    latitude: selectedSpot.latitude,
                    longitude: selectedSpot.longitude,
                    locationMapUri: selectedSpot.uri,
                  });
                  onUserLocationUpdated?.(selectedSpot.title, selectedSpot.uri);
                  setSelectedSpot(null);
                }}
                className="flex-1 py-2 rounded-xl bg-theme-primary text-black font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Check In Here</span>
              </button>

              {selectedSpot.uri && (
                <a
                  href={selectedSpot.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-theme-card border border-theme-card hover:border-theme-primary text-theme-primary flex items-center justify-center cursor-pointer"
                  title="View on Google Maps"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Strip (Desktop only) */}
      <div className="hidden sm:flex px-4 py-2 bg-theme-card-subtle border-t border-theme-card flex-wrap items-center justify-between text-xs text-theme-muted gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-theme-primary" />
            <span>
              Your GPS:{' '}
              <strong className="text-theme-main">
                {myCoords.lat.toFixed(5)}, {myCoords.lng.toFixed(5)}
              </strong>
            </span>
          </div>
          {gpsAccuracy && <span>• ±{gpsAccuracy}m precision</span>}
        </div>

        <div className="flex items-center gap-3">
          {lastPingTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Ping: {lastPingTime.toLocaleTimeString()}</span>
            </span>
          )}
          <span className="text-emerald-400 font-bold">• Real-Time Synced</span>
        </div>
      </div>
    </div>
  );
};
