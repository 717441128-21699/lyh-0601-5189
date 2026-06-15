import { Rarity } from '@/types';
import { cn } from '@/lib/utils';

interface RarityBadgeProps {
  rarity: Rarity;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const rarityConfig: Record<Rarity, { label: string; textClass: string; bgClass: string; borderClass: string; glowClass: string }> = {
  common: {
    label: '普通',
    textClass: 'text-rarity-common',
    bgClass: 'bg-gray-500/20',
    borderClass: 'border-gray-400/40',
    glowClass: 'rarity-glow-common',
  },
  uncommon: {
    label: '优秀',
    textClass: 'text-rarity-uncommon',
    bgClass: 'bg-green-500/20',
    borderClass: 'border-green-400/40',
    glowClass: 'rarity-glow-uncommon',
  },
  rare: {
    label: '稀有',
    textClass: 'text-rarity-rare',
    bgClass: 'bg-blue-500/20',
    borderClass: 'border-blue-400/40',
    glowClass: 'rarity-glow-rare',
  },
  epic: {
    label: '史诗',
    textClass: 'text-rarity-epic',
    bgClass: 'bg-purple-500/20',
    borderClass: 'border-purple-400/40',
    glowClass: 'rarity-glow-epic',
  },
  legendary: {
    label: '传说',
    textClass: 'text-rarity-legendary',
    bgClass: 'bg-amber-500/20',
    borderClass: 'border-amber-400/40',
    glowClass: 'rarity-glow-legendary',
  },
};

const sizeConfig = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export default function RarityBadge({ rarity, showLabel = true, size = 'md' }: RarityBadgeProps) {
  const config = rarityConfig[rarity];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-display font-bold border backdrop-blur-sm',
        config.textClass,
        config.bgClass,
        config.borderClass,
        config.glowClass,
        sizeConfig[size]
      )}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          rarity === 'common' && 'bg-gray-400',
          rarity === 'uncommon' && 'bg-green-400',
          rarity === 'rare' && 'bg-blue-400',
          rarity === 'epic' && 'bg-purple-400',
          rarity === 'legendary' && 'bg-amber-400 animate-pulse'
        )}
      />
      {showLabel && config.label}
    </span>
  );
}
