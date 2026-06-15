import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import type { LeaderboardEntry } from '@/types';
import {
  Star,
  Trophy,
  Users,
  Heart,
  ChevronUp,
  ChevronDown,
  Minus,
  Award,
  Crown,
  Medal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type LeaderboardTab = 'collection' | 'competition' | 'guild';

const tabConfig: { key: LeaderboardTab; label: string; icon: typeof Star }[] = [
  { key: 'collection', label: '纹身收藏度', icon: Heart },
  { key: 'competition', label: '大赛积分', icon: Trophy },
  { key: 'guild', label: '公会贡献', icon: Users },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 rounded-xl blur-md opacity-70 animate-pulse" />
        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
          <Crown className="w-6 h-6 text-yellow-900" />
        </div>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-gray-300 via-slate-200 to-gray-400 rounded-xl blur-md opacity-60" />
        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-gray-300 to-slate-400 flex items-center justify-center shadow-lg">
          <Award className="w-6 h-6 text-gray-700" />
        </div>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 rounded-xl blur-md opacity-60" />
        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg">
          <Medal className="w-6 h-6 text-amber-100" />
        </div>
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-xl bg-magic-purple-700/60 flex items-center justify-center border border-magic-gold-500/30">
      <span className="font-display font-bold text-xl text-magic-gold-300">{rank}</span>
    </div>
  );
}

function RankChange({ current, previous }: { current: number; previous: number }) {
  if (current === previous) {
    return (
      <div className="flex items-center gap-1 text-magic-gold-100/50">
        <Minus className="w-4 h-4" />
        <span className="text-xs">不变</span>
      </div>
    );
  }
  if (current < previous) {
    return (
      <div className="flex items-center gap-1 text-emerald-400">
        <ChevronUp className="w-4 h-4" />
        <span className="text-xs">{previous - current}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-rose-400">
      <ChevronDown className="w-4 h-4" />
      <span className="text-xs">{current - previous}</span>
    </div>
  );
}

function LeaderboardRow({
  entry,
  onClick,
  index,
}: {
  entry: LeaderboardEntry;
  onClick: () => void;
  index: number;
}) {
  const isTopThree = entry.rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ x: 4, scale: 1.01 }}
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
        isTopThree
          ? 'bg-gradient-to-r from-magic-purple-900/60 via-magic-purple-800/40 to-magic-purple-900/60 border-2'
          : 'bg-magic-purple-900/40 border border-magic-gold-500/20 hover:border-magic-gold-500/40'
      } ${
        entry.rank === 1
          ? 'border-yellow-500/50'
          : entry.rank === 2
          ? 'border-gray-400/50'
          : entry.rank === 3
          ? 'border-amber-600/50'
          : ''
      }`}
    >
      <RankBadge rank={entry.rank} />

      <div className="w-14 h-14 rounded-full bg-magic-purple-800/60 flex items-center justify-center text-3xl border-2 border-magic-gold-500/30">
        {entry.avatar}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-display font-bold text-lg truncate ${
          entry.rank === 1
            ? 'text-yellow-300'
            : entry.rank === 2
            ? 'text-gray-200'
            : entry.rank === 3
            ? 'text-amber-300'
            : 'text-magic-gold-100'
        }`}>
          {entry.playerName}
        </p>
        <RankChange current={entry.rank} previous={entry.previousRank} />
      </div>

      <div className="text-right">
        <p className="text-xs text-magic-gold-100/60">分数</p>
        <p className={`font-display font-bold text-xl ${
          entry.rank === 1
            ? 'text-yellow-300'
            : entry.rank === 2
            ? 'text-gray-200'
            : entry.rank === 3
            ? 'text-amber-300'
            : 'text-magic-gold-200'
        }`}>
          {entry.score.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const leaderboard = useGameStore((s) => s.leaderboard);
  const setCurrentPage = useGameStore((s) => s.setCurrentPage);
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('collection');

  const currentData = leaderboard[activeTab];

  const handlePlayerClick = (playerId: string) => {
    setCurrentPage('player-profile');
    navigate(`/player/${playerId}`);
  };

  const getTopThree = () => currentData.slice(0, 3);
  const getRest = () => currentData.slice(3);

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl text-magic-gold-200 flex items-center gap-3">
          <Trophy className="w-8 h-8" />
          全服排行榜
        </h1>
        <p className="text-magic-gold-100/60 mt-1">实时更新全服玩家排名</p>
      </div>

      <div className="magic-card rune-border p-2 inline-flex gap-1">
        {tabConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-display font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-magic-purple-600 to-magic-purple-500 text-magic-gold-100 shadow-lg shadow-magic-purple-500/30'
                  : 'text-magic-gold-100/70 hover:text-magic-gold-100 hover:bg-magic-purple-900/40'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {getTopThree().map((entry, idx) => {
          const orderClass =
            idx === 0
              ? 'md:col-start-2 md:row-start-1 scale-105'
              : idx === 1
              ? 'md:col-start-1 md:row-start-1 md:translate-y-4'
              : 'md:col-start-3 md:row-start-1 md:translate-y-4';
          const bgClass =
            idx === 0
              ? 'from-yellow-900/40 via-amber-800/30 to-yellow-900/40 border-yellow-500/50'
              : idx === 1
              ? 'from-gray-800/40 via-slate-700/30 to-gray-800/40 border-gray-400/50'
              : 'from-amber-900/40 via-orange-800/30 to-amber-900/40 border-amber-600/50';
          const trophyIcon =
            idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';

          return (
            <motion.div
              key={entry.playerId}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => handlePlayerClick(entry.playerId)}
              className={`magic-card rune-border p-6 cursor-pointer relative overflow-hidden bg-gradient-to-br ${bgClass} ${orderClass} border-2`}
            >
              <div className="absolute top-2 right-2 text-4xl">{trophyIcon}</div>
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {idx === 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                      <Crown className="w-8 h-8 text-yellow-400 animate-bounce" />
                    </div>
                  )}
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl border-4 ${
                      idx === 0
                        ? 'border-yellow-400 shadow-lg shadow-yellow-500/40'
                        : idx === 1
                        ? 'border-gray-300 shadow-lg shadow-gray-400/30'
                        : 'border-amber-500 shadow-lg shadow-amber-600/30'
                    } bg-magic-purple-900/60`}
                  >
                    {entry.avatar}
                  </div>
                </div>
                <h3
                  className={`font-display font-bold text-xl mb-2 ${
                    idx === 0
                      ? 'text-yellow-300'
                      : idx === 1
                      ? 'text-gray-200'
                      : 'text-amber-300'
                  }`}
                >
                  {entry.playerName}
                </h3>
                <p className="text-sm text-magic-gold-100/60 mb-3">
                  {tabConfig.find((t) => t.key === activeTab)?.label}
                </p>
                <p
                  className={`font-display font-bold text-3xl ${
                    idx === 0
                      ? 'text-yellow-300'
                      : idx === 1
                      ? 'text-gray-200'
                      : 'text-amber-300'
                  }`}
                >
                  {entry.score.toLocaleString()}
                </p>
                <div className="mt-3">
                  <RankChange current={entry.rank} previous={entry.previousRank} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="magic-card rune-border p-6">
        <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-5 flex items-center gap-2">
          <Star className="w-5 h-5" />
          完整排行榜
        </h2>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {getRest().map((entry, idx) => (
              <LeaderboardRow
                key={entry.playerId}
                entry={entry}
                index={idx}
                onClick={() => handlePlayerClick(entry.playerId)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
