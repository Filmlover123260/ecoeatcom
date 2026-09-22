import { SupportedLanguage } from '../../context/LanguageContext';
import { FoodTranslationMap } from './types';
import { enFoodTranslations } from './en';
import { idFoodTranslations } from './id';
import { esFoodTranslations } from './es';
import { frFoodTranslations } from './fr';
import { zhFoodTranslations } from './zh';

export const foodTranslationsByLanguage: Record<SupportedLanguage, FoodTranslationMap> = {
  English: enFoodTranslations,
  'Bahasa Indonesia': idFoodTranslations,
  Spanish: esFoodTranslations,
  French: frFoodTranslations,
  Mandarin: zhFoodTranslations,
};

export { enFoodTranslations, idFoodTranslations, esFoodTranslations, frFoodTranslations, zhFoodTranslations };
