import type {
  Material,
  Tattoo,
  TattooAffix,
  AffixType,
  Rarity,
  IndustryReport,
  LiveCompetitionState,
  ReportPeriodType,
} from '../types';
import { initialTattoos, initialMaterials } from '../data/mockData';

const rarityMultiplier: Record<Rarity, number> = {
  common: 1,
  uncommon: 1.3,
  rare: 1.7,
  epic: 2.2,
  legendary: 3,
};

const affixTemplates: Record<AffixType, { name: string; description: string }> = {
  frenzy: { name: '狂暴', description: '攻击力+{value}%' },
  guardian: { name: '守护者', description: '防御力+{value}%' },
  dazzle: { name: '炫光', description: '暴击率+{value}%' },
  swift: { name: '迅捷', description: '速度+{value}%' },
  vampire: { name: '吸血', description: '{value}%生命偷取' },
  thunder: { name: '雷霆', description: '{value}%概率触发雷击' },
};

const affixTypes: AffixType[] = ['frenzy', 'guardian', 'dazzle', 'swift', 'vampire', 'thunder'];

const basePrices: Record<string, number> = {
  pigment: 100,
  needle: 120,
  pattern: 200,
};

export interface TattooCalculationResult {
  powerBonus: number;
  specialEffectChance: number;
  successRate: number;
  expectedAffixes: number;
}

export function calculateTattooPower(
  pigment: Material,
  needle: Material,
  pattern: Material,
  workshopLevel: number = 1
): TattooCalculationResult {
  const avgQuality = (pigment.quality + needle.quality + pattern.quality) / 3;
  const avgRarity =
    (rarityMultiplier[pigment.rarity] +
      rarityMultiplier[needle.rarity] +
      rarityMultiplier[pattern.rarity]) /
    3;

  const basePower = avgQuality * avgRarity * 0.8;
  const workshopBonus = 1 + (workshopLevel - 1) * 0.1;
  const powerBonus = Math.round(basePower * workshopBonus);

  const specialEffectChance = Math.min(
    0.1 + (avgQuality - 50) * 0.004 + (avgRarity - 1) * 0.05,
    0.6
  );

  const baseSuccess = 0.5 + (avgQuality - 40) * 0.005;
  const successRate = Math.min(Math.max(baseSuccess * workshopBonus, 0.3), 0.98);

  const expectedAffixes =
    avgRarity > 2 ? 2 : avgRarity > 1.4 ? 1 : Math.random() > 0.5 ? 1 : 0;

  return {
    powerBonus,
    specialEffectChance: Number(specialEffectChance.toFixed(2)),
    successRate: Number(successRate.toFixed(2)),
    expectedAffixes,
  };
}

export function generateRandomAffixes(
  count: number,
  patternRarity: Rarity
): TattooAffix[] {
  const result: TattooAffix[] = [];
  const maxAffixes = Math.min(count, 3);
  const valueMultiplier = rarityMultiplier[patternRarity];

  const shuffled = [...affixTypes].sort(() => Math.random() - 0.5);

  for (let i = 0; i < maxAffixes; i++) {
    const type = shuffled[i];
    const template = affixTemplates[type];
    const baseValue = Math.floor(Math.random() * 10) + 5;
    const value = Math.round(baseValue * valueMultiplier);

    result.push({
      type,
      name: template.name,
      value,
      description: template.description.replace('{value}', String(value)),
    });
  }

  return result;
}

export function calculateCompetitionScore(
  tattoo: Tattoo,
  playerCheers: number,
  skillBonus: number = 0
): number {
  const baseScore = tattoo.powerBonus * 2;
  const affixScore = tattoo.affixes.reduce((sum, affix) => sum + affix.value * 3, 0);
  const specialScore = Math.round(tattoo.specialEffectChance * 100 * 1.5);
  const cheerBonus = Math.floor(playerCheers / 10);

  const total = baseScore + affixScore + specialScore + cheerBonus + skillBonus;
  return Math.round(total);
}

export function suggestMarketPrice(material: Material): {
  min: number;
  suggested: number;
  max: number;
} {
  const basePrice = basePrices[material.type] || 100;
  const rarityFactor = rarityMultiplier[material.rarity];
  const qualityFactor = 0.5 + material.quality / 100;

  const suggested = Math.round(basePrice * rarityFactor * qualityFactor);
  const min = Math.round(suggested * 0.85);
  const max = Math.round(suggested * 1.15);

  return { min, suggested, max };
}

function getDateLabels(days: number, endDate: Date = new Date()): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(endDate);
    d.setDate(d.getDate() - (days - 1 - i));
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
}

function getMonthLabels(weeks: number, endDate: Date = new Date()): string[] {
  return Array.from({ length: weeks }, (_, i) => {
    const d = new Date(endDate);
    d.setDate(d.getDate() - (weeks - 1 - i) * 7);
    return `第${i + 1}周`;
  });
}

