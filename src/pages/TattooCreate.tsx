import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import { calculateTattooPower, generateRandomAffixes } from '@/utils/gameEngine';
import type { Material, Tattoo, TattooAffix, MaterialType, Rarity } from '@/types';
import {
  Palette,
  Paintbrush,
  Scroll,
  Sparkles,
  Wand2,
  ArrowLeft,
  Check,
  X,
  Zap,
  Shield,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const rarityLabel: Record<Rarity, string> = {
  common: '普通',
  uncommon: '优秀',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const selectorConfig: { key: MaterialType; label: string; icon: typeof Palette }[] = [
  { key: 'pigment', label: '颜料', icon: Palette },
  { key: 'needle', label: '纹针', icon: Paintbrush },
  { key: 'pattern', label: '图案', icon: Scroll },
];

function MaterialSelector({
  type,
  materials,
  selected,
  onSelect,
}: {
  type: MaterialType;
  materials: Material[];
  selected: Material | null;
  onSelect: (m: Material) => void;
}) {
  const config = selectorConfig.find((c) => c.key === type)!;
  const Icon = config.icon;
  const filtered = materials.filter((m) => m.type === type && m.quantity > 0);

  return (
    <div className="magic-card rune-border p-5">
      <h3 className="font-display font-bold text-lg text-magic-gold-300 mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5" />
        {config.label}选择
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto scroll-container pr-1">
        {filtered.map((material) => {
          const isSelected = selected?.id === material.id;
          return (
            <motion.button
              key={material.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(material)}
              className={`relative p-3 rounded-lg text-left transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-magic-purple-600/60 to-magic-purple-700/60 border-2 border-magic-gold-400 shadow-lg shadow-magic-gold-500/20'
                  : 'bg-magic-purple-900/40 border border-magic-gold-500/15 hover:border-magic-gold-500/40'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-magic-gold-400 flex items-center justify-center">
                  <Check className="w-3 h-3 text-magic-purple-950" />
                </div>
              )}
              <div className="text-2xl mb-1">{material.icon}</div>
              <p className="font-display text-sm font-semibold text-magic-gold-100 line-clamp-1">
                {material.name}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-[10px] text-rarity-${material.rarity} font-display`}>
                  {rarityLabel[material.rarity]}
                </span>
                <span className="text-xs text-magic-gold-100/70">x{material.quantity}</span>
              </div>
            </motion.button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-6 text-center text-magic-gold-100/50 text-sm">
            暂无可用{config.label}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TattooCreate() {
  const navigate = useNavigate();
  const materials = useGameStore((s) => s.materials);
  const player = useGameStore((s) => s.player);
  const addTattoo = useGameStore((s) => s.addTattoo);
  const removeMaterial = useGameStore((s) => s.removeMaterial);
  const setCurrentPage = useGameStore((s) => s.setCurrentPage);

  const [selectedPigment, setSelectedPigment] = useState<Material | null>(null);
  const [selectedNeedle, setSelectedNeedle] = useState<Material | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<Material | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawProgress, setDrawProgress] = useState(0);
  const [drawResult, setDrawResult] = useState<{
    success: boolean;
    tattoo: Tattoo | null;
    affixes: TattooAffix[];
  } | null>(null);

  const canDraw = selectedPigment && selectedNeedle && selectedPattern && !isDrawing;

  const preview = useMemo(() => {
    if (!selectedPigment || !selectedNeedle || !selectedPattern) return null;
    return calculateTattooPower(selectedPigment, selectedNeedle, selectedPattern, player.workshopLevel);
  }, [selectedPigment, selectedNeedle, selectedPattern, player.workshopLevel]);

  useEffect(() => {
    if (!isDrawing) return;
    const interval = setInterval(() => {
      setDrawProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isDrawing]);

  useEffect(() => {
    if (drawProgress >= 100 && isDrawing && selectedPigment && selectedNeedle && selectedPattern) {
      const result = calculateTattooPower(selectedPigment, selectedNeedle, selectedPattern, player.workshopLevel);
      const success = Math.random() < result.successRate;

      let affixes: TattooAffix[] = [];
      let newTattoo: Tattoo | null = null;

      removeMaterial(selectedPigment.id, 1);
      removeMaterial(selectedNeedle.id, 1);
      removeMaterial(selectedPattern.id, 1);

      if (success) {
        affixes = generateRandomAffixes(result.expectedAffixes, selectedPattern.rarity);
        newTattoo = {
          id: `tattoo-${Date.now()}`,
          name: `${selectedPattern.name.replace(/卷轴|图|纹|符文|花纹$/, '')}之纹`,
          patternName: selectedPattern.name,
          pigmentId: selectedPigment.id,
          needleId: selectedNeedle.id,
          patternId: selectedPattern.id,
          powerBonus: result.powerBonus,
          specialEffectChance: result.specialEffectChance,
          affixes,
          createdAt: Date.now(),
          imageSeed: Math.floor(Math.random() * 1000),
        };
        addTattoo(newTattoo);
      }

      setDrawResult({ success, tattoo: newTattoo, affixes });
      setIsDrawing(false);
      setSelectedPigment(null);
      setSelectedNeedle(null);
      setSelectedPattern(null);
    }
  }, [drawProgress, isDrawing, selectedPigment, selectedNeedle, selectedPattern, player.workshopLevel, addTattoo, removeMaterial]);

  const handleDraw = () => {
    if (!canDraw) return;
    setIsDrawing(true);
    setDrawProgress(0);
    setDrawResult(null);
  };

  const handleBack = () => {
    setCurrentPage('workshop');
    navigate('/workshop');
  };

  const handleReset = () => {
    setDrawResult(null);
    setDrawProgress(0);
    setSelectedPigment(null);
    setSelectedNeedle(null);
    setSelectedPattern(null);
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="p-2 rounded-lg bg-magic-purple-900/50 border border-magic-gold-500/20 text-magic-gold-300 hover:border-magic-gold-500/40 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <h1 className="font-display font-bold text-3xl text-magic-gold-200 flex items-center gap-3">
            <Wand2 className="w-8 h-8" />
            纹身绘制台
          </h1>
          <p className="text-magic-gold-100/60 mt-1">选择材料，绘制你的专属魔法纹身</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!drawResult ? (
          <motion.div
            key="drawing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-5">
              <MaterialSelector
                type="pigment"
                materials={materials}
                selected={selectedPigment}
                onSelect={setSelectedPigment}
              />
              <MaterialSelector
                type="needle"
                materials={materials}
                selected={selectedNeedle}
                onSelect={setSelectedNeedle}
              />
              <MaterialSelector
                type="pattern"
                materials={materials}
                selected={selectedPattern}
                onSelect={setSelectedPattern}
              />
            </div>

            <div className="space-y-5">
              <div className="magic-card rune-border p-6">
                <h3 className="font-display font-bold text-lg text-magic-gold-300 mb-5 text-center">
                  魔法阵预览
                </h3>
                <div className="relative aspect-square rounded-xl bg-magic-purple-950/80 border-2 border-magic-gold-500/30 overflow-hidden mb-5">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: isDrawing ? 360 : 0 }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                      className="relative w-3/4 h-3/4"
                    >
                      <div className="absolute inset-0 rounded-full border-2 border-magic-gold-400/30" />
                      <div className="absolute inset-4 rounded-full border border-magic-gold-400/40" />
                      <div className="absolute inset-8 rounded-full border border-magic-gold-400/50" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        {preview ? (
                          <div className="text-center">
                            <Sparkles className="w-12 h-12 mx-auto text-magic-gold-400 mb-2 animate-pulse" />
                            <p className="font-display font-bold text-2xl text-magic-gold-300">
                              +{preview.powerBonus}
                            </p>
                            <p className="text-xs text-magic-gold-100/60">魔力加成</p>
                          </div>
                        ) : (
                          <div className="text-center text-magic-gold-100/40">
                            <Scroll className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">请选择材料</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                  {isDrawing && (
                    <div className="absolute inset-0 bg-magic-purple-500/10 animate-pulse" />
                  )}
                </div>

                {preview && (
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-magic-gold-100/70 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> 魔力加成
                      </span>
                      <span className="font-display font-bold text-magic-gold-300">+{preview.powerBonus}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-magic-gold-100/70 flex items-center gap-1.5">
                        <Shield className="w-4 h-4" /> 成功率
                      </span>
                      <span className="font-display font-bold text-emerald-300">{(preview.successRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-magic-gold-100/70 flex items-center gap-1.5">
                        <Zap className="w-4 h-4" /> 特殊效果
                      </span>
                      <span className="font-display font-bold text-amber-300">{(preview.specialEffectChance * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-magic-gold-100/70 flex items-center gap-1.5">
                        <Star className="w-4 h-4" /> 预期词缀
                      </span>
                      <span className="font-display font-bold text-fuchsia-300">{preview.expectedAffixes} 个</span>
                    </div>
                  </div>
                )}

                {isDrawing && (
                  <div className="mb-5">
                    <div className="flex justify-between text-sm text-magic-gold-100/70 mb-2">
                      <span>绘制中...</span>
                      <span>{drawProgress}%</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        className="progress-bar-fill"
                        initial={{ width: '0%' }}
                        animate={{ width: `${drawProgress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={canDraw ? { scale: 1.03 } : {}}
                  whileTap={canDraw ? { scale: 0.97 } : {}}
                  onClick={handleDraw}
                  disabled={!canDraw}
                  className="magic-btn-gold w-full flex items-center justify-center gap-2 py-3"
                >
                  <Wand2 className="w-5 h-5" />
                  {isDrawing ? '绘制中...' : '开始绘制'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="magic-card rune-border p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  drawResult.success
                    ? 'bg-emerald-500/20 border-2 border-emerald-400'
                    : 'bg-rose-500/20 border-2 border-rose-400'
                }`}
              >
                {drawResult.success ? (
                  <Check className="w-12 h-12 text-emerald-400" />
                ) : (
                  <X className="w-12 h-12 text-rose-400" />
                )}
              </motion.div>

              <h2 className="font-display font-bold text-3xl mb-3">
                {drawResult.success ? (
                  <span className="text-emerald-300">绘制成功！</span>
                ) : (
                  <span className="text-rose-300">绘制失败</span>
                )}
              </h2>

              {drawResult.success && drawResult.tattoo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6"
                >
                  <div className="w-32 h-32 mx-auto mb-4 rounded-xl bg-magic-purple-900/60 border-2 border-magic-gold-500/40 flex flex-col items-center justify-center">
                    <Scroll className="w-12 h-12 text-magic-gold-400 mb-1" />
                    <Sparkles className="w-5 h-5 text-magic-gold-300" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-magic-gold-200 mb-1">
                    {drawResult.tattoo.name}
                  </h3>
                  <p className="text-magic-gold-100/70 mb-3">
                    魔力加成 <span className="text-magic-gold-300 font-bold">+{drawResult.tattoo.powerBonus}</span>
                  </p>
                  {drawResult.affixes.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2">
                      {drawResult.affixes.map((affix, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                          className="px-3 py-1.5 rounded-full bg-magic-purple-700/60 text-magic-gold-200 border border-magic-gold-500/30 font-display text-sm"
                        >
                          {affix.name}+{affix.value}
                        </motion.span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {!drawResult.success && (
                <p className="text-magic-gold-100/60 mb-6">
                  材料已消耗，下次再接再厉！
                </p>
              )}

              <div className="flex justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  className="magic-btn flex items-center gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  继续绘制
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBack}
                  className="magic-btn-gold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回工坊
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
