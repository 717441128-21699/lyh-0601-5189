import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import type { Competition } from '@/types';
import {
  Trophy,
  Clock,
  Users,
  Star,
  Gift,
  Scroll,
  ChevronRight,
  Play,
  Medal,
  Crown,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';

type TabType = 'active' | 'upcoming' | 'finished';

const tabConfig: { key: TabType; label: string; icon: typeof Play }[] = [
  { key: 'active', label: '正在进行', icon: Play },
  { key: 'upcoming', label: '即将开始', icon: Clock },
  { key: 'finished', label: '已结束', icon: Medal },
];

const statusConfig = {
  active: { label: '进行中', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
  upcoming: { label: '即将开始', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  finished: { label: '已结束', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', dot: 'bg-gray-400' },
};

function formatTime(timestamp: number) {
  const diff = timestamp - Date.now();
  const absDiff = Math.abs(diff);
  if (absDiff < 3600000) return `${Math.floor(absDiff / 60000)}分钟${diff > 0 ? '后' : '前'}`;
  if (absDiff < 86400000) return `${Math.floor(absDiff / 3600000)}小时${diff > 0 ? '后' : '前'}`;
  return `${Math.floor(absDiff / 86400000)}天${diff > 0 ? '后' : '前'}`;
}

function formatDateTime(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function CompetitionCard({ competition, onRegister, onStart }: {
  competition: Competition;
  onRegister: () => void;
  onStart: () => void;
}) {
  const navigate = useNavigate();
  const status = statusConfig[competition.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="magic-card rune-border p-5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-magic-gold-500/10 to-transparent rounded-bl-full" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              competition.status === 'active'
                ? 'bg-emerald-500/20 text-emerald-400'
                : competition.status === 'upcoming'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-magic-gold-100">{competition.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-display border ${status.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${competition.status === 'active' ? 'animate-pulse' : ''}`} />
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-magic-gold-400" />
            <span className="text-magic-gold-100/70">
              {competition.status === 'finished' ? '结束时间' : competition.status === 'active' ? '结束于' : '开始于'}
            </span>
            <span className="text-magic-gold-200 font-semibold ml-auto">
              {formatDateTime(competition.status === 'upcoming' ? competition.startTime : competition.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-magic-gold-400" />
            <span className="text-magic-gold-100/70">剩余时间</span>
            <span className="text-magic-gold-200 font-semibold ml-auto">
              {competition.status === 'finished' ? '已结束' : formatTime(competition.status === 'upcoming' ? competition.startTime : competition.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-magic-gold-400" />
            <span className="text-magic-gold-100/70">参赛人数</span>
            <span className="text-magic-gold-200 font-semibold ml-auto">{competition.participants} 人</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-magic-gold-400" />
            <span className="text-magic-gold-100/70">奖励积分</span>
            <span className="text-cyan-300 font-bold ml-auto">+{competition.reward.points}</span>
          </div>
        </div>

        <div className="bg-magic-purple-900/50 rounded-lg p-3 mb-4 border border-magic-gold-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-magic-gold-400" />
            <span className="text-sm font-display text-magic-gold-200">奖励预览</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <Star className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-200 font-semibold">{competition.reward.points} 大赛积分</span>
            </div>
            {competition.reward.patternId && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <Scroll className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-200 font-semibold">稀有图纸</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {competition.status === 'upcoming' && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onRegister}
              className="magic-btn-gold flex-1 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              立即报名
            </motion.button>
          )}
          {competition.status === 'active' && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="magic-btn-gold flex-1 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              开始比赛
            </motion.button>
          )}
          {competition.status === 'finished' && (
            <div className="flex-1 text-center py-2.5 text-magic-gold-100/50 font-display">
              赛事已结束
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/competition')}
            className="magic-btn flex items-center gap-1 px-4"
          >
            详情
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Competition() {
  const navigate = useNavigate();
  const competitions = useGameStore((s) => s.competitions);
  const player = useGameStore((s) => s.player);
  const leaderboard = useGameStore((s) => s.leaderboard.competition);
  const registerCompetition = useGameStore((s) => s.registerCompetition);
  const startCompetition = useGameStore((s) => s.startCompetition);
  const setCurrentPage = useGameStore((s) => s.setCurrentPage);

  const [activeTab, setActiveTab] = useState<TabType>('active');

  const filteredCompetitions = useMemo(
    () => competitions.filter((c) => c.status === activeTab),
    [competitions, activeTab]
  );

  const myRank = useMemo(() => {
    return leaderboard.find((e) => e.playerId === player.id);
  }, [leaderboard, player.id]);

  const handleRegister = (competitionId: string) => {
    registerCompetition(competitionId);
  };

  const handleStart = (competitionId: string) => {
    startCompetition(competitionId);
    setCurrentPage('competition-live');
    navigate('/competition/live');
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-magic-gold-200 flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            纹身大赛大厅
          </h1>
          <p className="text-magic-gold-100/60 mt-1">参加比赛赢取稀有图纸和大赛积分</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="magic-card rune-border p-4">
            <div className="flex gap-2">
              {tabConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                const count = competitions.filter((c) => c.status === tab.key).length;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-display font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-magic-purple-600 to-magic-purple-500 text-magic-gold-100 border border-magic-gold-500/40 shadow-lg shadow-magic-purple-500/30'
                        : 'bg-magic-purple-900/40 text-magic-gold-100/70 border border-magic-gold-500/10 hover:border-magic-gold-500/30 hover:text-magic-gold-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      isActive ? 'bg-magic-gold-400/20 text-magic-gold-100' : 'bg-magic-purple-800/60 text-magic-gold-100/60'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {filteredCompetitions.map((competition) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                onRegister={() => handleRegister(competition.id)}
                onStart={() => handleStart(competition.id)}
              />
            ))}
            {filteredCompetitions.length === 0 && (
              <div className="magic-card rune-border p-12 text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-magic-gold-400/30" />
                <p className="text-magic-gold-100/60 font-display">暂无{tabConfig.find((t) => t.key === activeTab)?.label}的赛事</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="magic-card rune-border p-5"
          >
            <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              我的大赛排名
            </h2>
            {myRank ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-magic-gold-400 to-magic-gold-600 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-magic-gold-500/40">
                      {myRank.avatar}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-display font-bold px-3 py-0.5 rounded-full text-sm shadow-lg">
                      #{myRank.rank}
                    </div>
                  </div>
                  <p className="mt-5 font-display font-bold text-lg text-magic-gold-100">{myRank.playerName}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {myRank.previousRank > myRank.rank && (
                      <span className="text-emerald-400 text-xs flex items-center gap-0.5">
                        <ChevronRight className="w-3 h-3 rotate-[-90deg]" />
                        上升 {myRank.previousRank - myRank.rank} 名
                      </span>
                    )}
                    {myRank.previousRank < myRank.rank && (
                      <span className="text-rose-400 text-xs flex items-center gap-0.5">
                        <ChevronRight className="w-3 h-3 rotate-90" />
                        下降 {myRank.rank - myRank.previousRank} 名
                      </span>
                    )}
                    {myRank.previousRank === myRank.rank && (
                      <span className="text-magic-gold-100/50 text-xs">排名不变</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-magic-purple-900/50 rounded-lg p-3 text-center border border-magic-gold-500/20">
                    <p className="text-xs text-magic-gold-100/60 mb-1">大赛积分</p>
                    <p className="font-display font-bold text-xl text-cyan-300">{player.competitionPoints.toLocaleString()}</p>
                  </div>
                  <div className="bg-magic-purple-900/50 rounded-lg p-3 text-center border border-magic-gold-500/20">
                    <p className="text-xs text-magic-gold-100/60 mb-1">排行榜积分</p>
                    <p className="font-display font-bold text-xl text-amber-300">{myRank.score.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-magic-gold-100/50">
                <p>暂无排名数据</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="magic-card rune-border p-5"
          >
            <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-4 flex items-center gap-2">
              <Medal className="w-5 h-5" />
              大赛排行榜
            </h2>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((entry, idx) => (
                <motion.div
                  key={entry.playerId}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                    entry.playerId === player.id
                      ? 'bg-magic-gold-500/10 border border-magic-gold-500/30'
                      : 'bg-magic-purple-900/30 hover:bg-magic-purple-900/50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-sm ${
                    entry.rank === 1
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-magic-purple-950'
                      : entry.rank === 2
                      ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-magic-purple-950'
                      : entry.rank === 3
                      ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white'
                      : 'bg-magic-purple-800/60 text-magic-gold-200'
                  }`}>
                    {entry.rank}
                  </div>
                  <div className="text-xl">{entry.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-display text-sm truncate ${
                      entry.playerId === player.id ? 'text-magic-gold-100 font-bold' : 'text-magic-gold-100/80'
                    }`}>
                      {entry.playerName}
                    </p>
                  </div>
                  <p className="font-display font-bold text-magic-gold-200 text-sm">{entry.score.toLocaleString()}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