function formatDateRange(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function generateReportData(
  periodType: ReportPeriodType,
  customStartDate?: string,
  customEndDate?: string
): IndustryReport {
  const today = new Date();
  let startDate: Date;
  let endDate: Date;
  let pricePointCount: number;
  let competitionCount: number;
  let dataMultiplier: number;
  let periodLabel: string;
  let useMonthlyLabels = false;

  switch (periodType) {
    case 'week':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6);
      endDate = today;
      pricePointCount = 7;
      competitionCount = Math.floor(Math.random() * 3) + 3;
      dataMultiplier = 1;
      const weekNum = Math.ceil((today.getDate() + new Date(today.getFullYear(), today.getMonth(), 1).getDay()) / 7);
      periodLabel = `${today.getFullYear()}年第${weekNum}周`;
      break;

    case 'month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = today;
      pricePointCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      competitionCount = Math.floor(Math.random() * 8) + 12;
      dataMultiplier = 4;
      periodLabel = `${today.getFullYear()}年${today.getMonth() + 1}月`;
      useMonthlyLabels = true;
      break;

    case '7days':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6);
      endDate = today;
      pricePointCount = 7;
      competitionCount = Math.floor(Math.random() * 3) + 3;
      dataMultiplier = 1;
      periodLabel = `最近7天`;
      break;

    case '30days':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 29);
      endDate = today;
      pricePointCount = 30;
      competitionCount = Math.floor(Math.random() * 6) + 8;
      dataMultiplier = 4;
      periodLabel = `最近30天`;
      break;

    case 'custom':
      if (customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
      } else {
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6);
        endDate = today;
      }
      pricePointCount = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      dataMultiplier = Math.ceil(pricePointCount / 7);
      competitionCount = Math.max(1, Math.floor(pricePointCount / 5) + 2);
      periodLabel = `自定义: ${formatDateRange(startDate)} 至 ${formatDateRange(endDate)}`;
      useMonthlyLabels = pricePointCount > 14;
      break;

    default:
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6);
      endDate = today;
      pricePointCount = 7;
      competitionCount = 3;
      dataMultiplier = 1;
      periodLabel = periodType;
  }

  const pigmentMaterials = initialMaterials.filter((m) => m.type === 'pigment');
  const pigmentUsage: Record<string, number> = {};

  pigmentMaterials.forEach((p) => {
    const baseUsage = (Math.floor(Math.random() * 500) + 50) * dataMultiplier;
    const rarityFactor = 1 / rarityMultiplier[p.rarity];
    pigmentUsage[p.name] = Math.floor(baseUsage * rarityFactor);
  });

  const competitionScores: number[] = Array.from({ length: competitionCount }, () =>
    Math.floor(Math.random() * 400) + 400
  );

  const trackableMaterials = initialMaterials.filter(
    (m) => m.rarity === 'epic' || m.rarity === 'rare'
  );

  const labels = useMonthlyLabels
    ? getMonthLabels(Math.min(pricePointCount, Math.ceil(pricePointCount / 7)), endDate)
    : getDateLabels(pricePointCount, endDate);

  const priceTrends = trackableMaterials.slice(0, 3).map((m) => {
    const base = suggestMarketPrice(m).suggested;
    const priceCount = useMonthlyLabels ? labels.length : pricePointCount;
    const prices: number[] = Array.from({ length: priceCount }, (_, i) => {
      const variation = (Math.random() - 0.4) * 0.2;
      const trend = 1 + i * 0.008;
      return Math.round(base * (1 + variation) * trend);
    });
    return { material: m.name, prices, labels };
  });

  const sortedTattoos = [...initialTattoos].sort((a, b) => b.powerBonus - a.powerBonus);

  return {
    period: periodLabel,
    periodType,
    dateRange: {
      startDate: formatDateRange(startDate),
      endDate: formatDateRange(endDate),
    },
    pigmentUsage,
    competitionScores,
    priceTrends,
    topTattoos: sortedTattoos,
    radarData: {
      power: Math.floor(Math.random() * 30) + 60,
      rarity: Math.floor(Math.random() * 30) + 60,
      technique: Math.floor(Math.random() * 30) + 60,
      creativity: Math.floor(Math.random() * 30) + 60,
      popularity: Math.floor(Math.random() * 30) + 60,
    },
  };
}

export function simulateCompetitionTick(
  state: LiveCompetitionState
): LiveCompetitionState {
  if (state.status !== 'drawing') return state;

  const playerDelta = Math.floor(Math.random() * 8) + 2;
  const opponentDelta = Math.floor(Math.random() * 8) + 2;
  const playerCheerDelta = Math.floor(Math.random() * 5);
  const opponentCheerDelta = Math.floor(Math.random() * 5);

  const updatedSkills = state.skills.map((skill) => ({
    ...skill,
    currentCooldown: Math.max(0, skill.currentCooldown - 1),
  }));

  const newTimeRemaining = Math.max(0, state.timeRemaining - 1);

  return {
    ...state,
    playerScore: state.playerScore + playerDelta,
    opponentScore: state.opponentScore + opponentDelta,
    playerCheers: state.playerCheers + playerCheerDelta,
    opponentCheers: state.opponentCheers + opponentCheerDelta,
    timeRemaining: newTimeRemaining,
    skills: updatedSkills,
    status: newTimeRemaining <= 0 ? 'finished' : state.status,
  };
}
