import { SupportedLanguage } from '../../context/LanguageContext';

export type FoodTranslationMap = Record<string, string>;
export type AllFoodTranslations = Record<SupportedLanguage, FoodTranslationMap>;
