import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import {
  Coins,
  Star,
  Hammer,
  Zap,
  Heart,
  Trophy,
  Calendar,
  Palette,
  Users,
  TrendingUp,
  Scroll,
  Store,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const quickEntries = [
  { key: 'workshop', label: '纹身工坊', icon: Hammer, color: 'from-purple-600 to-purple-500', path: '/workshop' },
  { key: 'competition', label: '赛事中心', icon: Trophy, color: 'from-amber-600 to-amber-500', path: '/competition' },
  { key: 'market', label: '交易市场', icon: Store, color: 'from-emerald-600 to-emerald-500', path: '/market' },
  { key: 'guild', label: '我的公会', icon: Users, color: 'from-blue-600 to-blue-500', path: '/guild' },
  { key: 'reports', label: '行业报告', icon: TrendingUp, color: 'from-rose-600 to-rose-500', path: '/reports' },
  { key: 'leaderboard', label: '排行榜', icon: Star, color: 'from-fuchsia-600 to-fuchsia-500', path: '/leaderboard' },
];

const statIcons = [
  { key: 'gold', label: '金币', icon: Coins, color: 'text-amber-400' },
  { key: 'level', label: '等级', icon: Star, color: 'text-purple-400' },
  { key: 'workshopLevel', label: '工坊等级', icon: Hammer, color: 'text-emerald-400' },
  { key: 'critRate', label: '暴击率', icon: Zap, color: 'text-yellow-400', format: (v: number) => `${(v * 100).toFixed(0)}%` },
  { key: 'collectionScore', label: '收藏度', icon: Heart, color: 'text-rose-400' },
  { key: 'competitionPoints', label: '大赛积分', icon: Trophy, color: 'text-cyan-400' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const player = useGameStore((s) => s.player);
  const competitions = useGameStore((s) => s.competitions);
  const tattoos = useGameStore((s) => s.tattoos);
  const tradeAnnouncements = useGameStore((s) => s.tradeAnnouncements);
  const tattooFever = useGameStore((s) => s.ui.tattooFever);
  const checkTattooFeverExpiry = useGameStore((s) => s.checkTattooFeverExpiry);
  const setCurrentPage = useGameStore((s) => s.setCurrentPage);

  const [announcementIndex, setAnnouncementIndex] = useState(0);

  useEffect(() => {
    checkTattooFeverExpiry();
  }, [checkTattooFeverExpiry]);

  useEffect(() => {
    if (tradeAnnouncements.length <= 1) return;
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % tradeAnnouncements.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [tradeAnnouncements.length]);

  const activeCompetitions = competitions.filter(
    (c) => c.status === 'active' || c.status === 'upcoming'
  );
  const recentTattoos = tattoos.slice(0, 4);

  const formatTime = (timestamp: number) => {
    const diff = timestamp - Date.now();
    if (diff < 0) {
      const past = Math.abs(diff);
      if (past < 3600000) return `${Math.floor(past / 60000)}分钟前`;
      return `${Math.floor(past / 3600000)}小时前`;
    }
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟后`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时后`;
    return `${Math.floor(diff / 86400000)}天后`;
  };

  const handleQuickEntry = (path: string, page: string) => {
    setCurrentPage(page as any);
    navigate(path);
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {tattooFever.active && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="magic-card rune-border p-4 flex items-center justify-between bg-gradient-to-r from-amber-900/50 to-purple-900/50"
        >
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-amber-400 animate-pulse" />
            <div>
              <p className="font-display font-bold text-amber-300 text-lg">🔥 纹身热潮进行中！</p>
              <p className="text-sm text-amber-200/80">全服暴击率提升 {(tattooFever.bonusCritRate * 100).toFixed(0)}%</p>
            </div>
          </div>
          <div className="text-amber-300 font-display">
            剩余 {Math.ceil((tattooFever.endTime - Date.now()) / 60000)} 分钟
          </div>
        </motion.div>
      )}

      <div className="magic-card rune-border p-6">
        <h2 className="font-display font-bold text-2xl text-magic-gold-300 mb-5 flex items-center gap-2">
          <Star className="w-6 h-6" />
          玩家状态
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statIcons.map((stat) => {
            const Icon = stat.icon;
            const value = (player as any)[stat.key];
            const displayValue = stat.format ? stat.format(value) : value.toLocaleString();
            return (
              <motion.div
                key={stat.key}
                whileHover={{ scale: 1.05 }}
                className="bg-magic-purple-900/40 rounded-lg p-4 text-center border border-magic-gold-500/20"
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                <p className="text-xs text-magic-gold-100/60 mb-1">{stat.label}</p>
                <p className={`font-display font-bold text-lg ${stat.color}`}>{displayValue}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="magic-card rune-border p-6 lg:col-span-2">
          <h2 className="font-display font-bold text-2xl text-magic-gold-300 mb-5 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            今日赛事
          </h2>
          <div className="space-y-3">
            {activeCompetitions.map((comp, idx) => (
              <motion.div
                key={comp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-magic-purple-900/40 border border-magic-gold-500/20 hover:border-magic-gold-500/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    comp.status === 'active' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-magic-gold-100">{comp.name}</p>
                    <p className="text-sm text-magic-gold-100/60">
                      {comp.participants} 人参与 · 奖励 {comp.reward.points} 积分
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-display ${
                    comp.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {comp.status === 'active' ? '进行中' : '即将开始'}
                  </span>
                  <p className="text-sm text-magic-gold-200/70">
                    {comp.status === 'active' ? `结束于 ${formatTime(comp.endTime)}` : `开始于 ${formatTime(comp.startTime)}`}
                  </p>
                  <ChevronRight className="w-5 h-5 text-magic-gold-400" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="magic-card rune-border p-6">
          <h2 className="font-display font-bold text-2xl text-magic-gold-300 mb-5 flex items-center gap-2">
            <Palette className="w-6 h-6" />
            最近作品
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {recentTattoos.map((tattoo) => (
              <motion.div
                key={tattoo.id}
                whileHover={{ scale: 1.05 }}
                className="relative aspect-square rounded-lg overflow-hidden bg-magic-purple-900/60 border border-magic-gold-500/30 group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-magic-purple-600/40 via-magic-purple-900/40 to-magic-gold-500/20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                  <Scroll className="w-10 h-10 text-magic-gold-400 mb-2" />
                  <p className="font-display text-sm font-bold text-magic-gold-100 text-center truncate w-full">
                    {tattoo.name}
                  </p>
                  <p className="text-xs text-magic-gold-300/80">+{tattoo.powerBonus} 魔力</p>
                </div>
                <div className="absolute inset-0 bg-magic-gold-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="magic-card rune-border p-6">
        <h2 className="font-display font-bold text-2xl text-magic-gold-300 mb-5">快捷入口</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickEntries.map((entry, idx) => {
            const Icon = entry.icon;
            return (
              <motion.button
                key={entry.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickEntry(entry.path, entry.key)}
                className="group relative p-5 rounded-xl bg-magic-purple-900/40 border border-magic-gold-500/20 hover:border-magic-gold-500/50 transition-all overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${entry.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                <Icon className="w-10 h-10 mx-auto mb-3 text-magic-gold-300 group-hover:text-magic-gold-100 transition-colors" />
                <p className="font-display font-semibold text-magic-gold-100 text-center">{entry.label}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="magic-card rune-border overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-magic-purple-800/60 to-magic-purple-900/60 border-b border-magic-gold-500/20 flex items-center gap-2">
          <Scroll className="w-5 h-5 text-magic-gold-400" />
          <span className="font-display font-bold text-magic-gold-200">全服成交公告</span>
        </div>
        <div className="relative h-14 overflow-hidden">
          <AnimatePresence mode="wait">
            {tradeAnnouncements[announcementIndex] && (
              <motion.div
                key={announcementIndex}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center px-6"
              >
                <p className="text-magic-gold-100/90">
                  <span className="text-cyan-300 font-semibold">{tradeAnnouncements[announcementIndex].buyerName}</span>
                  <span className="mx-2 text-magic-gold-400">从</span>
                  <span className="text-rose-300 font-semibold">{tradeAnnouncements[announcementIndex].sellerName}</span>
                  <span className="mx-2 text-magic-gold-400">处以</span>
                  <span className="text-amber-300 font-bold">{tradeAnnouncements[announcementIndex].price.toLocaleString()}</span>
                  <span className="mx-1 text-amber-300">金币</span>
                  <span className="mx-2 text-magic-gold-400">购买了</span>
                  <span className="text-emerald-300 font-semibold">{tradeAnnouncements[announcementIndex].materialName}</span>
                  <span className="ml-1 text-magic-gold-100/60">x{tradeAnnouncements[announcementIndex].quantity}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
