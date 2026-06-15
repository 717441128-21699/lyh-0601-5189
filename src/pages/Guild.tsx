import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import type { GuildMember, Rarity } from '@/types';
import RarityBadge from '@/components/RarityBadge';
import {
  Users,
  Crown,
  Hammer,
  FlaskConical,
  Coins,
  Package,
  ArrowUp,
  Sparkles,
  Trophy,
  Medal,
  Award,
  Zap,
  Shield,
  Flame,
  Droplets,
  TrendingUp,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';

const rarityLabel: Record<Rarity, string> = {
  common: '普通',
  uncommon: '优秀',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

interface Recipe {
  id: string;
  name: string;
  materials: { name: string; icon: string; rarity: Rarity; count: number }[];
  result: { name: string; icon: string; rarity: Rarity };
  successRate: number;
  unlocked: boolean;
  labLevelReq: number;
}

const labRecipes: Recipe[] = [
  {
    id: 'recipe-001',
    name: '颜料精炼',
    materials: [
      { name: '普通墨汁', icon: '⚫', rarity: 'common', count: 3 },
      { name: '海洋深蓝', icon: '💙', rarity: 'uncommon', count: 2 },
    ],
    result: { name: '翡翠魔绿', icon: '💚', rarity: 'rare' },
    successRate: 0.75,
    unlocked: true,
    labLevelReq: 1,
  },
  {
    id: 'recipe-002',
    name: '纹针锻造',
    materials: [
      { name: '铁针', icon: '📌', rarity: 'common', count: 5 },
      { name: '精钢针', icon: '📍', rarity: 'uncommon', count: 3 },
    ],
    result: { name: '青铜绣针', icon: '🔩', rarity: 'rare' },
    successRate: 0.7,
    unlocked: true,
    labLevelReq: 2,
  },
  {
    id: 'recipe-003',
    name: '烈焰萃取',
    materials: [
      { name: '翡翠魔绿', icon: '💚', rarity: 'rare', count: 2 },
      { name: '青铜绣针', icon: '🔩', rarity: 'rare', count: 1 },
    ],
    result: { name: '龙血朱砂', icon: '🩸', rarity: 'epic' },
    successRate: 0.5,
    unlocked: true,
    labLevelReq: 3,
  },
  {
    id: 'recipe-004',
    name: '神纹融合',
    materials: [
      { name: '龙血朱砂', icon: '🩸', rarity: 'epic', count: 2 },
      { name: '寒铁刺针', icon: '❄️', rarity: 'epic', count: 1 },
    ],
    result: { name: '暗夜紫晶颜料', icon: '🎨', rarity: 'legendary' },
    successRate: 0.3,
    unlocked: false,
    labLevelReq: 5,
  },
];

const workshopBonuses = [
  { level: 1, critBonus: 0, successBonus: 0, label: '基础工坊' },
  { level: 5, critBonus: 0.02, successBonus: 0.03, label: '初级加成' },
  { level: 10, critBonus: 0.05, successBonus: 0.06, label: '中级加成' },
  { level: 20, critBonus: 0.1, successBonus: 0.12, label: '高级加成' },
  { level: 30, critBonus: 0.15, successBonus: 0.18, label: '大师加成' },
];

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-4 h-4 text-amber-400" />;
  if (rank === 2) return <Medal className="w-4 h-4 text-gray-300" />;
  if (rank === 3) return <Award className="w-4 h-4 text-amber-600" />;
  return <span className="w-4 h-4 text-center text-xs text-magic-gold-100/60">{rank}</span>;
}

export default function Guild() {
  const guild = useGameStore((s) => s.guild);
  const player = useGameStore((s) => s.player);
  const contributeGuildMaterials = useGameStore((s) => s.contributeGuildMaterials);
  const contributeGuildGold = useGameStore((s) => s.contributeGuildGold);
  const upgradeGuild = useGameStore((s) => s.upgradeGuild);
  const setCurrentPage = useGameStore((s) => s.setCurrentPage);

  const [materialAmount, setMaterialAmount] = useState(10);
  const [goldAmount, setGoldAmount] = useState(100);

  useEffect(() => {
    setCurrentPage('guild');
  }, [setCurrentPage]);

  const rankedMembers = useMemo(() => {
    return [...guild.members]
      .map((m) => ({
        ...m,
        totalScore: m.materialContribution * 10 + m.goldContribution,
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((m, idx) => ({ ...m, rank: idx + 1 }));
  }, [guild.members]);

  const currentWorkshopBonus = useMemo(() => {
    let bonus = workshopBonuses[0];
    for (const b of workshopBonuses) {
      if (guild.combinedWorkshopLevel >= b.level) {
        bonus = b;
      }
    }
    return bonus;
  }, [guild.combinedWorkshopLevel]);

  const nextWorkshopBonus = useMemo(() => {
    return workshopBonuses.find((b) => b.level > guild.combinedWorkshopLevel);
  }, [guild.combinedWorkshopLevel]);

  const canUpgrade =
    guild.upgradeProgress.materials >= guild.upgradeRequirements.materials &&
    guild.upgradeProgress.gold >= guild.upgradeRequirements.gold;

  const materialProgress = Math.min(
    100,
    (guild.upgradeProgress.materials / guild.upgradeRequirements.materials) * 100
  );
  const goldProgress = Math.min(
    100,
    (guild.upgradeProgress.gold / guild.upgradeRequirements.gold) * 100
  );

  const handleMaterialContribute = () => {
    if (materialAmount > 0) {
      contributeGuildMaterials(materialAmount);
    }
  };

  const handleGoldContribute = () => {
    if (goldAmount > 0 && goldAmount <= player.gold) {
      contributeGuildGold(goldAmount);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-magic-gold-200 flex items-center gap-3">
            <Users className="w-8 h-8" />
            {guild.name}
          </h1>
          <p className="text-magic-gold-100/60 mt-1">
            公会等级 Lv.{guild.level} · {guild.members.length} 名成员
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => upgradeGuild()}
          disabled={!canUpgrade}
          className="magic-btn-gold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowUp className="w-5 h-5" />
          升级公会
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="magic-card rune-border p-6"
          >
            <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-5 flex items-center gap-2">
              <Hammer className="w-5 h-5" />
              联合工坊
            </h2>

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-600/40 to-emerald-800/40 border border-emerald-500/30 flex items-center justify-center">
                  <Hammer className="w-8 h-8 text-emerald-300" />
                </div>
                <div>
                  <p className="font-display font-bold text-2xl text-emerald-300">
                    Lv.{guild.combinedWorkshopLevel}
                  </p>
                  <p className="text-sm text-magic-gold-100/60">联合工坊等级</p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center gap-2 justify-end">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-magic-gold-100/70">暴击率加成</span>
                  <span className="font-display font-bold text-yellow-300">
                    +{(currentWorkshopBonus.critBonus * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-magic-gold-100/70">成功率加成</span>
                  <span className="font-display font-bold text-cyan-300">
                    +{(currentWorkshopBonus.successBonus * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {nextWorkshopBonus && (
              <div className="p-4 rounded-lg bg-magic-purple-900/40 border border-magic-gold-500/10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-magic-gold-100/70">
                    下一档：Lv.{nextWorkshopBonus.level} {nextWorkshopBonus.label}
                  </p>
                  <p className="text-xs text-magic-gold-100/50">
                    还差 {nextWorkshopBonus.level - guild.combinedWorkshopLevel} 级
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-yellow-300">
                    暴击率 +{(nextWorkshopBonus.critBonus * 100).toFixed(0)}%
                  </span>
                  <span className="text-cyan-300">
                    成功率 +{(nextWorkshopBonus.successBonus * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="magic-card rune-border p-6"
          >
            <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-5 flex items-center gap-2">
              <FlaskConical className="w-5 h-5" />
              颜料实验室
              <span className="ml-auto text-base font-normal text-magic-gold-100/60">
                Lv.{guild.labLevel}
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {labRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className={`p-4 rounded-lg border transition-all ${
                    recipe.unlocked
                      ? 'bg-magic-purple-900/40 border-magic-gold-500/20'
                      : 'bg-magic-purple-950/40 border-magic-gold-500/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-rose-400" />
                      <span className="font-display font-semibold text-magic-gold-100">
                        {recipe.name}
                      </span>
                    </div>
                    {recipe.unlocked ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        成功率 {(recipe.successRate * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-magic-purple-800/60 text-magic-gold-100/50 border border-magic-gold-500/10">
                        需要实验室 Lv.{recipe.labLevelReq}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {recipe.materials.map((mat, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <div className="w-8 h-8 rounded-md bg-magic-purple-800/60 border border-magic-gold-500/10 flex items-center justify-center text-lg">
                          {mat.icon}
                        </div>
                        <span className="text-xs text-magic-gold-200 font-medium">
                          x{mat.count}
                        </span>
                        {idx < recipe.materials.length - 1 && (
                          <span className="text-magic-gold-100/30 mx-1">+</span>
                        )}
                      </div>
                    ))}
                    <span className="text-magic-gold-400 mx-2">→</span>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-magic-purple-800/60 border border-magic-gold-500/20 flex items-center justify-center text-xl">
                        {recipe.result.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-magic-gold-100">
                          {recipe.result.name}
                        </p>
                        <RarityBadge rarity={recipe.result.rarity} size="sm" />
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={!recipe.unlocked}
                    className={`w-full py-2 rounded-lg font-display font-semibold text-sm transition-all ${
                      recipe.unlocked
                        ? 'bg-gradient-to-r from-rose-600/40 to-amber-600/40 border border-rose-500/30 text-rose-200 hover:from-rose-600/60 hover:to-amber-600/60'
                        : 'bg-magic-purple-900/40 border border-magic-gold-500/10 text-magic-gold-100/30 cursor-not-allowed'
                    }`}
                  >
                    {recipe.unlocked ? '开始合成' : '未解锁'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="magic-card rune-border p-6"
          >
            <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-5 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              贡献排行榜
            </h2>

            <div className="space-y-2">
              {rankedMembers.map((member, idx) => {
                const isPlayer = member.playerId === player.id;
                return (
                  <motion.div
                    key={member.playerId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                      isPlayer
                        ? 'bg-magic-gold-500/10 border border-magic-gold-500/30'
                        : 'bg-magic-purple-900/40 border border-magic-gold-500/10'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-magic-purple-800/60 flex items-center justify-center">
                      {getRankIcon(member.rank)}
                    </div>
                    <div className="flex-1">
                      <p className={`font-display font-semibold ${
                        isPlayer ? 'text-magic-gold-200' : 'text-magic-gold-100'
                      }`}>
                        {member.playerName}
                        {isPlayer && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-magic-gold-500/20 text-magic-gold-300">
                            我
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-emerald-300">
                        <Package className="w-3.5 h-3.5" />
                        <span className="font-medium">{member.materialContribution}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-300">
                        <Coins className="w-3.5 h-3.5" />
                        <span className="font-medium">
                          {member.goldContribution.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-magic-gold-300 min-w-[60px] justify-end">
                        <Star className="w-3.5 h-3.5" />
                        <span className="font-display font-bold">
                          {member.totalScore.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="magic-card rune-border p-6"
          >
            <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-5 flex items-center gap-2">
              <Users className="w-5 h-5" />
              成员列表
            </h2>
            <div className="space-y-2">
              {guild.members.map((member, idx) => {
                const isPlayer = member.playerId === player.id;
                return (
                  <div
                    key={member.playerId}
                    className={`flex items-center gap-3 p-2.5 rounded-lg ${
                      isPlayer
                        ? 'bg-magic-gold-500/10 border border-magic-gold-500/20'
                        : 'bg-magic-purple-900/30'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-magic-purple-600/50 to-magic-purple-800/50 border border-magic-gold-500/20 flex items-center justify-center">
                      {idx === 0 ? (
                        <Crown className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Users className="w-4 h-4 text-magic-gold-300/70" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm truncate ${
                          isPlayer ? 'text-magic-gold-200' : 'text-magic-gold-100'
                        }`}
                      >
                        {member.playerName}
                      </p>
                      <p className="text-xs text-magic-gold-100/50">
                        材料 {member.materialContribution} · 金币{' '}
                        {member.goldContribution.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="magic-card rune-border p-6"
          >
            <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              贡献系统
            </h2>

            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-magic-purple-900/40 border border-magic-gold-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span className="font-display font-semibold text-emerald-300">
                    材料贡献
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => setMaterialAmount(Math.max(1, materialAmount - 10))}
                    className="w-8 h-8 rounded-md bg-magic-purple-800/60 border border-magic-gold-500/20 text-magic-gold-200 hover:bg-magic-purple-700/60 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={materialAmount}
                    onChange={(e) =>
                      setMaterialAmount(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="flex-1 h-8 px-3 rounded-md bg-magic-purple-950/60 border border-magic-gold-500/20 text-center font-display font-bold text-magic-gold-100 text-sm focus:outline-none focus:border-magic-gold-400/60"
                  />
                  <button
                    onClick={() => setMaterialAmount(materialAmount + 10)}
                    className="w-8 h-8 rounded-md bg-magic-purple-800/60 border border-magic-gold-500/20 text-magic-gold-200 hover:bg-magic-purple-700/60 transition-colors"
                  >
                    +
                  </button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMaterialContribute}
                  className="w-full py-2 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 font-display font-semibold text-sm hover:bg-emerald-600/50 transition-colors flex items-center justify-center gap-2"
                >
                  <Droplets className="w-4 h-4" />
                  贡献材料
                </motion.button>
              </div>

              <div className="p-4 rounded-lg bg-magic-purple-900/40 border border-magic-gold-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="font-display font-semibold text-amber-300">
                    金币贡献
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => setGoldAmount(Math.max(10, goldAmount - 100))}
                    className="w-8 h-8 rounded-md bg-magic-purple-800/60 border border-magic-gold-500/20 text-magic-gold-200 hover:bg-magic-purple-700/60 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={10}
                    max={player.gold}
                    value={goldAmount}
                    onChange={(e) =>
                      setGoldAmount(
                        Math.max(10, Math.min(player.gold, parseInt(e.target.value) || 10))
                      )
                    }
                    className="flex-1 h-8 px-3 rounded-md bg-magic-purple-950/60 border border-magic-gold-500/20 text-center font-display font-bold text-amber-200 text-sm focus:outline-none focus:border-magic-gold-400/60"
                  />
                  <button
                    onClick={() => setGoldAmount(Math.min(player.gold, goldAmount + 100))}
                    className="w-8 h-8 rounded-md bg-magic-purple-800/60 border border-magic-gold-500/20 text-magic-gold-200 hover:bg-magic-purple-700/60 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="flex justify-between text-xs text-magic-gold-100/50 mb-3">
                  <span>我的金币</span>
                  <span className="text-amber-300 font-medium">
                    {player.gold.toLocaleString()}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoldContribute}
                  disabled={goldAmount > player.gold}
                  className="w-full py-2 rounded-lg bg-amber-600/30 border border-amber-500/40 text-amber-200 font-display font-semibold text-sm hover:bg-amber-600/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Coins className="w-4 h-4" />
                  贡献金币
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="magic-card rune-border p-6"
          >
            <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-5 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              升级进度
              <span className="ml-auto text-base font-normal text-magic-gold-100/60">
                → Lv.{guild.level + 1}
              </span>
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <Package className="w-4 h-4" />
                    <span>材料贡献</span>
                  </div>
                  <span className="text-magic-gold-100/70">
                    {guild.upgradeProgress.materials.toLocaleString()} /{' '}
                    {guild.upgradeRequirements.materials.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-magic-purple-950 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${materialProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Coins className="w-4 h-4" />
                    <span>金币贡献</span>
                  </div>
                  <span className="text-magic-gold-100/70">
                    {guild.upgradeProgress.gold.toLocaleString()} /{' '}
                    {guild.upgradeRequirements.gold.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-magic-purple-950 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goldProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: canUpgrade ? 1.02 : 1 }}
                whileTap={{ scale: canUpgrade ? 0.98 : 1 }}
                onClick={() => upgradeGuild()}
                disabled={!canUpgrade}
                className={`w-full py-3 rounded-lg font-display font-bold text-base flex items-center justify-center gap-2 transition-all ${
                  canUpgrade
                    ? 'magic-btn-gold'
                    : 'bg-magic-purple-900/40 border border-magic-gold-500/20 text-magic-gold-100/40 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-5 h-5" />
                {canUpgrade ? '立即升级公会' : '贡献不足'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
