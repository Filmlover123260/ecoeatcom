import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const currentFilePath = typeof import.meta !== 'undefined' && import.meta.url ? fileURLToPath(import.meta.url) : (typeof __filename !== 'undefined' ? __filename : '');
const currentDirPath = currentFilePath ? path.dirname(currentFilePath) : (typeof __dirname !== 'undefined' ? __dirname : process.cwd());

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Helper to safely convert any URL, data URI, or raw Base64 into Gemini inlineData bytes
async function resolveImageToInlineData(
  input: string | undefined | null,
  fallbackMime = 'image/jpeg'
): Promise<{ mimeType: string; data: string } | null> {
  if (!input || typeof input !== 'string') return null;

  try {
    // 1. Remote HTTP/HTTPS URL
    if (input.startsWith('http://') || input.startsWith('https://')) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(input, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`Could not fetch remote image URL (${res.status}): ${input}`);
        return null;
      }
      const arrayBuf = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      const contentType = res.headers.get('content-type')?.split(';')[0] || fallbackMime;
      return {
        mimeType: contentType.startsWith('image/') ? contentType : fallbackMime,
        data: buffer.toString('base64'),
      };
    }

    // 2. Data URI (e.g. data:image/png;base64,iVBOR...)
    const dataUriMatch = input.match(/^data:([^;]+);base64,(.+)$/);
    if (dataUriMatch) {
      return {
        mimeType: dataUriMatch[1] || fallbackMime,
        data: dataUriMatch[2].trim(),
      };
    }

    // 3. Raw Base64 string or partial data prefix
    const cleaned = input.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '').trim();
    if (cleaned.length > 0) {
      return {
        mimeType: fallbackMime,
        data: cleaned,
      };
    }
  } catch (err: any) {
    console.warn('Error resolving image to inline data:', err?.message || err);
  }
  return null;
}

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'EcoEat' });
});

// Nutritional calculation engine for estimating protein, vitamins, and macros dynamically
interface CalculatedNutrition {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  calories: number;
  vitamins: string[];
  vitaminDetails: Array<{
    name: string;
    amount: string;
    dailyValue: string;
    benefit: string;
  }>;
}

