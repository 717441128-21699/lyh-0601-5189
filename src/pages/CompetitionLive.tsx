import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import type { SkillState } from '@/types';
import {
  Zap,
  Target,
  Users,
  Trophy,
  Clock,
  ChevronRight,
  Sparkles,
  Gift,
  Coins,
  Star,
  Swords,
  Volume2,
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

function ResultPanel({
  isWin,
  playerScore,
  opponentScore,
  rewardPoints,
  rewardGold,
  onClose,
}: {
  isWin: boolean;
  playerScore: number;
  opponentScore: number;
  rewardPoints: number;
  rewardGold: number;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="magic-card rune-border p-8 max-w-md w-full mx-4 relative overflow-hidden"
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            isWin
              ? 'from-amber-500/20 via-transparent to-cyan-500/20'
              : 'from-gray-500/20 via-transparent to-rose-500/20'
          }`}
        />

        {isWin && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  x: '50%',
                  y: '50%',
                  opacity: 1,
                  scale: 0,
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  opacity: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.05,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              >
                <Sparkles
                  className={`w-4 h-4 ${
                    ['text-amber-400', 'text-cyan-400', 'text-rose-400'][i % 3]
                  }`}
                />
              </motion.div>
            ))}
          </div>
        )}

        <div className="relative z-10 text-center">
          <motion.div
            animate={isWin ? { rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: isWin ? Infinity : 0, repeatDelay: 2 }}
            className="mb-4"
          >
            {isWin ? (
              <Trophy className="w-20 h-20 mx-auto text-amber-400 drop-shadow-lg" />
            ) : (
              <Star className="w-20 h-20 mx-auto text-gray-400 drop-shadow-lg" />
            )}
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`font-display font-bold text-3xl mb-2 ${
              isWin ? 'text-amber-300' : 'text-gray-300'
            }`}
          >
            {isWin ? '🎉 比赛胜利！' : '比赛结束'}
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-magic-gold-100/70 mb-6"
          >
            {isWin ? '恭喜你击败了对手！奖励已发放到你的账户' : '下次再接再厉！参与奖励已发放'}
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-magic-purple-900/50 rounded-xl p-4 mb-6 border border-magic-gold-500/20"
          >
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="text-center">
                <p className="text-xs text-magic-gold-100/60 mb-1">你的得分</p>
                <p className="font-display font-bold text-2xl text-cyan-300">{playerScore}</p>
              </div>
              <div className="text-3xl font-display font-bold text-magic-gold-400">VS</div>
              <div className="text-center">
                <p className="text-xs text-magic-gold-100/60 mb-1">对手得分</p>
                <p className="font-display font-bold text-2xl text-rose-300">{opponentScore}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-5 h-5 text-magic-gold-400" />
              <span className="font-display text-magic-gold-200">获得奖励</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Star className="w-5 h-5 text-cyan-400" />
                <span className="font-display font-bold text-cyan-200">+{rewardPoints} 积分</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <Coins className="w-5 h-5 text-amber-400" />
                <span className="font-display font-bold text-amber-200">+{rewardGold} 金币</span>
              </div>
            </div>
          </motion.div>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="magic-btn-gold w-full flex items-center justify-center gap-2"
          >
            返回大厅
            <ChevronRight className="w-5 h-5" />
          </motion.button>
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
  const updateCompetitionScore = useGameStore((s) => s.updateCompetitionScore);
  const updateCompetitionCheers = useGameStore((s) => s.updateCompetitionCheers);
  const tickCompetitionTime = useGameStore((s) => s.tickCompetitionTime);
  const finishCompetition = useGameStore((s) => s.finishCompetition);
  const setCurrentPage = useGameStore((s) => s.setCurrentPage);

  const [scoreHistory, setScoreHistory] = useState<{ labels: string[]; player: number[]; opponent: number[] }>({
    labels: ['0'],
    player: [0],
    opponent: [0],
  });
  const [showResult, setShowResult] = useState(false);
  const [rewardGiven, setRewardGiven] = useState(false);
  const tickRef = useRef(0);

  const currentCompetition = liveCompetition
    ? competitions.find((c) => c.id === liveCompetition.competitionId)
    : null;

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

      if (liveCompetition.status === 'drawing') {
        const playerDelta = Math.floor(Math.random() * 8) + 2;
        const opponentDelta = Math.floor(Math.random() * 8) + 2;
        updateCompetitionScore(playerDelta, opponentDelta);

        const playerCheerDelta = Math.floor(Math.random() * 6) + 1;
        const opponentCheerDelta = Math.floor(Math.random() * 6) + 1;
        updateCompetitionCheers(playerCheerDelta, opponentCheerDelta);

        setScoreHistory((prev) => {
          const newLabels = [...prev.labels, String(tickRef.current)];
          const lastPlayer = prev.player[prev.player.length - 1] || 0;
          const lastOpponent = prev.opponent[prev.opponent.length - 1] || 0;
          const newPlayer = [...prev.player, lastPlayer + playerDelta];
          const newOpponent = [...prev.opponent, lastOpponent + opponentDelta];
          const maxPoints = 30;
          if (newLabels.length > maxPoints) {
            return {
              labels: newLabels.slice(-maxPoints),
              player: newPlayer.slice(-maxPoints),
              opponent: newOpponent.slice(-maxPoints),
            };
          }
          return { labels: newLabels, player: newPlayer, opponent: newOpponent };
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [liveCompetition?.status, tickCompetitionTime, updateCompetitionScore, updateCompetitionCheers]);

  useEffect(() => {
    if (liveCompetition && liveCompetition.status === 'finished' && !showResult && !rewardGiven) {
      setRewardGiven(true);
      finishCompetition();
      setShowResult(true);
    }
  }, [liveCompetition, showResult, rewardGiven, finishCompetition]);

  const handleUseSkill = (skillId: string) => {
    if (liveCompetition?.status !== 'drawing') return;
    const success = useSkill(skillId);
    if (success && skillId === 'skill-001') {
      setScoreHistory((prev) => {
        const newPlayer = [...prev.player];
        if (newPlayer.length > 0) {
          newPlayer[newPlayer.length - 1] = newPlayer[newPlayer.length - 1] + 20;
        }
        return { ...prev, player: newPlayer };
      });
    }
  };

  const handleFinish = () => {
    setShowResult(false);
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
  const rewardPoints = isWin
    ? currentCompetition.reward.points
    : Math.floor(currentCompetition.reward.points * 0.3);
  const rewardGold = isWin ? 500 : 100;
  const maxCheers = 200;

  const chartData = {
    labels: scoreHistory.labels,
    datasets: [
      {
        label: '你的得分',
        data: scoreHistory.player,
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: '对手得分',
        data: scoreHistory.opponent,
        borderColor: '#fb7185',
        backgroundColor: 'rgba(251, 113, 133, 0.1)',
        borderWidth: 2,
        tension: 0.4,
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
        {showResult && (
          <ResultPanel
            isWin={isWin}
            playerScore={liveCompetition.playerScore}
            opponentScore={liveCompetition.opponentScore}
            rewardPoints={rewardPoints}
            rewardGold={rewardGold}
            onClose={handleFinish}
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
