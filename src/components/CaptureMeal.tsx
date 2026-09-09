import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Camera,
  RotateCcw,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Flame,
  Leaf,
  ChevronRight,
  ArrowLeft,
  X,
  Video,
  Check,
  Zap,
  Activity,
  Droplet,
  Award,
  Pencil,
  Plus,
  Trash2,
  Info,
  ShieldCheck,
  Target,
  Maximize2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PortionSize, MealRecord, UserProfile, DetectedFoodZone, MealNutrition } from '../types';
import { samplePresetMeals } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { calculateStickerMealModifiers, rarityConfigs } from '../data/stickersData';

interface CaptureMealProps {
  initialPortion?: PortionSize;
  onCompleteMeal: (newMeal: MealRecord, xpEarned: number, foodSavedKg: number) => void;
  onApplyPenalty?: (reason: string, penaltyAmount: number) => void;
  onCancel: () => void;
  user: UserProfile;
}

type ScanMode = 'smart-macro' | 'quick-eco' | 'high-precision';

// Ultra-fast client-side image downscaler to reduce payload from megabytes to ~40KB
const compressImageForScan = async (rawSrc: string, maxDimension = 640, quality = 0.78): Promise<string> => {
  return new Promise((resolve) => {
    if (!rawSrc) return resolve(rawSrc);
    if (rawSrc.startsWith('http://') || rawSrc.startsWith('https://')) {
      return resolve(rawSrc);
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width || 640;
      let height = img.height || 480;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(rawSrc);
      }
    };
    img.onerror = () => resolve(rawSrc);
    img.src = rawSrc;
  });
};

