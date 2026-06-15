export type MaterialType = 'pigment' | 'needle' | 'pattern';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type AffixType = 'frenzy' | 'guardian' | 'dazzle' | 'swift' | 'vampire' | 'thunder';

export interface Player {
  id: string;
  name: string;
  gold: number;
  level: number;
  workshopLevel: number;
  critRate: number;
  collectionScore: number;
  competitionPoints: number;
  guildId: string | null;
}

export interface Material {
  id: string;
  type: MaterialType;
  name: string;
  rarity: Rarity;
  quality: number;
  quantity: number;
  icon: string;
  description: string;
}

export interface TattooAffix {
  type: AffixType;
  name: string;
  value: number;
  description: string;
}

export interface Tattoo {
  id: string;
  name: string;
  patternName: string;
  pigmentId: string;
  needleId: string;
  patternId: string;
  powerBonus: number;
  specialEffectChance: number;
  affixes: TattooAffix[];
  createdAt: number;
  imageSeed: number;
  isFavorite?: boolean;
  tags?: string[];
}

export interface Competition {
  id: string;
  name: string;
  status: 'upcoming' | 'active' | 'finished';
  startTime: number;
  endTime: number;
  participants: number;
  reward: { points: number; patternId: string | null };
}

export interface SkillState {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  currentCooldown: number;
  effect: number;
}

export interface ScoreTickRecord {
  second: number;
  playerScore: number;
  opponentScore: number;
  playerCheers: number;
  opponentCheers: number;
  playerDelta: number;
  opponentDelta: number;
  isPrecisionStrike?: boolean;
}

export interface SkillUsageRecord {
  skillId: string;
  skillName: string;
  secondUsed: number;
  effect: string;
}

export interface CompetitionReward {
  points: number;
  gold: number;
  isWin: boolean;
}

export interface CompetitionSettlement {
  competitionId: string;
  competitionName: string;
  scoreHistory: ScoreTickRecord[];
  skillUsages: SkillUsageRecord[];
  finalPlayerScore: number;
  finalOpponentScore: number;
  finalPlayerCheers: number;
  finalOpponentCheers: number;
  reward: CompetitionReward;
  startTime: number;
  endTime: number;
  precisionStrikeActive?: boolean;
}

export interface LiveCompetitionState {
  competitionId: string;
  playerScore: number;
  opponentScore: number;
  playerCheers: number;
  opponentCheers: number;
  timeRemaining: number;
  skills: SkillState[];
  status: 'preparing' | 'drawing' | 'finished';
  prepareCountdown?: number;
  scoreHistory?: ScoreTickRecord[];
  skillUsages?: SkillUsageRecord[];
  precisionStrikeActive?: boolean;
  settlement?: CompetitionSettlement;
  rewardGiven?: boolean;
}

export interface MarketListing {
  id: string;
  sellerId: string;
  sellerName: string;
  material: Material;
  price: number;
  suggestedMin: number;
  suggestedMax: number;
  createdAt: number;
}

export interface GuildMember {
  playerId: string;
  playerName: string;
  materialContribution: number;
  goldContribution: number;
}

export interface Guild {
  id: string;
  name: string;
  level: number;
  combinedWorkshopLevel: number;
  labLevel: number;
  members: GuildMember[];
  upgradeProgress: { materials: number; gold: number };
  upgradeRequirements: { materials: number; gold: number };
}

export type ReportPeriodType = 'week' | 'month' | '7days' | '30days' | 'custom';

export interface ReportDateRange {
  startDate: string;
  endDate: string;
}

export interface IndustryReport {
  period: string;
  periodType: ReportPeriodType;
  dateRange: ReportDateRange;
  pigmentUsage: Record<string, number>;
  competitionScores: number[];
  priceTrends: { material: string; prices: number[]; labels: string[] }[];
  topTattoos: Tattoo[];
  radarData: {
    power: number;
    rarity: number;
    technique: number;
    creativity: number;
    popularity: number;
  };
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  rank: number;
  previousRank: number;
  score: number;
  avatar: string;
}

export type PageType =
  | 'dashboard'
  | 'workshop'
  | 'workshop-create'
  | 'competition'
  | 'competition-live'
  | 'market'
  | 'guild'
  | 'reports'
  | 'leaderboard'
  | 'player-profile';

export interface TradeRecord {
  id: string;
  materialName: string;
  materialId: string;
  price: number;
  quantity: number;
  timestamp: number;
  type: 'buy' | 'sell';
}

export interface MaterialPriceAlert {
  id: string;
  materialId: string;
  materialName: string;
  type: 'price_spike' | 'price_drop' | 'low_stock' | 'high_demand';
  message: string;
  currentPrice: number;
  changePercent: number;
  timestamp: number;
  read: boolean;
}

export interface FollowedMaterial {
  materialId: string;
  materialName: string;
  followedAt: number;
  targetPrice?: number;
  alertOnPriceChange: boolean;
  alertOnLowStock: boolean;
}

export interface TradeAnnouncement {
  id: string;
  buyerName: string;
  sellerName: string;
  materialName: string;
  price: number;
  quantity: number;
  timestamp: number;
}

export interface MaterialMarketData {
  materialId: string;
  materialName: string;
  recentTrades: TradeRecord[];
  currentLowestPrice: number;
  currentHighestPrice: number;
  suggestedMin: number;
  suggestedMax: number;
  suggestedPrice: number;
  avgTradePrice7d: number;
  priceChange7d: number;
  activeListingsCount: number;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationMessage {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
}

export interface TattooFeverState {
  active: boolean;
  bonusCritRate: number;
  endTime: number;
}
