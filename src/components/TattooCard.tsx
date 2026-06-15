import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Shield,
  Eye,
  Wind,
  Droplets,
  CloudLightning,
  RotateCcw,
} from 'lucide-react';
import { Tattoo, TattooAffix, AffixType } from '@/types';
import { cn } from '@/lib/utils';

interface TattooCardProps {
  tattoo: Tattoo;
  onClick?: () => void;
}

const affixIcons: Record<AffixType, React.ElementType> = {
  frenzy: Zap,
  guardian: Shield,
  dazzle: Eye,
  swift: Wind,
  vampire: Droplets,
  thunder: CloudLightning,
};

const affixColors: Record<AffixType, string> = {
  frenzy: 'text-magic-blood-400 bg-magic-blood-500/20 border-magic-blood-500/30',
  guardian: 'text-magic-blue-400 bg-magic-blue-500/20 border-magic-blue-500/30',
  dazzle: 'text-magic-gold-400 bg-magic-gold-500/20 border-magic-gold-500/30',
  swift: 'text-magic-green-400 bg-magic-green-500/20 border-magic-green-500/30',
  vampire: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  thunder: 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30',
};

function AffixTag({ affix }: { affix: TattooAffix }) {
  const Icon = affixIcons[affix.type];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-display border',
        affixColors[affix.type]
      )}
    >
      <Icon size={12} />
      {affix.name} +{affix.value}
    </span>
  );
}

export default function TattooCard({ tattoo, onClick }: TattooCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const maxAffixRarity = tattoo.affixes.length >= 4 ? 'legendary' :
    tattoo.affixes.length >= 3 ? 'epic' :
    tattoo.affixes.length >= 2 ? 'rare' :
    tattoo.powerBonus >= 80 ? 'uncommon' : 'common';

  const cardBorderClass = {
    common: 'border-gray-400/30',
    uncommon: 'border-green-400/40',
    rare: 'border-blue-400/40',
    epic: 'border-purple-400/50',
    legendary: 'border-amber-400/60',
  }[maxAffixRarity];

  const cardGlowClass = {
    common: 'shadow-[0_0_15px_rgba(156,163,175,0.15)]',
    uncommon: 'shadow-[0_0_20px_rgba(34,197,94,0.25)]',
    rare: 'shadow-[0_0_25px_rgba(59,130,246,0.3)]',
    epic: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]',
    legendary: 'shadow-[0_0_40px_rgba(245,158,11,0.5)]',
  }[maxAffixRarity];

  const gradientColors = [
    ['#8b5cf6', '#eab308'],
    ['#ec4899', '#8b5cf6'],
    ['#06b6d4', '#8b5cf6'],
    ['#f59e0b', '#ef4444'],
    ['#22c55e', '#3b82f6'],
  ];
  const colorIndex = tattoo.imageSeed % gradientColors.length;
  const [color1, color2] = gradientColors[colorIndex];

  return (
    <div
      className="perspective-1000 w-full"
      style={{ perspective: '1000px' }}
      onClick={onClick}
    >
      <motion.div
        className="relative w-full h-72 cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className={cn(
            'absolute inset-0 rounded-xl overflow-hidden backface-hidden',
            'bg-gradient-to-br from-magic-purple-900/80 to-magic-purple-950/95',
            'border-2 backdrop-blur-sm transition-all duration-300',
            cardBorderClass,
            cardGlowClass,
            'hover:scale-[1.02]'
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div
            className="relative h-36 bg-gradient-to-br from-magic-purple-800/60 to-magic-purple-950/80 flex items-center justify-center overflow-hidden"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 30%, ${color1}40 0%, transparent 50%), radial-gradient(circle at 70% 70%, ${color2}40 0%, transparent 50%)`,
            }}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${color1}60, ${color2}60)`,
                boxShadow: `0 0 40px ${color1}40, 0 0 80px ${color2}30`,
              }}
            >
              <Sparkles size={40} className="text-magic-gold-300" />
            </div>

            <button
              onClick={handleFlip}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-magic-purple-900/80 border border-magic-gold-500/30 text-magic-gold-300 hover:text-magic-gold-100 transition-colors"
            >
              <RotateCcw size={14} />
            </button>

            {maxAffixRarity === 'legendary' && (
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="absolute inset-0 animate-shimmer opacity-30"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${color1}40, transparent)`,
                    backgroundSize: '200% 100%',
                  }}
                />
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-display font-bold text-lg text-magic-gold-200 mb-1 truncate">
              {tattoo.name}
            </h3>
            <p className="text-xs text-magic-purple-300/70 mb-3">
              {tattoo.patternName}
            </p>

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-magic-purple-300">魔力加成</span>
              <div className="flex items-center gap-1">
                <Sparkles size={14} className="text-magic-gold-400" />
                <span className="font-display font-bold text-magic-gold-300">
                  +{tattoo.powerBonus}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tattoo.affixes.slice(0, 2).map((affix, idx) => (
                <AffixTag key={idx} affix={affix} />
              ))}
              {tattoo.affixes.length > 2 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs text-magic-purple-300 bg-magic-purple-800/50 border border-magic-purple-500/30">
                  +{tattoo.affixes.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          className={cn(
            'absolute inset-0 rounded-xl overflow-hidden',
            'bg-gradient-to-br from-magic-purple-950/95 to-magic-purple-900/90',
            'border-2 backdrop-blur-sm p-4',
            cardBorderClass,
            cardGlowClass
          )}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <button
            onClick={handleFlip}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-magic-purple-900/80 border border-magic-gold-500/30 text-magic-gold-300 hover:text-magic-gold-100 transition-colors z-10"
          >
            <RotateCcw size={14} />
          </button>

          <h3 className="font-display font-bold text-base text-magic-gold-300 mb-3 pr-8">
            {tattoo.name}
          </h3>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-magic-purple-300">图案</span>
              <span className="text-magic-gold-200 font-display">{tattoo.patternName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-magic-purple-300">魔力加成</span>
              <span className="text-magic-gold-300 font-display font-bold">+{tattoo.powerBonus}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-magic-purple-300">特殊效果</span>
              <span className="text-magic-gold-300 font-display">
                {(tattoo.specialEffectChance * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="border-t border-magic-gold-500/20 pt-3">
            <h4 className="text-xs font-display text-magic-gold-400 mb-2">词缀列表</h4>
            <div className="space-y-1.5">
              {tattoo.affixes.map((affix, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <AffixTag affix={affix} />
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-3 left-4 right-4 text-xs text-magic-purple-400/60 text-center font-display">
            点击翻转返回
          </div>
        </div>
      </motion.div>
    </div>
  );
}