function calculateNutritionFallback(
  dishName: string,
  portionSize: string = 'Regular',
  foodCategory?: string
): CalculatedNutrition {
  const isSmall = portionSize === 'Small';
  const isLarge = portionSize === 'Large';
  const multiplier = isSmall ? 0.65 : isLarge ? 1.4 : 1.0;
  const lower = `${dishName} ${foodCategory || ''}`.toLowerCase();

  // 1. Protein determination based on dish components
  let baseProtein = 20;
  if (
    lower.includes('salmon') ||
    lower.includes('chicken') ||
    lower.includes('beef') ||
    lower.includes('steak') ||
    lower.includes('tuna') ||
    lower.includes('turkey') ||
    lower.includes('shrimp') ||
    lower.includes('fish') ||
    lower.includes('pork') ||
    lower.includes('meat')
  ) {
    baseProtein = 32;
  } else if (
    lower.includes('tofu') ||
    lower.includes('tempeh') ||
    lower.includes('edamame') ||
    lower.includes('lentil') ||
    lower.includes('bean') ||
    lower.includes('chickpea') ||
    lower.includes('egg') ||
    lower.includes('paneer') ||
    lower.includes('falafel')
  ) {
    baseProtein = 24;
  } else if (
    lower.includes('quinoa') ||
    lower.includes('grain') ||
    lower.includes('pasta') ||
    lower.includes('noodle') ||
    lower.includes('rice') ||
    lower.includes('oat') ||
    lower.includes('sandwich') ||
    lower.includes('wrap')
  ) {
    baseProtein = 15;
  } else if (
    lower.includes('salad') ||
    lower.includes('greens') ||
    lower.includes('veggie') ||
    lower.includes('vegetable') ||
    lower.includes('soup')
  ) {
    baseProtein = 8;
  } else if (
    lower.includes('fruit') ||
    lower.includes('apple') ||
    lower.includes('banana') ||
    lower.includes('berry') ||
    lower.includes('orange') ||
    lower.includes('melon') ||
    lower.includes('citrus') ||
    lower.includes('smoothie')
  ) {
    baseProtein = 1.2;
  }

  // 2. Carbs, fat, fiber, calories
  let baseCalories = 430;
  let baseCarbs = 52;
  let baseFat = 13;
  let baseFiber = 8;

  if (
    lower.includes('fruit') ||
    lower.includes('apple') ||
    lower.includes('banana') ||
    lower.includes('orange') ||
    lower.includes('berry')
  ) {
    baseCalories = 95;
    baseCarbs = 25;
    baseFat = 0.4;
    baseFiber = 4.5;
  } else if (lower.includes('salad') && !lower.includes('pasta') && !lower.includes('chicken')) {
    baseCalories = 210;
    baseCarbs = 18;
    baseFat = 11;
    baseFiber = 7;
  } else if (lower.includes('smoothie') || lower.includes('juice')) {
    baseCalories = 180;
    baseCarbs = 38;
    baseFat = 1.5;
    baseFiber = 5;
  }

  // 3. Vitamins & Micronutrients profile
  const vitamins: string[] = [];
  const vitaminDetails: Array<{ name: string; amount: string; dailyValue: string; benefit: string }> = [];

  // Vitamin C
  if (
    lower.includes('citrus') ||
    lower.includes('orange') ||
    lower.includes('lemon') ||
    lower.includes('berry') ||
    lower.includes('strawberry') ||
    lower.includes('blueberry') ||
    lower.includes('broccoli') ||
    lower.includes('pepper') ||
    lower.includes('tomato') ||
    lower.includes('fruit') ||
    lower.includes('apple') ||
    lower.includes('salad') ||
    lower.includes('spinach') ||
    lower.includes('greens') ||
    lower.includes('smoothie')
  ) {
    const dv = Math.round(80 * multiplier);
    const mg = Math.round(72 * multiplier);
    vitamins.push(`Vitamin C (${dv}% DV - ${mg}mg)`);
    vitaminDetails.push({
      name: 'Vitamin C (Ascorbic Acid)',
      amount: `${mg}mg`,
      dailyValue: `${dv}%`,
      benefit: 'Immune defense, tissue repair & collagen synthesis',
    });
  }

  // Vitamin A
  if (
    lower.includes('carrot') ||
    lower.includes('spinach') ||
    lower.includes('kale') ||
    lower.includes('sweet potato') ||
    lower.includes('greens') ||
    lower.includes('salad') ||
    lower.includes('egg') ||
    lower.includes('salmon') ||
    lower.includes('mango') ||
    lower.includes('tomato') ||
    lower.includes('bowl') ||
    lower.includes('squash') ||
    lower.includes('pumpkin')
  ) {
    const dv = Math.round(65 * multiplier);
    const mcg = Math.round(580 * multiplier);
    vitamins.push(`Vitamin A (${dv}% DV - ${mcg}mcg)`);
    vitaminDetails.push({
      name: 'Vitamin A (Beta-Carotene)',
      amount: `${mcg}mcg`,
      dailyValue: `${dv}%`,
      benefit: 'Vision, cellular regeneration & mucosal barrier immunity',
    });
  }

  // Iron
  if (
    lower.includes('spinach') ||
    lower.includes('kale') ||
    lower.includes('beef') ||
    lower.includes('steak') ||
    lower.includes('lentil') ||
    lower.includes('bean') ||
    lower.includes('tofu') ||
    lower.includes('tempeh') ||
    lower.includes('quinoa') ||
    lower.includes('chickpea') ||
    lower.includes('grain') ||
    lower.includes('greens')
  ) {
    const dv = Math.round(26 * multiplier);
    const mg = (4.7 * multiplier).toFixed(1);
    vitamins.push(`Iron (${dv}% DV - ${mg}mg)`);
    vitaminDetails.push({
      name: 'Iron (Bioavailable)',
      amount: `${mg}mg`,
      dailyValue: `${dv}%`,
      benefit: 'Oxygen transport via hemoglobin & cellular energy production',
    });
  }

  // Calcium
  if (
    lower.includes('dairy') ||
    lower.includes('cheese') ||
    lower.includes('milk') ||
    lower.includes('yogurt') ||
    lower.includes('tofu') ||
    lower.includes('kale') ||
    lower.includes('broccoli') ||
    lower.includes('greens') ||
    lower.includes('chia') ||
    lower.includes('almond')
  ) {
    const dv = Math.round(24 * multiplier);
    const mg = Math.round(280 * multiplier);
    vitamins.push(`Calcium (${dv}% DV - ${mg}mg)`);
    vitaminDetails.push({
      name: 'Calcium',
      amount: `${mg}mg`,
      dailyValue: `${dv}%`,
      benefit: 'Bone structural density, muscular contraction & nerve impulses',
    });
  }

  // Vitamin B12
  if (
    lower.includes('salmon') ||
    lower.includes('fish') ||
    lower.includes('tuna') ||
    lower.includes('chicken') ||
    lower.includes('turkey') ||
    lower.includes('beef') ||
    lower.includes('egg') ||
    lower.includes('dairy') ||
    lower.includes('meat') ||
    lower.includes('cheese') ||
    lower.includes('pork')
  ) {
    const dv = Math.round(50 * multiplier);
    const mcg = (1.2 * multiplier).toFixed(1);
    vitamins.push(`Vitamin B12 (${dv}% DV - ${mcg}mcg)`);
    vitaminDetails.push({
      name: 'Vitamin B12 (Cobalamin)',
      amount: `${mcg}mcg`,
      dailyValue: `${dv}%`,
      benefit: 'Nerve myelin sheath maintenance & red blood cell formation',
    });
  }

  // Potassium
  if (
    lower.includes('banana') ||
    lower.includes('potato') ||
    lower.includes('avocado') ||
    lower.includes('salmon') ||
    lower.includes('spinach') ||
    lower.includes('fruit') ||
    lower.includes('bean') ||
    lower.includes('tomato') ||
    lower.includes('melon')
  ) {
    const dv = Math.round(20 * multiplier);
    const mg = Math.round(680 * multiplier);
    vitamins.push(`Potassium (${dv}% DV - ${mg}mg)`);
    vitaminDetails.push({
      name: 'Potassium (Electrolyte)',
      amount: `${mg}mg`,
      dailyValue: `${dv}%`,
      benefit: 'Cardiovascular balance, blood pressure & muscle recovery',
    });
  }

  // Vitamin K
  if (
    lower.includes('greens') ||
    lower.includes('spinach') ||
    lower.includes('kale') ||
    lower.includes('broccoli') ||
    lower.includes('cabbage') ||
    lower.includes('salad') ||
    lower.includes('asparagus')
  ) {
    const dv = Math.round(75 * multiplier);
    const mcg = Math.round(90 * multiplier);
    vitamins.push(`Vitamin K (${dv}% DV - ${mcg}mcg)`);
    vitaminDetails.push({
      name: 'Vitamin K1 (Phylloquinone)',
      amount: `${mcg}mcg`,
      dailyValue: `${dv}%`,
      benefit: 'Blood clotting factors & osteocalcin bone mineralization',
    });
  }

  // Vitamin D
  if (
    lower.includes('salmon') ||
    lower.includes('tuna') ||
    lower.includes('mushroom') ||
    lower.includes('egg') ||
    lower.includes('dairy') ||
    lower.includes('milk')
  ) {
    const dv = Math.round(40 * multiplier);
    const iu = Math.round(320 * multiplier);
    vitamins.push(`Vitamin D (${dv}% DV - ${iu} IU)`);
    vitaminDetails.push({
      name: 'Vitamin D3 (Cholecalciferol)',
      amount: `${iu} IU`,
      dailyValue: `${dv}%`,
      benefit: 'Calcium absorption, immune regulation & mood stabilization',
    });
  }

  // Fallback vitamins to ensure at least 4 are represented
  if (vitamins.length < 4) {
    const b6Dv = Math.round(25 * multiplier);
    const b6Mg = (0.42 * multiplier).toFixed(2);
    vitamins.push(`Vitamin B6 (${b6Dv}% DV - ${b6Mg}mg)`);
    vitaminDetails.push({
      name: 'Vitamin B6 (Pyridoxine)',
      amount: `${b6Mg}mg`,
      dailyValue: `${b6Dv}%`,
      benefit: 'Neurotransmitter synthesis & protein metabolism',
    });

    const folateDv = Math.round(22 * multiplier);
    const folateMcg = Math.round(88 * multiplier);
    vitamins.push(`Folate / B9 (${folateDv}% DV - ${folateMcg}mcg)`);
    vitaminDetails.push({
      name: 'Folate (Vitamin B9)',
      amount: `${folateMcg}mcg`,
      dailyValue: `${folateDv}%`,
      benefit: 'DNA replication, cell division & healthy metabolic function',
    });

    const magDv = Math.round(18 * multiplier);
    const magMg = Math.round(75 * multiplier);
    vitamins.push(`Magnesium (${magDv}% DV - ${magMg}mg)`);
    vitaminDetails.push({
      name: 'Magnesium',
      amount: `${magMg}mg`,
      dailyValue: `${magDv}%`,
      benefit: 'ATP energy production & neuromuscular relaxation',
    });

    const zincDv = Math.round(20 * multiplier);
    const zincMg = (2.2 * multiplier).toFixed(1);
    vitamins.push(`Zinc (${zincDv}% DV - ${zincMg}mg)`);
    vitaminDetails.push({
      name: 'Zinc',
      amount: `${zincMg}mg`,
      dailyValue: `${zincDv}%`,
      benefit: 'Enzyme catalysis, wound healing & immune resistance',
    });
  }

  const finalProtein = Math.round(baseProtein * multiplier * 10) / 10;
  const finalCarbs = Math.round(baseCarbs * multiplier);
  const finalFat = Math.round(baseFat * multiplier * 10) / 10;
  const finalFiber = Math.round(baseFiber * multiplier * 10) / 10;
  const finalCalories = Math.round(baseCalories * multiplier);

  return {
    protein: finalProtein,
    carbs: finalCarbs,
    fat: finalFat,
    fiber: finalFiber,
    calories: finalCalories,
    vitamins,
    vitaminDetails,
  };
}

