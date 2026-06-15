import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import {
  ArrowLeft,
  User,
  Star,
  Coins,
  Hammer,
  Zap,
  Heart,
  Trophy,
  Package,
  Scroll,
  Sparkles,
  Layers,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PlayerDetail {
  id: string;
  name: string;
  avatar: string;
  level: number;
  gold: number;
  workshopLevel: number;
  critRate: number;
  collectionScore: number;
  competitionPoints: number;
  guildName: string | null;
  materials: { type: string; count: number }[];
  tattoos: { name: string; patternName: string; powerBonus: number; affixes: string[] }[];
}

const mockPlayerDetails: Record<string, PlayerDetail> = {
  'player-001': {
    id: 'player-001',
    name: '墨影法师',
    avatar: '🎨',
    level: 12,
    gold: 15680,
    workshopLevel: 3,
    critRate: 0.18,
    collectionScore: 2840,
    competitionPoints: 1560,
    guildName: '墨染苍穹',
    materials: [
      { type: '颜料', count: 105 },
      { type: '纹针', count: 105 },
      { type: '图案', count: 83 },
    ],
    tattoos: [
      { name: '烈焰凤凰', patternName: '凤凰涅槃卷轴', powerBonus: 128, affixes: ['狂暴+15', '雷霆+10'] },
      { name: '翡翠守护', patternName: '守护符文', powerBonus: 76, affixes: ['守护者+20'] },
      { name: '暗夜刺客', patternName: '暗影吞噬者', powerBonus: 105, affixes: ['迅捷+18', '吸血+12'] },
    ],
  },
  'player-011': {
    id: 'player-011',
    name: '神笔马良',
    avatar: '🧙‍♂️',
    level: 28,
    gold: 89500,
    workshopLevel: 7,
    critRate: 0.32,
    collectionScore: 9850,
    competitionPoints: 8600,
    guildName: '龙纹圣殿',
    materials: [
      { type: '颜料', count: 320 },
      { type: '纹针', count: 280 },
      { type: '图案', count: 210 },
    ],
    tattoos: [
      { name: '神龙降临', patternName: '九龙至尊图', powerBonus: 256, affixes: ['龙威+25', '狂暴+20'] },
      { name: '星辰之眼', patternName: '银河星图', powerBonus: 198, affixes: ['洞察+18', '精准+15'] },
      { name: '幽冥死神', patternName: '死亡契约', powerBonus: 220, affixes: ['吸血+22', '恐惧+18'] },
      { name: '凤凰涅槃', patternName: '凤凰涅槃卷轴', powerBonus: 210, affixes: ['重生+20', '烈焰+18'] },
    ],
  },
  'player-012': {
    id: 'player-012',
    name: '纹身之神',
    avatar: '👑',
    level: 30,
    gold: 120000,
    workshopLevel: 8,
    critRate: 0.35,
    collectionScore: 9420,
    competitionPoints: 9200,
    guildName: '极光之笔',
    materials: [
      { type: '颜料', count: 350 },
      { type: '纹针', count: 310 },
      { type: '图案', count: 260 },
    ],
    tattoos: [
      { name: '创世神纹', patternName: '神之契约', powerBonus: 280, affixes: ['全能+30'] },
      { name: '时空裂隙', patternName: '虚空之门', powerBonus: 240, affixes: ['时空+25', '传送+15'] },
      { name: '永恒之眼', patternName: '命运之轮', powerBonus: 215, affixes: ['命运+22', '预知+18'] },
    ],
  },
  'player-013': {
    id: 'player-013',
    name: '暗夜玫瑰',
    avatar: '🌹',
    level: 24,
    gold: 65000,
    workshopLevel: 6,
    critRate: 0.28,
    collectionScore: 8120,
    competitionPoints: 6800,
    guildName: '暗夜蔷薇',
    materials: [
      { type: '颜料', count: 240 },
      { type: '纹针', count: 210 },
      { type: '图案', count: 180 },
    ],
    tattoos: [
      { name: '血色玫瑰', patternName: '荆棘花园', powerBonus: 185, affixes: ['吸血+20', '毒刺+15'] },
      { name: '暗夜女王', patternName: '暗影王冠', powerBonus: 195, affixes: ['威压+22', '魅惑+18'] },
    ],
  },
  'player-014': {
    id: 'player-014',
    name: '雷霆画师',
    avatar: '⚡',
    level: 22,
    gold: 52000,
    workshopLevel: 5,
    critRate: 0.30,
    collectionScore: 7680,
    competitionPoints: 7200,
    guildName: '雷霆公会',
    materials: [
      { type: '颜料', count: 200 },
      { type: '纹针', count: 180 },
      { type: '图案', count: 150 },
    ],
    tattoos: [
      { name: '雷神之怒', patternName: '雷霆之怒图', powerBonus: 178, affixes: ['雷击+25', '麻痹+15'] },
      { name: '闪电链', patternName: '电弧图腾', powerBonus: 145, affixes: ['连锁+20', '速度+18'] },
    ],
  },
  'guild-001': {
    id: 'guild-001',
    name: '墨染苍穹',
    avatar: '🎨',
    level: 5,
    gold: 28000,
    workshopLevel: 28,
    critRate: 0.18,
    collectionScore: 38200,
    competitionPoints: 12500,
    guildName: null,
    materials: [
      { type: '颜料', count: 1200 },
      { type: '纹针', count: 980 },
      { type: '图案', count: 750 },
    ],
    tattoos: [
      { name: '公会守护纹', patternName: '集体守护', powerBonus: 450, affixes: ['守护+35', '团结+30'] },
      { name: '苍穹印记', patternName: '天空之城', powerBonus: 380, affixes: ['飞行+25', '光明+28'] },
    ],
  },
};

const fallbackPlayer: PlayerDetail = {
  id: 'unknown',
  name: '未知玩家',
  avatar: '❓',
  level: 1,
  gold: 0,
  workshopLevel: 1,
  critRate: 0.05,
  collectionScore: 0,
  competitionPoints: 0,
  guildName: null,
  materials: [
    { type: '颜料', count: 0 },
    { type: '纹针', count: 0 },
    { type: '图案', count: 0 },
  ],
  tattoos: [],
};

export default function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setCurrentPage = useGameStore((s) => s.setCurrentPage);
  const leaderboard = useGameStore((s) => s.leaderboard);

  const player = useMemo(() => {
    if (!id) return fallbackPlayer;
    if (mockPlayerDetails[id]) return mockPlayerDetails[id];

    const allEntries = [
      ...leaderboard.collection,
      ...leaderboard.competition,
      ...leaderboard.guild,
    ];
    const entry = allEntries.find((e) => e.playerId === id);

    if (entry) {
      return {
        ...fallbackPlayer,
        id: entry.playerId,
        name: entry.playerName,
        avatar: entry.avatar,
        collectionScore: entry.score,
        level: Math.floor(entry.score / 500) + 1,
      };
    }

    return fallbackPlayer;
  }, [id, leaderboard]);

  const handleBack = () => {
    setCurrentPage('leaderboard');
    navigate('/leaderboard');
  };

  const statItems = [
    { label: '等级', value: `Lv.${player.level}`, icon: Star, color: 'text-purple-400' },
    { label: '金币', value: player.gold.toLocaleString(), icon: Coins, color: 'text-amber-400' },
    { label: '工坊等级', value: `Lv.${player.workshopLevel}`, icon: Hammer, color: 'text-emerald-400' },
    { label: '暴击率', value: `${(player.critRate * 100).toFixed(0)}%`, icon: Zap, color: 'text-yellow-400' },
    { label: '收藏度', value: player.collectionScore.toLocaleString(), icon: Heart, color: 'text-rose-400' },
    { label: '大赛积分', value: player.competitionPoints.toLocaleString(), icon: Trophy, color: 'text-cyan-400' },
  ];

  const totalMaterials = player.materials.reduce((sum, m) => sum + m.count, 0);

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-magic-purple-900/60 border border-magic-gold-500/30 text-magic-gold-200 hover:border-magic-gold-500/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回排行榜
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="magic-card rune-border p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-amber-900/20" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-amber-400 to-purple-500 rounded-full blur-lg opacity-50 animate-pulse" />
            <div className="relative w-28 h-28 rounded-full bg-magic-purple-900/80 flex items-center justify-center text-6xl border-4 border-magic-gold-500/50 shadow-2xl">
              {player.avatar}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="font-display font-bold text-3xl text-magic-gold-100">
                {player.name}
              </h1>
              {player.guildName && (
                <span className="px-3 py-1 rounded-full text-sm font-display bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border border-cyan-400/40 text-cyan-300">
                  🏰 {player.guildName}
                </span>
              )}
            </div>
            <p className="text-magic-gold-100/60 mb-4">ID: {player.id}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {statItems.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-magic-purple-900/40 rounded-lg p-3 border border-magic-gold-500/20"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-xs text-magic-gold-100/60">{stat.label}</span>
                    </div>
                    <p className={`font-display font-bold text-lg ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="magic-card rune-border p-6"
        >
          <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-5 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            工坊布局预览
          </h2>

          <div className="mb-6">
            <h3 className="font-display font-semibold text-magic-gold-200 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              材料统计
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {player.materials.map((m) => (
                <div
                  key={m.type}
                  className="bg-magic-purple-900/40 rounded-lg p-4 text-center border border-magic-gold-500/20"
                >
                  <p className="text-2xl mb-1">
                    {m.type === '颜料' ? '🎨' : m.type === '纹针' ? '🪡' : '📜'}
                  </p>
                  <p className="text-xs text-magic-gold-100/60 mb-1">{m.type}</p>
                  <p className="font-display font-bold text-lg text-magic-gold-200">
                    {m.count}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-magic-purple-800/40 border border-magic-gold-500/20">
              <span className="text-sm text-magic-gold-100/70">材料总数</span>
              <span className="font-display font-bold text-xl text-amber-400">
                {totalMaterials.toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-magic-gold-200 mb-3 flex items-center gap-2">
              <Scroll className="w-4 h-4" />
              纹身统计
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-magic-purple-800/40 border border-magic-gold-500/20">
                <span className="text-sm text-magic-gold-100/70">作品总数</span>
                <span className="font-display font-bold text-xl text-purple-400">
                  {player.tattoos.length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-magic-purple-800/40 border border-magic-gold-500/20">
                <span className="text-sm text-magic-gold-100/70">平均魔力加成</span>
                <span className="font-display font-bold text-xl text-cyan-400">
                  +{player.tattoos.length > 0
                    ? Math.round(player.tattoos.reduce((s, t) => s + t.powerBonus, 0) / player.tattoos.length)
                    : 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-magic-purple-800/40 border border-magic-gold-500/20">
                <span className="text-sm text-magic-gold-100/70">总魔力值</span>
                <span className="font-display font-bold text-xl text-emerald-400">
                  +{player.tattoos.reduce((s, t) => s + t.powerBonus, 0)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="magic-card rune-border p-6"
        >
          <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-5 flex items-center gap-2">
            <Star className="w-5 h-5" />
            纹身作品展示墙
          </h2>

          {player.tattoos.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {player.tattoos.map((tattoo, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="relative p-4 rounded-lg bg-magic-purple-900/50 border border-magic-gold-500/30 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-amber-500/10 opacity-60" />
                  <div className="relative">
                    <div className="w-full aspect-square rounded-lg bg-magic-purple-800/60 flex flex-col items-center justify-center mb-3 border border-magic-gold-500/20">
                      <Scroll className="w-10 h-10 text-magic-gold-400 mb-2" />
                      <p className="font-display text-xs text-magic-gold-300/70 px-2 text-center line-clamp-2">
                        {tattoo.patternName}
                      </p>
                    </div>
                    <h3 className="font-display font-bold text-magic-gold-100 text-sm mb-2 line-clamp-1">
                      {tattoo.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {tattoo.affixes.map((affix, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-magic-purple-700/60 text-magic-gold-200 border border-magic-gold-500/20"
                        >
                          {affix}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-magic-gold-300/80 text-xs">
                      <Sparkles className="w-3 h-3" />
                      <span>+{tattoo.powerBonus} 魔力</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-magic-gold-400/40" />
              <p className="text-magic-gold-100/60">该玩家暂无纹身作品展示</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
