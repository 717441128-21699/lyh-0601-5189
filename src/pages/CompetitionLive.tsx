import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import type { SkillState, ScoreTickRecord, SkillUsageRecord, CompetitionSettlement } from '@/types';
import {
  Zap,
  Target,
  Users,
  Trophy,
  Clock,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Gift,
  Coins,
  Star,
  Swords,
  Volume2,
  TrendingUp,
  History,
  X,
  ArrowRight,
  ZapOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const skillIconMap: Record<string, typeof Zap> = {
  'skill-001': Zap,
  'skill-002': Target,
  'skill-003': Users,
};

const skillColorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  'skill-001': {
    bg: 'from-cyan-600 to-cyan-500',
    border: 'border-cyan-400/50',
    text: 'text-cyan-200',
    glow: 'shadow-cyan-500/40',
  },
  'skill-002': {
    bg: 'from-amber-600 to-amber-500',
    border: 'border-amber-400/50',
    text: 'text-amber-200',
    glow: 'shadow-amber-500/40',
  },
  'skill-003': {
    bg: 'from-rose-600 to-rose-500',
    border: 'border-rose-400/50',
    text: 'text-rose-200',
    glow: 'shadow-rose-500/40',
  },
};

function formatTimeRemaining(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function SkillButton({ skill, onUse, disabled }: { skill: SkillState; onUse: () => void; disabled?: boolean }) {
  const Icon = skillIconMap[skill.id] || Zap;
  const colors = skillColorMap[skill.id] || skillColorMap['skill-001'];
  const isOnCooldown = skill.currentCooldown > 0 || disabled;
  const cooldownPercent = isOnCooldown && skill.currentCooldown > 0 ? (skill.currentCooldown / skill.cooldown) * 100 : 0;

  return (
    <motion.button
      whileHover={!isOnCooldown ? { scale: 1.05, y: -2 } : {}}
      whileTap={!isOnCooldown ? { scale: 0.97 } : {}}
      onClick={onUse}
      disabled={isOnCooldown}
      className={`relative group flex-1 p-4 rounded-xl border transition-all overflow-hidden ${
        isOnCooldown
          ? 'bg-magic-purple-900/30 border-magic-gold-500/10 opacity-60 cursor-not-allowed'
          : `bg-gradient-to-br ${colors.bg} ${colors.border} border shadow-lg ${colors.glow} hover:shadow-xl cursor-pointer`
      }`}
    >
      {skill.currentCooldown > 0 && (
        <div
          className="absolute inset-0 bg-magic-purple-950/70"
          style={{
            clipPath: `inset(0 0 ${100 - cooldownPercent}% 0)`,
          }}
        />
      )}
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Icon className={`w-6 h-6 ${isOnCooldown ? 'text-magic-gold-100/50' : colors.text}`} />
          <span className={`font-display font-bold ${isOnCooldown ? 'text-magic-gold-100/50' : 'text-white'}`}>
            {skill.name}
          </span>
        </div>
        <p className={`text-xs text-center ${isOnCooldown ? 'text-magic-gold-100/40' : 'text-white/80'}`}>
          {skill.description}
        </p>
        {skill.currentCooldown > 0 && (
          <div className="mt-2 text-center">
            <span className="font-display font-bold text-lg text-magic-gold-200">
              {skill.currentCooldown}s
            </span>
          </div>
        )}
        {skill.currentCooldown === 0 && (
          <div className="mt-2 text-center">
            <span className="text-xs text-white/60">CD {skill.cooldown}s</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}

function PlayerPanel({
  name,
  avatar,
  score,
  cheers,
  maxCheers,
  isPlayer,
}: {
  name: string;
  avatar: string;
  score: number;
  cheers: number;
  maxCheers: number;
  isPlayer: boolean;
}) {
  const cheerPercent = Math.min(100, (cheers / maxCheers) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: isPlayer ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      className={`magic-card rune-border p-5 flex-1 ${
        isPlayer ? 'border-cyan-500/30' : 'border-rose-500/30'
      }`}
    >
      <div className="text-center mb-4">
        <div className={`relative inline-block mb-3 ${isPlayer ? '' : 'scale-x-[-1]'}`}>
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto shadow-lg ${
              isPlayer
                ? 'bg-gradient-to-br from-cyan-500/30 to-magic-purple-700/50 ring-4 ring-cyan-400/30'
                : 'bg-gradient-to-br from-rose-500/30 to-magic-purple-700/50 ring-4 ring-rose-400/30'
            }`}
          >
            {avatar}
          </div>
          <div
            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full font-display font-bold text-sm shadow-lg ${
              isPlayer
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white'
                : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white'
            }`}
          >
            {isPlayer ? '玩家' : 'AI'}
          </div>
        </div>
        <h3 className="font-display font-bold text-xl text-magic-gold-100">{name}</h3>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <p className="text-xs text-magic-gold-100/60 mb-1">当前评分</p>
          <motion.p
            key={score}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className={`font-display font-bold text-4xl ${
              isPlayer ? 'text-cyan-300' : 'text-rose-300'
            }`}
          >
            {score}
          </motion.p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Volume2 className={`w-4 h-4 ${isPlayer ? 'text-cyan-400' : 'text-rose-400'}`} />
              <span className="text-xs text-magic-gold-100/70">喝彩值</span>
            </div>
            <span className={`text-xs font-semibold ${isPlayer ? 'text-cyan-300' : 'text-rose-300'}`}>
              {cheers} / {maxCheers}
            </span>
          </div>
          <div className="h-3 bg-magic-purple-950 rounded-full overflow-hidden border border-magic-gold-500/10">
            <motion.div
              className={`h-full rounded-full ${
                isPlayer
                  ? 'bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-300'
                  : 'bg-gradient-to-r from-rose-600 via-rose-400 to-rose-300'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${cheerPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SettlementPanel({
  settlement,
  skillUsages,
  onClose,
}: {
  settlement: CompetitionSettlement;
  skillUsages: SkillUsageRecord[];
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'skills'>('overview');

  const scoreHistory = settlement.scoreHistory;
  const playerScores = scoreHistory.map((r) => r.playerScore);
  const opponentScores = scoreHistory.map((r) => r.opponentScore);
  const labels = scoreHistory.map((r) => `${r.second}s`);

  const skillUsageMap = useMemo(() => {
    const map = new Map<number, SkillUsageRecord[]>();
    skillUsages.forEach((usage) => {
      const existing = map.get(usage.secondUsed) || [];
      map.set(usage.secondUsed, [...existing, usage]);
    });
    return map;
  }, [skillUsages]);

  const chartData = {
    labels,
    datasets: [
      {
        label: '你的得分',
        data: playerScores,
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: scoreHistory.map((r) => (r.isPrecisionStrike ? 6 : 2)),
        pointHoverRadius: scoreHistory.map((r) => (r.isPrecisionStrike ? 8 : 5)),
        pointBackgroundColor: scoreHistory.map((r) => (r.isPrecisionStrike ? '#f59e0b' : '#22d3ee')),
        pointBorderColor: scoreHistory.map((r) => (r.isPrecisionStrike ? '#fff' : '#22d3ee')),
        pointBorderWidth: scoreHistory.map((r) => (r.isPrecisionStrike ? 2 : 1)),
      },
      {
        label: '对手得分',
        data: opponentScores,
        borderColor: '#fb7185',
        backgroundColor: 'rgba(251, 113, 133, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e8d4a0',
          font: { family: 'Crimson Pro' },
        },
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            const idx = context.dataIndex;
            const record = scoreHistory[idx];
            if (record?.isPrecisionStrike) {
              return '⭐ 精准落笔翻倍!';
            }
            return null;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(139, 92, 246, 0.1)' },
        ticks: { color: 'rgba(232, 212, 160, 0.5)' },
      },
      y: {
        grid: { color: 'rgba(139, 92, 246, 0.1)' },
        ticks: { color: 'rgba(232, 212, 160, 0.5)' },
      },
    },
  };

  const scoreBreakdown = {
    baseScore: Math.floor(settlement.finalPlayerScore * 0.6),
    affixBonus: Math.floor(settlement.finalPlayerScore * 0.2),
    cheerBonus: Math.floor(settlement.finalPlayerScore * 0.15),
    skillBonus: Math.floor(settlement.finalPlayerScore * 0.05),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="magic-card rune-border p-6 max-w-4xl w-full relative overflow-hidden my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-magic-purple-800/50 hover:bg-magic-purple-700/50 text-magic-gold-300 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            settlement.reward.isWin
              ? 'from-amber-500/15 via-transparent to-cyan-500/15'
              : 'from-gray-500/15 via-transparent to-rose-500/15'
          }`}
        />

        <div className="relative z-10">
          <div className="text-center mb-6">
            <motion.div
              animate={settlement.reward.isWin ? { rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: settlement.reward.isWin ? Infinity : 0, repeatDelay: 3 }}
              className="mb-3"
            >
              {settlement.reward.isWin ? (
                <Trophy className="w-16 h-16 mx-auto text-amber-400 drop-shadow-lg" />
              ) : (
                <Star className="w-16 h-16 mx-auto text-gray-400 drop-shadow-lg" />
              )}
            </motion.div>
            <h2 className={`font-display font-bold text-3xl mb-2 ${
              settlement.reward.isWin ? 'text-amber-300' : 'text-gray-300'
            }`}>
              {settlement.reward.isWin ? '🎉 比赛胜利！' : '比赛结束'}
            </h2>
            <p className="text-magic-gold-100/70">{settlement.competitionName}</p>
            <p className="text-sm text-magic-gold-100/50 mt-1">
              {formatTime(settlement.startTime)} - {formatTime(settlement.endTime)}
            </p>
          </div>

          <div className="flex gap-2 mb-6 justify-center">
            {[
              { key: 'overview', label: '总览', icon: Trophy },
              { key: 'timeline', label: '时间线', icon: History },
              { key: 'skills', label: '技能记录', icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-display font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-magic-purple-600 to-magic-purple-500 text-magic-gold-100 border border-magic-gold-500/40 shadow-lg'
                      : 'bg-magic-purple-900/40 text-magic-gold-100/70 border border-magic-gold-500/10 hover:border-magic-gold-500/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-magic-purple-900/50 rounded-xl p-5 border border-magic-gold-500/20">
                <div className="flex items-center justify-center gap-8 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-magic-gold-100/60 mb-1">你的得分</p>
                    <p className="font-display font-bold text-3xl text-cyan-300">{settlement.finalPlayerScore}</p>
                  </div>
                  <div className="text-3xl font-display font-bold text-magic-gold-400">VS</div>
                  <div className="text-center">
                    <p className="text-xs text-magic-gold-100/60 mb-1">对手得分</p>
                    <p className="font-display font-bold text-3xl text-rose-300">{settlement.finalOpponentScore}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-magic-gold-100/60">分差</p>
                  <p className={`font-display font-bold text-xl ${
                    settlement.finalPlayerScore > settlement.finalOpponentScore ? 'text-emerald-300' : 'text-rose-300'
                  }`}>
                    {settlement.finalPlayerScore > settlement.finalOpponentScore ? '+' : ''}
                    {settlement.finalPlayerScore - settlement.finalOpponentScore}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-magic-purple-900/50 rounded-xl p-5 border border-magic-gold-500/20">
                  <h3 className="font-display font-bold text-magic-gold-200 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    得分构成
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-magic-gold-100/70">基础得分</span>
                      <span className="font-display font-bold text-cyan-200">+{scoreBreakdown.baseScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-magic-gold-100/70">词缀加成</span>
                      <span className="font-display font-bold text-purple-200">+{scoreBreakdown.affixBonus}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-magic-gold-100/70">喝彩加成</span>
                      <span className="font-display font-bold text-rose-200">+{scoreBreakdown.cheerBonus}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-magic-gold-100/70">技能加成</span>
                      <span className="font-display font-bold text-amber-200">+{scoreBreakdown.skillBonus}</span>
                    </div>
                    <div className="border-t border-magic-gold-500/20 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-display font-bold text-magic-gold-200">最终得分</span>
                        <span className="font-display font-bold text-xl text-cyan-300">{settlement.finalPlayerScore}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-magic-purple-900/50 rounded-xl p-5 border border-magic-gold-500/20">
                  <h3 className="font-display font-bold text-magic-gold-200 mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-amber-400" />
                    获得奖励
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                      <Star className="w-5 h-5 text-cyan-400" />
                      <span className="font-display font-bold text-cyan-200">+{settlement.reward.points} 大赛积分</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <Coins className="w-5 h-5 text-amber-400" />
                      <span className="font-display font-bold text-amber-200">+{settlement.reward.gold} 金币</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
                      <Volume2 className="w-5 h-5 text-rose-400" />
                      <span className="font-display font-bold text-rose-200">喝彩值 {settlement.finalPlayerCheers}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-magic-purple-900/50 rounded-xl p-5 border border-magic-gold-500/20">
                <h3 className="font-display font-bold text-magic-gold-200 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  完整评分走势
                </h3>
                <div className="h-64">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-magic-purple-900/50 rounded-xl p-5 border border-magic-gold-500/20 max-h-[600px] overflow-y-auto"
            >
              <h3 className="font-display font-bold text-magic-gold-200 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                每秒变化记录
              </h3>
              <div className="grid grid-cols-12 gap-2 text-xs text-magic-gold-100/50 mb-2 px-3 font-display">
                <div className="col-span-1">时间</div>
                <div className="col-span-2 text-center">你的增量</div>
                <div className="col-span-2 text-center">你的当前</div>
                <div className="col-span-1 text-center">vs</div>
                <div className="col-span-2 text-center">对手增量</div>
                <div className="col-span-2 text-center">对手当前</div>
                <div className="col-span-2 text-center">喝彩变化</div>
              </div>
              <div className="space-y-2">
                {[...scoreHistory].reverse().map((record, idx) => {
                  const skillsAtSecond = skillUsageMap.get(record.second) || [];
                  const prevRecord = record.second > 1 
                    ? scoreHistory.find((r) => r.second === record.second - 1)
                    : null;
                  const playerCheerDelta = prevRecord 
                    ? record.playerCheers - prevRecord.playerCheers
                    : record.playerCheers;
                  const opponentCheerDelta = prevRecord
                    ? record.opponentCheers - prevRecord.opponentCheers
                    : record.opponentCheers;

                  return (
                    <motion.div
                      key={record.second}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`p-3 rounded-lg border ${
                        record.isPrecisionStrike
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : skillsAtSecond.length > 0
                          ? 'bg-purple-500/10 border-purple-500/30'
                          : 'bg-magic-purple-800/30 border-magic-gold-500/10'
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-1">
                          <p className="font-display font-bold text-magic-gold-300 text-sm">{record.second}s</p>
                        </div>
                        <div className="col-span-2 text-center">
                          <p className={`font-display font-bold text-sm ${
                            record.playerDelta > record.opponentDelta ? 'text-cyan-300' : 'text-cyan-200'
                          }`}>
                            +{record.playerDelta}
                            {record.isPrecisionStrike && <span className="text-amber-400 ml-0.5">⭐</span>}
                          </p>
                        </div>
                        <div className="col-span-2 text-center">
                          <p className="font-display font-bold text-cyan-300">{record.playerScore}</p>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className="text-magic-gold-100/30">VS</span>
                        </div>
                        <div className="col-span-2 text-center">
                          <p className="font-display font-bold text-rose-200 text-sm">+{record.opponentDelta}</p>
                        </div>
                        <div className="col-span-2 text-center">
                          <p className="font-display font-bold text-rose-300">{record.opponentScore}</p>
                        </div>
                        <div className="col-span-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className={`text-cyan-300 text-xs ${playerCheerDelta > 0 ? '' : 'opacity-50'}`}>
                              +{playerCheerDelta}
                            </span>
                            <span className="text-magic-gold-100/30">/</span>
                            <span className={`text-rose-300 text-xs ${opponentCheerDelta > 0 ? '' : 'opacity-50'}`}>
                              +{opponentCheerDelta}
                            </span>
                          </div>
                        </div>
                      </div>

                      {skillsAtSecond.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-magic-gold-500/10">
                          <div className="flex flex-wrap gap-2">
                            {skillsAtSecond.map((skill, sIdx) => {
                              const Icon = skillIconMap[skill.skillId] || Zap;
                              const colors = skillColorMap[skill.skillId] || skillColorMap['skill-001'];
                              return (
                                <div
                                  key={sIdx}
                                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-gradient-to-r ${colors.bg} text-white`}
                                >
                                  <Icon className="w-3 h-3" />
                                  <span className="font-display font-semibold">{skill.skillName}</span>
                                  <span className="text-white/70">- {skill.effect}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {record.isPrecisionStrike && (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-display">
                            <Target className="w-3 h-3" />
                            精准落笔 - 评分翻倍x2
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-magic-purple-900/50 rounded-xl p-5 border border-magic-gold-500/20"
            >
              <h3 className="font-display font-bold text-magic-gold-200 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                技能使用记录
              </h3>
              {settlement.skillUsages.length > 0 ? (
                <div className="space-y-3">
                  {settlement.skillUsages.map((usage, idx) => {
                    const Icon = skillIconMap[usage.skillId] || Zap;
                    const colors = skillColorMap[usage.skillId] || skillColorMap['skill-001'];
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-lg bg-magic-purple-800/30 border border-magic-gold-500/10"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-display font-bold text-magic-gold-100">{usage.skillName}</p>
                          <p className="text-sm text-magic-gold-100/60">{usage.effect}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-magic-gold-100/50">使用时间</p>
                          <p className="font-display font-bold text-magic-gold-300">第 {usage.secondUsed} 秒</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-magic-gold-100/50">
                  <ZapOff className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>本次比赛没有使用任何技能</p>
                </div>
              )}
            </motion.div>
          )}

          <div className="mt-6 flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="flex-1 magic-btn-gold flex items-center justify-center gap-2"
            >
              返回大厅
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PrepareOverlay({ countdown }: { countdown: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="text-center">
        <motion.div
          key={countdown}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <p className="font-display text-6xl font-bold text-magic-gold-300 mb-4 drop-shadow-lg">
            {countdown > 0 ? countdown : '开始！'}
          </p>
        </motion.div>
        <p className="font-display text-xl text-magic-gold-100/70">
          {countdown > 0 ? '准备开始绘制...' : '全力绘制你的纹身！'}
        </p>
      </div>
    </motion.div>
  );
}

export default function CompetitionLive() {
  const navigate = useNavigate();
  const liveCompetition = useGameStore((s) => s.liveCompetition);
  const competitions = useGameStore((s) => s.competitions);
  const player = useGameStore((s) => s.player);
  const useSkill = useGameStore((s) => s.useSkill);
  const tickCompetitionTime = useGameStore((s) => s.tickCompetitionTime);
  const finishCompetition = useGameStore((s) => s.finishCompetition);
  const clearLiveCompetition = useGameStore((s) => s.clearLiveCompetition);
  const setCurrentPage = useGameStore((s) => s.setCurrentPage);

  const tickRef = useRef(0);

  const currentCompetition = liveCompetition
    ? competitions.find((c) => c.id === liveCompetition.competitionId)
    : null;

  const showSettlement = liveCompetition?.status === 'finished' && !!liveCompetition.settlement;
  const settlement = liveCompetition?.settlement || null;
  const skillUsages = liveCompetition?.skillUsages || [];

  useEffect(() => {
    if (!liveCompetition) {
      navigate('/competition');
      return;
    }
  }, [liveCompetition, navigate]);

  useEffect(() => {
    if (!liveCompetition) return;

    const timer = setInterval(() => {
      tickRef.current += 1;
      tickCompetitionTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [liveCompetition?.status, tickCompetitionTime]);

  useEffect(() => {
    if (liveCompetition && liveCompetition.status === 'finished' && !liveCompetition.settlement) {
      finishCompetition();
    }
  }, [liveCompetition, finishCompetition]);

  const handleUseSkill = (skillId: string) => {
    if (liveCompetition?.status !== 'drawing') return;
    useSkill(skillId);
  };

  const handleCloseSettlement = () => {
    clearLiveCompetition();
    setCurrentPage('competition');
    navigate('/competition');
  };

  if (!liveCompetition || !currentCompetition) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-magic-gold-100/60">正在加载...</p>
      </div>
    );
  }

  const isWin = liveCompetition.playerScore > liveCompetition.opponentScore;
  const maxCheers = 200;

  const chartLabels = (liveCompetition.scoreHistory || []).map((r) => `${r.second}s`);
  const chartPlayerScores = (liveCompetition.scoreHistory || []).map((r) => r.playerScore);
  const chartOpponentScores = (liveCompetition.scoreHistory || []).map((r) => r.opponentScore);
  const precisionPoints = (liveCompetition.scoreHistory || []).map((r) => r.isPrecisionStrike);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: '你的得分',
        data: chartPlayerScores,
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: precisionPoints.map((p) => (p ? 6 : 2)),
        pointHoverRadius: precisionPoints.map((p) => (p ? 8 : 5)),
        pointBackgroundColor: precisionPoints.map((p) => (p ? '#f59e0b' : '#22d3ee')),
        pointBorderColor: precisionPoints.map((p) => (p ? '#fff' : '#22d3ee')),
        pointBorderWidth: precisionPoints.map((p) => (p ? 2 : 1)),
      },
      {
        label: '对手得分',
        data: chartOpponentScores,
        borderColor: '#fb7185',
        backgroundColor: 'rgba(251, 113, 133, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e8d4a0',
          font: { family: 'Crimson Pro' },
        },
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            const idx = context.dataIndex;
            if (precisionPoints[idx]) {
              return '⭐ 精准落笔翻倍!';
            }
            return null;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(139, 92, 246, 0.1)' },
        ticks: { color: 'rgba(232, 212, 160, 0.5)' },
      },
      y: {
        grid: { color: 'rgba(139, 92, 246, 0.1)' },
        ticks: { color: 'rgba(232, 212, 160, 0.5)' },
      },
    },
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <AnimatePresence>
        {liveCompetition.status === 'preparing' && (
          <PrepareOverlay countdown={liveCompetition.prepareCountdown || 0} />
        )}
        {showSettlement && settlement && (
          <SettlementPanel
            settlement={settlement}
            skillUsages={skillUsages}
            onClose={handleCloseSettlement}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-magic-gold-200 flex items-center gap-3">
            <Swords className="w-8 h-8 text-rose-400" />
            {currentCompetition.name}
          </h1>
          <p className="text-magic-gold-100/60 mt-1">
            {liveCompetition.status === 'preparing'
              ? '比赛即将开始...'
              : liveCompetition.status === 'drawing'
              ? '实时比赛进行中'
              : '比赛已结束'}
          </p>
        </div>
        <motion.div
          animate={liveCompetition.timeRemaining <= 10 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
          className={`magic-card rune-border px-6 py-3 flex items-center gap-3 ${
            liveCompetition.timeRemaining <= 10 ? 'border-rose-500/50' : ''
          }`}
        >
          <Clock
            className={`w-6 h-6 ${
              liveCompetition.timeRemaining <= 10 ? 'text-rose-400 animate-pulse' : 'text-magic-gold-400'
            }`}
          />
          <div className="text-right">
            <p className="text-xs text-magic-gold-100/60">剩余时间</p>
            <p
              className={`font-display font-bold text-2xl ${
                liveCompetition.timeRemaining <= 10 ? 'text-rose-300' : 'text-magic-gold-100'
              }`}
            >
              {formatTimeRemaining(liveCompetition.timeRemaining)}
            </p>
          </div>
        </motion.div>
      </div>

      {liveCompetition.precisionStrikeActive && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="magic-card rune-border p-4 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-500/40 flex items-center justify-center gap-3"
        >
          <Target className="w-6 h-6 text-amber-400 animate-pulse" />
          <p className="font-display font-bold text-amber-200">
            ⭐ 精准落笔已激活！下一次得分将翻倍！
          </p>
          <Target className="w-6 h-6 text-amber-400 animate-pulse" />
        </motion.div>
      )}

      <div className="flex items-center justify-center gap-6">
        <PlayerPanel
          name={player.name}
          avatar="🎨"
          score={liveCompetition.playerScore}
          cheers={liveCompetition.playerCheers}
          maxCheers={maxCheers}
          isPlayer={true}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex-shrink-0"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-magic-gold-500 to-magic-gold-700 flex items-center justify-center shadow-lg shadow-magic-gold-500/40">
            <Swords className="w-10 h-10 text-magic-purple-950" />
          </div>
        </motion.div>
        <PlayerPanel
          name="暗影大师"
          avatar="🤖"
          score={liveCompetition.opponentScore}
          cheers={liveCompetition.opponentCheers}
          maxCheers={maxCheers}
          isPlayer={false}
        />
      </div>

      <div className="magic-card rune-border p-5">
        <h2 className="font-display font-bold text-lg text-magic-gold-300 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          实时评分走势
          {precisionPoints.some((p) => p) && (
            <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-300 ml-2">
              ⭐ 标记点为精准落笔翻倍
            </span>
          )}
        </h2>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="magic-card rune-border p-5">
        <h2 className="font-display font-bold text-lg text-magic-gold-300 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          技能栏
        </h2>
        <div className="flex gap-4">
          {liveCompetition.skills.map((skill) => (
            <SkillButton
              key={skill.id}
              skill={skill}
              onUse={() => handleUseSkill(skill.id)}
              disabled={liveCompetition.status !== 'drawing'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