// API: AI Meal & Portion Analyzer using Gemini (supports both /api/analyze-meal and /api/gemini/analyze-meal)
const analyzeMealHandler = async (req: express.Request, res: express.Response) => {
  const { mealStage = 'before', portionSize = 'Regular', foodCategory, foodItem } = req.body || {};
  const isSmall = portionSize === 'Small';
  const isLarge = portionSize === 'Large';

  try {
    let rawImage = req.body.imageBase64 || req.body.imageUrl || req.body.image;
    let mimeType = req.body.mimeType || 'image/jpeg';
    let stage = mealStage;

    // If client sent raw contents array from Gemini format
    if (req.body.contents && Array.isArray(req.body.contents)) {
      const parts = req.body.contents[0]?.parts || [];
      for (const p of parts) {
        if (p.inlineData?.data) {
          rawImage = p.inlineData.data;
          mimeType = p.inlineData.mimeType || mimeType;
        }
        if (p.text && p.text.includes('clean plate')) {
          stage = 'after';
        }
      }
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.AI_STUDIO_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'missing_api_key',
        message: 'Gemini API key is not configured on the server.',
      });
    }

    const resolved = await resolveImageToInlineData(rawImage, mimeType);
    if (!resolved || !resolved.data) {
      return res.status(400).json({
        success: false,
        error: 'invalid_image',
        message: 'No image data detected. Please position your camera at your food and try again.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let prompt = '';
    if (stage === 'before') {
      prompt = `You are EcoEat's campus dining and AI vision auditor.
Analyze this photo taken by a student with their smartphone camera in the campus dining hall.

=======================================================
STRICT RULE 1: NON-FOOD, FACE, PERSON, OR OBJECT DETECTION (CHECK THIS FIRST!)
=======================================================
You MUST inspect the entire image for non-food items BEFORE classifying any food:
- If this image displays a human face, selfie, person, head, portrait, eyes, mouth, nose, or skin closeup
- If this image displays a body part (hand, fingers, arm, leg) with NO edible food or fruit in it
- If this image displays a computer screen, laptop, keyboard, smartphone, monitor, TV
- If this image displays classroom or desk items: notebooks, pens, pencils, books, paper, backpack
- If this image displays a room wall, floor, ceiling, furniture, bed, vehicle, clothes, shoes
- If this image displays plastic bottles, keys, electronics, or non-edible objects

CRITICAL CLARIFICATION FOR HANDS / FINGERS:
If a hand or fingers are holding, peeling, opening, or splitting a fruit or meal (e.g. fingers holding a split-open orange, peeled banana, sliced watermelon, split apple, or avocado half), THIS IS 100% VALID FOOD. Do NOT classify an image as non-food simply because human fingers or a hand are holding or peeling the fruit!

IF A HUMAN FACE, PERSON, SELFIE, OR NON-FOOD OBJECT IS IN FOCUS OR NO EDIBLE FOOD IS PRESENT:
YOU MUST IMMEDIATELY SET:
{
  "isFood": false,
  "isFinishedFruit": false,
  "isSplitFruit": false,
  "isPenalty": true,
  "dishName": "Non-Food Detected: [Specify what is actually seen, e.g. Human Face / Selfie, Laptop Screen, Desk Stationery, Clothing]",
  "nonFoodReason": "Identified [actual item or face seen] instead of an edible campus meal or fresh fruit.",
  "confidenceScore": 99,
  "portionEstimatedGrams": 0,
  "estimatedCalories": 0,
  "nutrition": { "protein": 0, "carbs": 0, "fat": 0, "fiber": 0, "vitamins": [], "vitaminDetails": [] },
  "foodItems": [],
  "detectedZones": [],
  "carbonSavingsKg": 0,
  "waterSavedLiters": 0,
  "ecoScore": "N/A",
  "dietaryTags": ["Non-Food"],
  "sustainabilityFeedback": "⚠️ Non-food item detected. EcoEat awards XP only for genuine dining meals, plates, or fresh fruit.",
  "xpEarned": -20
}

=======================================================
STRICT RULE 2: GENUINE FOOD, SPLIT FRUITS & FRESH PRODUCE RECOGNITION
=======================================================
ONLY if the photo ACTUALLY contains edible food, a split-open or whole fruit, a prepared meal, dining plate/bowl, beverage, or compostable fruit remnants:
- Disregard any user hints if they do not match the photo! Classify what you ACTUALLY see in the photo:
${foodCategory ? `(Category hint was "${foodCategory}")` : ''}
${foodItem ? `(Dish hint was "${foodItem}" - WARNING: Only use if this is actually what is in the picture!)` : ''}

A. SPLIT-OPEN, CUT, HALVED, SLICED, OR PEELED FRUITS (HIGH PRIORITY):
Students frequently cut, slice, wedge, crack, peel, bite, or split open fresh fruit before or while dining:
- SPLIT-OPEN ORANGES & CITRUS: Orange, clementine, tangerine, mandarin, grapefruit, lemon, or lime split in half, peeled open, or pulled into segments.
- SPLIT-OPEN APPLES & PEARS: Apple or pear cut in half, quartered, sliced into wedges, or bitten open exposing the inner flesh, core, or seeds.
- PEELED & SPLIT BANANAS: Banana peeled open (partially or fully), split down the middle, or broken in half.
- SLICED & SPLIT WATERMELON / MELON: Watermelon cut open into wedges/slices, or cantaloupe / honeydew halved or scooped.
- SPLIT AVOCADOS: Avocado sliced in half, showing the round pit or smooth green flesh.
- SPLIT MANGOS & PAPAYAS: Mango sliced in half or diced/scored in hedgehog style; papaya cut in half showing dark seeds and vibrant orange flesh.
- SPLIT DRAGONFRUIT (PITAYA): Dragonfruit sliced or split open showing speckled white or magenta flesh with tiny black seeds.
- SPLIT POMEGRANATES: Pomegranate broken or split open showing clusters of ruby-red seeds/arils.
- OTHER SPLIT / HALVED FRUITS: Split passionfruit, halved kiwi (showing green/gold flesh and seeds), cracked coconut (showing white flesh), halved peaches, plums, apricots, figs, guavas, berries, or mixed fresh fruit salad.

WHEN ANY SPLIT-OPEN, HALVED, OR SLICED FRUIT IS PRESENT:
- Set "isFood": true
- Set "isSplitFruit": true
- Set "isFinishedFruit": false
- Set "isPenalty": false
- Set "dishName": Accurate name recognizing the split fruit (e.g. "Split Fresh Orange", "Sliced Watermelon Wedge", "Split Honeycrisp Apple", "Peeled Fresh Banana", "Split Dragonfruit", "Halved Fresh Avocado", "Split Open Pomegranate", "Cut Fresh Kiwi", "Split Tropical Mango").
- Set "portionEstimatedGrams": estimated weight of the split fruit portion (e.g. 120g - 280g).
- Set "estimatedCalories": estimated natural calories of the fruit (e.g. 60 - 140 kcal).
- Set "nutrition": Provide realistic natural macro & micronutrients, highlighting essential vitamins:
  * "protein": ~1 - 2g
  * "carbs": ~15 - 30g (natural fruit sugars)
  * "fat": ~0 - 1g (or ~15g if avocado)
  * "fiber": ~3 - 6g (high prebiotic fiber)
  * "vitamins": e.g. ["Vitamin C (85% DV - 75mg)", "Potassium (320mg)", "Folate (12% DV)"]
  * "vitaminDetails": detailed vitamin benefits (immune support, antioxidant defense, cellular health)
- Set "foodItems": [name of the fruit, "100% Raw Edible Fruit", "Natural Plant Fiber"]
- Set "detectedZones": [{ "label": "name of fruit", "category": "fruit", "confidence": 97, "estimatedGrams": 180 }]
- Set "carbonSavingsKg": 0.45 (fresh raw fruit requires zero cooking energy, saving carbon)
- Set "waterSavedLiters": 120
- Set "ecoScore": "A+"
- Set "dietaryTags": ["Fresh Fruit", "Split Fruit", "Raw Produce", "Zero Carbon", "High Fiber"]
- Set "sustainabilityFeedback": "🍎 Fresh split fruit verified! Consuming raw seasonal fruit provides direct hydration and vitamins while generating zero cooking carbon emissions."
- Set "xpEarned": 35

B. FINISHED APPLES, PEARS, BANANAS & COMPOSTABLE FRUIT REMNANTS (100% EDIBLE FRUIT CONSUMED):
CRITICAL MANDATORY INSTRUCTION: Students frequently finish eating an apple, pear, or banana and take a photo of what remains:
- APPLE'S CENTER / CORE: When an apple is eaten down to its central core, seeds, and stem.
- PEAR'S CENTER / CORE: When a pear is eaten down to its central core, seeds, and stem.
- BANANA PEEL: When a banana has been eaten leaving only the yellow or spotted peel.
- CITRUS PEELS / RIND: Orange, mandarin, grapefruit, or lemon peels leftover after eating the fruit.
- WATERMELON / MELON RINDS: Clean green or white rinds leftover after eating the sweet melon flesh.
- AVOCADO PEEL & PIT: Empty avocado skins/peels and pit after scooping out the flesh.
- FRUIT PITS / STONES: Peach, plum, apricot, mango, or cherry pits/stones with all fruit consumed.

DO NOT PENALIZE! DO NOT DEDUCT POINTS!
Natural fruit cores, centers, seeds, stems, and peels are INEDIBLE, ORGANIC COMPOSTABLE MATTER, NOT FOOD WASTE.
When an apple center/core, pear center/core, banana peel, or fruit peel is present:
- Set "isFood": true
- Set "isFinishedFruit": true
- Set "isSplitFruit": false
- Set "isPenalty": false
- Set "dishName": descriptive name (e.g. "Finished Apple (Core & Center Consumed)", "Finished Pear (Center & Stem Remaining)", "Finished Banana (Peel Remaining - 100% Eaten)").
- Set "portionEstimatedGrams": 0 (edible portion 100% finished)
- Set "estimatedCalories": estimated fruit calories enjoyed (e.g. 95 kcal for apple, 100 kcal for pear, 105 kcal for banana)
- Set "nutrition": natural fruit nutrition profile (vitamins C, A, potassium, fiber)
- Set "foodItems": ["100% Edible Fruit Consumed", "Organic Compostable Core / Peel"]
- Set "carbonSavingsKg": 0.45
- Set "waterSavedLiters": 120
- Set "ecoScore": "A+"
- Set "dietaryTags": ["Finished Fruit", "Zero Waste", "100% Eaten", "Compostable Peel/Core"]
- Set "sustainabilityFeedback": "🍎 Finished fruit verified! 100% of edible fruit enjoyed. Natural apple/pear centers and banana peels are organic compost, not edible waste. Zero penalty!"
- Set "xpEarned": 35

C. Fresh Whole Fruit / Produce:
If the image shows an uncut fresh whole apple, banana, pear, orange, watermelon slice, berries, or produce:
- Set "isFood": true, "isFinishedFruit": false, "isSplitFruit": false, "isPenalty": false.
- Set "dishName": specific fruit name (e.g. "Fresh Apple", "Fresh Pear", "Fresh Banana", "Fruit Salad").

D. Prepared Meals & Dining Dishes:
If the image shows a plated meal, rice bowl, noodle dish, soup, salad, sandwich, protein:
- Identify the ACTUAL dish (e.g., "Nasi Goreng with Fried Egg", "Chicken Caesar Salad", "Tofu & Vegetable Stir-Fry", "Pasta Primavera").
- Set "isFood": true, "isFinishedFruit": false, "isSplitFruit": false, "isPenalty": false.

Respond STRICTLY with a valid JSON object matching this schema:
{
  "isFood": boolean,
  "isFinishedFruit": boolean,
  "isSplitFruit": boolean,
  "nonFoodReason": string,
  "isPenalty": boolean,
  "dishName": string,
  "confidenceScore": number (80 to 99),
  "portionEstimatedGrams": number,
  "estimatedCalories": number,
  "nutrition": {
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "vitamins": ["string array with % DV e.g. 'Vitamin C (85% DV - 76mg)'"],
    "vitaminDetails": [
      {
        "name": string,
        "amount": string,
        "dailyValue": string,
        "benefit": string
      }
    ]
  },
  "foodItems": ["list of visible components"],
  "detectedZones": [
    {
      "label": string,
      "category": "protein" | "grain" | "vegetable" | "fruit" | "dairy" | "dressing" | "other",
      "confidence": number,
      "estimatedGrams": number
    }
  ],
  "carbonSavingsKg": number,
  "waterSavedLiters": number,
  "ecoScore": "A+" | "A" | "B+" | "B" | "N/A",
  "dietaryTags": ["string"],
  "sustainabilityFeedback": string,
  "xpEarned": number (35 to 45 for food, or -20 for non-food)
}`;
    } else {
      prompt = `You are EcoEat's campus clean plate & finished dining verification AI vision model.
Analyze this post-dining photo taken by a student to verify if they finished their meal.

=======================================================
STRICT RULE 1: NON-DINING, NON-FOOD, OR FACE DETECTION
=======================================================
- If this photo shows a human face, selfie, person, wall, shoes, laptop, desk stationery, or non-dining items:
  YOU MUST SET:
  "isFood": false,
  "isPenalty": true,
  "cleanPlateVerified": false,
  "dishName": "Non-Dining Photo: [Name object or face seen]",
  "confidenceScore": 99,
  "wasteGrams": 0,
  "remainingWasteGrams": 0,
  "foodSavedKg": 0,
  "carbonSavingsKg": 0,
  "waterSavedLiters": 0,
  "bonusXp": -20,
  "xpEarned": -20,
  "congratulationsMessage": "⚠️ Non-dining image detected! Please capture your actual dining plate or finished fruit tray.",
  "sustainabilityFeedback": "EcoEat clean plate verification requires a photo of your dining tray or plate."

=======================================================
STRICT RULE 2: VERIFY CLEAN PLATE OR FINISHED FRUIT (APPLES, PEARS, BANANAS, CORES & PEELS)
=======================================================
CRITICAL ZERO-PENALTY POLICY FOR APPLES, PEARS, BANANAS & FRUIT PEELS:
DO NOT DEDUCT SOMEONE'S POINTS JUST BECAUSE THEY LEFT THE APPLE'S CENTER, THE PEAR'S CENTER, OR THE BANANA PEEL!
- If the photo shows an APPLE'S CENTER / CORE (the seeds, stem, and fibrous core leftover after eating an apple): 100% FINISHED FRUIT!
- If the photo shows a PEAR'S CENTER / CORE (the seeds, stem, and fibrous core leftover after eating a pear): 100% FINISHED FRUIT!
- If the photo shows a BANANA PEEL (the banana was completely eaten, leaving the yellow/brown peel): 100% FINISHED FRUIT!
- If the photo shows citrus peels (orange, tangerine, lemon), watermelon rinds, melon rinds, or fruit stones/pits: 100% FINISHED FRUIT!

IN ALL THESE FINISHED FRUIT CASES:
* "cleanPlateVerified": true
* "isFood": true
* "isFinishedFruit": true
* "isFinishedPlateRemnants": false
* "remnantType": "fruit_core_peel"
* "isPenalty": false
* "wasteGrams": 0  <-- MUST BE 0! Inedible peels, centers, and cores are NOT food waste!
* "remainingWasteGrams": 0
* "foodSavedKg": 0.25
* "carbonSavingsKg": 0.54
* "waterSavedLiters": 120
* "bonusXp": 30
* "xpEarned": 35
* "dishName": "Finished Apple (Core Composted)" / "Finished Pear (Center Composted)" / "Finished Banana (Peel Composted)" / "Finished Fruit Verification"
* "congratulationsMessage": "🍎 Finished Fruit 100% Verified! Zero edible food wasted. The apple center, pear center, or banana peel is 100% compostable!"
* "sustainabilityFeedback": "Awesome job finishing your fruit! Leaving the apple center, pear center, or banana peel is natural and healthy—these are inedible compostable fibers, completely diverted from landfill."

=======================================================
STRICT RULE 3: INEDIBLE REMNANTS & TRACE LEFTOVERS POLICY (BONES, RICE GRAINS, NOODLE BITS, FOOD SPECKS)
=======================================================
CRITICAL ZERO-PENALTY POLICY FOR FINISHED PLATES WITH BONES, RICE GRAINS, NOODLE BITS, OR FOOD SPECKS:
WHEN THE USER FINISHES THEIR MEAL, DETECT BONES, LITTLE BITS OF GRAINS OF RICE, BITS OF NOODLES, OR BITS OF FOOD LEFT ON THEIR PLATE AS A FINISHED PLATE!
- BONES: Chicken bones (wings, drumsticks), fish bones, meat/rib bones, seafood shells (prawn shells, clam shells), or cartilage leftover after consuming meat. Inedible bones and shells are NOT food waste! A plate with bones leftover from dining is a 100% FINISHED PLATE!
- LITTLE BITS OF GRAINS OF RICE: Stray grains of rice sticking to the surface, rim, or crevices of a plate or rice bowl are natural dining remnants. This is a 100% FINISHED PLATE!
- BITS OF NOODLES: Short noodle segments, broken noodle bits, or trace noodle strands remaining in the bottom of a noodle bowl or plate are natural dining remnants. This is a 100% FINISHED PLATE!
- BITS OF FOOD: Small food specks, trace crumbs, sauce smears, herb/scallion garnishes, chili seeds, or minor food bits (< 35g) remaining on an eaten plate are natural dining remnants. This is a 100% FINISHED PLATE!

IN ALL THESE FINISHED PLATE CASES (empty plate, bones, rice grains, noodle bits, or trace food bits):
* "cleanPlateVerified": true
* "isFood": true
* "isFinishedFruit": false
* "isFinishedPlateRemnants": true (or false if completely empty plate)
* "remnantType": "bones" | "rice_grains" | "noodles" | "food_bits" | "empty_clean"
* "isPenalty": false
* "wasteGrams": 0  <-- MUST BE 0! Inedible bones, scattered grains of rice, noodle bits, and food specks are NOT penalizable food waste!
* "remainingWasteGrams": 0
* "foodSavedKg": 0.35
* "carbonSavingsKg": 0.54
* "waterSavedLiters": 350
* "bonusXp": 30
* "xpEarned": 35
* "dishName": "Finished Plate (Bones Cleared)" / "Finished Plate (Rice Grains Diverted)" / "Finished Plate (Noodle Bits Diverted)" / "Finished Plate (Trace Bits Diverted)" / "Clean Plate Verification"
* "congratulationsMessage": "🍽️ Finished Plate 100% Verified! Zero edible food wasted. Bones, stray rice grains, noodle bits, or trace food bits are natural dining remnants!"
* "sustainabilityFeedback": "Terrific job finishing your meal! Bones, stray grains of rice, noodle bits, or minor food specks are natural dining remnants, not food waste. Full clean plate points and diversion bonus awarded!"

- Clean Plate (Empty Plate): If dining plate, bowl, or container is completely empty and clean:
  "cleanPlateVerified": true, "isFood": true, "isFinishedFruit": false, "isFinishedPlateRemnants": false, "remnantType": "empty_clean", "isPenalty": false, "wasteGrams": 0, "foodSavedKg": 0.35, "bonusXp": 30, "xpEarned": 35.

- Unfinished Food Waste: ONLY if substantial, significant EDIBLE portions of food remain uneaten (e.g., half an uneaten sandwich, major leftover pile of rice > 35g, untouched noodle portion, large intact uneaten cutlet).
  NEVER penalize for bones, stray grains of rice, noodle bits, minor food specks, or fruit cores/peels:
  "cleanPlateVerified": false, "isFood": true, "isPenalty": true, "wasteGrams": number, "bonusXp": -25, "xpEarned": -25.

Respond STRICTLY with valid JSON matching:
{
  "dishName": string,
  "isFood": boolean,
  "isFinishedFruit": boolean,
  "isFinishedPlateRemnants": boolean,
  "remnantType": "bones" | "rice_grains" | "noodles" | "food_bits" | "fruit_core_peel" | "empty_clean" | "none",
  "isPenalty": boolean,
  "cleanPlateVerified": boolean,
  "cleanPlateConfidence": number,
  "cleanlinessConfidence": number,
  "confidenceScore": number,
  "wasteGrams": number,
  "remainingWasteGrams": number,
  "foodSavedKg": number,
  "carbonSavingsKg": number,
  "waterSavedLiters": number,
  "bonusXp": number,
  "xpEarned": number,
  "congratulationsMessage": string,
  "sustainabilityFeedback": string
}`;
    }

    const parts = [
      {
        inlineData: {
          mimeType: resolved.mimeType,
          data: resolved.data,
        },
      },
      { text: prompt },
    ];

    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const generatePromise = ai.models.generateContent({
            model: modelName,
            contents: {
              parts: parts,
            },
            config: {
              responseMimeType: 'application/json',
            },
          });

          // 22-second timeout to allow complete, high-quality multimodal analysis
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Model timeout')), 22000)
          );

          response = await Promise.race([generatePromise, timeoutPromise]);
          if (response && response.text) {
            break;
          }
        } catch (modelErr: any) {
          lastError = modelErr;
          const isTransient =
            modelErr?.status === 503 ||
            modelErr?.status === 429 ||
            modelErr?.message?.includes('503') ||
            modelErr?.message?.includes('demand') ||
            modelErr?.message?.includes('429');

          if (isTransient && attempt === 0) {
            console.log(`[Gemini Vision] ${modelName} transient spike (${modelErr?.status || 503}), retrying in 1200ms...`);
            await new Promise((r) => setTimeout(r, 1200));
            continue;
          }
          console.log(`[Gemini Vision] ${modelName} error on attempt ${attempt + 1}:`, modelErr?.status || modelErr?.message);
          break;
        }
      }
      if (response && response.text) {
        break;
      }
    }

    if (response && response.text) {
      const text = response.text.trim();
      const sanitized = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(sanitized);

      // GUARANTEE ZERO PENALTIES FOR FINISHED APPLES, PEARS, BANANAS & INEDIBLE PEELS/CORES
      const checkText = `${parsed.dishName || ''} ${parsed.sustainabilityFeedback || ''} ${parsed.nonFoodReason || ''} ${parsed.congratulationsMessage || ''} ${JSON.stringify(parsed.foodItems || [])} ${foodItem || ''} ${foodCategory || ''}`.toLowerCase();
      
      const isFruitCoreOrPeel =
        parsed.isFinishedFruit === true ||
        /apple.*(core|center)|pear.*(core|center)|banana.*(peel|skin)|(core|center|peel|rind|skin).*(apple|pear|banana|fruit|citrus|orange|watermelon|melon)/i.test(checkText) ||
        /\b(apple\s*core|pear\s*core|banana\s*peel|apple\s*center|pear\s*center|banana\s*skin|fruit\s*peel|citrus\s*peel|watermelon\s*rind)\b/i.test(checkText);

      if (isFruitCoreOrPeel) {
        parsed.isFood = true;
        parsed.isFinishedFruit = true;
        parsed.isFinishedPlateRemnants = false;
        parsed.remnantType = 'fruit_core_peel';
        parsed.isPenalty = false;
        delete parsed.nonFoodReason;

        if (mealStage === 'after') {
          parsed.cleanPlateVerified = true;
          parsed.wasteGrams = 0;
          parsed.remainingWasteGrams = 0;
          parsed.cleanPlateConfidence = parsed.cleanPlateConfidence || 99;
          parsed.cleanlinessConfidence = parsed.cleanlinessConfidence || 99;
          parsed.foodSavedKg = parsed.foodSavedKg || 0.25;
          parsed.carbonSavingsKg = Math.max(parsed.carbonSavingsKg || 0, 0.54);
          parsed.waterSavedLiters = Math.max(parsed.waterSavedLiters || 0, 120);
          parsed.bonusXp = 30;
          parsed.xpEarned = 35;
          parsed.dishName = parsed.dishName && !/penalty|waste|non-dining/i.test(parsed.dishName)
            ? parsed.dishName
            : 'Finished Fruit Verification';
          parsed.congratulationsMessage = parsed.congratulationsMessage || '🍎 Finished Fruit 100% Verified! Zero edible food wasted. The apple center, pear center, or banana peel is 100% compostable!';
          parsed.sustainabilityFeedback = parsed.sustainabilityFeedback || 'Awesome job finishing your fruit! Leaving the apple center, pear center, or banana peel is natural and healthy—these are compostable fibers, completely diverted from landfill.';
        } else {
          parsed.portionEstimatedGrams = parsed.portionEstimatedGrams || 0;
          parsed.xpEarned = Math.max(parsed.xpEarned || 0, 35);
          parsed.sustainabilityFeedback = parsed.sustainabilityFeedback || '🍎 Finished fruit detected! 100% of the edible fruit was consumed. Natural cores, centers, and peels are organic compost, not edible waste.';
        }
      }

      // GUARANTEE ZERO PENALTIES FOR FINISHED PLATES WITH BONES, RICE GRAINS, NOODLE BITS, OR FOOD SPECKS
      const isBoneOrTraceRemnant =
        !isFruitCoreOrPeel && (
          parsed.isFinishedPlateRemnants === true ||
          /\b(bone|bones|chicken\s*bone|fish\s*bone|meat\s*bone|rib\s*bone|wings?\s*bone|drumstick\s*bone|shell|shells|prawn\s*shell|shrimp\s*tail|cartilage)\b/i.test(checkText) ||
          /\b(grain|grains|rice\s*grain|rice\s*grains|grains?\s*of\s*rice|stray\s*rice|rice\s*residue|rice\s*bits?)\b/i.test(checkText) ||
          /\b(noodle\s*bit|noodle\s*bits|bits?\s*of\s*noodles?|noodle\s*strand|noodle\s*strands|pasta\s*bit|pasta\s*bits|noodle\s*fragment|noodle\s*fragments)\b/i.test(checkText) ||
          /\b(bits?\s*of\s*food|food\s*bit|food\s*bits|trace\s*food|food\s*speck|food\s*specks|crumbs?|sauce\s*smear|garnish|herb\s*speck)\b/i.test(checkText) ||
          (/finished\s*(plate|meal|dish)|empty\s*(plate|bowl)/i.test(checkText) && (parsed.wasteGrams || 0) < 40)
        );

      if (isBoneOrTraceRemnant && mealStage === 'after') {
        parsed.isFood = true;
        parsed.cleanPlateVerified = true;
        parsed.isFinishedPlateRemnants = true;
        parsed.isPenalty = false;
        parsed.wasteGrams = 0;
        parsed.remainingWasteGrams = 0;
        delete parsed.nonFoodReason;

        // Classify remnant type
        if (/\b(bone|bones|cartilage|shell|shells)\b/i.test(checkText)) {
          parsed.remnantType = 'bones';
        } else if (/\b(rice|grain|grains)\b/i.test(checkText)) {
          parsed.remnantType = 'rice_grains';
        } else if (/\b(noodle|noodles|pasta|strand|strands)\b/i.test(checkText)) {
          parsed.remnantType = 'noodles';
        } else {
          parsed.remnantType = 'food_bits';
        }

        parsed.cleanPlateConfidence = parsed.cleanPlateConfidence || 99;
        parsed.cleanlinessConfidence = parsed.cleanlinessConfidence || 99;
        parsed.foodSavedKg = parsed.foodSavedKg || 0.35;
        parsed.carbonSavingsKg = Math.max(parsed.carbonSavingsKg || 0, 0.54);
        parsed.waterSavedLiters = Math.max(parsed.waterSavedLiters || 0, 350);
        parsed.bonusXp = 30;
        parsed.xpEarned = 35;

        if (!parsed.dishName || /penalty|waste|unfinished|non-dining/i.test(parsed.dishName)) {
          if (parsed.remnantType === 'bones') {
            parsed.dishName = 'Finished Plate (Bones Cleared)';
          } else if (parsed.remnantType === 'rice_grains') {
            parsed.dishName = 'Finished Plate (Rice Grains Diverted)';
          } else if (parsed.remnantType === 'noodles') {
            parsed.dishName = 'Finished Plate (Noodle Bits Diverted)';
          } else {
            parsed.dishName = 'Finished Plate (Trace Bits Diverted)';
          }
        }

        parsed.congratulationsMessage = parsed.congratulationsMessage || '🍽️ Finished Plate 100% Verified! Zero edible food wasted. Bones, stray rice grains, noodle bits, or trace food bits are natural dining remnants!';
        parsed.sustainabilityFeedback = parsed.sustainabilityFeedback || 'Terrific job finishing your meal! Bones, stray grains of rice, noodle bits, or minor food specks are natural dining remnants, not food waste. Full clean plate points and diversion bonus awarded!';
      }

      if (parsed.isFood !== false && !parsed.isPenalty) {
        if (parsed.nutrition) {
          if (!parsed.nutrition.vitamins || !Array.isArray(parsed.nutrition.vitamins) || parsed.nutrition.vitamins.length === 0) {
            const enrichNutr = calculateNutritionFallback(parsed.dishName || foodItem || 'Campus Meal', portionSize, foodCategory);
            parsed.nutrition.vitamins = enrichNutr.vitamins;
            parsed.nutrition.vitaminDetails = enrichNutr.vitaminDetails;
          }
        }
      }

      return res.json({ success: true, ...parsed, text: sanitized });
    }

    throw lastError || new Error('All vision models temporarily unavailable');
  } catch (err: any) {
    console.error('[Gemini Vision] Vision processing error:', err?.message || err);
    return res.status(503).json({
      success: false,
      error: 'ai_vision_unavailable',
      message: 'The AI scanner is momentarily experiencing high demand. Please hold your camera steady and scan again.',
    });
  }
};

