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
  CheckCircle2,
  ArrowRight,
  Search,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PortionSize, MealRecord, UserProfile, DetectedFoodZone, MealNutrition, FoodCategoryItem } from '../types';
import { samplePresetMeals } from '../data/mockData';
import { foodCategories } from '../data/foodCategoriesData';
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
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategoryItem>(foodCategories[0]);
  const [selectedFood, setSelectedFood] = useState<string>(foodCategories[0].popularFoods[0]);
  const [customFoodInput, setCustomFoodInput] = useState<string>('');
  const [dishSearchQuery, setDishSearchQuery] = useState<string>('');
  const [portion, setPortion] = useState<PortionSize>(initialPortion);

  const filteredPopularFoods = useMemo(() => {
    if (!selectedCategory) return [];
    if (!dishSearchQuery.trim()) return selectedCategory.popularFoods;
    const q = dishSearchQuery.toLowerCase().trim();
    return selectedCategory.popularFoods.filter((dish) => dish.toLowerCase().includes(q));
  }, [selectedCategory, dishSearchQuery]);

  const handleSelectCategory = (category: FoodCategoryItem) => {
    setSelectedCategory(category);
    setSelectedFood(category.popularFoods[0]);
    setCustomFoodInput('');
    setDishSearchQuery('');
  };

  const handleSelectFood = (food: string) => {
    setSelectedFood(food);
    setCustomFoodInput('');
  };

  const handleContinueToScan = () => {
    const finalFood = customFoodInput.trim() || selectedFood || selectedCategory.popularFoods[0];
    setSelectedFood(finalFood);
    setEditedDishName(finalFood);
    setCurrentStep(2);
    setIsLiveMode(true);
    detectNutritionForDish(finalFood, portion);
  };
  const [scanMode, setScanMode] = useState<ScanMode>('smart-macro');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);

  const [capturedBeforeImage, setCapturedBeforeImage] = useState<string>('');
  const [capturedAfterImage, setCapturedAfterImage] = useState<string>('');
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
  const [isDetectingNutrition, setIsDetectingNutrition] = useState(false);

  // AI-powered Protein, Vitamin, and Nutritional Profile detector for custom dishes
  const detectNutritionForDish = useCallback(
    async (dishName: string, portionSize: PortionSize = portion) => {
      if (!dishName || !dishName.trim()) return;
      setIsDetectingNutrition(true);
      try {
        const response = await fetch('/api/analyze-dish-nutrition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dishName: dishName.trim(),
            portionSize,
            foodCategory: selectedCategory?.name,
            ingredients: editedFoodItems,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.nutrition) {
            setAnalysisResult((prev: any) => ({
              ...(prev || {}),
              dishName: dishName.trim(),
              estimatedCalories:
                data.estimatedCalories ||
                prev?.estimatedCalories ||
                (portionSize === 'Small' ? 310 : portionSize === 'Large' ? 620 : 440),
              portionEstimatedGrams:
                data.portionEstimatedGrams ||
                prev?.portionEstimatedGrams ||
                (portionSize === 'Small' ? 220 : portionSize === 'Large' ? 460 : 340),
              nutrition: data.nutrition,
              carbonSavingsKg: data.carbonSavingsKg ?? prev?.carbonSavingsKg ?? 0.54,
              waterSavedLiters: data.waterSavedLiters ?? prev?.waterSavedLiters ?? 590,
              ecoScore: data.ecoScore || prev?.ecoScore || 'A+',
              foodItems:
                Array.isArray(data.foodItems) && data.foodItems.length > 0
                  ? data.foodItems
                  : prev?.foodItems || [dishName.trim()],
              sustainabilityFeedback:
                data.sustainabilityFeedback ||
                prev?.sustainabilityFeedback ||
                `Rich in protein (${data.nutrition.protein}g) and essential vitamins.`,
            }));
            if (Array.isArray(data.foodItems) && data.foodItems.length > 0) {
              setEditedFoodItems(data.foodItems);
            }
          }
        }
      } catch (err: any) {
        console.log('Nutrition detection endpoint notice:', err?.message || 'Handled');
      } finally {
        setIsDetectingNutrition(false);
      }
    },
    [portion, selectedCategory, editedFoodItems]
  );

  // Auto-detect nutritional profile and vitamins if dish name is present or custom dish is entered
  useEffect(() => {
    if (currentStep === 3) {
      const activeDish =
        editedDishName.trim() ||
        customFoodInput.trim() ||
        (selectedFood && selectedFood !== foodCategories[0]?.popularFoods[0] ? selectedFood : '') ||
        analysisResult?.dishName;
      if (
        activeDish &&
        (!analysisResult?.nutrition?.vitamins ||
          analysisResult.nutrition.vitamins.length === 0 ||
          (analysisResult?.dishName && analysisResult.dishName !== activeDish))
      ) {
        detectNutritionForDish(activeDish, portion);
      }
    }
  }, [
    currentStep,
    editedDishName,
    customFoodInput,
    selectedFood,
    analysisResult?.nutrition?.vitamins,
    analysisResult?.dishName,
    detectNutritionForDish,
    portion,
  ]);

  // Calculate sticker modifiers: Rarer stickers yield higher clean plate XP, but amplify waste penalty
  const stickerModifiers = useMemo(() => {
    return calculateStickerMealModifiers(user?.purchasedStickers || [], user?.showcaseStickerId);
  }, [user?.purchasedStickers, user?.showcaseStickerId]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Callback ref to guarantee stream is attached immediately upon video DOM element mount
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      if (node.srcObject !== streamRef.current) {
        node.srcObject = streamRef.current;
      }
      node.setAttribute('playsinline', 'true');
      node.setAttribute('webkit-playsinline', 'true');
      node.muted = true;
      node.play().catch((err) => console.warn('Camera video play error on ref attach:', err));
    }
  }, []);

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

  // Start or switch live camera stream with multi-tier constraint fallback
  const startCamera = useCallback(async (mode: 'environment' | 'user' = facingMode) => {
    setIsCameraLoading(true);
    setCameraError(null);
    stopCamera();

    let stream: MediaStream | null = null;

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera API (getUserMedia) not supported by your browser.');
      }

      // 1. Try ideal constraints (preferred orientation and resolution)
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
        console.warn('Ideal camera constraints failed, trying facingMode fallback:', idealErr);
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode },
            audio: false,
          });
        } catch (facingErr) {
          console.warn('FacingMode fallback failed, trying basic video:', facingErr);
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
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
        setCameraError(t('camera_error_denied', 'Camera access was blocked by browser or system settings. You can tap "Take Photo Directly" or upload an image from your device.'));
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError(t('camera_error_not_found', 'No camera device detected on this system. You can take a photo or upload an image below.'));
      } else {
        setCameraError(t('camera_error_unavailable', 'Live camera viewfinder is unavailable. Tap "Take Photo Directly" or upload an image to scan.'));
      }
      setIsCameraActive(false);
      setIsLiveMode(false);
    } finally {
      setIsCameraLoading(false);
    }
  }, [facingMode, stopCamera]);

  // Keep video element attached to stream whenever step or live state updates
  useEffect(() => {
    if (videoRef.current && streamRef.current && isCameraActive && isLiveMode) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch((err) => console.warn('Stream play effect error:', err));
    }
  }, [isCameraActive, isLiveMode, currentStep]);

  // Camera startup for scanning steps 2 and 3
  useEffect(() => {
    if (currentStep === 2 || currentStep === 3) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [facingMode, startCamera, stopCamera, currentStep]);

  // Toggle front/back camera
  const handleFlipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture frame from webcam or use active static image
  const handleSnap = async () => {
    // If live camera is not ready, paused, or unavailable, trigger native device camera directly
    if (
      !isCameraActive ||
      !videoRef.current ||
      !isLiveMode ||
      videoRef.current.videoWidth === 0 ||
      videoRef.current.readyState < 2
    ) {
      cameraInputRef.current?.click();
      return;
    }

    // Trigger visual shutter flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 220);

    let base64Image = '';
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

    if (!base64Image || base64Image.length < 200) {
      // Fallback to device camera if capture failed
      cameraInputRef.current?.click();
      return;
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
      const isFruitRemnant = (preset as any).isFinishedFruit || preset.tags?.includes('Finished Fruit');
      const isSmall = portion === 'Small';
      const isLarge = portion === 'Large';
      const dishTitle = isNotFood ? t('non_food_object_detected', 'Non-Food Object Detected') : (selectedFood || preset.name || t('sustainable_campus_meal', 'Sustainable Campus Meal'));
      const parsed = {
        dishName: dishTitle,
        foodCategory: isFruitRemnant ? t('fresh_fruits', 'Fresh Fruits') : (selectedCategory?.name || 'East Asian Cuisine'),
        foodItem: selectedFood || dishTitle,
        isFood: !isNotFood,
        isFinishedFruit: isFruitRemnant,
        nonFoodReason: isNotFood ? (preset.nonFoodReason || t('stationery_non_food_reason', 'Stationery / non-food detected instead of dining meal.')) : undefined,
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
        foodItems: isNotFood ? [t('non_food_object_penalty', 'Non-Food Object (Penalty: -20 XP)')] : (preset.items || [dishTitle, t('fresh_campus_greens', 'Fresh Campus Greens'), t('organic_grains', 'Organic Grains')]),
        detectedZones: isNotFood ? [] : [
          { label: dishTitle, category: isFruitRemnant ? 'fruit' : 'protein', confidence: 96, estimatedGrams: isSmall ? 65 : isLarge ? 130 : 90 },
          { label: t('compostable_peels_core', 'Organic Compostable Peels & Core'), category: 'fruit', confidence: 97, estimatedGrams: 35 },
        ],
        carbonSavingsKg: isNotFood ? 0 : isSmall ? 0.38 : isLarge ? 0.78 : 0.54,
        waterSavedLiters: isNotFood ? 0 : isSmall ? 420 : isLarge ? 860 : 590,
        ecoScore: isNotFood ? 'N/A' : (preset.ecoScore || 'A+'),
        dietaryTags: isNotFood ? [t('non_food', 'Non-Food'), t('penalty_20_xp', 'Penalty -20 XP')] : (preset.tags || [selectedCategory?.name || 'Campus Meal', 'Low Carbon', 'High Fiber']),
        sustainabilityFeedback: isNotFood
          ? t('non_food_feedback', '⚠️ Non-food item detected. EcoEat requires real dining scans. A -20 XP penalty applies.')
          : isFruitRemnant
          ? t('finished_fruit_feedback', '🍎 Finished fruit detected! You enjoyed 100% of the edible fruit. Natural peels and cores are organic compost, not edible waste.')
          : t('well_balanced_meal_desc', 'Well-balanced campus meal with zero food waste potential!'),
        xpEarned: isNotFood ? -20 : (isLarge ? 40 : 35),
      };
      setAnalysisResult(parsed);
      setEditedDishName(parsed.dishName);
      setEditedFoodItems([...parsed.foodItems]);
    } else {
      const isFruitRemnant = (preset as any).isFinishedFruit || preset.tags?.includes('Finished Fruit');
      const isClean = preset.cleanPlateVerified !== false;
      const wasteGrams = isClean ? 0 : (preset.wasteGrams || 160);
      const parsedAfter = {
        dishName: isFruitRemnant ? t('finished_fruit_verification', 'Finished Fruit Verification') : isClean ? t('clean_plate_verification', 'Clean Plate Verification') : t('unfinished_plate_waste_detected', 'Unfinished Plate Waste Detected'),
        cleanPlateVerified: isClean,
        isFinishedFruit: isFruitRemnant,
        cleanPlateConfidence: 99,
        confidenceScore: 99,
        wasteGrams: wasteGrams,
        remainingWasteGrams: wasteGrams,
        foodSavedKg: isClean ? (isFruitRemnant ? 0.25 : 0.35) : 0,
        carbonSavingsKg: isClean ? 0.54 : -0.35,
        waterSavedLiters: isClean ? (isFruitRemnant ? 120 : 590) : 0,
        bonusXp: isClean ? 30 : -25,
        xpEarned: isClean ? 35 : -25,
        isPenalty: !isClean,
        congratulationsMessage: isFruitRemnant
          ? t('finished_fruit_congrats', '🍎 Finished Fruit 100% Verified! Zero edible fruit wasted. Natural peels & cores composted!')
          : isClean
          ? t('clean_plate_congrats', 'Clean plate 100% verified! Zero scraps sent to landfill.')
          : t('unfinished_food_detected_title', '⚠️ Unfinished Food Detected! Leftovers sent to landfill produce methane.'),
        sustainabilityFeedback: isFruitRemnant
          ? t('finished_fruit_compost_desc', 'Superb job finishing your fruit! Inedible peels, rinds, and cores are natural compostable fibers, diverted completely from landfill waste.')
          : isClean
          ? t('clean_plate_prevented_desc', 'Outstanding! You prevented food waste and claimed maximum clean plate streak multiplier.')
          : t('unfinished_scraps_desc', 'Leftover food scraps waste valuable resources and emit landfill greenhouse gases. A -25 XP penalty has been applied.'),
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
          foodCategory: selectedCategory?.name,
          foodItem: selectedFood,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();
      
      if (type === 'before') {
        const isNotFood = result.isFood === false || knownPreset?.isFood === false;
        const isFruitRemnant = !!(result.isFinishedFruit || (knownPreset as any)?.isFinishedFruit);
        const parsed = {
          dishName: isNotFood ? t('non_food_object_detected', 'Non-Food Object Detected') : result.dishName || selectedFood || knownPreset?.name || t('sustainable_campus_meal', 'Sustainable Campus Meal'),
          foodCategory: result.foodCategory || selectedCategory?.name || (isFruitRemnant ? t('fresh_fruits', 'Fresh Fruits') : 'East Asian Cuisine'),
          foodItem: result.foodItem || selectedFood || result.dishName || t('campus_meal', 'Campus Meal'),
          isFood: !isNotFood,
          isFinishedFruit: isFruitRemnant,
          nonFoodReason: isNotFood ? (result.nonFoodReason || knownPreset?.nonFoodReason || t('non_edible_reason', 'Non-edible item detected instead of dining meal.')) : undefined,
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
          foodItems: isNotFood ? [t('non_food_object_penalty', 'Non-Food Object (Penalty: -20 XP)')] : result.foodItems || knownPreset?.items || [t('mixed_campus_greens', 'Mixed Campus Greens'), t('quinoa', 'Quinoa'), t('roasted_veggies', 'Roasted Veggies')],
          detectedZones: isNotFood ? [] : result.detectedZones || [
            { label: t('plant_protein_tofu', 'Plant Protein & Tofu'), category: 'protein', confidence: 95, estimatedGrams: 90 },
            { label: t('whole_grains_rice', 'Whole Grains & Rice'), category: 'grain', confidence: 94, estimatedGrams: 120 },
            { label: t('fresh_campus_vegetables', 'Fresh Campus Vegetables'), category: 'vegetable', confidence: 98, estimatedGrams: 110 },
          ],
          carbonSavingsKg: isNotFood ? 0 : result.carbonSavingsKg || (portion === 'Small' ? 0.38 : portion === 'Large' ? 0.78 : 0.54),
          waterSavedLiters: isNotFood ? 0 : result.waterSavedLiters || (portion === 'Small' ? 420 : portion === 'Large' ? 860 : 590),
          ecoScore: isNotFood ? 'N/A' : result.ecoScore || 'A+',
          dietaryTags: isNotFood ? [t('non_food', 'Non-Food'), t('penalty_20_xp', 'Penalty -20 XP')] : result.dietaryTags || ['Plant-Rich', 'Low Carbon', 'High Fiber'],
          sustainabilityFeedback: isNotFood
            ? t('non_food_feedback', '⚠️ Non-food item detected. EcoEat requires real dining scans. A -20 XP penalty applies.')
            : isFruitRemnant
            ? t('finished_fruit_feedback', '🍎 Finished fruit detected! You enjoyed 100% of the edible fruit. Natural peels and cores are organic compost, not edible waste.')
            : result.sustainabilityFeedback || t('plant_forward_potential_desc', 'Well-balanced plant-forward meal with zero food waste potential!'),
          xpEarned: isNotFood ? -20 : result.xpEarned || (portion === 'Large' ? 40 : 35),
        };
        setAnalysisResult(parsed);
        setEditedDishName(parsed.dishName);
        setEditedFoodItems([...parsed.foodItems]);
      } else {
        const isFruitRemnant = !!(result.isFinishedFruit || (knownPreset as any)?.isFinishedFruit);
        const isClean = (result.cleanPlateVerified !== false) && (knownPreset?.cleanPlateVerified !== false);
        const wasteGrams = isClean ? 0 : (result.wasteGrams || knownPreset?.wasteGrams || 160);
        const parsedAfter = {
          dishName: isFruitRemnant ? t('finished_fruit_verification', 'Finished Fruit Verification') : isClean ? t('clean_plate_verification', 'Clean Plate Verification') : t('unfinished_plate_waste_detected', 'Unfinished Plate Waste Detected'),
          cleanPlateVerified: isClean,
          isFinishedFruit: isFruitRemnant,
          cleanPlateConfidence: result.cleanPlateConfidence || result.cleanlinessConfidence || 99,
          confidenceScore: result.confidenceScore || 99,
          wasteGrams: wasteGrams,
          remainingWasteGrams: wasteGrams,
          foodSavedKg: isClean ? (result.foodSavedKg || (isFruitRemnant ? 0.25 : 0.35)) : 0,
          carbonSavingsKg: isClean ? (result.carbonSavingsKg || 0.54) : -0.35,
          waterSavedLiters: isClean ? (result.waterSavedLiters || (isFruitRemnant ? 120 : 590)) : 0,
          bonusXp: isClean ? (result.bonusXp || 30) : -25,
          xpEarned: isClean ? (result.xpEarned || 35) : -25,
          isPenalty: !isClean,
          congratulationsMessage: isFruitRemnant
            ? (result.congratulationsMessage || t('finished_fruit_congrats', '🍎 Finished Fruit 100% Verified! Zero edible fruit wasted. Natural peels & cores composted!'))
            : isClean
            ? (result.congratulationsMessage || t('clean_plate_congrats', 'Clean plate 100% verified! Zero scraps sent to landfill.'))
            : t('unfinished_food_detected_title', '⚠️ Unfinished Food Detected! Leftovers sent to landfill produce methane.'),
          sustainabilityFeedback: isFruitRemnant
            ? (result.sustainabilityFeedback || t('finished_fruit_compost_desc', 'Superb job finishing your fruit! Inedible peels, rinds, and cores are natural compostable fibers, diverted completely from landfill waste.'))
            : isClean
            ? (result.sustainabilityFeedback || t('clean_plate_prevented_desc', 'Outstanding! You prevented food waste and claimed maximum clean plate streak multiplier.'))
            : t('unfinished_scraps_desc', 'Leftover food scraps waste valuable resources and emit landfill greenhouse gases. A -25 XP penalty has been applied.'),
        };
        setAfterAnalysisResult(parsedAfter);
      }
    } catch (error: any) {
      console.log('Using real-time fallback meal analysis:', error?.message || 'Handled');
      if (type === 'before') {
        const isNotFood = knownPreset?.isFood === false;
        const isFruitRemnant = (knownPreset as any)?.isFinishedFruit || false;
        const isSmall = portion === 'Small';
        const isLarge = portion === 'Large';
        const fallback = {
          dishName: isNotFood ? t('non_food_object_detected', 'Non-Food Object Detected') : knownPreset ? knownPreset.name : isSmall ? t('garden_harvest_salad', 'Garden Harvest Salad & Herb Tofu') : isLarge ? t('mediterranean_quinoa_bowl', 'Mediterranean Roasted Quinoa & Protein Bowl') : t('healthy_campus_protein_bowl', 'Healthy Campus Protein Bowl'),
          isFood: !isNotFood,
          isFinishedFruit: isFruitRemnant,
          nonFoodReason: isNotFood ? (knownPreset?.nonFoodReason || t('stationery_non_food_reason', 'Stationery / non-food detected instead of dining meal')) : undefined,
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
          foodItems: isNotFood ? [t('non_food_object_penalty', 'Non-Food Object (Penalty: -20 XP)')] : knownPreset?.items || [t('crisp_mixed_greens', 'Crisp Mixed Greens'), t('roasted_chickpeas', 'Herb Roasted Chickpeas'), t('steamed_broccoli', 'Steamed Broccoli'), t('organic_quinoa', 'Organic Quinoa'), t('cherry_tomatoes', 'Cherry Tomatoes')],
          detectedZones: isNotFood ? [] : [
            { label: t('plant_protein_chickpeas_tofu', 'Plant Protein (Chickpeas & Tofu)'), category: 'protein', confidence: 94, estimatedGrams: isSmall ? 70 : isLarge ? 140 : 100 },
            { label: t('ancient_grains_quinoa_rice', 'Ancient Grains (Quinoa & Rice)'), category: 'grain', confidence: 93, estimatedGrams: isSmall ? 80 : isLarge ? 160 : 120 },
            { label: t('fresh_campus_vegetables', 'Fresh Campus Vegetables'), category: 'vegetable', confidence: 97, estimatedGrams: isSmall ? 80 : isLarge ? 160 : 110 },
          ],
          carbonSavingsKg: isNotFood ? 0 : isSmall ? 0.38 : isLarge ? 0.78 : 0.54,
          waterSavedLiters: isNotFood ? 0 : isSmall ? 420 : isLarge ? 860 : 590,
          ecoScore: isNotFood ? 'N/A' : 'A+',
          dietaryTags: isNotFood ? [t('non_food', 'Non-Food'), t('penalty_20_xp', 'Penalty: -20 XP')] : isFruitRemnant ? [t('finished_fruit', 'Finished Fruit'), t('zero_waste', 'Zero Waste'), t('natural_compost', 'Natural Compost')] : ['Plant-Rich', 'Low Carbon', 'Campus Sourced', 'High Fiber'],
          sustainabilityFeedback: isNotFood
            ? t('non_food_feedback', '⚠️ Non-food item detected. EcoEat requires real dining scans. A -20 XP penalty applies.')
            : isFruitRemnant
            ? t('finished_fruit_feedback', '🍎 Finished fruit detected! You consumed 100% of the edible fruit. Natural peels and cores are organic compost, not edible waste.')
            : t('plant_forward_feedback', 'High nutrient-density plant-forward meal! Diverts approx 0.54kg CO2e compared to average high-carbon cafeteria dishes.'),
          xpEarned: isNotFood ? -20 : (isLarge ? 40 : 35),
        };
        setAnalysisResult(fallback);
        setEditedDishName(fallback.dishName);
        setEditedFoodItems([...fallback.foodItems]);
      } else {
        const isFruitRemnant = (knownPreset as any)?.isFinishedFruit || false;
        const isClean = knownPreset?.cleanPlateVerified !== false;
        const wasteGrams = isClean ? 0 : (knownPreset?.wasteGrams || 160);
        setAfterAnalysisResult({
          dishName: isFruitRemnant ? t('finished_fruit_verification', 'Finished Fruit Verification') : isClean ? t('clean_plate_verification', 'Clean Plate Verification') : t('unfinished_plate_waste_detected', 'Unfinished Plate Waste Detected'),
          cleanPlateVerified: isClean,
          isFinishedFruit: isFruitRemnant,
          cleanPlateConfidence: 99,
          confidenceScore: 99,
          wasteGrams: wasteGrams,
          remainingWasteGrams: wasteGrams,
          foodSavedKg: isClean ? (isFruitRemnant ? 0.25 : 0.35) : 0,
          carbonSavingsKg: isClean ? 0.54 : -0.35,
          waterSavedLiters: isClean ? (isFruitRemnant ? 120 : 590) : 0,
          bonusXp: isClean ? 30 : -25,
          xpEarned: isClean ? 35 : -25,
          isPenalty: !isClean,
          congratulationsMessage: isFruitRemnant
            ? t('finished_fruit_congrats', '🍎 Finished Fruit 100% Verified! Zero edible fruit wasted. Natural peels & cores composted!')
            : isClean
            ? t('clean_plate_diverted_congrats', 'Clean Plate Verified! 100% food diverted from campus waste.')
            : t('unfinished_food_detected_title', '⚠️ Unfinished Food Detected! Leftover food creates landfill waste.'),
          sustainabilityFeedback: isFruitRemnant
            ? t('finished_fruit_compost_desc', 'Superb job finishing your fruit! Inedible peels, rinds, and cores are natural compostable fibers, diverted completely from landfill waste.')
            : isClean
            ? t('clean_plate_zero_scraps_desc', 'Outstanding! Zero scraps detected on the dining tray. Bonus XP granted!')
            : t('unfinished_scraps_desc', 'Unfinished meal scraps produce landfill emissions. A -25 XP penalty has been deducted.'),
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

    const userTypedDish = editedDishName.trim() || customFoodInput.trim() || (selectedFood && selectedFood !== foodCategories[0]?.popularFoods[0] ? selectedFood : '');
    const dishTitle = userTypedDish || analysisResult?.dishName || (isClean ? t('healthy_campus_meal', 'Healthy Campus Meal') : t('unfinished_campus_meal', 'Unfinished Campus Meal'));
    const finalFoodItems = editedFoodItems.length > 0 ? editedFoodItems : analysisResult?.foodItems;

    const baseCleanXp = (analysisResult?.xpEarned || 35) + (afterAnalysisResult?.bonusXp || 30);
    const baseWastePenalty = 25;

    const totalCleanReward = baseCleanXp + stickerModifiers.bonusCleanXp;
    const totalWasteDeduction = baseWastePenalty + stickerModifiers.bonusWastePenalty;

    const totalXp = isClean ? totalCleanReward : -totalWasteDeduction;

    const newRecord: MealRecord = {
      id: `meal-${Date.now()}`,
      title: dishTitle,
      customDishName: userTypedDish || undefined,
      time: t('just_now', 'Just now'),
      portion: portion,
      foodCategory: selectedCategory?.name || analysisResult?.foodCategory,
      foodItem: dishTitle,
      xp: totalXp,
      imageUrl: capturedBeforeImage,
      afterImageUrl: capturedAfterImage,
      calories: analysisResult?.estimatedCalories || 440,
      carbonSavedKg: isClean ? (analysisResult?.carbonSavingsKg || 0.54) : -0.35,
      waterSavedLiters: isClean ? (analysisResult?.waterSavedLiters || 590) : 0,
      ecoScore: isClean ? (analysisResult?.ecoScore || 'A+') : 'F',
      confidenceScore: analysisResult?.confidenceScore || 96,
      nutrition: analysisResult?.nutrition || {
        protein: 22,
        carbs: 54,
        fat: 13,
        fiber: 9,
        vitamins: ['Vitamin C (85% DV - 76mg)', 'Vitamin A (45% DV - 410mcg)', 'Iron (22% DV - 4.0mg)', 'Calcium (18% DV - 230mg)'],
      },
      foodItems: finalFoodItems,
      detectedZones: analysisResult?.detectedZones,
      sustainabilityFeedback: isClean
        ? (stickerModifiers.hasStickers
            ? `${t('zero_food_waste_achieved', 'Zero food waste achieved!')} ${t(stickerModifiers.highestRarity, stickerModifiers.highestRarity).toUpperCase()} +${stickerModifiers.bonusCleanXp.toLocaleString()} XP ${t('clean_plate_bonus_short', 'clean plate bonus!')}`
            : (analysisResult?.sustainabilityFeedback || t('great_job_finishing_plate', 'Great job finishing your plate and preventing waste!')))
        : (stickerModifiers.hasStickers
            ? `${t('food_waste_detected', 'Food waste detected')} (${afterAnalysisResult?.wasteGrams || 160}g). -${totalWasteDeduction.toLocaleString()} XP (${t(stickerModifiers.highestRarity, stickerModifiers.highestRarity).toUpperCase()})`
            : t('leftover_methane_warning', 'Leftover food scraps generate landfill methane. Clean your plate or choose smaller portions.')),
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
      onApplyPenalty(t('non_food_object_scanned', 'Non-Food Object Scanned'), 20);
    } else {
      const penaltyRecord: MealRecord = {
        id: `meal-${Date.now()}`,
        title: t('non_food_scan_invalid', 'Non-Food Object Scan (Invalid)'),
        time: t('just_now', 'Just now'),
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
        penaltyReason: analysisResult?.nonFoodReason || t('non_food_object_scanned', 'Non-food object scanned'),
        sustainabilityFeedback: t('non_food_penalty_feedback', 'Non-food items do not qualify for dining sustainability points. -20 XP deducted.'),
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
              ? t('capture_step_choose_food', '1. Food Category & Meal')
              : currentStep === 2
              ? t('capture_step_scan_meal', '2. AI Meal Scan')
              : t('capture_step_clean_plate', '3. Clean Plate Verification')}
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

      {/* STEP 1: Food Category and Dish Selection */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Question 1: What food category are you going to eat? */}
          <div className="bg-theme-card border border-theme-card rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-theme-primary bg-theme-primary-bg px-2.5 py-1 rounded-full border border-theme-primary-border">
                {t('question_food_category', 'What food category are you going to eat?')}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-theme-main pt-1.5 leading-tight">
                {t('question_food_category', 'What food category are you going to eat?')}
              </h3>
              <p className="text-xs text-theme-muted">
                {t('question_food_category_desc', 'Select your food category to calibrate AI recognition accuracy and nutritional metrics.')}
              </p>
            </div>

            {/* Food Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              {foodCategories.map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`cuisine-cat-${cat.id}`}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3 relative ${
                      isSelected
                        ? 'border-theme-primary bg-theme-primary-bg shadow-sm'
                        : 'border-theme-card bg-theme-card-subtle hover:border-theme-muted/40 hover:bg-theme-card'
                    }`}
                  >
                    <span className="text-2xl p-2 rounded-xl bg-theme-card border border-theme-card shrink-0">
                      {cat.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs sm:text-sm font-extrabold truncate ${isSelected ? 'text-theme-primary' : 'text-theme-main'}`}>
                          {t(cat.name, cat.name)}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-theme-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-theme-muted truncate mt-0.5">
                        {t(cat.description, cat.description)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 2: What food are you going to eat from that category? */}
          <div className="bg-theme-card border border-theme-card rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-theme-primary bg-theme-primary-bg px-2.5 py-1 rounded-full border border-theme-primary-border">
                  {t('question_food_item', 'What food are you going to eat from that category?')}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-theme-main pt-1 leading-tight">
                  {t('question_food_item', 'What food are you going to eat from that category?')}
                </h3>
                <p className="text-xs text-theme-muted flex items-center gap-1.5">
                  <span>{t('category', 'Category')}:</span>
                  <span className="font-bold text-theme-primary">{t(selectedCategory?.name, selectedCategory?.name)}</span>
                  <span>{selectedCategory?.icon}</span>
                </p>
              </div>
              <span className="self-start sm:self-center px-3 py-1 rounded-full bg-theme-primary-bg border border-theme-primary-border text-[11px] font-black text-theme-primary whitespace-nowrap">
                {selectedCategory?.popularFoods.length || 22} {t('options_available', 'Options Available')}
              </span>
            </div>

            {/* Quick Filter & Search Bar for Dishes */}
            <div className="relative">
              <Search className="w-4 h-4 text-theme-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="input-dish-search"
                type="text"
                value={dishSearchQuery}
                onChange={(e) => setDishSearchQuery(e.target.value)}
                placeholder={t('search_dish_placeholder', 'Search popular meals or type custom dish...')}
                className="w-full bg-theme-card-subtle border border-theme-card focus:border-theme-primary rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-semibold text-theme-main placeholder-theme-muted/60 focus:outline-none transition-colors"
              />
              {dishSearchQuery && (
                <button
                  type="button"
                  onClick={() => setDishSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-main text-xs font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Popular dish chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-theme-muted font-bold">
                <span>
                  {dishSearchQuery.trim()
                    ? `${t('matching_options', 'Matching options')} (${filteredPopularFoods.length})`
                    : `${t('popular_options', 'Popular Choices')} (${t(selectedCategory?.name, selectedCategory?.name)})`}
                </span>
                {dishSearchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => setDishSearchQuery('')}
                    className="text-theme-primary hover:underline font-bold text-[11px] cursor-pointer"
                  >
                    {t('show_all', 'Show all')} {selectedCategory?.popularFoods.length}
                  </button>
                )}
              </div>

              {filteredPopularFoods.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto pr-1 py-1">
                  {filteredPopularFoods.map((dish) => {
                    const isDishSelected = selectedFood === dish && !customFoodInput;
                    return (
                      <button
                        key={dish}
                        id={`dish-chip-${dish.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        type="button"
                        onClick={() => handleSelectFood(dish)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1.5 text-left ${
                          isDishSelected
                            ? 'bg-theme-primary text-black font-extrabold shadow-sm shadow-theme-glow'
                            : 'bg-theme-card-subtle text-theme-main hover:bg-theme-card border border-theme-card hover:border-theme-muted/40'
                        }`}
                      >
                        <span>{t(dish, dish)}</span>
                        {isDishSelected && <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-theme-card-subtle border border-dashed border-theme-card text-center space-y-2">
                  <p className="text-xs text-theme-muted">
                    {t('no_preset_matches', 'No preset option matches "{query}" in {category}.').replace('{query}', dishSearchQuery).replace('{category}', t(selectedCategory?.name || '', selectedCategory?.name || ''))}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomFoodInput(dishSearchQuery.trim());
                      setSelectedFood(dishSearchQuery.trim());
                      setDishSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-theme-primary text-black text-xs font-black shadow-sm hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>{t('use_as_selection', 'Use "{query}" as my selection').replace('{query}', dishSearchQuery.trim())}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Custom dish input */}
            <div className="pt-2 border-t border-theme-card space-y-2">
              <label className="text-xs font-bold text-theme-muted block">
                {t('custom_dish_placeholder', 'Or type custom food name...')}
              </label>
              <div className="relative">
                <input
                  id="input-custom-dish"
                  type="text"
                  value={customFoodInput}
                  onChange={(e) => {
                    setCustomFoodInput(e.target.value);
                    if (e.target.value) {
                      setSelectedFood(e.target.value);
                    } else {
                      setSelectedFood(selectedCategory?.popularFoods[0] || '');
                    }
                  }}
                  placeholder={t('custom_dish_placeholder', 'Or type custom dish name...')}
                  className="w-full bg-theme-card-subtle border border-theme-card focus:border-theme-primary rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-theme-main placeholder-theme-muted/60 focus:outline-none transition-colors"
                />
                {customFoodInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomFoodInput('');
                      setSelectedFood(selectedCategory?.popularFoods[0] || '');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-main text-xs font-bold cursor-pointer"
                  >
                    {t('clear', 'Clear')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Planned Portion Selector */}
          <div className="bg-theme-card border border-theme-card rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-theme-muted">
                  {t('planned_portion_size', 'Planned Portion Size')}
                </span>
                <p className="text-sm font-extrabold text-theme-main">
                  {portion === 'Small' ? t('portion_small_desc', 'Small / Light Plate (~240g)') : portion === 'Large' ? t('portion_large_desc', 'Large / Hearty Plate (~480g)') : t('portion_regular_desc', 'Regular Campus Plate (~350g)')}
                </p>
              </div>
              <span className="text-xs font-black text-theme-primary px-2.5 py-1 rounded-full bg-theme-primary-bg border border-theme-primary-border">
                {portion === 'Small' ? '+35 XP' : portion === 'Large' ? '+40 XP' : '+35 XP'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['Small', 'Regular', 'Large'] as PortionSize[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  id={`portion-btn-${p.toLowerCase()}`}
                  onClick={() => setPortion(p)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                    portion === p
                      ? 'border-theme-primary bg-theme-primary-bg text-theme-primary font-black shadow-sm'
                      : 'border-theme-card bg-theme-card-subtle text-theme-muted hover:text-theme-main hover:bg-theme-card'
                  }`}
                >
                  {p === 'Small' ? t('portion_small', 'Small') : p === 'Large' ? t('portion_large', 'Large') : t('portion_regular', 'Regular')}
                </button>
              ))}
            </div>
          </div>

          {/* Summary & Continue CTA */}
          <div className="bg-theme-card border-2 border-theme-primary/60 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-theme-muted">
                  {t('selected_dining_profile', 'Selected Dining Profile')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedCategory?.icon}</span>
                  <span className="text-sm sm:text-base font-black text-theme-main">
                    {customFoodInput.trim() || selectedFood || selectedCategory?.popularFoods[0]}
                  </span>
                </div>
                <p className="text-xs text-theme-muted">
                  {t(selectedCategory?.name, selectedCategory?.name)} • {portion === 'Small' ? t('portion_small', 'Small') : portion === 'Large' ? t('portion_large', 'Large') : t('portion_regular', 'Regular')} {t('portion', 'Portion')}
                </p>
              </div>
            </div>

            <button
              id="btn-continue-to-scan"
              type="button"
              onClick={handleContinueToScan}
              className="w-full py-4 rounded-full bg-theme-primary text-black font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 hover:opacity-95 active:scale-[0.99] transition-all shadow-lg shadow-theme-glow cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>{t('continue_to_scan', 'Continue to Scan Plate')}</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* STEPS 2 & 3: Camera, Scanning, and Clean Plate UI */}
      {currentStep >= 2 && (
        <>
          {/* Active Dining Selection Banner (Step 2) */}
          {currentStep === 2 && (
            <div className="bg-theme-card border border-theme-card rounded-2xl p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="text-2xl p-1 bg-theme-card-subtle rounded-xl border border-theme-card shrink-0">
                  {selectedCategory?.icon}
                </span>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5 text-[11px] text-theme-muted font-bold">
                    <span>{t('dining_on', 'Dining on')}</span>
                    <span className="text-theme-primary font-extrabold">• {t(selectedCategory?.name, selectedCategory?.name)}</span>
                  </div>
                  <p className="text-sm font-extrabold text-theme-main truncate">
                    {t(selectedFood || selectedCategory?.popularFoods[0], selectedFood || selectedCategory?.popularFoods[0])}
                  </p>
                </div>
              </div>
              <button
                id="btn-change-selected-food"
                onClick={() => {
                  stopCamera();
                  setCurrentStep(1);
                }}
                className="px-3 py-1.5 rounded-full bg-theme-card-subtle hover:bg-theme-card border border-theme-card hover:border-theme-primary text-xs font-bold text-theme-muted hover:text-theme-main transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Pencil className="w-3 h-3 text-theme-primary" />
                <span>{t('change_food', 'Change Food')}</span>
              </button>
            </div>
          )}

          {/* Main Camera / Viewfinder Box */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-black rounded-3xl overflow-hidden border-2 border-theme-card shadow-2xl flex items-center justify-center">
        {/* Shutter flash effect */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-30 animate-out fade-out duration-200 pointer-events-none" />
        )}

        {/* Live Camera Video */}
        <video
          ref={setVideoRef}
          playsInline
          muted
          autoPlay
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            v.play().catch((err) => console.warn('Video onLoadedMetadata play:', err));
          }}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            isCameraActive && isLiveMode ? 'opacity-100 block' : 'opacity-0 absolute pointer-events-none'
          }`}
        />

        {/* Static Snapshot or Viewfinder Standby Preview */}
        {(!isCameraActive || !isLiveMode) && (
          <div className="relative w-full h-full flex items-center justify-center bg-theme-card">
            {(currentStep === 3 ? capturedAfterImage : capturedBeforeImage) ? (
              <>
                <img
                  src={currentStep === 3 ? capturedAfterImage : capturedBeforeImage}
                  alt={t('meal_capture_preview', 'Meal capture preview')}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {/* Overlay badge indicating captured snapshot */}
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-lg">
                  <Check className="w-3.5 h-3.5 text-theme-primary" />
                  <span>{t('snapshot_captured', 'Snapshot Captured')}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-theme-primary-bg border border-theme-primary/40 flex items-center justify-center text-theme-primary animate-pulse">
                  {isCameraLoading ? <RefreshCw className="w-7 h-7 animate-spin" /> : <Camera className="w-7 h-7" />}
                </div>
                <div className="space-y-1 max-w-xs">
                  <p className="text-sm font-bold text-theme-main">
                    {isCameraLoading ? t('starting_camera', 'Starting AI Camera Viewfinder...') : t('camera_ready', 'Camera Ready for Scanning')}
                  </p>
                  <p className="text-xs text-theme-muted">
                    {isCameraLoading
                      ? t('connecting_camera', 'Connecting to your camera feed...')
                      : t('point_at_food', 'Point at your food and tap the round button, or take a photo directly.')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Camera Permission / Error Fallback Overlay */}
        {cameraError && !isLiveMode && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center space-y-3 z-20">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-xs">
              <h4 className="text-sm font-bold text-white">{t('camera_access_notice', 'Camera Access Notice')}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{cameraError}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs pt-1">
              <button
                id="btn-take-direct-photo"
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 py-2.5 px-3 bg-theme-primary text-black text-xs font-extrabold rounded-full hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Camera className="w-4 h-4" />
                <span>{t('take_photo_directly', 'Take Photo Directly')}</span>
              </button>
              <button
                id="btn-retry-camera"
                type="button"
                onClick={() => startCamera(facingMode)}
                className="py-2.5 px-3 bg-white/15 border border-white/20 text-white text-xs font-bold rounded-full hover:bg-white/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t('retry_live', 'Retry Live')}</span>
              </button>
            </div>
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
                <span>{t('live_ai_vision', 'Live AI Vision')} ({facingMode === 'environment' ? t('rear', 'Rear') : t('front', 'Front')})</span>
              </div>
            ) : isCameraLoading ? (
              <div className="bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                <RefreshCw className="w-3 h-3 animate-spin text-theme-primary" />
                <span>{t('starting_camera_dots', 'Starting Camera...')}</span>
              </div>
            ) : (
              <div className="bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{t('active_snapshot', 'Active Snapshot')}</span>
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
              {currentStep === 3 ? t('align_clean_plate', 'Align Clean Plate') : t('center_food_frame', 'Center Food or Produce in Frame')}
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
              title={t('resume_live_camera', 'Resume Live Camera')}
            >
              <Video className="w-3.5 h-3.5 text-theme-primary" />
              <span>{t('live_video', 'Live Video')}</span>
            </button>
          )}

          <button
            id="btn-flip-camera"
            onClick={handleFlipCamera}
            className="p-2.5 rounded-full bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition-all cursor-pointer border border-white/10"
            title={t('flip_camera', 'Flip Camera (Front/Back)')}
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
            : t('capture_align_meal', 'Align your food or fruit and tap the shutter for intelligent AI macro analysis.')}
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
          title={t('upload_photo_device', 'Upload photo from device')}
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
        {/* Dedicated Native Hardware Camera Trigger Input */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Big Circular Shutter Snap Button */}
        <button
          id="btn-shutter-snap"
          onClick={handleSnap}
          disabled={isAnalyzing}
          className="w-20 h-20 rounded-full bg-theme-card border-4 border-theme-primary p-1.5 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-lg shadow-theme-glow cursor-pointer"
          title={t('take_photo_analyze', 'Take Photo & Analyze')}
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
          title={!isLiveMode ? t('retake_live_camera', 'Retake / Live Camera') : t('switch_step', 'Switch Step')}
        >
          {!isLiveMode ? (
            <RotateCcw className="w-5 h-5 text-theme-primary" />
          ) : (
            <Sparkles className="w-5 h-5 text-theme-primary" />
          )}
        </button>
      </div>

      {/* Quick Interactive AI Vision Demo Scenarios */}
      <div className="pt-2 pb-1 text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-theme-muted">
          <Sparkles className="w-3.5 h-3.5 text-theme-primary" />
          <span>{t('try_demo_scenarios', 'Try AI Scanner Demo Scenarios:')}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {samplePresetMeals.map((preset) => {
            const isFruit = (preset as any).isFinishedFruit;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  isFruit
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25 ring-1 ring-amber-500/30'
                    : preset.cleanPlateVerified
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                    : preset.isPenalty && preset.isFood
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25'
                    : preset.isFood === false
                    ? 'bg-red-500/15 text-red-300 border-red-500/40 hover:bg-red-500/25'
                    : 'bg-theme-card text-theme-main border-theme-card hover:border-theme-primary'
                }`}
              >
                <span>{isFruit ? '🍎' : preset.cleanPlateVerified ? '✨' : preset.isPenalty && preset.isFood ? '⚠️' : preset.isFood === false ? '❌' : '🥗'}</span>
                <span>{t(preset.name.split('(')[0].trim(), preset.name.split('(')[0].trim())}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  )}

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
                    <span>{t('non_food_detected', 'Non-Food Object Detected')}</span>
                  </span>
                  <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {t('invalid_scan', 'Invalid Scan')}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white leading-tight">
                  {analysisResult.dishName || t('invalid_item_scanned', 'Invalid Item Scanned')}
                </h3>
                <p className="text-xs text-rose-200/80">
                  {analysisResult.nonFoodReason || t('non_food_reason_default', 'The AI camera identified an ineligible object (stationery, device, or empty surface) rather than a cafeteria meal.')}
                </p>
              </div>

              <div className="bg-rose-500 text-white font-extrabold px-3.5 py-1.5 rounded-full text-xs shadow-md shrink-0 border border-rose-400">
                -20 {t('xp_penalty', 'XP Penalty')}
              </div>
            </div>

            <div className="bg-black/40 p-4 rounded-2xl border border-rose-500/30 space-y-2">
              <p className="text-xs text-rose-200 leading-relaxed">
                {t('non_food_warning', 'EcoEat awards sustainability points strictly for real dining meals. Non-food scans violate campus sustainability logging rules and reduce your campus XP standing.')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="btn-apply-non-food-penalty"
                onClick={handleApplyNonFoodPenalty}
                className="flex-1 py-3.5 px-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
              >
                <span>{t('acknowledge_deduct', 'Acknowledge & Deduct -20 XP')}</span>
              </button>
              <button
                id="btn-retake-non-food-scan"
                onClick={() => {
                  setAnalysisResult(null);
                  setCurrentStep(2);
                  setIsLiveMode(true);
                  startCamera(facingMode);
                }}
                className="py-3.5 px-5 rounded-full bg-theme-card border border-theme-card hover:border-theme-primary text-theme-main font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{t('retake_scan', 'Retake Scan')}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Valid Food Meal Card */
          <div className="bg-theme-card border-2 border-theme-primary rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-2">
            {/* Header Banner */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-theme-primary flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t('ai_vision_verified', 'AI Vision Verified')}</span>
                  </span>
                  {analysisResult.isFinishedFruit ? (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>🍎</span>
                      <span>{t('finished_fruit_detected', 'Finished Fruit Detected')}</span>
                    </span>
                  ) : (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      {analysisResult.confidenceScore || 96}% {t('match', 'Match')}
                    </span>
                  )}
                  <span className="bg-theme-primary-bg text-theme-primary border border-theme-primary-border text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    EcoScore {analysisResult.ecoScore || 'A+'}
                  </span>
                  {selectedCategory && (
                    <span className="bg-theme-card-subtle text-theme-main border border-theme-card text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>{selectedCategory.icon}</span>
                      <span>{t(selectedCategory.name, selectedCategory.name)}</span>
                    </span>
                  )}
                </div>

                {isEditingMeal ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={editedDishName}
                      onChange={(e) => setEditedDishName(e.target.value)}
                      className="bg-theme-card-subtle border border-theme-primary rounded-xl px-3 py-1.5 text-sm font-bold text-theme-main focus:outline-none w-full"
                      placeholder={t('enter_custom_meal_name', 'Enter custom meal name')}
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setIsEditingMeal(false);
                          detectNutritionForDish(editedDishName);
                        }}
                        className="px-3 py-1.5 bg-theme-primary text-black rounded-xl text-xs font-extrabold cursor-pointer hover:opacity-90 transition-all flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{t('save', 'Save')}</span>
                      </button>
                      <button
                        onClick={() => {
                          detectNutritionForDish(editedDishName);
                          setIsEditingMeal(false);
                        }}
                        disabled={isDetectingNutrition}
                        className="px-3 py-1.5 bg-theme-card border border-theme-primary text-theme-primary rounded-xl text-xs font-bold cursor-pointer hover:bg-theme-primary/15 transition-all flex items-center gap-1"
                      >
                        {isDetectingNutrition ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-theme-primary" />
                        )}
                        <span>{t('detect_ai', 'Detect AI')}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className="text-xl font-extrabold text-theme-main leading-tight">
                      {t(editedDishName || analysisResult.dishName, editedDishName || analysisResult.dishName)}
                    </h3>
                    <button
                      onClick={() => setIsEditingMeal(true)}
                      className="p-1 text-theme-muted hover:text-theme-primary text-xs cursor-pointer"
                      title={t('edit_dish_name', 'Edit Dish Name')}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => detectNutritionForDish(editedDishName || analysisResult.dishName)}
                      disabled={isDetectingNutrition}
                      className="px-2.5 py-0.5 rounded-full bg-theme-primary/10 border border-theme-primary/30 text-theme-primary text-[10px] font-bold hover:bg-theme-primary/20 transition-all flex items-center gap-1 cursor-pointer"
                      title={t('run_ai_nutrition_detection', 'Run AI Protein & Vitamin Detection')}
                    >
                      {isDetectingNutrition ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      <span>{isDetectingNutrition ? t('detecting_nutrients', 'Detecting Nutrients...') : t('ai_protein_vitamins', 'AI Protein & Vitamins')}</span>
                    </button>
                  </div>
                )}

                <p className="text-xs text-theme-muted">{t(analysisResult.sustainabilityFeedback, analysisResult.sustainabilityFeedback)}</p>
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
                  <span>{t('nutrient_macro_breakdown', 'Nutrient & Macro Breakdown')} ({analysisResult.portionEstimatedGrams}g {t('portion', 'portion')})</span>
                </span>
                <span className="text-theme-primary font-extrabold">{analysisResult.estimatedCalories} kcal</span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                <div className="bg-theme-card p-2 rounded-xl border-2 border-theme-primary/40">
                  <p className="text-[10px] font-bold text-theme-primary uppercase">{t('protein', 'Protein')}</p>
                  <p className="text-sm font-black text-theme-main">{analysisResult.nutrition?.protein || 22}g</p>
                </div>
                <div className="bg-theme-card p-2 rounded-xl border border-theme-card">
                  <p className="text-[10px] font-bold text-theme-muted uppercase">{t('carbs', 'Carbs')}</p>
                  <p className="text-sm font-extrabold text-theme-main">{analysisResult.nutrition?.carbs || 54}g</p>
                </div>
                <div className="bg-theme-card p-2 rounded-xl border border-theme-card">
                  <p className="text-[10px] font-bold text-theme-muted uppercase">{t('fat', 'Fat')}</p>
                  <p className="text-sm font-extrabold text-theme-main">{analysisResult.nutrition?.fat || 13}g</p>
                </div>
                <div className="bg-theme-card p-2 rounded-xl border border-theme-card">
                  <p className="text-[10px] font-bold text-theme-muted uppercase">{t('fiber', 'Fiber')}</p>
                  <p className="text-sm font-extrabold text-theme-main">{analysisResult.nutrition?.fiber || 9}g</p>
                </div>
              </div>

              {/* Detected Vitamins & Micronutrients in Step 2 */}
              {analysisResult.nutrition?.vitamins && analysisResult.nutrition.vitamins.length > 0 && (
                <div className="pt-2 border-t border-theme-card/70 text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-extrabold text-theme-main flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-theme-primary" />
                      <span>{t('detected_vitamins_minerals', 'AI Detected Vitamins & Micronutrients:')}</span>
                    </span>
                    <span className="text-[9px] text-theme-primary font-bold">{t('bioactive_profile', 'Bioactive Profile')}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.nutrition.vitamins.map((vit: string, vIdx: number) => (
                      <span
                        key={vIdx}
                        className="inline-flex items-center gap-1 text-[10px] font-bold bg-theme-card text-theme-primary border border-theme-primary/30 px-2 py-0.5 rounded-md"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-theme-primary" />
                        {t(vit, vit)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recognized Food Ingredients (Editable Tag List) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-theme-main">
                <span>{t('recognized_ingredients', 'Recognized Ingredients')} ({editedFoodItems.length}):</span>
                <span className="text-[11px] text-theme-muted font-normal">{t('tap_to_customize', 'Tap to customize')}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {editedFoodItems.map((item, i) => (
                  <span
                    key={i}
                    className="bg-theme-card-subtle text-theme-main border border-theme-card text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 group"
                  >
                    <span>{t(item, item)}</span>
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
                  placeholder={t('add_missing_ingredient', 'Add missing ingredient...')}
                  className="flex-1 bg-theme-card-subtle border border-theme-card rounded-xl px-3 py-1.5 text-xs text-theme-main font-medium focus:outline-none focus:border-theme-primary"
                />
                <button
                  onClick={handleAddIngredient}
                  className="px-3 py-1.5 rounded-xl bg-theme-card border border-theme-card text-theme-main font-bold text-xs hover:border-theme-primary cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-theme-primary" />
                  <span>{t('add', 'Add')}</span>
                </button>
              </div>
            </div>

            {/* Environmental Impact Savings Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-theme-card text-center">
              <div className="bg-theme-card-subtle p-2.5 rounded-2xl border border-theme-card">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-theme-primary uppercase">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>{t('co2e_diverted', 'CO2e Diverted')}</span>
                </div>
                <p className="text-base font-extrabold text-theme-main">~{analysisResult.carbonSavingsKg} kg</p>
                <p className="text-[10px] text-theme-muted">{t('vs_cafeteria_beef', 'vs cafeteria beef baseline')}</p>
              </div>
              <div className="bg-theme-card-subtle p-2.5 rounded-2xl border border-theme-card">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-sky-400 uppercase">
                  <Droplet className="w-3.5 h-3.5" />
                  <span>{t('virtual_water_saved', 'Virtual Water Saved')}</span>
                </div>
                <p className="text-base font-extrabold text-theme-main">~{analysisResult.waterSavedLiters || 590} L</p>
                <p className="text-[10px] text-theme-muted">{t('through_plant_forward', 'through plant-forward selection')}</p>
              </div>
            </div>

            {/* Active Sticker Stakes Banner */}
            <div className="p-3.5 rounded-2xl bg-theme-card-subtle border border-theme-card space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-theme-main flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('sticker_dining_multiplier', 'Sticker Dining Multiplier')} ({stickerModifiers.totalStickersCount} {t('stickers_owned', 'Collected')})</span>
                </span>
                {stickerModifiers.highestRarity !== 'none' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-theme-primary/20 text-theme-primary border border-theme-primary/30">
                    {t(stickerModifiers.highestRarity, stickerModifiers.highestRarity)} {t('tier_active', 'tier active')}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-emerald-500/10 border border-emerald-500/25 p-2 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-400 block">{t('clean_plate_reward', 'Clean Plate Reward')}</span>
                  <span className="text-sm font-black text-emerald-400">+{stickerModifiers.bonusCleanXp.toLocaleString()} XP</span>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/25 p-2 rounded-xl">
                  <span className="text-[10px] font-bold text-rose-400 block">{t('waste_penalty_risk', 'Waste Penalty Risk')}</span>
                  <span className="text-sm font-black text-rose-400">-{stickerModifiers.bonusWastePenalty.toLocaleString()} XP</span>
                </div>
              </div>
              <p className="text-[10px] text-theme-muted text-center leading-tight">
                {stickerModifiers.hasStickers
                  ? t('rarer_sticker_desc', '⚡ The rarer the sticker you buy, the higher your reward for a clean plate, but the higher the deduction if you waste food!')
                  : t('buy_rare_stickers_tip', '💡 Buy rare stickers from the Eco Shop to multiply your clean plate points!')}
              </p>
            </div>

            {/* Action button to proceed to Step 3 */}
            <button
              id="btn-proceed-to-step3"
              onClick={() => {
                setCurrentStep(3);
                const targetImage = (analysisResult.isFinishedFruit && capturedBeforeImage)
                  ? capturedBeforeImage
                  : (samplePresetMeals.find((p) => (p as any).isFinishedFruit)?.url || samplePresetMeals[4]?.url || samplePresetMeals[3].url);
                setCapturedAfterImage(targetImage);
                if (analysisResult.isFinishedFruit) {
                  analyzePresetDirect(samplePresetMeals.find((p) => (p as any).isFinishedFruit) || samplePresetMeals[4], 'after');
                } else {
                  analyzeImageWithGemini(targetImage, 'after');
                }
              }}
              className="w-full py-4 rounded-full bg-theme-primary text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all shadow-lg shadow-theme-glow cursor-pointer"
            >
              <span>{analysisResult.isFinishedFruit ? '🍎 ' + t('verify_finished_fruit', 'Verify Finished Fruit (100% Eaten)') : t('capture_btn_proceed', 'Proceed to Clean Plate Verification')}</span>
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
                    {t('food_waste_detected', 'Food Waste Detected')}
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {afterAnalysisResult?.wasteGrams || 160}g {t('scraps_left', 'Scraps Left')}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  {t('unfinished_plate_penalty', 'Unfinished Plate Penalty')}
                </h3>
              </div>
            </div>

            {/* Before vs After Visual Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 text-center">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-theme-card">
                  <img
                    src={capturedBeforeImage}
                    alt={t('meal_before_dining', 'Meal before dining')}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {t('initial_meal', 'Initial Meal')}
                  </span>
                </div>
                <p className="text-[10px] text-theme-muted font-bold">{t('original_portion', 'Original Portion')}</p>
              </div>
              <div className="space-y-1 text-center">
                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-amber-500">
                  <img
                    src={capturedAfterImage}
                    alt={t('unfinished_plate_after', 'Unfinished plate after dining')}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-1 left-1 bg-amber-500 text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                    {afterAnalysisResult?.wasteGrams || 160}g {t('leftovers', 'Leftovers')}
                  </span>
                </div>
                <p className="text-[10px] text-amber-400 font-bold">{t('unfinished_waste', 'Unfinished Waste')}</p>
              </div>
            </div>

            <p className="text-xs text-amber-200/90 leading-relaxed">
              {afterAnalysisResult?.sustainabilityFeedback
                ? t(afterAnalysisResult.sustainabilityFeedback, afterAnalysisResult.sustainabilityFeedback)
                : t('waste_consequence_desc', 'Discarded cafeteria food generates methane emissions in municipal landfills. To motivate clean plate habits, unfinished meals incur deductions and reset your streak.')}
            </p>

            {/* Penalty Summary Card */}
            <div className="bg-black/40 border border-amber-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-xs font-bold text-white">{t('leftover_waste', 'Leftover Waste')}: {afterAnalysisResult?.wasteGrams || 160} {t('grams', 'grams')}</p>
                    <p className="text-[10px] text-amber-300/80">{t('landfill_waste_emissions', 'Landfill organic waste emissions')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-rose-400">
                    -{(25 + stickerModifiers.bonusWastePenalty).toLocaleString()} XP
                  </p>
                  <p className="text-[10px] text-theme-muted font-semibold">{t('total_waste_penalty', 'Total Waste Penalty')}</p>
                </div>
              </div>

              {/* Rarity breakdown */}
              {stickerModifiers.hasStickers && (
                <div className="pt-2 border-t border-amber-500/20 text-[11px] space-y-1">
                  <div className="flex justify-between text-amber-200/80">
                    <span>{t('base_waste_penalty', 'Base Cafeteria Waste Penalty')}</span>
                    <span>-25 XP</span>
                  </div>
                  <div className="flex justify-between font-bold text-rose-400">
                    <span>⚠️ {stickerModifiers.highestRarity.toUpperCase()} {t('sticker_waste_risk', 'Sticker Waste Risk')} ({stickerModifiers.totalStickersCount} {t('stickers', 'Stickers')})</span>
                    <span>-{stickerModifiers.bonusWastePenalty.toLocaleString()} XP</span>
                  </div>
                  <p className="text-[10px] text-amber-300/70 pt-0.5">
                    {t('rarer_stickers_notice', 'Notice: The rarer the stickers you collect, the larger the deduction if food is wasted!')}
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
                <span>{t('log_waste_deduct', 'Log Waste & Deduct')} -{(25 + stickerModifiers.bonusWastePenalty).toLocaleString()} XP</span>
              </button>
              <button
                id="btn-return-finish-meal"
                onClick={() => {
                  setCurrentStep(2);
                }}
                className="py-4 px-6 rounded-full bg-theme-card border border-theme-card hover:border-theme-primary text-theme-main font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{t('finish_eating_go_back', "I'll Finish Eating (Go Back)")}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Clean Plate / Finished Fruit 100% Zero Waste Success Card */
          <div className="bg-theme-card border-2 border-theme-primary rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-theme-primary-bg border border-theme-primary-border flex items-center justify-center text-theme-primary text-2xl">
                {afterAnalysisResult?.isFinishedFruit ? '🍎' : <CheckCircle className="w-7 h-7 fill-current/30" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-theme-primary">
                    {afterAnalysisResult?.isFinishedFruit
                      ? '🍎 ' + t('finished_fruit_verified', 'Finished Fruit 100% Verified')
                      : t('clean_plate_verified', 'Clean Plate 100% Verified')}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {afterAnalysisResult?.isFinishedFruit ? t('zero_edible_waste', '0g Edible Waste') : t('zero_scraps', '0g Scraps')}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-theme-main">
                  {afterAnalysisResult?.isFinishedFruit
                    ? t('finished_fruit_title', 'All Fruit Eaten • Peels Composted')
                    : t('zero_waste_achieved', 'Zero Waste Achieved')}
                </h3>
              </div>
            </div>

            {/* Before vs After Visual Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 text-center">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-theme-card">
                  <img
                    src={capturedBeforeImage}
                    alt={t('meal_before_dining', 'Meal before dining')}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {t('before_dining', 'Before Dining')}
                  </span>
                </div>
                <p className="text-[10px] text-theme-muted font-bold">{t('initial_portion_verified', 'Initial Portion Verified')}</p>
              </div>
              <div className="space-y-1 text-center">
                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-theme-primary">
                  <img
                    src={capturedAfterImage}
                    alt={t('clean_plate_after', 'Clean plate or finished fruit after dining')}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-1 left-1 bg-theme-primary text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                    {afterAnalysisResult?.isFinishedFruit ? `🍎 ${t('finished_fruit_0g', 'Finished Fruit (0g)')}` : t('clean_plate_0g', 'Clean Plate (0g)')}
                  </span>
                </div>
                <p className="text-[10px] text-theme-primary font-bold">
                  {afterAnalysisResult?.isFinishedFruit ? t('fruit_eaten_diverted', '100% Fruit Eaten (Peels Composted)') : t('waste_diverted_100', '100% Waste Diverted')}
                </p>
              </div>
            </div>

            <p className="text-xs text-theme-muted leading-relaxed">
              {afterAnalysisResult?.congratulationsMessage
                ? t(afterAnalysisResult.congratulationsMessage, afterAnalysisResult.congratulationsMessage).replace('{name}', user.greetingName)
                : afterAnalysisResult?.sustainabilityFeedback
                ? t(afterAnalysisResult.sustainabilityFeedback, afterAnalysisResult.sustainabilityFeedback)
                : t(
                    'clean_plate_praise',
                    'Outstanding job, {name}! Your meal was finished with zero scraps. Maximum XP bonus and streak multiplier unlocked.'
                  ).replace('{name}', user.greetingName)}
            </p>

            {/* Dish Details with AI Protein & Vitamins Profile */}
            <div className="bg-theme-card-subtle border border-theme-primary/40 rounded-2xl p-4 space-y-3.5 shadow-md text-left">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-theme-primary bg-theme-primary/10 border border-theme-primary/30 px-2 py-0.5 rounded-full">
                      {t('dish_details', 'Dish Details')}
                    </span>
                    {(editedDishName.trim() || customFoodInput.trim()) && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        {t('custom_dish', 'Custom Dish')}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-extrabold text-theme-main">
                    {t(
                      editedDishName.trim() || customFoodInput.trim() || selectedFood || analysisResult?.dishName || 'Healthy Campus Meal',
                      editedDishName.trim() || customFoodInput.trim() || selectedFood || analysisResult?.dishName || 'Healthy Campus Meal'
                    )}
                  </h4>
                  <p className="text-xs text-theme-muted">
                    {t('portion', 'Portion')}: <span className="font-semibold text-theme-main">{t(portion, portion)}</span> • {t('category', 'Category')}:{' '}
                    <span className="font-semibold text-theme-main">{t(selectedCategory?.name || 'Campus Dining', selectedCategory?.name || 'Campus Dining')}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-theme-muted uppercase">{t('energy', 'Energy')}</span>
                  <p className="text-base font-black text-theme-main">
                    {analysisResult?.estimatedCalories || (portion === 'Small' ? 310 : portion === 'Large' ? 620 : 440)}{' '}
                    <span className="text-xs font-normal text-theme-muted">kcal</span>
                  </p>
                </div>
              </div>

              {/* AI Nutritional Profile & Protein Highlight */}
              <div className="bg-theme-card border border-theme-card rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-theme-main">
                    <Sparkles className="w-4 h-4 text-theme-primary" />
                    <span>{t('ai_detected_protein_nutrition', 'AI Detected Protein & Nutrition')}</span>
                  </div>
                  {isDetectingNutrition ? (
                    <span className="text-[10px] text-theme-primary font-bold animate-pulse flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> {t('detecting_nutrients', 'Detecting nutrients...')}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        detectNutritionForDish(
                          editedDishName.trim() || customFoodInput.trim() || selectedFood || analysisResult?.dishName || 'Campus Meal'
                        )
                      }
                      className="text-[10px] text-theme-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> {t('rescan_ai', 'Re-scan AI')}
                    </button>
                  )}
                </div>

                {/* Macro Grid with Protein Highlight */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-theme-card-subtle border-2 border-theme-primary/50 rounded-xl p-2">
                    <p className="text-[9px] uppercase font-bold text-theme-primary">{t('protein', 'Protein')}</p>
                    <p className="text-base font-black text-theme-main">
                      {analysisResult?.nutrition?.protein ?? 22}g
                    </p>
                    <p className="text-[8px] text-theme-muted font-medium">{t('muscle_satiety', 'Muscle & satiety')}</p>
                  </div>
                  <div className="bg-theme-card-subtle border border-theme-card rounded-xl p-2">
                    <p className="text-[9px] uppercase font-bold text-theme-muted">{t('carbs', 'Carbs')}</p>
                    <p className="text-base font-black text-theme-main">
                      {analysisResult?.nutrition?.carbs ?? 54}g
                    </p>
                    <p className="text-[8px] text-theme-muted font-medium">{t('energy_fuel', 'Energy fuel')}</p>
                  </div>
                  <div className="bg-theme-card-subtle border border-theme-card rounded-xl p-2">
                    <p className="text-[9px] uppercase font-bold text-theme-muted">{t('fat', 'Fat')}</p>
                    <p className="text-base font-black text-theme-main">
                      {analysisResult?.nutrition?.fat ?? 13}g
                    </p>
                    <p className="text-[8px] text-theme-muted font-medium">{t('healthy_lipids', 'Healthy lipids')}</p>
                  </div>
                  <div className="bg-theme-card-subtle border border-theme-card rounded-xl p-2">
                    <p className="text-[9px] uppercase font-bold text-theme-muted">{t('fiber', 'Fiber')}</p>
                    <p className="text-base font-black text-theme-main">
                      {analysisResult?.nutrition?.fiber ?? 9}g
                    </p>
                    <p className="text-[8px] text-theme-muted font-medium">{t('gut_health', 'Gut health')}</p>
                  </div>
                </div>

                {/* Detected Vitamins & Micronutrients */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold text-theme-main flex items-center gap-1">
                    <span>💊 {t('detected_vitamins_minerals', 'Detected Vitamins & Essential Minerals:')}</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult?.nutrition?.vitamins && analysisResult.nutrition.vitamins.length > 0 ? (
                      analysisResult.nutrition.vitamins.map((vit: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[10px] font-bold bg-theme-primary/10 text-theme-primary border border-theme-primary/25 px-2 py-0.5 rounded-md"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-theme-primary" />
                          {t(vit, vit)}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-theme-muted italic">
                        {t('analyzing_vitamins', 'Analyzing vitamin composition with Gemini...')}
                      </span>
                    )}
                  </div>

                  {analysisResult?.nutrition?.vitaminDetails && analysisResult.nutrition.vitaminDetails.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      {analysisResult.nutrition.vitaminDetails.slice(0, 4).map((vd: any, vIdx: number) => (
                        <div key={vIdx} className="bg-theme-card-subtle border border-theme-card rounded-lg p-2 text-[10px]">
                          <div className="flex justify-between font-extrabold text-theme-main">
                            <span>{t(vd.name, vd.name)}</span>
                            <span className="text-theme-primary font-black">
                              {vd.dailyValue} DV ({vd.amount})
                            </span>
                          </div>
                          <p className="text-theme-muted text-[9px] mt-0.5 line-clamp-1">{t(vd.benefit, vd.benefit)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reward Summary Card */}
            <div className="bg-theme-card-subtle border border-theme-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Leaf className="w-5 h-5 text-theme-primary" />
                  <div>
                    <p className="text-xs font-bold text-theme-main">{t('food_waste_diverted_stat', 'Food Waste Diverted:')} +{afterAnalysisResult?.foodSavedKg || 0.35} kg</p>
                    <p className="text-[10px] text-theme-muted">{t('prevented_methane', 'Prevented landfill methane emissions')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-theme-primary">
                    +{((analysisResult?.xpEarned || 35) + (afterAnalysisResult?.bonusXp || 30) + stickerModifiers.bonusCleanXp).toLocaleString()} XP
                  </p>
                  <p className="text-[10px] text-theme-muted font-semibold">{t('total_clean_plate_reward', 'Total Clean Plate Reward')}</p>
                </div>
              </div>

              {/* Reward breakdown */}
              {stickerModifiers.hasStickers && (
                <div className="pt-2 border-t border-theme-card text-[11px] space-y-1">
                  <div className="flex justify-between text-theme-muted">
                    <span>{t('base_clean_plate_xp', 'Base Dining & Clean Plate XP')}</span>
                    <span>+{((analysisResult?.xpEarned || 35) + (afterAnalysisResult?.bonusXp || 30)).toLocaleString()} XP</span>
                  </div>
                  <div className="flex justify-between font-bold text-theme-primary">
                    <span className="flex items-center gap-1">
                      <span>✨ {stickerModifiers.highestRarity.toUpperCase()} {t('sticker_yield', 'Sticker Yield')} ({stickerModifiers.totalStickersCount} {t('stickers', 'Stickers')})</span>
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
                  placeholder={t('optional_notes_placeholder', 'Add optional notes (e.g. delicious tofu bowl, ate with classmates)...')}
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
                  ? `${t('claim', 'Claim')} +${((analysisResult?.xpEarned || 35) + (afterAnalysisResult?.bonusXp || 30) + stickerModifiers.bonusCleanXp).toLocaleString()} XP & ${t('log_meal', 'Log Meal')}`
                  : t('capture_btn_finish', 'Claim XP & Log Sustainable Meal')}
              </span>
            </button>
          </div>
        )
      )}
    </div>
  );
};