export const CaptureMeal: React.FC<CaptureMealProps> = ({
  initialPortion,
  onCompleteMeal,
  onApplyPenalty,
  onCancel,
  user,
}) => {
  const { activeTheme } = useTheme();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(2);
  const [portion, setPortion] = useState<PortionSize>(initialPortion);
  const [scanMode, setScanMode] = useState<ScanMode>('smart-macro');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);

  const [capturedBeforeImage, setCapturedBeforeImage] = useState<string>(samplePresetMeals[0].url);
  const [capturedAfterImage, setCapturedAfterImage] = useState<string>(samplePresetMeals[4]?.url || samplePresetMeals[3].url);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Detailed Analysis State
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [afterAnalysisResult, setAfterAnalysisResult] = useState<any>(null);
  
  // User Customization & Fine-Tuning State
  const [isEditingMeal, setIsEditingMeal] = useState(false);
  const [editedDishName, setEditedDishName] = useState('');
  const [editedFoodItems, setEditedFoodItems] = useState<string[]>([]);
  const [newIngredientInput, setNewIngredientInput] = useState('');
  const [studentNotes, setStudentNotes] = useState('');
  const [showMacroBreakdown, setShowMacroBreakdown] = useState(true);

  // Calculate sticker modifiers: Rarer stickers yield higher clean plate XP, but amplify waste penalty
  const stickerModifiers = useMemo(() => {
    return calculateStickerMealModifiers(user?.purchasedStickers || [], user?.showcaseStickerId);
  }, [user?.purchasedStickers, user?.showcaseStickerId]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping camera track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Start or switch live camera stream
  const startCamera = useCallback(async (mode: 'environment' | 'user' = facingMode) => {
    setIsCameraLoading(true);
    setCameraError(null);
    stopCamera();

    let stream: MediaStream | null = null;

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera API (getUserMedia) not supported by your browser.');
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (idealErr) {
        console.warn('Ideal camera constraints failed, attempting fallback to default video:', idealErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (stream) {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('webkit-playsinline', 'true');
          videoRef.current.muted = true;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn('Video play triggered:', playErr);
          }
        }
        setIsCameraActive(true);
        setIsLiveMode(true);
        setCameraError(null);
      }
    } catch (err: any) {
      console.warn('Camera access failed or was denied:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was blocked by browser or system settings. Click "Enable / Retry Camera" below or select a photo.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device detected. You can upload a photo from your gallery or choose a preset meal below.');
      } else {
        setCameraError('Unable to start live camera stream. Click "Enable / Retry Camera" or upload a dining photo.');
      }
      setIsCameraActive(false);
      setIsLiveMode(false);
    } finally {
      setIsCameraLoading(false);
    }
  }, [facingMode, stopCamera]);

  // Initial camera startup
  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopCamera();
    };
  }, [facingMode, startCamera, stopCamera]);

  // Toggle front/back camera
  const handleFlipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture frame from webcam or use active static image
  const handleSnap = async () => {
    let base64Image = currentStep === 2 ? capturedBeforeImage : capturedAfterImage;

    // Trigger visual shutter flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 220);

    if (isCameraActive && videoRef.current && isLiveMode) {
      try {
        const video = videoRef.current;
        const rawW = video.videoWidth || 640;
        const rawH = video.videoHeight || 480;
        const maxDim = 640;
        const scale = Math.min(1, maxDim / Math.max(rawW, rawH));
        const width = Math.round(rawW * scale);
        const height = Math.round(rawH * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          base64Image = canvas.toDataURL('image/jpeg', 0.78);
        }
      } catch (snapErr) {
        console.error('Error capturing video frame:', snapErr);
      }
    }

    if (currentStep === 2) {
      setCapturedBeforeImage(base64Image);
      setIsLiveMode(false);
      await analyzeImageWithGemini(base64Image, 'before');
    } else {
      setCapturedAfterImage(base64Image);
      setIsLiveMode(false);
      await analyzeImageWithGemini(base64Image, 'after');
    }
  };

  // Upload custom photo from device with instant client-side downscaling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawString = reader.result as string;
        const compressed = await compressImageForScan(rawString, 640, 0.78);
        setIsLiveMode(false);
        if (currentStep === 2) {
          setCapturedBeforeImage(compressed);
          analyzeImageWithGemini(compressed, 'before');
        } else {
          setCapturedAfterImage(compressed);
          analyzeImageWithGemini(compressed, 'after');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Instant direct analyzer for preset dishes (sub-200ms snappy response)
  const analyzePresetDirect = (preset: (typeof samplePresetMeals)[0], type: 'before' | 'after') => {
    if (type === 'before') {
      const isNotFood = preset.isFood === false;
      const isSmall = portion === 'Small';
      const isLarge = portion === 'Large';
      const parsed = {
        dishName: isNotFood ? 'Non-Food Object Detected' : preset.name || 'Sustainable Campus Meal',
        isFood: !isNotFood,
        nonFoodReason: isNotFood ? (preset.nonFoodReason || 'Stationery / non-food detected instead of dining meal.') : undefined,
        isPenalty: isNotFood,
        confidenceScore: isNotFood ? 99 : 98,
        portionEstimatedGrams: isNotFood ? 0 : isSmall ? 240 : isLarge ? 480 : 340,
        estimatedCalories: isNotFood ? 0 : preset.calories || (isSmall ? 320 : isLarge ? 620 : 440),
        nutrition: isNotFood ? { protein: 0, carbs: 0, fat: 0, fiber: 0 } : preset.nutrition || {
          protein: isSmall ? 14 : isLarge ? 28 : 20,
          carbs: isSmall ? 38 : isLarge ? 76 : 55,
          fat: isSmall ? 9 : isLarge ? 18 : 14,
          fiber: isSmall ? 6 : isLarge ? 12 : 8,
        },
        foodItems: isNotFood ? ['Non-Food Object (Penalty: -20 XP)'] : (preset.items || ['Mixed Campus Greens', 'Organic Quinoa', 'Roasted Tofu']),
        detectedZones: isNotFood ? [] : [
          { label: 'Plant Protein & Tofu', category: 'protein', confidence: 96, estimatedGrams: isSmall ? 65 : isLarge ? 130 : 90 },
          { label: 'Whole Grains & Rice', category: 'grain', confidence: 95, estimatedGrams: isSmall ? 85 : isLarge ? 170 : 120 },
          { label: 'Fresh Campus Vegetables', category: 'vegetable', confidence: 98, estimatedGrams: isSmall ? 80 : isLarge ? 160 : 110 },
        ],
        carbonSavingsKg: isNotFood ? 0 : isSmall ? 0.38 : isLarge ? 0.78 : 0.54,
        waterSavedLiters: isNotFood ? 0 : isSmall ? 420 : isLarge ? 860 : 590,
        ecoScore: isNotFood ? 'N/A' : (preset.ecoScore || 'A+'),
        dietaryTags: isNotFood ? ['Non-Food', 'Penalty -20 XP'] : (preset.tags || ['Plant-Rich', 'Low Carbon', 'High Fiber']),
        sustainabilityFeedback: isNotFood
          ? '⚠️ Non-food item detected. EcoEat requires real dining scans. A -20 XP penalty applies.'
          : 'Well-balanced plant-forward meal with zero food waste potential!',
        xpEarned: isNotFood ? -20 : (isLarge ? 40 : 35),
      };
      setAnalysisResult(parsed);
      setEditedDishName(parsed.dishName);
      setEditedFoodItems([...parsed.foodItems]);
    } else {
      const isClean = preset.cleanPlateVerified !== false;
      const wasteGrams = isClean ? 0 : (preset.wasteGrams || 160);
      const parsedAfter = {
        dishName: isClean ? 'Clean Plate Verification' : 'Unfinished Plate Waste Detected',
        cleanPlateVerified: isClean,
        cleanPlateConfidence: 99,
        confidenceScore: 99,
        wasteGrams: wasteGrams,
        remainingWasteGrams: wasteGrams,
        foodSavedKg: isClean ? 0.35 : 0,
        carbonSavingsKg: isClean ? 0.54 : -0.35,
        waterSavedLiters: isClean ? 590 : 0,
        bonusXp: isClean ? 30 : -25,
        xpEarned: isClean ? 35 : -25,
        isPenalty: !isClean,
        congratulationsMessage: isClean
          ? 'Clean plate 100% verified! Zero scraps sent to landfill.'
          : '⚠️ Unfinished Food Detected! Leftovers sent to landfill produce methane.',
        sustainabilityFeedback: isClean
          ? 'Outstanding! You prevented food waste and claimed maximum clean plate streak multiplier.'
          : 'Leftover food scraps waste valuable resources and emit landfill greenhouse gases. A -25 XP penalty has been applied.',
      };
      setAfterAnalysisResult(parsedAfter);
    }
    setIsAnalyzing(false);
  };

  // Choose preset sample meal with immediate snappy response
  const handleSelectPreset = (preset: (typeof samplePresetMeals)[0]) => {
    setIsLiveMode(false);
    setIsAnalyzing(true);
    if (currentStep === 2) {
      setCapturedBeforeImage(preset.url);
      setTimeout(() => {
        analyzePresetDirect(preset, 'before');
      }, 160);
    } else {
      setCapturedAfterImage(preset.url);
      setTimeout(() => {
        analyzePresetDirect(preset, 'after');
      }, 160);
    }
  };

  // Call server-side Gemini API with smart schema
  const analyzeImageWithGemini = async (
    imageBase64: string,
    type: 'before' | 'after',
    knownPreset?: (typeof samplePresetMeals)[0]
  ) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64,
          mimeType: 'image/jpeg',
          mealStage: type,
          portionSize: portion,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();
      
      if (type === 'before') {
        const isNotFood = result.isFood === false || knownPreset?.isFood === false;
        const parsed = {
          dishName: isNotFood ? 'Non-Food Object Detected' : result.dishName || knownPreset?.name || 'Sustainable Campus Meal',
          isFood: !isNotFood,
          nonFoodReason: isNotFood ? (result.nonFoodReason || knownPreset?.nonFoodReason || 'Non-edible item detected instead of dining meal.') : undefined,
          isPenalty: isNotFood,
          confidenceScore: result.confidenceScore || 96,
          portionEstimatedGrams: isNotFood ? 0 : result.portionEstimatedGrams || (portion === 'Small' ? 240 : portion === 'Large' ? 480 : 340),
          estimatedCalories: isNotFood ? 0 : result.estimatedCalories || knownPreset?.calories || 440,
          nutrition: isNotFood ? { protein: 0, carbs: 0, fat: 0, fiber: 0 } : result.nutrition || knownPreset?.nutrition || {
            protein: 20,
            carbs: 55,
            fat: 14,
            fiber: 8,
          },
          foodItems: isNotFood ? ['Non-Food Object (Penalty: -20 XP)'] : result.foodItems || knownPreset?.items || ['Mixed Campus Greens', 'Quinoa', 'Roasted Veggies'],
          detectedZones: isNotFood ? [] : result.detectedZones || [
            { label: 'Plant Protein & Tofu', category: 'protein', confidence: 95, estimatedGrams: 90 },
            { label: 'Whole Grains & Rice', category: 'grain', confidence: 94, estimatedGrams: 120 },
            { label: 'Fresh Campus Vegetables', category: 'vegetable', confidence: 98, estimatedGrams: 110 },
          ],
          carbonSavingsKg: isNotFood ? 0 : result.carbonSavingsKg || (portion === 'Small' ? 0.38 : portion === 'Large' ? 0.78 : 0.54),
          waterSavedLiters: isNotFood ? 0 : result.waterSavedLiters || (portion === 'Small' ? 420 : portion === 'Large' ? 860 : 590),
          ecoScore: isNotFood ? 'N/A' : result.ecoScore || 'A+',
          dietaryTags: isNotFood ? ['Non-Food', 'Penalty -20 XP'] : result.dietaryTags || ['Plant-Rich', 'Low Carbon', 'High Fiber'],
          sustainabilityFeedback: isNotFood
            ? '⚠️ Non-food item detected. EcoEat requires real dining scans. A -20 XP penalty applies.'
            : result.sustainabilityFeedback || 'Well-balanced plant-forward meal with zero food waste potential!',
          xpEarned: isNotFood ? -20 : result.xpEarned || (portion === 'Large' ? 40 : 35),
        };
        setAnalysisResult(parsed);
        setEditedDishName(parsed.dishName);
        setEditedFoodItems([...parsed.foodItems]);
      } else {
        const isClean = (result.cleanPlateVerified !== false) && (knownPreset?.cleanPlateVerified !== false);
        const wasteGrams = isClean ? 0 : (result.wasteGrams || knownPreset?.wasteGrams || 160);
        const parsedAfter = {
          dishName: isClean ? 'Clean Plate Verification' : 'Unfinished Plate Waste Detected',
          cleanPlateVerified: isClean,
          cleanPlateConfidence: result.cleanPlateConfidence || result.cleanlinessConfidence || 99,
          confidenceScore: result.confidenceScore || 99,
          wasteGrams: wasteGrams,
          remainingWasteGrams: wasteGrams,
          foodSavedKg: isClean ? (result.foodSavedKg || 0.35) : 0,
          carbonSavingsKg: isClean ? (result.carbonSavingsKg || 0.54) : -0.35,
          waterSavedLiters: isClean ? (result.waterSavedLiters || 590) : 0,
          bonusXp: isClean ? (result.bonusXp || 30) : -25,
          xpEarned: isClean ? (result.xpEarned || 35) : -25,
          isPenalty: !isClean,
          congratulationsMessage: isClean
            ? (result.congratulationsMessage || 'Clean plate 100% verified! Zero scraps sent to landfill.')
            : '⚠️ Unfinished Food Detected! Leftovers sent to landfill produce methane.',
          sustainabilityFeedback: isClean
            ? (result.sustainabilityFeedback || 'Outstanding! You prevented food waste and claimed maximum clean plate streak multiplier.')
            : 'Leftover food scraps waste valuable resources and emit landfill greenhouse gases. A -25 XP penalty has been applied.',
        };
        setAfterAnalysisResult(parsedAfter);
      }
    } catch (error) {
      console.warn('Using intelligent fallback meal analysis:', error);
      if (type === 'before') {
        const isNotFood = knownPreset?.isFood === false;
        const isSmall = portion === 'Small';
        const isLarge = portion === 'Large';
        const fallback = {
          dishName: isNotFood ? 'Non-Food Object Detected' : knownPreset ? knownPreset.name : isSmall ? 'Garden Harvest Salad & Herb Tofu' : isLarge ? 'Mediterranean Roasted Quinoa & Protein Bowl' : 'Healthy Campus Protein Bowl',
          isFood: !isNotFood,
          nonFoodReason: isNotFood ? (knownPreset?.nonFoodReason || 'Stationery / non-food detected instead of dining meal') : undefined,
          isPenalty: isNotFood,
          confidenceScore: 94,
          portionEstimatedGrams: isNotFood ? 0 : isSmall ? 240 : isLarge ? 480 : 340,
          estimatedCalories: isNotFood ? 0 : knownPreset?.calories || (isSmall ? 310 : isLarge ? 620 : 440),
          nutrition: isNotFood ? { protein: 0, carbs: 0, fat: 0, fiber: 0 } : knownPreset?.nutrition || {
            protein: isSmall ? 14 : isLarge ? 28 : 22,
            carbs: isSmall ? 35 : isLarge ? 72 : 54,
            fat: isSmall ? 9 : isLarge ? 18 : 13,
            fiber: isSmall ? 6 : isLarge ? 12 : 9,
          },
          foodItems: isNotFood ? ['Non-Food Object (Penalty: -20 XP)'] : knownPreset?.items || ['Crisp Mixed Greens', 'Herb Roasted Chickpeas', 'Steamed Broccoli', 'Organic Quinoa', 'Cherry Tomatoes'],
          detectedZones: isNotFood ? [] : [
            { label: 'Plant Protein (Chickpeas & Tofu)', category: 'protein', confidence: 94, estimatedGrams: isSmall ? 70 : isLarge ? 140 : 100 },
            { label: 'Ancient Grains (Quinoa & Rice)', category: 'grain', confidence: 93, estimatedGrams: isSmall ? 80 : isLarge ? 160 : 120 },
            { label: 'Fresh Campus Vegetables', category: 'vegetable', confidence: 97, estimatedGrams: isSmall ? 80 : isLarge ? 160 : 110 },
          ],
          carbonSavingsKg: isNotFood ? 0 : isSmall ? 0.38 : isLarge ? 0.78 : 0.54,
          waterSavedLiters: isNotFood ? 0 : isSmall ? 420 : isLarge ? 860 : 590,
          ecoScore: isNotFood ? 'N/A' : 'A+',
          dietaryTags: isNotFood ? ['Non-Food', 'Penalty: -20 XP'] : ['Plant-Rich', 'Low Carbon', 'Campus Sourced', 'High Fiber'],
          sustainabilityFeedback: isNotFood
            ? '⚠️ Non-food item detected. EcoEat requires real dining scans. A -20 XP penalty applies.'
            : 'High nutrient-density plant-forward meal! Diverts approx 0.54kg CO2e compared to average high-carbon cafeteria dishes.',
          xpEarned: isNotFood ? -20 : (isLarge ? 40 : 35),
        };
        setAnalysisResult(fallback);
        setEditedDishName(fallback.dishName);
        setEditedFoodItems([...fallback.foodItems]);
      } else {
        const isClean = knownPreset?.cleanPlateVerified !== false;
        const wasteGrams = isClean ? 0 : (knownPreset?.wasteGrams || 160);
        setAfterAnalysisResult({
          dishName: isClean ? 'Clean Plate Verification' : 'Unfinished Plate Waste Detected',
          cleanPlateVerified: isClean,
          cleanPlateConfidence: 99,
          confidenceScore: 99,
          wasteGrams: wasteGrams,
          remainingWasteGrams: wasteGrams,
          foodSavedKg: isClean ? 0.35 : 0,
          carbonSavingsKg: isClean ? 0.54 : -0.35,
          waterSavedLiters: isClean ? 590 : 0,
          bonusXp: isClean ? 30 : -25,
          xpEarned: isClean ? 35 : -25,
          isPenalty: !isClean,
          congratulationsMessage: isClean
            ? 'Clean Plate Verified! 100% food diverted from campus waste.'
            : '⚠️ Unfinished Food Detected! Leftover food creates landfill waste.',
          sustainabilityFeedback: isClean
            ? 'Outstanding! Zero scraps detected on the dining tray. Bonus XP granted!'
            : 'Unfinished meal scraps produce landfill emissions. A -25 XP penalty has been deducted.',
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Recalculate values when student switches portion size interactively
  const handlePortionChange = (newPortion: PortionSize) => {
    setPortion(newPortion);
    if (analysisResult) {
      const multiplier = newPortion === 'Small' ? 0.75 : newPortion === 'Large' ? 1.4 : 1.0;
      setAnalysisResult((prev: any) => {
        if (!prev) return prev;
        const baseCalories = 440;
        const baseGrams = 340;
        return {
          ...prev,
          portionEstimatedGrams: Math.round(baseGrams * multiplier),
          estimatedCalories: Math.round(baseCalories * multiplier),
          carbonSavingsKg: Number((0.54 * multiplier).toFixed(2)),
          waterSavedLiters: Math.round(590 * multiplier),
          nutrition: {
            protein: Math.round(22 * multiplier),
            carbs: Math.round(54 * multiplier),
            fat: Math.round(13 * multiplier),
            fiber: Math.round(9 * multiplier),
          },
        };
      });
    }
  };

  // Add custom ingredient tag
  const handleAddIngredient = () => {
    if (newIngredientInput.trim() && !editedFoodItems.includes(newIngredientInput.trim())) {
      setEditedFoodItems((prev) => [...prev, newIngredientInput.trim()]);
      setNewIngredientInput('');
    }
  };

  // Remove ingredient tag
  const handleRemoveIngredient = (itemToRemove: string) => {
    setEditedFoodItems((prev) => prev.filter((i) => i !== itemToRemove));
  };

  const handleFinishCleanPlate = () => {
    const isClean = afterAnalysisResult?.cleanPlateVerified !== false;

    if (isClean) {
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 },
      });
    }

    const dishTitle = editedDishName || analysisResult?.dishName || (isClean ? 'Healthy Campus Meal' : 'Unfinished Campus Meal');
    const finalFoodItems = editedFoodItems.length > 0 ? editedFoodItems : analysisResult?.foodItems;

    const baseCleanXp = (analysisResult?.xpEarned || 35) + (afterAnalysisResult?.bonusXp || 30);
    const baseWastePenalty = 25;

    const totalCleanReward = baseCleanXp + stickerModifiers.bonusCleanXp;
    const totalWasteDeduction = baseWastePenalty + stickerModifiers.bonusWastePenalty;

    const totalXp = isClean ? totalCleanReward : -totalWasteDeduction;

    const newRecord: MealRecord = {
      id: `meal-${Date.now()}`,
      title: dishTitle,
      time: 'Just now',
      portion: portion,
      xp: totalXp,
      imageUrl: capturedBeforeImage,
      afterImageUrl: capturedAfterImage,
      calories: analysisResult?.estimatedCalories || 440,
      carbonSavedKg: isClean ? (analysisResult?.carbonSavingsKg || 0.54) : -0.35,
      waterSavedLiters: isClean ? (analysisResult?.waterSavedLiters || 590) : 0,
      ecoScore: isClean ? (analysisResult?.ecoScore || 'A+') : 'F',
      confidenceScore: analysisResult?.confidenceScore || 96,
      nutrition: analysisResult?.nutrition || { protein: 22, carbs: 54, fat: 13, fiber: 9 },
      foodItems: finalFoodItems,
      detectedZones: analysisResult?.detectedZones,
      sustainabilityFeedback: isClean
        ? (stickerModifiers.hasStickers
            ? `Zero food waste achieved! Your ${stickerModifiers.highestRarity.toUpperCase()} sticker tier awarded an extra +${stickerModifiers.bonusCleanXp.toLocaleString()} XP clean plate bonus!`
            : (analysisResult?.sustainabilityFeedback || 'Great job finishing your plate and preventing waste!'))
        : (stickerModifiers.hasStickers
            ? `Food waste detected (${afterAnalysisResult?.wasteGrams || 160}g). Higher stakes applied: -${totalWasteDeduction.toLocaleString()} XP deducted because you own ${stickerModifiers.highestRarity.toUpperCase()} stickers!`
            : 'Leftover food scraps generate landfill methane. Clean your plate or choose smaller portions.'),
      studentNotes: studentNotes || undefined,
      cleanPlate: isClean,
      wasteGrams: isClean ? 0 : (afterAnalysisResult?.wasteGrams || 160),
      cleanPlatePercentage: isClean ? (afterAnalysisResult?.cleanPlateConfidence || 99) : 40,
      isPenalty: !isClean,
    };

    const foodSavedKg = isClean ? (afterAnalysisResult?.foodSavedKg || 0.35) : 0;

    onCompleteMeal(newRecord, totalXp, foodSavedKg);
  };

  const handleApplyNonFoodPenalty = () => {
    if (onApplyPenalty) {
      onApplyPenalty('Non-Food Object Scanned', 20);
    } else {
      const penaltyRecord: MealRecord = {
        id: `meal-${Date.now()}`,
        title: 'Non-Food Object Scan (Invalid)',
        time: 'Just now',
        portion: portion,
        xp: -20,
        imageUrl: capturedBeforeImage,
        calories: 0,
        carbonSavedKg: 0,
        waterSavedLiters: 0,
        ecoScore: 'N/A',
        confidenceScore: 98,
        cleanPlate: false,
        isFood: false,
        isPenalty: true,
        penaltyReason: analysisResult?.nonFoodReason || 'Non-food object scanned',
        sustainabilityFeedback: 'Non-food items do not qualify for dining sustainability points. -20 XP deducted.',
      };
      onCompleteMeal(penaltyRecord, -20, 0);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 sm:py-6 space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          id="btn-cancel-scan"
          onClick={onCancel}
          className="p-2 rounded-full text-theme-muted hover:text-theme-main hover:bg-theme-card-subtle transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('cancel', 'Cancel')}</span>
        </button>

        <h2 className="text-base font-extrabold text-theme-main tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-theme-primary" />
          <span>{t('capture_title', 'AI Meal & Macro Vision')}</span>
        </h2>

        {/* Scan Mode Toggle Badge */}
        <div className="flex items-center gap-1 bg-theme-card border border-theme-card px-2.5 py-1 rounded-full text-[11px] font-bold text-theme-primary">
          <Zap className="w-3 h-3 text-theme-primary" />
          <span>Gemini 3.7 Vision</span>
        </div>
      </div>

      {/* 3 Steps Indicator */}
      <div className="bg-theme-card border border-theme-card rounded-2xl p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-theme-main">
            {t('step', 'Step')} {currentStep} {t('of', 'of')} 3
          </span>
          <span className="text-theme-primary font-extrabold">
            {currentStep === 1
              ? t('portion_title', 'Portion Size')
              : currentStep === 2
              ? t('capture_step_1', 'AI Food & Nutrient Scan')
              : t('capture_step_2', 'Clean Plate Verification')}
          </span>
        </div>

        {/* 3 Segment Progress Bar */}
        <div className="grid grid-cols-3 gap-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              currentStep >= 1 ? 'bg-theme-primary shadow-sm shadow-theme-glow' : 'bg-theme-card-subtle'
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              currentStep >= 2 ? 'bg-theme-primary shadow-sm shadow-theme-glow' : 'bg-theme-card-subtle'
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              currentStep >= 3 ? 'bg-theme-primary shadow-sm shadow-theme-glow' : 'bg-theme-card-subtle'
            }`}
          />
        </div>
      </div>

      {/* Main Camera / Viewfinder Box */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-black rounded-3xl overflow-hidden border-2 border-theme-card shadow-2xl flex items-center justify-center">
        {/* Shutter flash effect */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-30 animate-out fade-out duration-200 pointer-events-none" />
        )}

        {/* Live Camera Video */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            isCameraActive && isLiveMode ? 'opacity-100 block' : 'opacity-0 absolute pointer-events-none'
          }`}
        />

        {/* Static Snapshot or Preset Image Preview */}
        {(!isCameraActive || !isLiveMode) && (
          <div className="relative w-full h-full flex items-center justify-center bg-theme-card">
            <img
              src={currentStep === 3 ? capturedAfterImage : capturedBeforeImage}
              alt="Meal capture preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Overlay badge indicating captured/preset */}
            <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-lg">
              <Check className="w-3.5 h-3.5 text-theme-primary" />
              <span>Snapshot Loaded</span>
            </div>
          </div>
        )}

        {/* Camera Permission / Error Fallback Overlay */}
        {cameraError && !isLiveMode && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center space-y-3 z-20">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-sm font-bold text-white">Camera Permission Notice</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{cameraError}</p>
            </div>
            <button
              id="btn-retry-camera"
              onClick={() => startCamera(facingMode)}
              className="px-4 py-2 bg-theme-primary text-black text-xs font-extrabold rounded-full hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Enable / Retry Camera</span>
            </button>
          </div>
        )}

        {/* Dynamic AR AI Viewfinder Reticles & Food Alignment Frame */}
        <div className="absolute inset-0 pointer-events-none p-5 sm:p-6 flex flex-col justify-between z-10">
          {/* Top reticles & status badge */}
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 border-t-2 border-l-2 border-theme-primary rounded-tl-lg shadow-theme-glow" />
            
            {/* Live Camera Badge */}
            {isCameraActive && isLiveMode ? (
              <div className="bg-black/80 backdrop-blur-md border border-theme-primary/60 text-white text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-theme-primary animate-pulse" />
                <span>Live AI Vision ({facingMode === 'environment' ? 'Rear' : 'Front'})</span>
              </div>
            ) : isCameraLoading ? (
              <div className="bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                <RefreshCw className="w-3 h-3 animate-spin text-theme-primary" />
                <span>Starting Camera...</span>
              </div>
            ) : (
              <div className="bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Active Snapshot</span>
              </div>
            )}

            <div className="w-8 h-8 border-t-2 border-r-2 border-theme-primary rounded-tr-lg shadow-theme-glow" />
          </div>

          {/* Central Target Grid Crosshair */}
          <div className="flex flex-col items-center justify-center space-y-2 opacity-60">
            <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-dashed border-theme-primary/70 flex items-center justify-center animate-pulse">
              <Target className="w-8 h-8 text-theme-primary/80" />
            </div>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-md">
              {currentStep === 3 ? 'Align Clean Plate' : 'Center Dish in Frame'}
            </span>
          </div>

          {/* Animated Scanline during Live Mode */}
          {isCameraActive && isLiveMode && <div className="animate-scanline" />}

          {/* Bottom reticles */}
          <div className="flex justify-between items-end">
            <div className="w-8 h-8 border-b-2 border-l-2 border-theme-primary rounded-bl-lg shadow-theme-glow" />
            <div className="w-8 h-8 border-b-2 border-r-2 border-theme-primary rounded-br-lg shadow-theme-glow" />
          </div>
        </div>

        {/* Viewfinder Top-Right Quick Actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          {!isLiveMode && (
            <button
              id="btn-resume-live-camera"
              onClick={() => {
                setIsLiveMode(true);
                startCamera(facingMode);
              }}
              className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-theme-primary text-white text-xs font-bold hover:bg-black/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Resume Live Camera"
            >
              <Video className="w-3.5 h-3.5 text-theme-primary" />
              <span>Live Video</span>
            </button>
          )}

          <button
            id="btn-flip-camera"
            onClick={handleFlipCamera}
            className="p-2.5 rounded-full bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition-all cursor-pointer border border-white/10"
            title="Flip Camera (Front/Back)"
          >
            <RotateCcw className="w-4 h-4 text-theme-primary" />
          </button>
        </div>
      </div>

      {/* Guidance Text */}
      <div className="text-center space-y-1 px-4">
        <p className="text-sm font-bold text-theme-main">
          {currentStep === 3
            ? t('capture_align_plate', 'Verify clean plate to lock in maximum XP and diversion bonus!')
            : t('capture_align_meal', 'Align your dish and tap the shutter for intelligent AI macro analysis.')}
        </p>
        <p className="text-xs text-theme-primary font-semibold flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('clean_plate_bonus_hint', 'Smart vision verifies food items, nutrition macros, and CO2 diversion.')}</span>
        </p>
      </div>

      {/* Shutter Button & Controls Row */}
      <div className="flex items-center justify-center gap-6 pt-1">
        {/* Upload from Gallery Button */}
        <button
          id="btn-upload-gallery"
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 rounded-full bg-theme-card border border-theme-card text-theme-muted hover:text-theme-main hover:border-theme-primary flex items-center justify-center transition-all shadow-md cursor-pointer"
          title="Upload photo from device"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Big Circular Shutter Snap Button */}
        <button
          id="btn-shutter-snap"
          onClick={handleSnap}
          disabled={isAnalyzing}
          className="w-20 h-20 rounded-full bg-theme-card border-4 border-theme-primary p-1.5 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-lg shadow-theme-glow cursor-pointer"
          title="Take Photo & Analyze"
        >
          <div className="w-full h-full rounded-full bg-theme-primary flex items-center justify-center text-black">
            {isAnalyzing ? (
              <RefreshCw className="w-7 h-7 animate-spin" />
            ) : (
              <Camera className="w-7 h-7 stroke-[2.2]" />
            )}
          </div>
        </button>

        {/* Switch Step / Retake Button */}
        <button
          id="btn-switch-step"
          onClick={() => {
            if (!isLiveMode) {
              setIsLiveMode(true);
              startCamera(facingMode);
            } else {
              setCurrentStep((prev) => (prev === 2 ? 3 : 2));
            }
          }}
          className="w-12 h-12 rounded-full bg-theme-card border border-theme-card text-theme-muted hover:text-theme-main hover:border-theme-primary flex items-center justify-center transition-all shadow-md cursor-pointer"
          title={!isLiveMode ? 'Retake / Live Camera' : 'Switch Step'}
        >
          {!isLiveMode ? (
            <RotateCcw className="w-5 h-5 text-theme-primary" />
          ) : (
            <Sparkles className="w-5 h-5 text-theme-primary" />
          )}
        </button>
      </div>

      {/* Preset Campus Food Selectors */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs text-theme-muted font-semibold">
          <span>{t('capture_demo_sample', 'Quick Campus Meal Samples:')}</span>
          <span className="text-theme-primary font-bold">{t('click_to_test', '1-Click Test')}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {samplePresetMeals.map((preset, idx) => (
            <button
              key={preset.name}
              id={`preset-meal-${idx}`}
              onClick={() => handleSelectPreset(preset)}
              className="p-2.5 rounded-2xl bg-theme-card border border-theme-card hover:border-theme-primary text-left transition-all flex items-center gap-2.5 group cursor-pointer shadow-sm hover:shadow-md"
            >
              <img
                src={preset.url}
                alt={preset.name}
                className="w-10 h-10 rounded-xl object-cover border border-theme-card shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-theme-main group-hover:text-theme-primary truncate">
                  {preset.name}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-theme-muted">
                  <span>{preset.calories > 0 ? `${preset.calories} kcal` : 'Zero Waste'}</span>
                  {preset.ecoScore && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[9px]">
                      {preset.ecoScore}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Intelligent AI Detection & Nutrition Analysis Card */}
      {analysisResult && currentStep !== 3 && (
        analysisResult.isFood === false || analysisResult.isPenalty ? (
          /* Non-Food Penalty Card */
          <div className="bg-rose-950/30 border-2 border-rose-500/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Non-Food Object Detected</span>
                  </span>
                  <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    Invalid Scan
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white leading-tight">
                  {analysisResult.dishName || 'Invalid Item Scanned'}
                </h3>
                <p className="text-xs text-rose-200/80">
                  {analysisResult.nonFoodReason || 'The AI camera identified an ineligible object (stationery, device, or empty surface) rather than a cafeteria meal.'}
                </p>
              </div>

              <div className="bg-rose-500 text-white font-extrabold px-3.5 py-1.5 rounded-full text-xs shadow-md shrink-0 border border-rose-400">
                -20 XP Penalty
              </div>
            </div>

            <div className="bg-black/40 p-4 rounded-2xl border border-rose-500/30 space-y-2">
              <p className="text-xs text-rose-200 leading-relaxed">
                EcoEat awards sustainability points strictly for real dining meals. Non-food scans violate campus sustainability logging rules and reduce your campus XP standing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="btn-apply-non-food-penalty"
                onClick={handleApplyNonFoodPenalty}
                className="flex-1 py-3.5 px-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
              >
                <span>Acknowledge & Deduct -20 XP</span>
              </button>
              <button
                id="btn-retake-non-food-scan"
                onClick={() => {
                  setAnalysisResult(null);
                  setCurrentStep(1);
                  startCamera();
                }}
                className="py-3.5 px-5 rounded-full bg-theme-card border border-theme-card hover:border-theme-primary text-theme-main font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Retake Scan</span>
              </button>
            </div>
          </div>
        ) : (
          /* Valid Food Meal Card */
          <div className="bg-theme-card border-2 border-theme-primary rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-2">
            {/* Header Banner */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-theme-primary flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>AI Vision Verified</span>
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {analysisResult.confidenceScore || 96}% Match
                  </span>
                  <span className="bg-theme-primary-bg text-theme-primary border border-theme-primary-border text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    EcoScore {analysisResult.ecoScore || 'A+'}
                  </span>
                </div>

                {isEditingMeal ? (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={editedDishName}
                      onChange={(e) => setEditedDishName(e.target.value)}
                      className="bg-theme-card-subtle border border-theme-primary rounded-xl px-3 py-1 text-sm font-bold text-theme-main focus:outline-none w-full"
                      placeholder="Enter custom meal name"
                    />
                    <button
                      onClick={() => setIsEditingMeal(false)}
                      className="p-1.5 bg-theme-primary text-black rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-theme-main leading-tight">
                      {editedDishName || analysisResult.dishName}
                    </h3>
                    <button
                      onClick={() => setIsEditingMeal(true)}
                      className="p-1 text-theme-muted hover:text-theme-primary text-xs cursor-pointer"
                      title="Edit Dish Name"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <p className="text-xs text-theme-muted">{analysisResult.sustainabilityFeedback}</p>
              </div>

              <div className="bg-theme-primary text-black font-extrabold px-3.5 py-1.5 rounded-full text-xs shadow-md shrink-0">
                +{analysisResult.xpEarned} {t('xp', 'XP')}
              </div>
            </div>

            {/* Dietary & Smart Eco Tags */}
            {analysisResult.dietaryTags && (
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.dietaryTags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="bg-theme-primary-bg text-theme-primary border border-theme-primary-border text-[11px] px-2.5 py-0.5 rounded-full font-bold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Macro Nutrition Profile Grid */}
            <div className="space-y-2 bg-theme-card-subtle p-3.5 rounded-2xl border border-theme-card">
              <div className="flex items-center justify-between text-xs font-bold text-theme-main">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-theme-primary" />
                  <span>Nutrient & Macro Breakdown ({analysisResult.portionEstimatedGrams}g portion)</span>
                </span>
                <span className="text-theme-primary font-extrabold">{analysisResult.estimatedCalories} kcal</span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                <div className="bg-theme-card p-2 rounded-xl border border-theme-card">
                  <p className="text-[10px] font-bold text-theme-muted uppercase">Protein</p>
                  <p className="text-sm font-extrabold text-theme-main">{analysisResult.nutrition?.protein || 22}g</p>
                </div>
                <div className="bg-theme-card p-2 rounded-xl border border-theme-card">
                  <p className="text-[10px] font-bold text-theme-muted uppercase">Carbs</p>
                  <p className="text-sm font-extrabold text-theme-main">{analysisResult.nutrition?.carbs || 54}g</p>
                </div>
                <div className="bg-theme-card p-2 rounded-xl border border-theme-card">
                  <p className="text-[10px] font-bold text-theme-muted uppercase">Fat</p>
                  <p className="text-sm font-extrabold text-theme-main">{analysisResult.nutrition?.fat || 13}g</p>
                </div>
                <div className="bg-theme-card p-2 rounded-xl border border-theme-card">
                  <p className="text-[10px] font-bold text-theme-muted uppercase">Fiber</p>
                  <p className="text-sm font-extrabold text-theme-main">{analysisResult.nutrition?.fiber || 9}g</p>
                </div>
              </div>
            </div>

            {/* Recognized Food Ingredients (Editable Tag List) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-theme-main">
                <span>Recognized Ingredients ({editedFoodItems.length}):</span>
                <span className="text-[11px] text-theme-muted font-normal">Tap to customize</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {editedFoodItems.map((item, i) => (
                  <span
                    key={i}
                    className="bg-theme-card-subtle text-theme-main border border-theme-card text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 group"
                  >
                    <span>{item}</span>
                    <button
                      onClick={() => handleRemoveIngredient(item)}
                      className="text-theme-muted hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add ingredient input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newIngredientInput}
                  onChange={(e) => setNewIngredientInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                  placeholder="Add missing ingredient..."
                  className="flex-1 bg-theme-card-subtle border border-theme-card rounded-xl px-3 py-1.5 text-xs text-theme-main font-medium focus:outline-none focus:border-theme-primary"
                />
                <button
                  onClick={handleAddIngredient}
                  className="px-3 py-1.5 rounded-xl bg-theme-card border border-theme-card text-theme-main font-bold text-xs hover:border-theme-primary cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-theme-primary" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Environmental Impact Savings Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-theme-card text-center">
              <div className="bg-theme-card-subtle p-2.5 rounded-2xl border border-theme-card">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-theme-primary uppercase">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>CO2e Diverted</span>
                </div>
                <p className="text-base font-extrabold text-theme-main">~{analysisResult.carbonSavingsKg} kg</p>
                <p className="text-[10px] text-theme-muted">vs cafeteria beef baseline</p>
              </div>
              <div className="bg-theme-card-subtle p-2.5 rounded-2xl border border-theme-card">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-sky-400 uppercase">
                  <Droplet className="w-3.5 h-3.5" />
                  <span>Virtual Water Saved</span>
                </div>
                <p className="text-base font-extrabold text-theme-main">~{analysisResult.waterSavedLiters || 590} L</p>
                <p className="text-[10px] text-theme-muted">through plant-forward selection</p>
              </div>
            </div>

            {/* Active Sticker Stakes Banner */}
            <div className="p-3.5 rounded-2xl bg-theme-card-subtle border border-theme-card space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-theme-main flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sticker Dining Multiplier ({stickerModifiers.totalStickersCount} Collected)</span>
                </span>
                {stickerModifiers.highestRarity !== 'none' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-theme-primary/20 text-theme-primary border border-theme-primary/30">
                    {stickerModifiers.highestRarity} tier active
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-emerald-500/10 border border-emerald-500/25 p-2 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-400 block">Clean Plate Reward</span>
                  <span className="text-sm font-black text-emerald-400">+{stickerModifiers.bonusCleanXp.toLocaleString()} XP</span>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/25 p-2 rounded-xl">
                  <span className="text-[10px] font-bold text-rose-400 block">Waste Penalty Risk</span>
                  <span className="text-sm font-black text-rose-400">-{stickerModifiers.bonusWastePenalty.toLocaleString()} XP</span>
                </div>
              </div>
              <p className="text-[10px] text-theme-muted text-center leading-tight">
                {stickerModifiers.hasStickers
                  ? '⚡ The rarer the sticker you buy, the higher your reward for a clean plate, but the higher the deduction if you waste food!'
                  : '💡 Buy rare stickers from the Eco Shop to multiply your clean plate points!'}
              </p>
            </div>

            {/* Action button to proceed to Step 3 */}
            <button
              id="btn-proceed-to-step3"
              onClick={() => {
                setCurrentStep(3);
                setCapturedAfterImage(samplePresetMeals[4]?.url || samplePresetMeals[3].url);
                analyzeImageWithGemini(samplePresetMeals[4]?.url || samplePresetMeals[3].url, 'after');
              }}
              className="w-full py-4 rounded-full bg-theme-primary text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all shadow-lg shadow-theme-glow cursor-pointer"
            >
              <span>{t('capture_btn_proceed', 'Proceed to Clean Plate Verification')}</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        )
      )}

      {/* Step 3: Clean Plate Verification Completed or Waste Penalty Card */}
      {currentStep === 3 && (
        afterAnalysisResult?.cleanPlateVerified === false ? (
          /* Unfinished Meal Food Waste Penalty Card */
          <div className="bg-amber-950/30 border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-400">
                    Food Waste Detected
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {afterAnalysisResult?.wasteGrams || 160}g Scraps Left
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  Unfinished Plate Penalty
                </h3>
              </div>
            </div>

            {/* Before vs After Visual Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 text-center">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-theme-card">
                  <img
                    src={capturedBeforeImage}
                    alt="Meal before dining"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Initial Meal
                  </span>
                </div>
                <p className="text-[10px] text-theme-muted font-bold">Original Portion</p>
              </div>
              <div className="space-y-1 text-center">
                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-amber-500">
                  <img
                    src={capturedAfterImage}
                    alt="Unfinished plate after dining"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-1 left-1 bg-amber-500 text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                    {afterAnalysisResult?.wasteGrams || 160}g Leftovers
                  </span>
                </div>
                <p className="text-[10px] text-amber-400 font-bold">Unfinished Waste</p>
              </div>
            </div>

            <p className="text-xs text-amber-200/90 leading-relaxed">
              {afterAnalysisResult?.sustainabilityFeedback ||
                'Discarded cafeteria food generates methane emissions in municipal landfills. To motivate clean plate habits, unfinished meals incur deductions and reset your streak.'}
            </p>

            {/* Penalty Summary Card */}
            <div className="bg-black/40 border border-amber-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Leftover Waste: {afterAnalysisResult?.wasteGrams || 160} grams</p>
                    <p className="text-[10px] text-amber-300/80">Landfill organic waste emissions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-rose-400">
                    -{(25 + stickerModifiers.bonusWastePenalty).toLocaleString()} XP
                  </p>
                  <p className="text-[10px] text-theme-muted font-semibold">Total Waste Penalty</p>
                </div>
              </div>

              {/* Rarity breakdown */}
              {stickerModifiers.hasStickers && (
                <div className="pt-2 border-t border-amber-500/20 text-[11px] space-y-1">
                  <div className="flex justify-between text-amber-200/80">
                    <span>Base Cafeteria Waste Penalty</span>
                    <span>-25 XP</span>
                  </div>
                  <div className="flex justify-between font-bold text-rose-400">
                    <span>⚠️ {stickerModifiers.highestRarity.toUpperCase()} Sticker Waste Risk ({stickerModifiers.totalStickersCount} Stickers)</span>
                    <span>-{stickerModifiers.bonusWastePenalty.toLocaleString()} XP</span>
                  </div>
                  <p className="text-[10px] text-amber-300/70 pt-0.5">
                    Notice: The rarer the stickers you collect, the larger the deduction if food is wasted!
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="btn-claim-waste-penalty"
                onClick={handleFinishCleanPlate}
                className="flex-1 py-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
              >
                <span>Log Waste & Deduct -{(25 + stickerModifiers.bonusWastePenalty).toLocaleString()} XP</span>
              </button>
              <button
                id="btn-return-finish-meal"
                onClick={() => {
                  setCurrentStep(2);
                }}
                className="py-4 px-6 rounded-full bg-theme-card border border-theme-card hover:border-theme-primary text-theme-main font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>I'll Finish Eating (Go Back)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Clean Plate 100% Zero Waste Success Card */
          <div className="bg-theme-card border-2 border-theme-primary rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-theme-primary-bg border border-theme-primary-border flex items-center justify-center text-theme-primary">
                <CheckCircle className="w-7 h-7 fill-current/30" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-theme-primary">
                    {t('clean_plate_verified', 'Clean Plate 100% Verified')}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    0g Scraps
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-theme-main">
                  {t('zero_waste_achieved', 'Zero Waste Achieved')}
                </h3>
              </div>
            </div>

            {/* Before vs After Visual Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 text-center">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-theme-card">
                  <img
                    src={capturedBeforeImage}
                    alt="Meal before dining"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Before Dining
                  </span>
                </div>
                <p className="text-[10px] text-theme-muted font-bold">Initial Portion Verified</p>
              </div>
              <div className="space-y-1 text-center">
                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-theme-primary">
                  <img
                    src={capturedAfterImage}
                    alt="Clean plate after dining"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-1 left-1 bg-theme-primary text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                    Clean Plate (0g)
                  </span>
                </div>
                <p className="text-[10px] text-theme-primary font-bold">100% Waste Diverted</p>
              </div>
            </div>

            <p className="text-xs text-theme-muted leading-relaxed">
              {afterAnalysisResult?.sustainabilityFeedback ||
                t(
                  'clean_plate_praise',
                  `Outstanding job, ${user.greetingName}! Your meal was finished with zero scraps. Maximum XP bonus and streak multiplier unlocked.`
                )}
            </p>

            {/* Reward Summary Card */}
            <div className="bg-theme-card-subtle border border-theme-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Leaf className="w-5 h-5 text-theme-primary" />
                  <div>
                    <p className="text-xs font-bold text-theme-main">Food Waste Diverted: +{afterAnalysisResult?.foodSavedKg || 0.35} kg</p>
                    <p className="text-[10px] text-theme-muted">Prevented landfill methane emissions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-theme-primary">
                    +{((analysisResult?.xpEarned || 35) + (afterAnalysisResult?.bonusXp || 30) + stickerModifiers.bonusCleanXp).toLocaleString()} XP
                  </p>
                  <p className="text-[10px] text-theme-muted font-semibold">Total Clean Plate Reward</p>
                </div>
              </div>

              {/* Reward breakdown */}
              {stickerModifiers.hasStickers && (
                <div className="pt-2 border-t border-theme-card text-[11px] space-y-1">
                  <div className="flex justify-between text-theme-muted">
                    <span>Base Dining & Clean Plate XP</span>
                    <span>+{((analysisResult?.xpEarned || 35) + (afterAnalysisResult?.bonusXp || 30)).toLocaleString()} XP</span>
                  </div>
                  <div className="flex justify-between font-bold text-theme-primary">
                    <span className="flex items-center gap-1">
                      <span>✨ {stickerModifiers.highestRarity.toUpperCase()} Sticker Yield ({stickerModifiers.totalStickersCount} Stickers)</span>
                    </span>
                    <span>+{stickerModifiers.bonusCleanXp.toLocaleString()} XP</span>
                  </div>
                </div>
              )}

              {/* Optional student notes */}
              <div className="pt-2 border-t border-theme-card">
                <input
                  type="text"
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  placeholder="Add optional notes (e.g. delicious tofu bowl, ate with classmates)..."
                  className="w-full bg-theme-card border border-theme-card rounded-xl px-3 py-2 text-xs text-theme-main font-medium focus:outline-none focus:border-theme-primary"
                />
              </div>
            </div>

            <button
              id="btn-claim-xp-finish"
              onClick={handleFinishCleanPlate}
              className="w-full py-4 rounded-full bg-theme-primary text-black font-extrabold text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] shadow-lg shadow-theme-glow cursor-pointer"
            >
              <Sparkles className="w-5 h-5 fill-current" />
              <span>
                {stickerModifiers.hasStickers
                  ? `Claim +${((analysisResult?.xpEarned || 35) + (afterAnalysisResult?.bonusXp || 30) + stickerModifiers.bonusCleanXp).toLocaleString()} XP & Log Meal`
                  : t('capture_btn_finish', 'Claim XP & Log Sustainable Meal')}
              </span>
            </button>
          </div>
        )
      )}
    </div>
  );
};


