import { useState, useRef, useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import type { ReportPeriodType } from '@/types';
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  Calendar,
  Clock,
  X,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface PeriodOption {
  key: ReportPeriodType;
  label: string;
  icon: typeof Calendar;
}

const periodOptions: PeriodOption[] = [
  { key: 'week', label: '周报', icon: Calendar },
  { key: 'month', label: '月报', icon: Calendar },
  { key: '7days', label: '最近7天', icon: Clock },
  { key: '30days', label: '最近30天', icon: Clock },
  { key: 'custom', label: '自定义', icon: Calendar },
];

export default function Reports() {
  const reports = useGameStore((s) => s.reports);
  const addNotification = useGameStore((s) => s.addNotification);
  const switchReportPeriod = useGameStore((s) => s.switchReportPeriod);
  const [exporting, setExporting] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

  const currentPeriodType = reports.periodType || 'week';

  const handlePeriodSwitch = (periodType: ReportPeriodType) => {
    if (periodType === 'custom') {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 6);
      setCustomStartDate(weekAgo.toISOString().split('T')[0]);
      setCustomEndDate(today.toISOString().split('T')[0]);
      setShowCustomDatePicker(true);
    } else {
      switchReportPeriod(periodType);
    }
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      if (new Date(customStartDate) > new Date(customEndDate)) {
        addNotification({
          type: 'error',
          title: '日期错误',
          message: '开始日期不能晚于结束日期',
        });
        return;
      }
      switchReportPeriod('custom', customStartDate, customEndDate);
      setShowCustomDatePicker(false);
    }
  };

  const totalDrawings = useMemo(
    () => Object.values(reports.pigmentUsage).reduce((a, b) => a + b, 0),
    [reports.pigmentUsage]
  );

  const competitionCount = useMemo(
    () => reports.competitionScores.length,
    [reports.competitionScores]
  );

  const tradeVolume = useMemo(
    () => reports.priceTrends.reduce((sum, t) => {
      const lastPrice = t.prices[t.prices.length - 1] || 0;
      return sum + lastPrice * 10;
    }, 0),
    [reports.priceTrends]
  );

  const hotMaterial = useMemo(() => {
    const entries = Object.entries(reports.pigmentUsage);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0];
  }, [reports.pigmentUsage]);

  const pigmentLabels = useMemo(() => Object.keys(reports.pigmentUsage), [reports.pigmentUsage]);
  const pigmentDataValues = useMemo(() => Object.values(reports.pigmentUsage), [reports.pigmentUsage]);

  const pigmentData = {
    labels: pigmentLabels,
    datasets: [
      {
        label: '使用次数',
        data: pigmentDataValues,
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

  const competitionScoreLabels = useMemo(
    () => reports.competitionScores.map((_, i) => `第${i + 1}场`),
    [reports.competitionScores]
  );

  const competitionScoreData = {
    labels: competitionScoreLabels,
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
    labels: reports.priceTrends[0]?.labels || [],
    datasets: reports.priceTrends.map((trend, i) => ({
      label: trend.material,
      data: trend.prices,
      borderColor: priceTrendColors[i % priceTrendColors.length].border,
      backgroundColor: priceTrendColors[i % priceTrendColors.length].bg,
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
        label: reports.period,
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

  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    setExporting(true);

    try {
      const element = reportRef.current;
      const safePeriod = reports.period.replace(/[\\/:*?"<>|]/g, '-');
      const fileName = `纹身产业报告_${safePeriod}.pdf`;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#1a0a2e',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      let heightLeft = imgHeight * ratio - pdfHeight;
      let position = -pdfHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
        heightLeft -= pdfHeight;
        position -= pdfHeight;
      }

      pdf.save(fileName);

      addNotification({
        type: 'success',
        title: '导出成功',
        message: `产业报告「${fileName}」已下载完成`,
      });
    } catch (error) {
      console.error('PDF导出失败:', error);
      addNotification({
        type: 'error',
        title: '导出失败',
        message: 'PDF导出时发生错误，请重试',
      });
    } finally {
      setExporting(false);
    }
  };

  const statCards = [
    {
      label: `${reports.period}总绘制数`,
      value: totalDrawings.toLocaleString(),
      icon: Palette,
      color: 'from-purple-600 to-purple-500',
    },
    {
      label: '大赛参与数',
      value: competitionCount,
      icon: Trophy,
      color: 'from-amber-600 to-amber-500',
    },
    {
      label: '交易总额',
      value: tradeVolume.toLocaleString(),
      icon: Coins,
      color: 'from-emerald-600 to-emerald-500',
    },
    {
      label: '热门材料',
      value: hotMaterial?.[0] || '-',
      icon: Flame,
      color: 'from-rose-600 to-rose-500',
    },
  ];

  const getReportTitle = () => {
    if (currentPeriodType === 'week') return '周报';
    if (currentPeriodType === 'month') return '月报';
    return '数据报告';
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-magic-gold-200 flex items-center gap-3">
            <TrendingUp className="w-8 h-8" />
            产业报告
          </h1>
          <p className="text-magic-gold-100/60 mt-1">
            统计周期：{reports.period}
            {reports.dateRange && (
              <span className="ml-2 text-magic-gold-100/40">
                ({reports.dateRange.startDate} 至 {reports.dateRange.endDate})
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1 rounded-lg overflow-hidden border border-magic-gold-500/30">
            {periodOptions.map((option) => {
              const Icon = option.icon;
              const isActive = currentPeriodType === option.key;
              return (
                <button
                  key={option.key}
                  onClick={() => handlePeriodSwitch(option.key)}
                  className={`px-3 py-2 flex items-center gap-1.5 font-display font-semibold text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-magic-purple-600 to-magic-purple-500 text-magic-gold-100'
                      : 'bg-magic-purple-900/40 text-magic-gold-100/70 hover:text-magic-gold-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {option.label}
                </button>
              );
            })}
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
      </div>

      <AnimatePresence>
        {showCustomDatePicker && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="magic-card rune-border p-5 bg-gradient-to-r from-magic-purple-900/80 to-magic-purple-950/80"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-magic-gold-300 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                自定义时间范围
              </h3>
              <button
                onClick={() => setShowCustomDatePicker(false)}
                className="p-1.5 rounded-lg hover:bg-magic-purple-800/50 text-magic-gold-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs text-magic-gold-100/60 mb-1.5">开始日期</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-magic-purple-800/60 border border-magic-gold-500/30 text-magic-gold-100 focus:outline-none focus:border-magic-gold-500/60"
                />
              </div>
              <div className="text-magic-gold-100/50 pb-2">至</div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs text-magic-gold-100/60 mb-1.5">结束日期</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-magic-purple-800/60 border border-magic-gold-500/30 text-magic-gold-100 focus:outline-none focus:border-magic-gold-500/60"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCustomDateApply}
                className="magic-btn-gold flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                应用
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={reportRef} className="space-y-6">
        <div className="magic-card rune-border p-5 bg-gradient-to-r from-magic-purple-900/80 to-magic-purple-950/80">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-2xl text-magic-gold-300">
                墨染苍穹 · 纹身产业{getReportTitle()}
              </h2>
              <p className="text-magic-gold-100/60 mt-1">
                统计周期：{reports.period}
                {reports.dateRange && (
                  <span className="ml-2">({reports.dateRange.startDate} ~ {reports.dateRange.endDate})</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-sm text-magic-gold-100/50">报告生成时间</p>
              <p className="font-display text-magic-gold-200">
                {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
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
            {reports.periodType === 'month' && (
              <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300 ml-2">
                按周统计
              </span>
            )}
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
          {reports.topTattoos.slice(0, 5).map((tattoo, idx) => (
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
    </div>
  );
}
