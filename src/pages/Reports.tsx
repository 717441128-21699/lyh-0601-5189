import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Radar } from 'react-chartjs-2';
import {
  TrendingUp,
  Palette,
  Trophy,
  Coins,
  Flame,
  Download,
  Scroll,
  Sparkles,
  Star,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      labels: {
        color: 'rgba(250, 204, 21, 0.8)',
        font: { family: 'inherit' },
      },
    },
  },
  scales: {
    x: {
      ticks: { color: 'rgba(250, 204, 21, 0.6)' },
      grid: { color: 'rgba(250, 204, 21, 0.1)' },
    },
    y: {
      ticks: { color: 'rgba(250, 204, 21, 0.6)' },
      grid: { color: 'rgba(250, 204, 21, 0.1)' },
    },
  },
};

const radarOptions = {
  responsive: true,
  plugins: {
    legend: {
      labels: {
        color: 'rgba(250, 204, 21, 0.8)',
        font: { family: 'inherit' },
      },
    },
  },
  scales: {
    r: {
      angleLines: { color: 'rgba(250, 204, 21, 0.2)' },
      grid: { color: 'rgba(250, 204, 21, 0.1)' },
      pointLabels: { color: 'rgba(250, 204, 21, 0.8)', font: { family: 'inherit' } },
      ticks: { color: 'rgba(250, 204, 21, 0.5)', backdropColor: 'transparent' },
    },
  },
};

export default function Reports() {
  const reports = useGameStore((s) => s.reports);
  const addNotification = useGameStore((s) => s.addNotification);
  const [exporting, setExporting] = useState(false);

  const totalDrawings = Object.values(reports.pigmentUsage).reduce((a, b) => a + b, 0);
  const competitionCount = 3;
  const tradeVolume = reports.priceTrends.reduce(
    (sum, t) => sum + t.prices[t.prices.length - 1] * 10,
    0
  );
  const hotMaterial = Object.entries(reports.pigmentUsage).sort((a, b) => b[1] - a[1])[0];

  const pigmentData = {
    labels: Object.keys(reports.pigmentUsage),
    datasets: [
      {
        label: '使用次数',
        data: Object.values(reports.pigmentUsage),
        backgroundColor: [
          'rgba(168, 85, 247, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(107, 114, 128, 0.7)',
          'rgba(250, 204, 21, 0.7)',
        ],
        borderColor: [
          'rgba(168, 85, 247, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(107, 114, 128, 1)',
          'rgba(250, 204, 21, 1)',
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const competitionScoreData = {
    labels: reports.competitionScores.map((_, i) => `第${i + 1}场`),
    datasets: [
      {
        label: '平均评分',
        data: reports.competitionScores,
        borderColor: 'rgba(250, 204, 21, 1)',
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(250, 204, 21, 1)',
        pointBorderColor: '#1e1b4b',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const priceTrendColors = [
    { border: 'rgba(239, 68, 68, 1)', bg: 'rgba(239, 68, 68, 0.1)' },
    { border: 'rgba(34, 197, 94, 1)', bg: 'rgba(34, 197, 94, 0.1)' },
    { border: 'rgba(59, 130, 246, 1)', bg: 'rgba(59, 130, 246, 0.1)' },
  ];

  const priceTrendData = {
    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    datasets: reports.priceTrends.map((trend, i) => ({
      label: trend.material,
      data: trend.prices,
      borderColor: priceTrendColors[i].border,
      backgroundColor: priceTrendColors[i].bg,
      borderWidth: 2,
      fill: false,
      tension: 0.3,
      pointRadius: 3,
    })),
  };

  const radarData = {
    labels: ['魔力', '稀有度', '技法', '创意', '人气'],
    datasets: [
      {
        label: '本周平均',
        data: [
          reports.radarData.power,
          reports.radarData.rarity,
          reports.radarData.technique,
          reports.radarData.creativity,
          reports.radarData.popularity,
        ],
        backgroundColor: 'rgba(168, 85, 247, 0.3)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(250, 204, 21, 1)',
      },
    ],
  };

  const handleExportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      addNotification({
        type: 'success',
        title: '导出成功',
        message: `产业报告(${reports.period})已导出为PDF`,
      });
    }, 1500);
  };

  const statCards = [
    { label: '本周总绘制数', value: totalDrawings, icon: Palette, color: 'from-purple-600 to-purple-500' },
    { label: '大赛参与数', value: competitionCount, icon: Trophy, color: 'from-amber-600 to-amber-500' },
    { label: '交易总额', value: tradeVolume.toLocaleString(), icon: Coins, color: 'from-emerald-600 to-emerald-500' },
    { label: '热门材料', value: hotMaterial?.[0] || '-', icon: Flame, color: 'from-rose-600 to-rose-500' },
  ];

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-magic-gold-200 flex items-center gap-3">
            <TrendingUp className="w-8 h-8" />
            产业报告
          </h1>
          <p className="text-magic-gold-100/60 mt-1">统计周期：{reports.period}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExportPDF}
          disabled={exporting}
          className="magic-btn-gold flex items-center gap-2 disabled:opacity-60"
        >
          <Download className={`w-5 h-5 ${exporting ? 'animate-spin' : ''}`} />
          {exporting ? '正在导出...' : '导出PDF'}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="magic-card rune-border p-5 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-magic-gold-100/60">{stat.label}</p>
                  <Icon className="w-5 h-5 text-magic-gold-300" />
                </div>
                <p className="font-display font-bold text-2xl text-magic-gold-100 line-clamp-1">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="magic-card rune-border p-6"
        >
          <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-5 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            颜料使用率统计
          </h2>
          <div className="h-72">
            <Bar data={pigmentData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="magic-card rune-border p-6"
        >
          <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-5 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            大赛评分趋势
          </h2>
          <div className="h-72">
            <Line data={competitionScoreData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="magic-card rune-border p-6"
        >
          <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-5 flex items-center gap-2">
            <Coins className="w-5 h-5" />
            材料价格走势
          </h2>
          <div className="h-72">
            <Line data={priceTrendData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="magic-card rune-border p-6"
        >
          <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-5 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            纹身属性分析
          </h2>
          <div className="h-72">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="magic-card rune-border p-6"
      >
        <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-5 flex items-center gap-2">
          <Star className="w-5 h-5" />
          热门纹身作品排行榜
        </h2>
        <div className="space-y-3">
          {reports.topTattoos.map((tattoo, idx) => (
            <motion.div
              key={tattoo.id}
              whileHover={{ x: 4 }}
              className="flex items-center gap-4 p-4 rounded-lg bg-magic-purple-900/40 border border-magic-gold-500/20 hover:border-magic-gold-500/40 transition-colors cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-lg ${
                  idx === 0
                    ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-900'
                    : idx === 1
                    ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700'
                    : idx === 2
                    ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-amber-100'
                    : 'bg-magic-purple-700/60 text-magic-gold-300'
                }`}
              >
                {idx + 1}
              </div>
              <div className="w-14 h-14 rounded-lg bg-magic-purple-800/60 flex items-center justify-center border border-magic-gold-500/20">
                <Scroll className="w-7 h-7 text-magic-gold-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-magic-gold-100">{tattoo.name}</p>
                <p className="text-sm text-magic-gold-100/60">{tattoo.patternName}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-magic-gold-100/60">魔力加成</p>
                  <p className="font-display font-bold text-amber-400">+{tattoo.powerBonus}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-magic-gold-100/60">特效概率</p>
                  <p className="font-display font-bold text-cyan-400">
                    {(tattoo.specialEffectChance * 100).toFixed(0)}%
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-magic-gold-400" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
