import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Player,
  Material,
  Tattoo,
  Competition,
  LiveCompetitionState,
  MarketListing,
  TradeAnnouncement,
  Guild,
  IndustryReport,
  LeaderboardEntry,
  NotificationMessage,
  TattooFeverState,
  PageType,
  initialPlayer,
  initialMaterials,
  initialTattoos,
  initialCompetitions,
  initialLiveCompetition,
  initialMarketListings,
  initialTradeAnnouncements,
  initialGuild,
  initialIndustryReport,
  initialLeaderboard,
  initialNotifications,
  initialTattooFever,
} from '../data/mockData';
import { suggestMarketPrice } from '../utils/gameEngine';

interface GameState {
  player: Player;
  materials: Material[];
  tattoos: Tattoo[];
  competitions: Competition[];
  liveCompetition: LiveCompetitionState | null;
  marketListings: MarketListing[];
  tradeAnnouncements: TradeAnnouncement[];
  guild: Guild;
  reports: IndustryReport;
  leaderboard: {
    collection: LeaderboardEntry[];
    competition: LeaderboardEntry[];
    guild: LeaderboardEntry[];
  };
  ui: {
    currentPage: PageType;
    notifications: NotificationMessage[];
    tattooFever: TattooFeverState;
  };
  setCurrentPage: (page: PageType) => void;
  addNotification: (notification: Omit<NotificationMessage, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  updatePlayerCritRate: (rate: number) => void;
  levelUpPlayer: () => void;
  addMaterial: (materialId: string, quantity: number) => void;
  removeMaterial: (materialId: string, quantity: number) => boolean;
  addTattoo: (tattoo: Tattoo) => void;
  registerCompetition: (competitionId: string) => boolean;
  startCompetition: (competitionId: string) => void;
  setLiveCompetitionStatus: (status: 'preparing' | 'drawing' | 'finished') => void;
  useSkill: (skillId: string) => boolean;
  updateCompetitionScore: (playerDelta: number, opponentDelta: number) => void;
  updateCompetitionCheers: (playerDelta: number, opponentDelta: number) => void;
  tickCompetitionTime: () => void;
  finishCompetition: () => void;
  buyListing: (listingId: string) => boolean;
  createListing: (materialId: string, price: number, quantity: number) => boolean;
  cancelListing: (listingId: string) => boolean;
  addTradeAnnouncement: (announcement: Omit<TradeAnnouncement, 'id' | 'timestamp'>) => void;
  triggerTattooFever: (bonusCritRate: number, durationMs: number) => void;
  checkTattooFeverExpiry: () => void;
  contributeGuildMaterials: (amount: number) => boolean;
  contributeGuildGold: (amount: number) => boolean;
  upgradeGuild: () => boolean;
  updateReports: (reports: Partial<IndustryReport>) => void;
  refreshLeaderboard: () => void;
  resetAll: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      player: initialPlayer,
      materials: initialMaterials,
      tattoos: initialTattoos,
      competitions: initialCompetitions,
      liveCompetition: initialLiveCompetition,
      marketListings: initialMarketListings,
      tradeAnnouncements: initialTradeAnnouncements,
      guild: initialGuild,
      reports: initialIndustryReport,
      leaderboard: initialLeaderboard,
      ui: {
        currentPage: 'dashboard',
        notifications: initialNotifications,
        tattooFever: initialTattooFever,
      },

      setCurrentPage: (page: PageType) => {
        set((state) => ({
          ui: { ...state.ui, currentPage: page },
        }));
      },

      addNotification: (notification: Omit<NotificationMessage, 'id' | 'timestamp'>) => {
        const newNotification: NotificationMessage = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        set((state) => ({
          ui: {
            ...state.ui,
            notifications: [newNotification, ...state.ui.notifications].slice(0, 50),
          },
        }));
      },

      removeNotification: (id: string) => {
        set((state) => ({
          ui: {
            ...state.ui,
            notifications: state.ui.notifications.filter((n) => n.id !== id),
          },
        }));
      },

      clearNotifications: () => {
        set((state) => ({
          ui: { ...state.ui, notifications: [] },
        }));
      },

      addGold: (amount: number) => {
        set((state) => ({
          player: { ...state.player, gold: state.player.gold + amount },
        }));
      },

      spendGold: (amount: number): boolean => {
        const { player } = get();
        if (player.gold < amount) {
          get().addNotification({
            type: 'error',
            title: '金币不足',
            message: '您没有足够的金币完成此操作',
          });
          return false;
        }
        set((state) => ({
          player: { ...state.player, gold: state.player.gold - amount },
        }));
        return true;
      },

      updatePlayerCritRate: (rate: number) => {
        set((state) => ({
          player: { ...state.player, critRate: Math.max(0, Math.min(1, rate)) },
        }));
      },

      levelUpPlayer: () => {
        set((state) => ({
          player: {
            ...state.player,
            level: state.player.level + 1,
            critRate: Math.min(0.5, state.player.critRate + 0.01),
          },
        }));
        get().addNotification({
          type: 'success',
          title: '等级提升',
          message: `恭喜！您已升至 ${get().player.level} 级`,
        });
      },

      addMaterial: (materialId: string, quantity: number) => {
        set((state) => {
          const existing = state.materials.find((m) => m.id === materialId);
          if (existing) {
            return {
              materials: state.materials.map((m) =>
                m.id === materialId ? { ...m, quantity: m.quantity + quantity } : m
              ),
            };
          }
          return state;
        });
      },

      removeMaterial: (materialId: string, quantity: number): boolean => {
        const { materials } = get();
        const material = materials.find((m) => m.id === materialId);
        if (!material || material.quantity < quantity) {
          get().addNotification({
            type: 'error',
            title: '材料不足',
            message: '您没有足够的材料',
          });
          return false;
        }
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === materialId ? { ...m, quantity: m.quantity - quantity } : m
          ),
        }));
        return true;
      },

      addTattoo: (tattoo: Tattoo) => {
        set((state) => ({
          tattoos: [tattoo, ...state.tattoos],
          player: {
            ...state.player,
            collectionScore: state.player.collectionScore + Math.floor(tattoo.powerBonus / 2),
          },
        }));
        get().addNotification({
          type: 'success',
          title: '纹身完成',
          message: `您的新纹身"${tattoo.name}"已入库！`,
        });
      },

      registerCompetition: (competitionId: string): boolean => {
        const { competitions } = get();
        const competition = competitions.find((c) => c.id === competitionId);
        if (!competition || competition.status !== 'upcoming') {
          return false;
        }
        set((state) => ({
          competitions: state.competitions.map((c) =>
            c.id === competitionId ? { ...c, participants: c.participants + 1 } : c
          ),
        }));
        get().addNotification({
          type: 'success',
          title: '报名成功',
          message: `您已成功报名参加"${competition.name}"`,
        });
        return true;
      },

      startCompetition: (competitionId: string) => {
        const { competitions } = get();
        const competition = competitions.find((c) => c.id === competitionId);
        if (!competition) return;

        set((state) => ({
          liveCompetition: {
            competitionId,
            playerScore: 0,
            opponentScore: 0,
            playerCheers: 0,
            opponentCheers: 0,
            timeRemaining: 60,
            skills: [
              { id: 'skill-001', name: '灵感迸发', description: '瞬间提升20分', cooldown: 30, currentCooldown: 0, effect: 20 },
              { id: 'skill-002', name: '精准落笔', description: '下一次评分翻倍', cooldown: 45, currentCooldown: 0, effect: 2 },
              { id: 'skill-003', name: '观众互动', description: '获得大量喝彩值', cooldown: 20, currentCooldown: 0, effect: 50 },
            ],
            status: 'preparing',
            prepareCountdown: 5,
          },
          ui: { ...state.ui, currentPage: 'competition-live' },
        }));
      },

      setLiveCompetitionStatus: (status: 'preparing' | 'drawing' | 'finished') => {
        set((state) => {
          if (!state.liveCompetition) return state;
          return {
            liveCompetition: { ...state.liveCompetition, status },
          };
        });
      },

      useSkill: (skillId: string): boolean => {
        const { liveCompetition } = get();
        if (!liveCompetition || liveCompetition.status !== 'drawing') return false;

        const skill = liveCompetition.skills.find((s) => s.id === skillId);
        if (!skill || skill.currentCooldown > 0) return false;

        set((state) => {
          if (!state.liveCompetition) return state;

          let newState = { ...state };
          const updatedSkills = state.liveCompetition.skills.map((s) =>
            s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s
          );

          if (skillId === 'skill-001') {
            newState.liveCompetition = {
              ...state.liveCompetition,
              skills: updatedSkills,
              playerScore: state.liveCompetition.playerScore + skill.effect,
            };
          } else if (skillId === 'skill-003') {
            newState.liveCompetition = {
              ...state.liveCompetition,
              skills: updatedSkills,
              playerCheers: state.liveCompetition.playerCheers + skill.effect,
            };
          } else {
            newState.liveCompetition = {
              ...state.liveCompetition,
              skills: updatedSkills,
            };
          }

          return newState;
        });

        return true;
      },

      updateCompetitionScore: (playerDelta: number, opponentDelta: number) => {
        set((state) => {
          if (!state.liveCompetition) return state;
          return {
            liveCompetition: {
              ...state.liveCompetition,
              playerScore: state.liveCompetition.playerScore + playerDelta,
              opponentScore: state.liveCompetition.opponentScore + opponentDelta,
            },
          };
        });
      },

      updateCompetitionCheers: (playerDelta: number, opponentDelta: number) => {
        set((state) => {
          if (!state.liveCompetition) return state;
          return {
            liveCompetition: {
              ...state.liveCompetition,
              playerCheers: state.liveCompetition.playerCheers + playerDelta,
              opponentCheers: state.liveCompetition.opponentCheers + opponentDelta,
            },
          };
        });
      },

      tickCompetitionTime: () => {
        set((state) => {
          if (!state.liveCompetition) return state;

          if (state.liveCompetition.status === 'preparing') {
            const newCountdown = (state.liveCompetition.prepareCountdown || 5) - 1;
            if (newCountdown <= 0) {
              return {
                liveCompetition: {
                  ...state.liveCompetition,
                  status: 'drawing',
                  prepareCountdown: 0,
                },
              };
            }
            return {
              liveCompetition: {
                ...state.liveCompetition,
                prepareCountdown: newCountdown,
              },
            };
          }

          if (state.liveCompetition.status !== 'drawing') return state;

          const newTime = state.liveCompetition.timeRemaining - 1;
          const updatedSkills = state.liveCompetition.skills.map((s) => ({
            ...s,
            currentCooldown: Math.max(0, s.currentCooldown - 1),
          }));

          if (newTime <= 0) {
            return {
              liveCompetition: {
                ...state.liveCompetition,
                timeRemaining: 0,
                skills: updatedSkills,
                status: 'finished',
              },
            };
          }

          return {
            liveCompetition: {
              ...state.liveCompetition,
              timeRemaining: newTime,
              skills: updatedSkills,
            },
          };
        });
      },

      finishCompetition: () => {
        const { liveCompetition, player, competitions } = get();
        if (!liveCompetition) return;

        const isWin = liveCompetition.playerScore > liveCompetition.opponentScore;
        const competition = competitions.find((c) => c.id === liveCompetition.competitionId);
        const rewardPoints = isWin ? (competition?.reward.points || 100) : Math.floor((competition?.reward.points || 100) * 0.3);

        set((state) => ({
          liveCompetition: null,
          player: {
            ...state.player,
            competitionPoints: state.player.competitionPoints + rewardPoints,
            gold: state.player.gold + (isWin ? 500 : 100),
          },
          ui: { ...state.ui, currentPage: 'competition' },
        }));

        get().addNotification({
          type: isWin ? 'success' : 'info',
          title: isWin ? '比赛胜利！' : '比赛结束',
          message: isWin
            ? `恭喜获胜！获得 ${rewardPoints} 大赛积分和 500 金币`
            : `获得参与奖励：${rewardPoints} 大赛积分和 100 金币`,
        });
      },

      buyListing: (listingId: string): boolean => {
        const { marketListings, player } = get();
        const listing = marketListings.find((l) => l.id === listingId);
        if (!listing) return false;

        if (player.gold < listing.price) {
          get().addNotification({
            type: 'error',
            title: '金币不足',
            message: '您没有足够的金币购买此商品',
          });
          return false;
        }

        set((state) => ({
          player: { ...state.player, gold: state.player.gold - listing.price },
          marketListings: state.marketListings.filter((l) => l.id !== listingId),
        }));

        get().addMaterial(listing.material.id, listing.material.quantity);
        get().addTradeAnnouncement({
          buyerName: player.name,
          sellerName: listing.sellerName,
          materialName: listing.material.name,
          price: listing.price,
          quantity: listing.material.quantity,
        });

        if (Math.random() < 0.15) {
          get().triggerTattooFever(0.1, 300000);
        }

        return true;
      },

      createListing: (materialId: string, price: number, quantity: number): boolean => {
        const { materials, player } = get();
        const material = materials.find((m) => m.id === materialId);
        if (!material || material.quantity < quantity) {
          get().addNotification({
            type: 'error',
            title: '材料不足',
            message: '您没有足够的材料上架',
          });
          return false;
        }

        const stablePrice = suggestMarketPrice(material);

        const newListing: MarketListing = {
          id: `listing-${Date.now()}`,
          sellerId: player.id,
          sellerName: player.name,
          material: { ...material, quantity },
          price,
          suggestedMin: stablePrice.min,
          suggestedMax: stablePrice.max,
          createdAt: Date.now(),
        };

        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === materialId ? { ...m, quantity: m.quantity - quantity } : m
          ),
          marketListings: [newListing, ...state.marketListings],
        }));

        get().addNotification({
          type: 'success',
          title: '上架成功',
          message: `您的 ${material.name} x${quantity} 已上架`,
        });

        return true;
      },

      cancelListing: (listingId: string): boolean => {
        const { marketListings, player } = get();
        const listing = marketListings.find((l) => l.id === listingId);
        if (!listing || listing.sellerId !== player.id) return false;

        set((state) => ({
          marketListings: state.marketListings.filter((l) => l.id !== listingId),
        }));

        get().addMaterial(listing.material.id, listing.material.quantity);
        return true;
      },

      addTradeAnnouncement: (announcement: Omit<TradeAnnouncement, 'id' | 'timestamp'>) => {
        const newAnnouncement: TradeAnnouncement = {
          ...announcement,
          id: `ann-${Date.now()}`,
          timestamp: Date.now(),
        };
        set((state) => ({
          tradeAnnouncements: [newAnnouncement, ...state.tradeAnnouncements].slice(0, 20),
        }));
      },

      triggerTattooFever: (bonusCritRate: number, durationMs: number) => {
        set((state) => ({
          ui: {
            ...state.ui,
            tattooFever: {
              active: true,
              bonusCritRate,
              endTime: Date.now() + durationMs,
            },
          },
        }));
        get().addNotification({
          type: 'warning',
          title: '🔥 纹身热潮！',
          message: `全服暴击率提升 ${(bonusCritRate * 100).toFixed(0)}%，持续 5 分钟！`,
        });
      },

      checkTattooFeverExpiry: () => {
        const { ui } = get();
        if (ui.tattooFever.active && Date.now() > ui.tattooFever.endTime) {
          set((state) => ({
            ui: {
              ...state.ui,
              tattooFever: { active: false, bonusCritRate: 0, endTime: 0 },
            },
          }));
        }
      },

      contributeGuildMaterials: (amount: number): boolean => {
        if (amount <= 0) return false;
        set((state) => ({
          guild: {
            ...state.guild,
            upgradeProgress: {
              ...state.guild.upgradeProgress,
              materials: state.guild.upgradeProgress.materials + amount,
            },
            members: state.guild.members.map((m) =>
              m.playerId === state.player.id
                ? { ...m, materialContribution: m.materialContribution + amount }
                : m
            ),
          },
        }));
        get().addNotification({
          type: 'success',
          title: '贡献成功',
          message: `您已向公会贡献 ${amount} 材料`,
        });
        return true;
      },

      contributeGuildGold: (amount: number): boolean => {
        if (!get().spendGold(amount)) return false;
        set((state) => ({
          guild: {
            ...state.guild,
            upgradeProgress: {
              ...state.guild.upgradeProgress,
              gold: state.guild.upgradeProgress.gold + amount,
            },
            members: state.guild.members.map((m) =>
              m.playerId === state.player.id
                ? { ...m, goldContribution: m.goldContribution + amount }
                : m
            ),
          },
        }));
        get().addNotification({
          type: 'success',
          title: '贡献成功',
          message: `您已向公会贡献 ${amount} 金币`,
        });
        return true;
      },

      upgradeGuild: () => {
        const { guild } = get();
        const { materials, gold } = guild.upgradeProgress;
        const { materials: reqMaterials, gold: reqGold } = guild.upgradeRequirements;

        if (materials < reqMaterials || gold < reqGold) {
          get().addNotification({
            type: 'error',
            title: '升级失败',
            message: '贡献不足，无法升级公会',
          });
          return false;
        }

        set((state) => ({
          guild: {
            ...state.guild,
            level: state.guild.level + 1,
            upgradeProgress: { materials: 0, gold: 0 },
            upgradeRequirements: {
              materials: Math.floor(state.guild.upgradeRequirements.materials * 1.5),
              gold: Math.floor(state.guild.upgradeRequirements.gold * 1.5),
            },
          },
        }));
        get().addNotification({
          type: 'success',
          title: '公会升级',
          message: `恭喜！公会已升至 ${get().guild.level} 级`,
        });
        return true;
      },

      updateReports: (reports: Partial<IndustryReport>) => {
        set((state) => ({
          reports: { ...state.reports, ...reports },
        }));
      },

      refreshLeaderboard: () => {
        set((state) => ({
          leaderboard: {
            ...state.leaderboard,
            collection: [...state.leaderboard.collection].sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 })),
            competition: [...state.leaderboard.competition].sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 })),
            guild: [...state.leaderboard.guild].sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 })),
          },
        }));
      },

      resetAll: () => {
        set({
          player: initialPlayer,
          materials: initialMaterials,
          tattoos: initialTattoos,
          competitions: initialCompetitions,
          liveCompetition: initialLiveCompetition,
          marketListings: initialMarketListings,
          tradeAnnouncements: initialTradeAnnouncements,
          guild: initialGuild,
          reports: initialIndustryReport,
          leaderboard: initialLeaderboard,
          ui: {
            currentPage: 'dashboard',
            notifications: initialNotifications,
            tattooFever: initialTattooFever,
          },
        });
      },
    }),
    {
      name: 'game-store',
      partialize: (state) => ({
        player: state.player,
        materials: state.materials,
        tattoos: state.tattoos,
        guild: state.guild,
      }),
    }
  )
);