// API: Detect Protein, Vitamins, and Nutritional Profile for any custom dish name using Gemini AI
const analyzeDishNutritionHandler = async (req: express.Request, res: express.Response) => {
  const { dishName = 'Campus Meal', portionSize = 'Regular', foodCategory, ingredients = [] } = req.body || {};

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.AI_STUDIO_API_KEY;

  const fallbackNutr = calculateNutritionFallback(dishName, portionSize, foodCategory);

  if (!apiKey) {
    return res.json({
      success: true,
      dishName,
      portionSize,
      estimatedCalories: fallbackNutr.calories,
      portionEstimatedGrams: portionSize === 'Small' ? 220 : portionSize === 'Large' ? 460 : 340,
      nutrition: fallbackNutr,
      foodItems: [dishName, ...(Array.isArray(ingredients) && ingredients.length > 0 ? ingredients : ['Fresh Campus Ingredients', 'Nutrient-Dense Produce'])],
      carbonSavingsKg: portionSize === 'Small' ? 0.38 : portionSize === 'Large' ? 0.76 : 0.54,
      waterSavedLiters: portionSize === 'Small' ? 380 : portionSize === 'Large' ? 820 : 590,
      ecoScore: 'A+',
      sustainabilityFeedback: `Nutrient-dense ${foodCategory || 'campus'} dish! High in protein (${fallbackNutr.protein}g) and rich in vital vitamins.`,
      isMock: true,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const prompt = `You are EcoEat's expert nutritional scientist AI.
Analyze the nutritional composition of this specific meal or custom dish:
Dish Name: "${dishName}"
Portion Size: "${portionSize}"
Food Category: "${foodCategory || 'Campus Meal'}"
Known Ingredients: ${Array.isArray(ingredients) && ingredients.length > 0 ? ingredients.join(', ') : 'None specified'}

Analyze:
1. Exact macronutrients (especially protein in grams, carbs, fat, fiber).
2. Key vitamins & essential minerals (e.g. Vitamin A, Vitamin C, Vitamin D, Vitamin E, Vitamin K, Vitamin B6, Vitamin B12, Folate/B9, Iron, Calcium, Potassium, Magnesium, Zinc).
   - In "vitamins" string array, provide 4 to 6 items with % Daily Value and amounts (e.g. "Vitamin C (85% DV - 76mg)", "Vitamin A (45% DV - 410mcg)", "Iron (22% DV - 4.0mg)", "Calcium (18% DV - 230mg)", "Vitamin B12 (35% DV - 0.8mcg)").
   - In "vitaminDetails", provide name, amount, dailyValue, and benefit for each.
3. Total estimated calories (kcal) and portion in grams.
4. Sustainability feedback and recognized ingredients.

Respond STRICTLY with a valid JSON object matching this schema:
{
  "dishName": "${dishName}",
  "portionSize": "${portionSize}",
  "estimatedCalories": number,
  "portionEstimatedGrams": number,
  "nutrition": {
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "vitamins": ["string"],
    "vitaminDetails": [
      {
        "name": "string",
        "amount": "string",
        "dailyValue": "string",
        "benefit": "string"
      }
    ]
  },
  "foodItems": ["string"],
  "carbonSavingsKg": number,
  "waterSavedLiters": number,
  "ecoScore": "A+",
  "sustainabilityFeedback": "string"
}`;

    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
    for (const model of modelsToTry) {
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 7000));
        const genPromise = ai.models.generateContent({
          model,
          contents: [{ text: prompt }],
          config: { responseMimeType: 'application/json' },
        });

        const resp: any = await Promise.race([genPromise, timeoutPromise]);
        const text = resp?.text ? (typeof resp.text === 'function' ? resp.text() : resp.text) : '';
        if (text) {
          const sanitized = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
          const parsed = JSON.parse(sanitized);
          if (parsed && parsed.nutrition && typeof parsed.nutrition.protein === 'number') {
            if (!Array.isArray(parsed.nutrition.vitamins) || parsed.nutrition.vitamins.length === 0) {
              parsed.nutrition.vitamins = fallbackNutr.vitamins;
              parsed.nutrition.vitaminDetails = fallbackNutr.vitaminDetails;
            }
            return res.json({ success: true, ...parsed, text: sanitized });
          }
        }
      } catch (err: any) {
        const isBusy =
          err?.status === 503 ||
          err?.status === 429 ||
          err?.message?.includes('503') ||
          err?.message?.includes('demand') ||
          err?.message?.includes('429');
        if (isBusy) {
          console.log(`[Gemini] ${model} experiencing temporary high demand, rotating model...`);
        } else {
          console.log(`[Gemini] ${model} query fallback:`, err?.message || 'Model error');
        }
      }
    }
  } catch (outerErr: any) {
    console.log('[Gemini] Dynamic nutritional calculation fallback active');
  }

  return res.json({
    success: true,
    dishName,
    portionSize,
    estimatedCalories: fallbackNutr.calories,
    portionEstimatedGrams: portionSize === 'Small' ? 220 : portionSize === 'Large' ? 460 : 340,
    nutrition: fallbackNutr,
    foodItems: [dishName, ...(Array.isArray(ingredients) && ingredients.length > 0 ? ingredients : ['Fresh Campus Ingredients', 'Nutrient-Dense Produce'])],
    carbonSavingsKg: portionSize === 'Small' ? 0.38 : portionSize === 'Large' ? 0.76 : 0.54,
    waterSavedLiters: portionSize === 'Small' ? 380 : portionSize === 'Large' ? 820 : 590,
    ecoScore: 'A+',
    sustainabilityFeedback: `Nutrient-dense ${foodCategory || 'campus'} dish! High in protein (${fallbackNutr.protein}g) and rich in vital vitamins.`,
  });
};

  app.post('/api/analyze-meal', analyzeMealHandler);
  app.post('/api/gemini/analyze-meal', analyzeMealHandler);
  app.post('/api/analyze-dish-nutrition', analyzeDishNutritionHandler);
  app.post('/api/gemini/analyze-dish-nutrition', analyzeDishNutritionHandler);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EcoEat Server running on http://localhost:${PORT}`);
  });
}

startServer();
