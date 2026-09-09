import React, { useState, useRef } from 'react';
import {
  X,
  Check,
  Sparkles,
  Trophy,
  Leaf,
  Utensils,
  Award,
  Lock,
  Mail,
  HelpCircle,
  ShieldCheck,
  Shield,
  TrendingUp,
  KeyRound,
  Upload,
  Camera,
  Image as ImageIcon,
  Link as LinkIcon,
  RotateCcw,
  Recycle,
  Flame,
  Globe,
  Zap,
  Heart,
  Droplets,
  Droplet,
  BookOpen,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Lightbulb,
  Info,
  TreePine,
  Crown,
  Apple,
  Sprout,
  Sun,
  Target,
  Users,
  UserPlus,
  Search,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { UserProfile, MealRecord, BadgeItem, DailyTipItem, CampusChallengeInfo, AppSettings } from '../types';
import { initialBadges, GRADE_DIVISIONS } from '../data/mockData';
import { CAMPUS_LINKS } from '../utils/urlHelper';
import { getAcademicYearChallengeList, getAcademicYearPeriod } from '../data/academicYearChallenge';

// 1. Edit Profile Modal
interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updated: Partial<UserProfile>) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [name, setName] = useState(user.name);
  const [greetingName, setGreetingName] = useState(user.greetingName);
  const [grade, setGrade] = useState(user.grade);
  const [section, setSection] = useState(user.section || 'A');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  ];

  const handleFileProcess = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP, etc.)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image size exceeds 8MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setAvatarUrl(e.target.result);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleApplyUrl = () => {
    if (!imageUrlInput.trim()) return;
    setAvatarUrl(imageUrlInput.trim());
    setImageUrlInput('');
    setShowUrlInput(false);
  };

  const isCustomUploaded = !sampleAvatars.includes(avatarUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-theme-card border-t sm:border border-theme-card rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="w-12 h-1.5 bg-theme-muted/40 rounded-full mx-auto sm:hidden -mt-1 mb-1 shrink-0" />
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-theme-main">Edit Student Profile</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-theme-muted hover:text-theme-main hover:bg-theme-card-subtle cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Picture Upload & Customization Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase font-bold text-theme-muted">Profile Picture</label>
            {isCustomUploaded && (
              <span className="text-[10px] font-bold text-theme-primary bg-theme-primary-bg border border-theme-primary-border px-2 py-0.5 rounded-full">
                Custom Photo Active
              </span>
            )}
          </div>

          {/* Current Avatar with Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-theme-card-subtle border border-theme-card p-4 rounded-2xl">
            <div className="relative group shrink-0">
              <img
                src={avatarUrl}
                alt="Profile Preview"
                className="w-20 h-20 rounded-full object-cover border-3 border-theme-primary shadow-md shadow-theme-glow"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change Photo"
                className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
              >
                <Camera className="w-4 h-4 mb-0.5" />
                Change
              </button>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  id="btn-upload-photo"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-theme-primary text-black font-extrabold text-xs hover:opacity-90 transition-all shadow-sm cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>

                <button
                  type="button"
                  id="btn-take-photo"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-theme-card border border-theme-card text-theme-main font-bold text-xs hover:border-theme-primary transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-theme-primary" />
                  <span>Take Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-theme-card border border-theme-card text-theme-muted hover:text-theme-main text-xs font-semibold transition-all cursor-pointer"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Link</span>
                </button>
              </div>

              <p className="text-[11px] text-theme-muted">
                Upload any personal image (PNG, JPG, WebP) from your device or camera.
              </p>
            </div>
          </div>

          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="user"
            className="hidden"
          />

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
              isDragging
                ? 'border-theme-primary bg-theme-primary-bg/20 scale-[1.01]'
                : 'border-theme-card hover:border-theme-primary/60 bg-theme-card-subtle/50'
            }`}
          >
            <ImageIcon className="w-5 h-5 text-theme-primary" />
            <p className="text-xs font-bold text-theme-main">
              Drag & drop your picture here, or <span className="text-theme-primary underline">browse file</span>
            </p>
            <span className="text-[10px] text-theme-muted">Supports all image formats up to 8MB</span>
          </div>

          {/* Paste Image URL Input Box */}
          {showUrlInput && (
            <div className="flex gap-2 animate-in fade-in">
              <input
                type="url"
                placeholder="https://example.com/my-photo.jpg"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 bg-theme-card-subtle border border-theme-card rounded-xl px-3.5 py-2 text-xs text-theme-main font-medium focus:outline-none focus:border-theme-primary"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3.5 py-2 rounded-xl bg-theme-primary text-black font-extrabold text-xs hover:opacity-90 cursor-pointer"
              >
                Apply URL
              </button>
            </div>
          )}

          {uploadError && (
            <p className="text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/40 p-2.5 rounded-xl text-center">
              {uploadError}
            </p>
          )}

          {/* Optional Preset Avatars Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowPresets((prev) => !prev)}
              className="text-[11px] font-bold text-theme-muted hover:text-theme-main flex items-center gap-1 cursor-pointer"
            >
              <span>{showPresets ? '▼ Hide Avatar Presets' : '▶ Or choose a sample avatar preset'}</span>
            </button>

            {showPresets && (
              <div className="flex items-center gap-2.5 pt-2.5 overflow-x-auto pb-1 animate-in fade-in">
                {sampleAvatars.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Avatar preset ${i + 1}`}
                    onClick={() => setAvatarUrl(url)}
                    className={`w-11 h-11 rounded-full object-cover cursor-pointer border-2 transition-all shrink-0 ${
                      avatarUrl === url ? 'border-theme-primary scale-110 shadow-md shadow-theme-glow' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profile Details Inputs */}
        <div className="space-y-4 pt-2 border-t border-theme-card">
          <div>
            <label className="text-xs uppercase font-bold text-theme-muted block mb-1">
              Full Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-theme-card-subtle border border-theme-card rounded-xl px-4 py-2.5 text-sm text-theme-main font-medium focus:outline-none focus:border-theme-primary"
            />
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-theme-muted block mb-1">
              Greeting Name (Dashboard)
            </label>
            <input
              type="text"
              value={greetingName}
              onChange={(e) => setGreetingName(e.target.value)}
              className="w-full bg-theme-card-subtle border border-theme-card rounded-xl px-4 py-2.5 text-sm text-theme-main font-medium focus:outline-none focus:border-theme-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase font-bold text-theme-muted block mb-1">Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-theme-card-subtle border border-theme-card rounded-xl px-4 py-2.5 text-sm text-theme-main font-medium focus:outline-none focus:border-theme-primary cursor-pointer"
              >
                {GRADE_DIVISIONS.map((division) => (
                  <optgroup
                    key={division.name}
                    label={division.label}
                    className="bg-slate-900 text-white font-bold"
                  >
                    {division.grades.map((g) => (
                      <option key={g} value={g} className="bg-slate-900 text-white font-medium">
                        {g}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs uppercase font-bold text-theme-muted block mb-1">Class Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full bg-theme-card-subtle border border-theme-card rounded-xl px-4 py-2.5 text-sm text-theme-main font-medium focus:outline-none focus:border-theme-primary cursor-pointer"
              >
                <option value="A" className="bg-slate-900 text-white font-medium">Section A</option>
                <option value="B" className="bg-slate-900 text-white font-medium">Section B</option>
                <option value="C" className="bg-slate-900 text-white font-medium">Section C</option>
                <option value="D" className="bg-slate-900 text-white font-medium">Section D</option>
              </select>
            </div>
          </div>

          <div className="bg-theme-card-subtle border border-theme-card p-3 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-theme-muted">Assigned Homeroom:</span>
            <span className="font-extrabold text-theme-primary">{grade}-{section}</span>
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full bg-theme-card-subtle text-theme-muted font-bold text-xs hover:text-theme-main cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({
                name,
                greetingName,
                grade,
                section,
                homeroom: `${grade}-${section}`,
                avatarUrl,
              });
              onClose();
            }}
            className="flex-1 py-3 rounded-full bg-theme-primary text-black font-extrabold text-xs hover:opacity-90 shadow-md shadow-theme-glow cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Greeting Color Customizer Modal
interface GreetingColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: string;
  onSelectColor: (color: string) => void;
}

export const GreetingColorModal: React.FC<GreetingColorModalProps> = ({
  isOpen,
  onClose,
  currentColor,
  onSelectColor,
}) => {
  if (!isOpen) return null;

  const colorOptions = [
    { id: 'auto', name: 'Auto Theme Color', previewClass: 'text-theme-main', hex: '#A3E635' },
    { id: 'green', name: 'Eco Emerald', previewClass: 'text-emerald-500', hex: '#22C55E' },
    { id: 'amber', name: 'Solar Amber', previewClass: 'text-amber-500', hex: '#F59E0B' },
    { id: 'cyan', name: 'Ocean Cyan', previewClass: 'text-cyan-500', hex: '#06B6D4' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-theme-card border-t sm:border border-theme-card rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="w-12 h-1.5 bg-theme-muted/40 rounded-full mx-auto sm:hidden -mt-1 mb-1 shrink-0" />
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-theme-main">Greeting Accent Color</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-theme-muted hover:text-theme-main cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-theme-muted">
          Personalize the header greeting text style on your EcoEat dashboard.
        </p>

        <div className="space-y-2">
          {colorOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onSelectColor(opt.id);
                onClose();
              }}
              className="w-full p-3.5 rounded-2xl bg-theme-card-subtle border border-theme-card hover:border-theme-primary flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: opt.hex }}
                />
                <span className={`text-sm font-bold ${opt.previewClass}`}>{opt.name}</span>
              </div>
              {currentColor === opt.id && <Check className="w-4 h-4 text-theme-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. Change Password Modal
export const ChangePasswordModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-theme-card border-t sm:border border-theme-card rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="w-12 h-1.5 bg-theme-muted/40 rounded-full mx-auto sm:hidden -mt-1 mb-1 shrink-0" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-theme-primary" />
            <h3 className="text-lg font-extrabold text-theme-main">Change Password</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-theme-muted hover:text-theme-main cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {saved ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-theme-primary-bg border border-theme-primary-border flex items-center justify-center text-theme-primary mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold text-theme-main">Password Updated!</h4>
            <p className="text-xs text-theme-muted">Your campus student credentials have been securely updated.</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-full bg-theme-primary text-black font-extrabold text-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase font-bold text-theme-muted block mb-1">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-theme-card-subtle border border-theme-card rounded-xl px-4 py-2.5 text-sm text-theme-main focus:outline-none focus:border-theme-primary"
              />
            </div>

            <div>
              <label className="text-xs uppercase font-bold text-theme-muted block mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-theme-card-subtle border border-theme-card rounded-xl px-4 py-2.5 text-sm text-theme-main focus:outline-none focus:border-theme-primary"
              />
            </div>

            <button
              onClick={() => setSaved(true)}
              className="w-full py-3.5 rounded-full bg-theme-primary text-black font-extrabold text-xs hover:opacity-90 shadow-md shadow-theme-glow mt-2"
            >
              Update Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Meal Details Modal
interface MealDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: MealRecord | null;
}

export const MealDetailsModal: React.FC<MealDetailsModalProps> = ({ isOpen, onClose, meal }) => {
  if (!isOpen || !meal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-theme-card border-t sm:border border-theme-card rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="w-12 h-1.5 bg-theme-muted/40 rounded-full mx-auto sm:hidden -mt-1 mb-1 shrink-0" />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-theme-primary" />
            <h3 className="text-lg font-extrabold text-theme-main">{meal.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-theme-muted hover:text-theme-main cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Preview Images (Before & After if available) */}
        <div className={meal.afterImageUrl ? 'grid grid-cols-2 gap-2.5' : 'block'}>
          <div className="relative rounded-2xl overflow-hidden border border-theme-card">
            <img
              src={meal.imageUrl}
              alt={meal.title}
              className="w-full h-44 object-cover"
              referrerPolicy="no-referrer"
            />
            {meal.afterImageUrl && (
              <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                Pre-Meal Scan
              </span>
            )}
          </div>
          {meal.afterImageUrl && (
            <div className="relative rounded-2xl overflow-hidden border-2 border-theme-primary">
              <img
                src={meal.afterImageUrl}
                alt="Clean Plate Post-Dining"
                className="w-full h-44 object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-2 left-2 bg-theme-primary text-black text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                Clean Plate (0g)
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs font-semibold text-theme-muted">
            <span className="flex items-center gap-1.5">
              <span>Logged: {meal.time}</span>
              {meal.ecoScore && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px]">
                  EcoScore {meal.ecoScore}
                </span>
              )}
            </span>
            <span
              className={`font-extrabold px-3 py-1 rounded-full shadow-sm ${
                meal.xp < 0
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-theme-primary text-black'
              }`}
            >
              {meal.xp >= 0 ? `+${meal.xp} XP Earned` : `${meal.xp} XP Penalty`}
            </span>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-4 gap-2 bg-theme-card-subtle p-3 rounded-2xl border border-theme-card text-center">
            <div>
              <p className="text-[10px] text-theme-muted font-bold uppercase">Portion</p>
              <p className="text-xs font-bold text-theme-main">{meal.portion}</p>
            </div>
            <div>
              <p className="text-[10px] text-theme-muted font-bold uppercase">Calories</p>
              <p className="text-xs font-bold text-theme-main">{meal.calories || 440} kcal</p>
            </div>
            <div>
              <p className="text-[10px] text-theme-muted font-bold uppercase">CO2 Saved</p>
              <p className="text-xs font-bold text-theme-primary">~{meal.carbonSavedKg || 0.54}kg</p>
            </div>
            <div>
              <p className="text-[10px] text-theme-muted font-bold uppercase">Water Saved</p>
              <p className="text-xs font-bold text-sky-400">~{meal.waterSavedLiters || 590}L</p>
            </div>
          </div>

          {/* Macro Nutrition Profile */}
          {meal.nutrition && (
            <div className="space-y-1.5 bg-theme-card-subtle p-3 rounded-2xl border border-theme-card">
              <p className="text-xs font-bold text-theme-main flex items-center justify-between">
                <span>Verified Nutrient Profile:</span>
                <span className="text-[11px] text-theme-primary font-extrabold">Smart AI Verified</span>
              </p>
              <div className="grid grid-cols-4 gap-2 text-center pt-1">
                <div className="bg-theme-card p-1.5 rounded-xl border border-theme-card">
                  <p className="text-[9px] font-bold text-theme-muted uppercase">Protein</p>
                  <p className="text-xs font-extrabold text-theme-main">{meal.nutrition.protein}g</p>
                </div>
                <div className="bg-theme-card p-1.5 rounded-xl border border-theme-card">
                  <p className="text-[9px] font-bold text-theme-muted uppercase">Carbs</p>
                  <p className="text-xs font-extrabold text-theme-main">{meal.nutrition.carbs}g</p>
                </div>
                <div className="bg-theme-card p-1.5 rounded-xl border border-theme-card">
                  <p className="text-[9px] font-bold text-theme-muted uppercase">Fat</p>
                  <p className="text-xs font-extrabold text-theme-main">{meal.nutrition.fat}g</p>
                </div>
                <div className="bg-theme-card p-1.5 rounded-xl border border-theme-card">
                  <p className="text-[9px] font-bold text-theme-muted uppercase">Fiber</p>
                  <p className="text-xs font-extrabold text-theme-main">{meal.nutrition.fiber}g</p>
                </div>
              </div>
            </div>
          )}

          {/* Recognized Ingredients */}
          {meal.foodItems && meal.foodItems.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-xs font-bold text-theme-main">Recognized Campus Ingredients:</p>
              <div className="flex flex-wrap gap-1.5">
                {meal.foodItems.map((item, i) => (
                  <span
                    key={i}
                    className="bg-theme-card-subtle text-theme-main border border-theme-card text-xs px-2.5 py-1 rounded-full font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Student Notes or Sustainability Tip */}
          {(meal.studentNotes || meal.sustainabilityFeedback) && (
            <div className="bg-theme-primary-bg border border-theme-primary-border p-3 rounded-2xl space-y-1">
              <p className="text-[11px] font-bold text-theme-primary uppercase">Sustainability Feedback & Notes:</p>
              <p className="text-xs text-theme-main leading-relaxed">
                {meal.studentNotes ? `"${meal.studentNotes}" — ` : ''}
                {meal.sustainabilityFeedback || 'Great job minimizing food waste and choosing plant-forward dining!'}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-full bg-theme-primary text-black font-extrabold text-xs hover:opacity-90 transition-all shadow-md shadow-theme-glow cursor-pointer"
        >
          Close Meal Details
        </button>
      </div>
    </div>
  );
};

// 5. Campus Challenge Details Modal
interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: CampusChallengeInfo;
  onJoinChallenge?: () => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  challenge,
  onJoinChallenge,
}) => {
  const allYearChallenges = getAcademicYearChallengeList();
  const currentPeriod = getAcademicYearPeriod();
  const [selectedYearCode, setSelectedYearCode] = useState<string>(challenge.academicYear || currentPeriod.code);

  if (!isOpen) return null;

  // Selected challenge or fallback to active challenge
  const activeChallenge =
    selectedYearCode === challenge.academicYear
      ? challenge
      : allYearChallenges.find((c) => c.academicYear === selectedYearCode) || challenge;

  const isCurrentYear = activeChallenge.academicYear === currentPeriod.code;
  const isPastYear = (activeChallenge.daysLeft ?? 0) === 0 && !isCurrentYear;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-theme-card border-t sm:border border-theme-card rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="w-12 h-1.5 bg-theme-muted/40 rounded-full mx-auto sm:hidden -mt-1 mb-1 shrink-0" />
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-theme-primary-bg border border-theme-primary-border flex items-center justify-center text-theme-primary shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-theme-primary tracking-wider">
                {activeChallenge.title}
              </p>
              <h3 className="text-lg font-extrabold text-theme-main">{activeChallenge.subtitle}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-theme-muted hover:text-theme-main cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Academic Year Switcher Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-theme-muted">
            <span className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-theme-primary" />
              <span>BBS Academic Year Challenges</span>
            </span>
            <span className="text-[10px] uppercase text-theme-primary font-black">
              {isCurrentYear ? 'Current' : isPastYear ? 'Archived' : 'Upcoming'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {allYearChallenges.map((item) => {
              const isSelected = item.academicYear === activeChallenge.academicYear;
              const isCurrent = item.academicYear === currentPeriod.code;
              return (
                <button
                  key={item.academicYear}
                  onClick={() => setSelectedYearCode(item.academicYear)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-theme-primary text-black border-theme-primary shadow-sm shadow-theme-glow'
                      : 'bg-theme-card-subtle text-theme-muted border-theme-card hover:text-theme-main hover:border-theme-primary/40'
                  }`}
                >
                  AY {item.academicYear} {isCurrent && '★'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Academic Year Challenge Status Badge */}
        <div className="p-3 rounded-2xl bg-theme-primary/10 border border-theme-primary/20 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-theme-primary shrink-0" />
            <span className="text-theme-main">
              Academic Year {activeChallenge.academicYear} Goal
            </span>
          </div>
          <span className="text-theme-primary text-[11px] font-extrabold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {isCurrentYear ? 'Active Goal' : isPastYear ? 'Archived' : 'Upcoming Goal'}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-theme-muted leading-relaxed">{activeChallenge.description}</p>

        {/* Progress Bar Card */}
        <div className="space-y-2 bg-theme-card-subtle p-4 rounded-2xl border border-theme-card">
          <div className="flex justify-between text-xs font-bold text-theme-main">
            <span>
              Progress: {activeChallenge.progressPercentage}%
            </span>
            <span className="text-theme-muted">
              {activeChallenge.currentKg} / {activeChallenge.targetKg} kg Target
            </span>
          </div>
          <div className="w-full progress-theme-track h-3 rounded-full overflow-hidden p-0.5 border border-theme-card">
            <div
              className="bg-theme-primary h-full rounded-full transition-all duration-700"
              style={{ width: `${activeChallenge.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Real-Time Student Participants Section */}
        <div className="space-y-3 bg-theme-card-subtle p-4 rounded-2xl border border-theme-card">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <h4 className="text-xs uppercase tracking-wider font-bold text-theme-muted flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-theme-primary" />
                <span>Real-Time Student Participants</span>
              </h4>
            </div>
            <span className="text-xs font-black text-theme-main">
              {activeChallenge.studentsParticipating} {activeChallenge.studentsParticipating === 1 ? 'student' : 'students'}
            </span>
          </div>

          {/* Join action banner if current year */}
          {isCurrentYear && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-theme-card border border-theme-card">
              {activeChallenge.hasJoined ? (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>You are actively participating in this challenge!</span>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full gap-3">
                  <div className="text-xs text-theme-muted">
                    Join this challenge to divert food waste and earn XP!
                  </div>
                  {onJoinChallenge && (
                    <button
                      onClick={onJoinChallenge}
                      className="px-4 py-2 rounded-full bg-theme-primary text-black font-extrabold text-xs hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer shadow-sm shadow-theme-glow flex items-center gap-1.5 shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Join (+50 XP)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Real Participants List or empty state */}
          {activeChallenge.participantsList && activeChallenge.participantsList.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-theme-muted">Students participating in AY {activeChallenge.academicYear}:</p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {activeChallenge.participantsList.map((p) => (
                  <div
                    key={p.id || p.userId}
                    className="inline-flex items-center gap-1.5 bg-theme-card border border-theme-card px-2.5 py-1 rounded-full text-[11px] text-theme-main"
                  >
                    {p.avatarUrl ? (
                      <img src={p.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-theme-primary/20 text-theme-primary text-[9px] font-bold flex items-center justify-center">
                        {p.userName ? p.userName.charAt(0).toUpperCase() : 'S'}
                      </div>
                    )}
                    <span className="font-semibold">{p.userName}</span>
                    <span className="text-[9px] text-theme-muted">({p.userGrade})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-theme-muted italic">
              {activeChallenge.studentsParticipating === 0
                ? "0 students have joined yet. Be the first to join this academic year challenge!"
                : `${activeChallenge.studentsParticipating} students joined.`}
            </p>
          )}
        </div>

        {/* Community Rewards List */}
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider font-bold text-theme-muted">
            School Community Rewards for AY {activeChallenge.academicYear}:
          </h4>
          <div className="space-y-2">
            {activeChallenge.rewards.map((reward, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-theme-card-subtle border border-theme-card p-3 rounded-xl text-xs font-semibold text-theme-main"
              >
                <Sparkles className="w-4 h-4 text-theme-primary shrink-0" />
                <span>{reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How BBS Challenges Work */}
        <div className="p-3.5 rounded-2xl bg-theme-card-subtle border border-theme-card space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-theme-main text-[11px]">
            <Info className="w-3.5 h-3.5 text-theme-primary" />
            <span>How the Campus Challenge Works</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-theme-muted leading-relaxed">
            <p>
              • <strong>Eat Clean Plates</strong>: Finish your meals and log meal cards in the app to prevent food waste.
            </p>
            <p>
              • <strong>Divert Food Scraps</strong>: Every gram of unavoidable food waste composted or diverted adds to the campus total.
            </p>
            <p>
              • <strong>Unlock Community Rewards</strong>: Diverting food waste collectively unlocks new student amenities across the campus!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-full bg-theme-primary text-black font-extrabold text-xs hover:opacity-90 shadow-md shadow-theme-glow cursor-pointer"
        >
          {isCurrentYear ? "Got It, Let's Save Food!" : "Back to Active Challenge"}
        </button>
      </div>
    </div>
  );
};

// Helper for rendering badge icons inside modals
const renderModalBadgeIcon = (iconName: string, unlocked: boolean, className = 'w-8 h-8') => {
  if (!unlocked) return <Lock className={`${className} text-theme-muted`} />;
  switch (iconName) {
    case 'utensils':
      return <Utensils className={`${className} text-theme-primary`} />;
    case 'recycle':
      return <Recycle className={`${className} text-emerald-400`} />;
    case 'sparkles':
      return <Sparkles className={`${className} text-amber-300`} />;
    case 'flame':
      return <Flame className={`${className} text-amber-400`} />;
    case 'leaf':
      return <Leaf className={`${className} text-emerald-400`} />;
    case 'trophy':
      return <Trophy className={`${className} text-yellow-400`} />;
    case 'globe':
      return <Globe className={`${className} text-sky-400`} />;
    case 'zap':
      return <Zap className={`${className} text-amber-300`} />;
    case 'heart':
      return <Heart className={`${className} text-rose-400`} />;
    case 'shield':
      return <Shield className={`${className} text-sky-400`} />;
    case 'shield-check':
      return <ShieldCheck className={`${className} text-emerald-400`} />;
    case 'tree-pine':
      return <TreePine className={`${className} text-emerald-500`} />;
    case 'crown':
      return <Crown className={`${className} text-amber-400`} />;
    case 'apple':
      return <Apple className={`${className} text-rose-400`} />;
    case 'sprout':
      return <Sprout className={`${className} text-emerald-400`} />;
    case 'droplets':
      return <Droplets className={`${className} text-cyan-400`} />;
    case 'droplet':
      return <Droplet className={`${className} text-cyan-400`} />;
    case 'sun':
      return <Sun className={`${className} text-amber-400`} />;
    case 'target':
      return <Target className={`${className} text-emerald-400`} />;
    case 'users':
      return <Users className={`${className} text-indigo-400`} />;
    default:
      return <Award className={`${className} text-theme-primary`} />;
  }
};

// 6. Badge Details Modal
interface BadgeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: BadgeItem | null;
}

export const BadgeDetailsModal: React.FC<BadgeDetailsModalProps> = ({ isOpen, onClose, badge }) => {
  if (!isOpen || !badge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-theme-card border-t sm:border border-theme-card rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-4 text-center max-h-[88vh] sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="w-12 h-1.5 bg-theme-muted/40 rounded-full mx-auto sm:hidden -mt-1 mb-1 shrink-0" />
        <div className="flex justify-end">
          <button onClick={onClose} className="text-theme-muted hover:text-theme-main cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg border-2 ${
          badge.unlocked
            ? 'bg-theme-primary-bg border-theme-primary-border shadow-theme-glow'
            : 'bg-theme-card border-theme-card'
        }`}>
          {renderModalBadgeIcon(badge.icon, badge.unlocked, 'w-10 h-10')}
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-theme-main">{badge.name}</h3>
          <p className="text-xs font-semibold text-theme-primary">{badge.category}</p>
        </div>

        <p className="text-xs text-theme-muted leading-relaxed px-2">{badge.description}</p>

        <div className="bg-theme-card-subtle p-3 rounded-2xl border border-theme-card flex items-center justify-between text-xs font-bold">
          <span className="text-theme-muted">Status</span>
          <span className={badge.unlocked ? 'text-emerald-400 font-extrabold' : 'text-theme-muted'}>
            {badge.unlocked ? `Unlocked (${badge.unlockedDate || 'Active'})` : 'Locked Milestone'}
          </span>
        </div>

        <div className="bg-theme-card-subtle p-3 rounded-2xl border border-theme-card flex items-center justify-between text-xs font-bold">
          <span className="text-theme-muted">Reward XP</span>
          <span className="text-theme-primary font-black">+{badge.xpReward} XP</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-full bg-theme-primary text-black font-extrabold text-xs hover:opacity-90 transition-all shadow-md shadow-theme-glow cursor-pointer"
        >
          {badge.unlocked ? 'Awesome!' : 'Got It, Keep Going!'}
        </button>
      </div>
    </div>
  );
};

// 7. Badge Gallery Modal
export const BadgeGalleryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  badges: BadgeItem[];
  onSelectBadge: (b: BadgeItem) => void;
}> = ({ isOpen, onClose, badges, onSelectBadge }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(badges.map((b) => b.category)))];
  
  const unlockedBadges = badges.filter((b) => b.unlocked);
  const unlockedCount = unlockedBadges.length;
  const totalBadgeXpEarned = unlockedBadges.reduce((sum, b) => sum + b.xpReward, 0);
  const totalBadgeXpPossible = badges.reduce((sum, b) => sum + b.xpReward, 0);
  const completionPercent = Math.round((unlockedCount / badges.length) * 100);

  const filteredBadges = badges.filter((b) => {
    // Category match
    if (selectedCategory !== 'All' && b.category !== selectedCategory) return false;
    // Status match
    if (statusFilter === 'unlocked' && !b.unlocked) return false;
    if (statusFilter === 'locked' && b.unlocked) return false;
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = b.name.toLowerCase().includes(q);
      const descMatch = b.description.toLowerCase().includes(q);
      const catMatch = b.category.toLowerCase().includes(q);
      if (!nameMatch && !descMatch && !catMatch) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-theme-card border-0 sm:border border-theme-card rounded-none sm:rounded-3xl max-w-3xl w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] p-4 sm:p-6 shadow-2xl flex flex-col space-y-3.5 sm:space-y-4 overflow-hidden animate-in fade-in sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-2xl bg-theme-primary-bg border border-theme-primary-border flex items-center justify-center text-theme-primary shadow-sm shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-theme-main">Campus Badges Gallery</h3>
              <p className="text-xs text-theme-muted">
                {unlockedCount} of {badges.length} Unlocked ({completionPercent}%) • +{totalBadgeXpEarned} / {totalBadgeXpPossible} XP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-theme-muted hover:text-theme-main hover:bg-theme-card-subtle cursor-pointer transition-colors"
            aria-label="Close Badges Gallery"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collection Progress Bar */}
        <div className="bg-theme-card-subtle border border-theme-card p-3 rounded-2xl space-y-1.5 shrink-0">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-theme-muted">Collection Progress</span>
            <span className="text-theme-primary">{unlockedCount} of {badges.length} Badges ({completionPercent}%)</span>
          </div>
          <div className="w-full bg-slate-900/60 h-2.5 rounded-full overflow-hidden p-0.5 border border-theme-card">
            <div
              className="bg-theme-primary h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-theme-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search badges by title, description, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-theme-card-subtle border border-theme-card rounded-2xl pl-10 pr-4 py-2 text-xs text-theme-main placeholder:text-theme-muted focus:outline-none focus:border-theme-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-main text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-theme-card-subtle p-1 rounded-2xl border border-theme-card shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-theme-primary text-black shadow-sm'
                  : 'text-theme-muted hover:text-theme-main'
              }`}
            >
              All ({badges.length})
            </button>
            <button
              onClick={() => setStatusFilter('unlocked')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'unlocked'
                  ? 'bg-theme-primary text-black shadow-sm'
                  : 'text-theme-muted hover:text-theme-main'
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              onClick={() => setStatusFilter('locked')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'locked'
                  ? 'bg-theme-primary text-black shadow-sm'
                  : 'text-theme-muted hover:text-theme-main'
              }`}
            >
              Locked ({badges.length - unlockedCount})
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 no-scrollbar">
          {categories.map((cat) => {
            const countInCat = cat === 'All' ? badges.length : badges.filter((b) => b.category === cat).length;
            const unlockedInCat = cat === 'All' ? unlockedCount : badges.filter((b) => b.category === cat && b.unlocked).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-theme-primary text-black shadow-sm'
                    : 'bg-theme-card-subtle text-theme-muted hover:text-theme-main border border-theme-card'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                  selectedCategory === cat ? 'bg-black/20 text-black' : 'bg-theme-card text-theme-muted'
                }`}>
                  {unlockedInCat}/{countInCat}
                </span>
              </button>
            );
          })}
        </div>

        {/* Badges Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-0.5 pb-2">
          {filteredBadges.length === 0 ? (
            <div className="text-center py-12 space-y-2 bg-theme-card-subtle rounded-2xl border border-theme-card my-auto">
              <Award className="w-8 h-8 text-theme-muted mx-auto opacity-50" />
              <p className="text-sm font-bold text-theme-main">No badges match your filter</p>
              <p className="text-xs text-theme-muted">Try clearing your search query or selecting "All" category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
              {filteredBadges.map((b) => (
                <div
                  key={b.id}
                  onClick={() => onSelectBadge(b)}
                  className={`p-3 sm:p-3.5 rounded-2xl border flex flex-col items-center text-center justify-between space-y-2 cursor-pointer transition-all card-hover-tap ${
                    b.unlocked
                      ? 'bg-theme-card-subtle border-theme-card hover:border-theme-primary shadow-sm'
                      : 'bg-theme-card border-theme-card opacity-50 hover:opacity-75'
                  }`}
                >
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center ${
                    b.unlocked
                      ? 'bg-theme-primary-bg border-theme-primary-border shadow-sm'
                      : 'bg-theme-card border-theme-card'
                  }`}>
                    {renderModalBadgeIcon(b.icon, b.unlocked, 'w-5 h-5 sm:w-6 sm:h-6')}
                  </div>
                  <div className="w-full">
                    <h4 className="text-xs font-bold text-theme-main truncate">{b.name}</h4>
                    <p className="text-[10px] text-theme-muted truncate mt-0.5">{b.category}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    b.unlocked ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-theme-card text-theme-muted border border-theme-card'
                  }`}>
                    {b.unlocked ? 'Unlocked' : `+${b.xpReward} XP`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 8. Campus Special Modal
export const MealHallSpecialModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-theme-card border-t sm:border border-theme-card rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="w-12 h-1.5 bg-theme-muted/40 rounded-full mx-auto sm:hidden -mt-1 mb-1 shrink-0" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Utensils className="w-5 h-5 text-theme-primary" />
            <h3 className="text-lg font-extrabold text-theme-main">Campus Meal Hall Special</h3>
          </div>
          <button onClick={onClose} className="text-theme-muted hover:text-theme-main cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <img
          src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"
          alt="Garden Salad"
          className="w-full h-44 rounded-2xl object-cover border border-theme-card"
          referrerPolicy="no-referrer"
        />

        <div className="space-y-2">
          <h4 className="text-base font-bold text-theme-main">Farm-Fresh Organic Garden Salad</h4>
          <p className="text-xs text-theme-muted leading-relaxed">
            Locally harvested organic crisp lettuce, cherry tomatoes, cucumbers, toasted chickpeas, and house-made lemon tahini vinaigrette.
          </p>
        </div>

        <div className="bg-theme-card-subtle p-3 rounded-2xl border border-theme-card flex items-center justify-between text-xs">
          <span className="text-theme-muted">Station: Dining Hall North 2</span>
          <span className="text-theme-primary font-bold">100% Plant-Rich</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-full bg-theme-primary text-black font-extrabold text-xs hover:opacity-90"
        >
          Close Special
        </button>
      </div>
    </div>
  );
};

// 9. FAQ & Info Modals
export const InfoContentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}> = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-theme-card border-t sm:border border-theme-card rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="w-12 h-1.5 bg-theme-muted/40 rounded-full mx-auto sm:hidden -mt-1 mb-1 shrink-0" />
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-theme-main">{title}</h3>
          <button onClick={onClose} className="text-theme-muted hover:text-theme-main cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-theme-muted leading-relaxed space-y-3 whitespace-pre-line max-h-72 overflow-y-auto">
          {content}
        </div>

        {/* Official Campus References with absolute https:// paths */}
        <div className="pt-2 border-t border-theme-card/60 space-y-2">
          <p className="text-[11px] font-bold text-theme-main">Official Campus Sustainability Links:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <a
              id="modal-link-bbs-portal"
              href={CAMPUS_LINKS.BBS_PIK_CAMPUS}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-theme-card-subtle hover:bg-theme-card border border-theme-card text-theme-muted hover:text-theme-primary transition-colors cursor-pointer no-underline"
            >
              <span>BBS PIK Portal</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
            <a
              id="modal-link-charter"
              href={CAMPUS_LINKS.SUSTAINABILITY_CHARTER}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-theme-card-subtle hover:bg-theme-card border border-theme-card text-theme-muted hover:text-theme-primary transition-colors cursor-pointer no-underline"
            >
              <span>Sustainability Charter</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
            <a
              id="modal-link-privacy"
              href={CAMPUS_LINKS.PRIVACY_POLICY}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-theme-card-subtle hover:bg-theme-card border border-theme-card text-theme-muted hover:text-theme-primary transition-colors cursor-pointer no-underline"
            >
              <span>Student Privacy</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
            <a
              id="modal-link-terms"
              href={CAMPUS_LINKS.TERMS_OF_SERVICE}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-theme-card-subtle hover:bg-theme-card border border-theme-card text-theme-muted hover:text-theme-primary transition-colors cursor-pointer no-underline"
            >
              <span>Terms of Service</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-full bg-theme-primary text-black font-extrabold text-xs hover:opacity-90 cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// 10. Comprehensive Daily Tip Details Modal
export const DailyTipDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  tip: DailyTipItem | null;
  onTipLearned?: (tip: DailyTipItem) => void;
}> = ({ isOpen, onClose, tip, onTipLearned }) => {
  const [learned, setLearned] = useState(false);

  if (!isOpen || !tip) return null;

  const handleLearnClick = () => {
    setLearned(true);
    if (onTipLearned) {
      onTipLearned(tip);
    }
  };

  const renderTipIconLarge = (iconType: DailyTipItem['iconType']) => {
    switch (iconType) {
      case 'compost':
      case 'plant':
        return <Leaf className="w-8 h-8 text-emerald-400" />;
      case 'water':
        return <Droplets className="w-8 h-8 text-sky-400" />;
      case 'bag':
        return <ShoppingBag className="w-8 h-8 text-teal-400" />;
      case 'plan':
        return <BookOpen className="w-8 h-8 text-indigo-400" />;
      case 'utensils':
        return <Utensils className="w-8 h-8 text-amber-400" />;
      case 'recycle':
        return <Recycle className="w-8 h-8 text-emerald-400" />;
      case 'sparkles':
        return <Sparkles className="w-8 h-8 text-amber-300" />;
      case 'flame':
        return <Flame className="w-8 h-8 text-orange-400" />;
      case 'heart':
        return <Heart className="w-8 h-8 text-rose-400" />;
      case 'clock':
        return <Clock className="w-8 h-8 text-purple-400" />;
      default:
        return <Leaf className="w-8 h-8 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-theme-card border-t sm:border border-theme-card rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[88vh] sm:max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="w-12 h-1.5 bg-theme-muted/40 rounded-full mx-auto sm:hidden -mt-1 mb-1 shrink-0" />
        
        {/* Header with Category & Day pill */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-theme-primary/20 text-theme-primary text-[10px] font-extrabold uppercase tracking-wider">
                {tip.dayName} Eco Focus
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-theme-card-subtle border border-theme-card text-theme-muted text-[10px] font-bold">
                {tip.category}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-theme-main tracking-tight pt-1">
              {tip.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-theme-muted hover:text-theme-main cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Visual Card */}
        <div className="bg-theme-card-subtle p-4 rounded-2xl border border-theme-card flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-theme-card border border-theme-primary-border flex items-center justify-center shrink-0 shadow-sm">
            {renderTipIconLarge(tip.iconType)}
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-theme-main leading-relaxed font-medium">
              {tip.description}
            </p>
            {tip.impactStat && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-extrabold border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{tip.impactStat}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actionable Steps Checklist */}
        {tip.actionableSteps && tip.actionableSteps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-theme-main flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-theme-primary" />
              <span>Actionable Steps to Take Today:</span>
            </h4>
            <div className="space-y-2">
              {tip.actionableSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-theme-card-subtle/80 border border-theme-card p-3 rounded-xl text-xs text-theme-main"
                >
                  <span className="w-5 h-5 rounded-full bg-theme-primary text-black font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Did You Know? Scientific Insight */}
        {tip.didYouKnow && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-amber-400">
              <Lightbulb className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider">
                Did You Know? (Eco Science Fact)
              </span>
            </div>
            <p className="text-xs text-theme-main/90 leading-relaxed pl-6">
              {tip.didYouKnow}
            </p>
          </div>
        )}

        {/* Campus Cafeteria Application Guide */}
        {tip.campusApplication && (
          <div className="bg-theme-card-subtle p-3.5 rounded-2xl border border-theme-card space-y-1">
            <div className="flex items-center gap-2 text-theme-primary">
              <Utensils className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider">
                BBS PIK Campus Dining Guide
              </span>
            </div>
            <p className="text-xs text-theme-muted leading-relaxed pl-6">
              {tip.campusApplication}
            </p>
          </div>
        )}

        {/* Milestone Bonus & Action Button */}
        <div className="pt-2 space-y-2">
          <button
            onClick={learned ? onClose : handleLearnClick}
            className={`w-full py-3.5 rounded-full font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              learned
                ? 'bg-emerald-500 text-black shadow-emerald-500/30'
                : 'bg-theme-primary text-black hover:opacity-90 shadow-theme-glow'
            }`}
          >
            {learned ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Tip Mastered! (+{tip.bonusXp || 20} XP Logged)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Got It! I'll Practice This Today (+{tip.bonusXp || 20} XP)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
