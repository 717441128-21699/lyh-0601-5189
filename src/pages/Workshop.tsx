import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import type { Material, Tattoo, MaterialType, Rarity } from '@/types';
import {
  Palette,
  Paintbrush,
  Scroll,
  Sparkles,
  Layers,
  Star,
  Plus,
  Package,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';

const rarityLabel: Record<Rarity, string> = {
  common: '普通',
  uncommon: '优秀',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const tabConfig: { key: MaterialType; label: string; icon: typeof Palette }[] = [
  { key: 'pigment', label: '颜料', icon: Palette },
  { key: 'needle', label: '纹针', icon: Paintbrush },
  { key: 'pattern', label: '图案', icon: Scroll },
];

function MaterialCard({ material }: { material: Material }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      className={`relative p-4 rounded-lg bg-magic-purple-900/50 border border-magic-gold-500/20 rarity-glow-${material.rarity} transition-all`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-lg bg-magic-purple-800/60 flex items-center justify-center text-2xl">
          {material.icon}
        </div>
        <span className={`text-xs font-display px-2 py-0.5 rounded border text-rarity-${material.rarity} border-current opacity-80`}>
          {rarityLabel[material.rarity]}
        </span>
      </div>
      <h3 className="font-display font-bold text-magic-gold-100 text-sm mb-1 line-clamp-1">
        {material.name}
      </h3>
      <p className="text-xs text-magic-gold-100/50 mb-3 line-clamp-2 h-8">
        {material.description}
      </p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-magic-gold-300/70">品质 {material.quality}</span>
        <span className="font-display font-bold text-magic-gold-200">x{material.quantity}</span>
      </div>
    </motion.div>
  );
}

function TattooCard({ tattoo }: { tattoo: Tattoo }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      className="relative p-4 rounded-lg bg-magic-purple-900/50 border border-magic-gold-500/30 overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-magic-purple-600/20 via-transparent to-magic-gold-500/10 opacity-60" />
      <div className="relative">
        <div className="w-full aspect-square rounded-lg bg-magic-purple-800/60 flex flex-col items-center justify-center mb-3 border border-magic-gold-500/20">
          <Scroll className="w-12 h-12 text-magic-gold-400 mb-2" />
          <p className="font-display text-xs text-magic-gold-300/70">{tattoo.patternName}</p>
        </div>
        <h3 className="font-display font-bold text-magic-gold-100 text-sm mb-2 line-clamp-1">
          {tattoo.name}
        </h3>
        <div className="flex flex-wrap gap-1 mb-2">
          {tattoo.affixes.map((affix, idx) => (
            <span
              key={idx}
              className="text-[10px] px-1.5 py-0.5 rounded bg-magic-purple-700/60 text-magic-gold-200 border border-magic-gold-500/20"
            >
              {affix.name}+{affix.value}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-magic-gold-300/80 text-xs">
            <Sparkles className="w-3 h-3" />
            <span>+{tattoo.powerBonus}</span>
          </div>
          <span className="text-[10px] text-magic-gold-100/50">
            特效 {(tattoo.specialEffectChance * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Workshop() {
  const navigate = useNavigate();
  const materials = useGameStore((s) => s.materials);
  const tattoos = useGameStore((s) => s.tattoos);
  const player = useGameStore((s) => s.player);
  const setCurrentPage = useGameStore((s) => s.setCurrentPage);

  const [activeTab, setActiveTab] = useState<MaterialType>('pigment');

  const filteredMaterials = useMemo(
    () => materials.filter((m) => m.type === activeTab && m.quantity > 0),
    [materials, activeTab]
  );

  const stats = useMemo(() => {
    const totalMaterials = materials.reduce((sum, m) => sum + m.quantity, 0);
    const totalTattoos = tattoos.length;
    const avgPower = totalTattoos > 0
      ? Math.round(tattoos.reduce((sum, t) => sum + t.powerBonus, 0) / totalTattoos)
      : 0;
    return { totalMaterials, totalTattoos, avgPower };
  }, [materials, tattoos]);

  const handleCreate = () => {
    setCurrentPage('workshop-create');
    navigate('/workshop/create');
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-magic-gold-200 flex items-center gap-3">
            <Layers className="w-8 h-8" />
            纹身工坊
          </h1>
          <p className="text-magic-gold-100/60 mt-1">工坊等级 Lv.{player.workshopLevel}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCreate}
          className="magic-btn-gold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          进入绘制
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="magic-card rune-border p-5 flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-xl bg-magic-purple-700/60 flex items-center justify-center">
            <Package className="w-7 h-7 text-magic-gold-300" />
          </div>
          <div>
            <p className="text-sm text-magic-gold-100/60">材料总数</p>
            <p className="font-display font-bold text-2xl text-magic-gold-200">
              {stats.totalMaterials.toLocaleString()}
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="magic-card rune-border p-5 flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-xl bg-magic-purple-700/60 flex items-center justify-center">
            <Star className="w-7 h-7 text-magic-gold-300" />
          </div>
          <div>
            <p className="text-sm text-magic-gold-100/60">纹身总数</p>
            <p className="font-display font-bold text-2xl text-magic-gold-200">
              {stats.totalTattoos}
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="magic-card rune-border p-5 flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-xl bg-magic-purple-700/60 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-magic-gold-300" />
          </div>
          <div>
            <p className="text-sm text-magic-gold-100/60">平均魔力加成</p>
            <p className="font-display font-bold text-2xl text-magic-gold-200">
              +{stats.avgPower}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="magic-card rune-border p-6">
        <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          材料仓库
        </h2>
        <div className="flex gap-2 mb-5">
          {tabConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
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
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMaterials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
          {filteredMaterials.length === 0 && (
            <div className="col-span-full py-12 text-center text-magic-gold-100/50">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无{tabConfig.find((t) => t.key === activeTab)?.label}材料</p>
            </div>
          )}
        </div>
      </div>

      <div className="magic-card rune-border p-6">
        <h2 className="font-display font-bold text-xl text-magic-gold-300 mb-5 flex items-center gap-2">
          <Star className="w-5 h-5" />
          作品展示墙
        </h2>
        {tattoos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {tattoos.map((tattoo) => (
              <TattooCard key={tattoo.id} tattoo={tattoo} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Scroll className="w-16 h-16 mx-auto mb-4 text-magic-gold-400/40" />
            <p className="text-magic-gold-100/60 mb-4">还没有作品，去绘制你的第一个纹身吧！</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreate}
              className="magic-btn inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              开始绘制
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
