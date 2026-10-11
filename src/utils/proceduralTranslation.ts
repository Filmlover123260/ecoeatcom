import { SupportedLanguage } from '../context/LanguageContext';

/**
 * Procedural translator for dynamic template strings such as badge milestones,
 * weights, day streaks, and campus metrics.
 */
export function translateProceduralString(text: string, lang: SupportedLanguage): string | null {
  if (lang === 'English') return null;

  // Pattern 1: Finish X campus meals without leftover waste.
  const m1 = text.match(/^Finish (\d+) campus meals without leftover waste\.$/i);
  if (m1) {
    const n = m1[1];
    if (lang === 'Bahasa Indonesia') return `Selesaikan ${n} makanan kantin tanpa sisa makanan.`;
    if (lang === 'Spanish') return `Termina ${n} comidas del campus sin desperdicios.`;
    if (lang === 'French') return `Terminez ${n} repas du campus sans gaspillage.`;
    if (lang === 'Mandarin') return `完成 ${n} 顿无残留的校园餐食。`;
  }

  // Pattern 2: Complete X clean plate dining sessions.
  const m2 = text.match(/^Complete (\d+) clean plate dining sessions\.$/i);
  if (m2) {
    const n = m2[1];
    if (lang === 'Bahasa Indonesia') return `Selesaikan ${n} sesi makan piring bersih.`;
    if (lang === 'Spanish') return `Completa ${n} sesiones de comida con plato limpio.`;
    if (lang === 'French') return `Complétez ${n} sessions de repas avec assiette propre.`;
    if (lang === 'Mandarin') return `完成 ${n} 次光盘用餐。`;
  }

  // Pattern 3: Complete X clean plates on campus.
  const m3 = text.match(/^Complete (\d+) clean plates on campus\.$/i);
  if (m3) {
    const n = m3[1];
    if (lang === 'Bahasa Indonesia') return `Selesaikan ${n} piring bersih di kampus.`;
    if (lang === 'Spanish') return `Completa ${n} platos limpios en el campus.`;
    if (lang === 'French') return `Complétez ${n} assiettes propres sur le campus.`;
    if (lang === 'Mandarin') return `在校园内完成 ${n} 次光盘。`;
  }

  // Pattern 4: Complete X campus meals with 100% clean plates.
  const m4 = text.match(/^Complete (\d+) campus meals with 100% clean plates\.$/i);
  if (m4) {
    const n = m4[1];
    if (lang === 'Bahasa Indonesia') return `Selesaikan ${n} makanan kampus dengan piring 100% bersih.`;
    if (lang === 'Spanish') return `Completa ${n} comidas del campus con platos 100% limpios.`;
    if (lang === 'French') return `Complétez ${n} repas du campus avec des assiettes 100% propres.`;
    if (lang === 'Mandarin') return `以 100% 光盘完成 ${n} 顿校园餐食。`;
  }

  // Pattern 5: Finish X verified zero-waste meals.
  const m5 = text.match(/^Finish (\d+) verified zero-waste meals\.$/i);
  if (m5) {
    const n = m5[1];
    if (lang === 'Bahasa Indonesia') return `Selesaikan ${n} makanan terverifikasi bebas sampah.`;
    if (lang === 'Spanish') return `Termina ${n} comidas verificadas sin desperdicio.`;
    if (lang === 'French') return `Terminez ${n} repas vérifiés zéro déchet.`;
    if (lang === 'Mandarin') return `完成 ${n} 顿经核验的零废弃餐食。`;
  }

  // Pattern 6: Record X clean plates in the campus dining hall.
  const m6 = text.match(/^Record (\d+) clean plates in the campus dining hall\.$/i);
  if (m6) {
    const n = m6[1];
    if (lang === 'Bahasa Indonesia') return `Catat ${n} piring bersih di kantin kampus.`;
    if (lang === 'Spanish') return `Registra ${n} platos limpios en el comedor del campus.`;
    if (lang === 'French') return `Enregistrez ${n} assiettes propres à la cantine du campus.`;
    if (lang === 'Mandarin') return `在校园食堂记录 ${n} 次光盘。`;
  }

  // Pattern 7: Hit X zero-waste meal completions.
  const m7 = text.match(/^Hit (\d+) zero-waste meal completions\.$/i);
  if (m7) {
    const n = m7[1];
    if (lang === 'Bahasa Indonesia') return `Capai ${n} penyelesaian makanan bebas sampah.`;
    if (lang === 'Spanish') return `Alcanza ${n} comidas sin desperdicio completadas.`;
    if (lang === 'French') return `Atteignez ${n} repas zéro déchet complétés.`;
    if (lang === 'Mandarin') return `达成 ${n} 次零废弃餐食完成记录。`;
  }

  // Pattern 8: Finish X nutritious meals with zero leftover scraps.
  const m8 = text.match(/^Finish (\d+) nutritious meals with zero leftover scraps\.$/i);
  if (m8) {
    const n = m8[1];
    if (lang === 'Bahasa Indonesia') return `Habiskan ${n} makanan bergizi tanpa sisa makanan.`;
    if (lang === 'Spanish') return `Termina ${n} comidas nutritivas sin dejar sobras.`;
    if (lang === 'French') return `Terminez ${n} repas nutritifs sans aucun reste.`;
    if (lang === 'Mandarin') return `吃完 ${n} 顿营养丰富且毫无残留的餐食。`;
  }

  // Pattern 9: Reach X clean plate meal milestones.
  const m9 = text.match(/^Reach (\d+) clean plate meal milestones\.$/i);
  if (m9) {
    const n = m9[1];
    if (lang === 'Bahasa Indonesia') return `Capai tonggak sejarah ${n} makanan piring bersih.`;
    if (lang === 'Spanish') return `Alcanza el hito de ${n} comidas con plato limpio.`;
    if (lang === 'French') return `Atteignez le jalon de ${n} repas assiette propre.`;
    if (lang === 'Mandarin') return `达到 ${n} 次光盘就餐里程碑。`;
  }

  // Pattern 10: Log X clean plate campus meals.
  const m10 = text.match(/^Log (\d+) clean plate campus meals\.$/i);
  if (m10) {
    const n = m10[1];
    if (lang === 'Bahasa Indonesia') return `Catat ${n} makanan kampus dengan piring bersih.`;
    if (lang === 'Spanish') return `Registra ${n} comidas del campus con plato limpio.`;
    if (lang === 'French') return `Enregistrez ${n} repas du campus avec assiette propre.`;
    if (lang === 'Mandarin') return `打卡记录 ${n} 顿校园光盘餐食。`;
  }

  // Pattern 11: Achieve X zero-waste dining records.
  const m11 = text.match(/^Achieve (\d+) zero-waste dining records\.$/i);
  if (m11) {
    const n = m11[1];
    if (lang === 'Bahasa Indonesia') return `Raih ${n} rekor makan bebas sampah.`;
    if (lang === 'Spanish') return `Consigue ${n} registros de comidas sin desperdicio.`;
    if (lang === 'French') return `Atteignez ${n} enregistrements de repas zéro déchet.`;
    if (lang === 'Mandarin') return `实现 ${n} 次零废弃用餐记录。`;
  }

  // Pattern 12: Finish X campus meals without leaving a single scrap.
  const m12 = text.match(/^Finish (\d+) campus meals without leaving a single scrap\.$/i);
  if (m12) {
    const n = m12[1];
    if (lang === 'Bahasa Indonesia') return `Selesaikan ${n} makanan kampus tanpa meninggalkan satu pun sisa.`;
    if (lang === 'Spanish') return `Termina ${n} comidas del campus sin dejar una sola sobra.`;
    if (lang === 'French') return `Terminez ${n} repas du campus sans laisser la moindre miette.`;
    if (lang === 'Mandarin') return `完成 ${n} 顿不留丝毫残渣的校园餐食。`;
  }

  // Pattern 13: Divert X kg of organic campus food waste.
  const m13 = text.match(/^Divert ([\d.]+) kg of organic campus food waste\.$/i);
  if (m13) {
    const kg = m13[1];
    if (lang === 'Bahasa Indonesia') return `Alihkan ${kg} kg sisa makanan organik kampus.`;
    if (lang === 'Spanish') return `Desvía ${kg} kg de residuos orgánicos de alimentos del campus.`;
    if (lang === 'French') return `Détournez ${kg} kg de déchets alimentaires organiques du campus.`;
    if (lang === 'Mandarin') return `减少 ${kg} 公斤校园有机食物垃圾。`;
  }

  // Pattern 14: Divert X kg of food from campus landfill bins.
  const m14 = text.match(/^Divert ([\d.]+) kg of food from campus landfill bins\.$/i);
  if (m14) {
    const kg = m14[1];
    if (lang === 'Bahasa Indonesia') return `Alihkan ${kg} kg makanan dari tempat sampah TPA kampus.`;
    if (lang === 'Spanish') return `Desvía ${kg} kg de alimentos de los vertederos del campus.`;
    if (lang === 'French') return `Détournez ${kg} kg de nourriture des décharges du campus.`;
    if (lang === 'Mandarin') return `减少 ${kg} 公斤送往垃圾填埋场的食物。`;
  }

  // Pattern 15: Divert X kg of food scraps.
  const m15 = text.match(/^Divert ([\d.]+) kg of food scraps\.$/i);
  if (m15) {
    const kg = m15[1];
    if (lang === 'Bahasa Indonesia') return `Alihkan ${kg} kg sisa makanan.`;
    if (lang === 'Spanish') return `Desvía ${kg} kg de restos de comida.`;
    if (lang === 'French') return `Détournez ${kg} kg de restes de nourriture.`;
    if (lang === 'Mandarin') return `减少 ${kg} 公斤餐余垃圾。`;
  }

  // Pattern 16: Prevent X kg of edible food waste.
  const m16 = text.match(/^Prevent ([\d.]+) kg of edible food waste\.$/i);
  if (m16) {
    const kg = m16[1];
    if (lang === 'Bahasa Indonesia') return `Cegah ${kg} kg sampah makanan yang dapat dimakan.`;
    if (lang === 'Spanish') return `Evita ${kg} kg de desperdicio de comida comestible.`;
    if (lang === 'French') return `Évitez ${kg} kg de gaspillage alimentaire comestible.`;
    if (lang === 'Mandarin') return `避免 ${kg} 公斤可食用食物浪费。`;
  }

  // Pattern 17: Maintain a X-day clean plate streak.
  const m17 = text.match(/^Maintain a (\d+)-day clean plate streak\.$/i);
  if (m17) {
    const d = m17[1];
    if (lang === 'Bahasa Indonesia') return `Pertahankan rekor piring bersih ${d} hari berturut-turut.`;
    if (lang === 'Spanish') return `Mantén una racha de plato limpio de ${d} días.`;
    if (lang === 'French') return `Maintenez une série d'assiettes propres de ${d} jours.`;
    if (lang === 'Mandarin') return `保持 ${d} 天连续光盘纪录。`;
  }

  // Pattern 18: Level Titles & Levels
  const mLvl = text.match(/^Level (\d+)$/i);
  if (mLvl) {
    const l = mLvl[1];
    if (lang === 'Bahasa Indonesia') return `Tingkat ${l}`;
    if (lang === 'Spanish') return `Nivel ${l}`;
    if (lang === 'French') return `Niveau ${l}`;
    if (lang === 'Mandarin') return `等级 ${l}`;
  }

  const mEcoLvl = text.match(/^Eco Guardian Lvl (\d+)$/i);
  if (mEcoLvl) {
    const l = mEcoLvl[1];
    if (lang === 'Bahasa Indonesia') return `Penjaga Lingkungan Tk. ${l}`;
    if (lang === 'Spanish') return `Guardián Ecológico Niv. ${l}`;
    if (lang === 'French') return `Gardien Éco Niv. ${l}`;
    if (lang === 'Mandarin') return `环保守护者 ${l} 级`;
  }

  // Pattern 19: Grade levels
  const mGrade = text.match(/^Grade (\d+)$/i);
  if (mGrade) {
    const g = mGrade[1];
    if (lang === 'Bahasa Indonesia') return `Kelas ${g}`;
    if (lang === 'Spanish') return `Grado ${g}`;
    if (lang === 'French') return `Classe de ${g}e`;
    if (lang === 'Mandarin') return `${g} 年级`;
  }

  // Pattern 20: Simple numbers with days or meals
  const mDays = text.match(/^(\d+)\s+days?$/i);
  if (mDays) {
    const d = mDays[1];
    if (lang === 'Bahasa Indonesia') return `${d} Hari`;
    if (lang === 'Spanish') return `${d} Días`;
    if (lang === 'French') return `${d} Jours`;
    if (lang === 'Mandarin') return `${d} 天`;
  }

  return null;
}
