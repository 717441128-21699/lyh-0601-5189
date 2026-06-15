import {
  Droplets,
  Pencil,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { Material } from '@/types';
import RarityBadge from './RarityBadge';
import { cn } from '@/lib/utils';

interface MaterialCardProps {
  material: Material;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
}

const typeIcons = {
  pigment: Droplets,
  needle: Pencil,
  pattern: ImageIcon,
};

const typeLabels = {
  pigment: '颜料',
  needle: '纹身针',
  pattern: '图案',
};

export default function MaterialCard({ material, onClick, selected = false, compact = false }: MaterialCardProps) {
  const TypeIcon = typeIcons[material.type];

  const rarityGlowClass = {
    common: 'shadow-[0_0_15px_rgba(156,163,175,0.2)]',
    uncommon: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    rare: 'shadow-[0_0_25px_rgba(59,130,246,0.35)]',
    epic: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]',
    legendary: 'shadow-[0_0_35px_rgba(245,158,11,0.5)] animate-pulse',
  }[material.rarity];

  const rarityBorderClass = {
    common: 'border-gray-400/30',
    uncommon: 'border-green-400/40',
    rare: 'border-blue-400/40',
    epic: 'border-purple-400/50',
    legendary: 'border-amber-400/60',
  }[material.rarity];

  const rarityTextClass = {
    common: 'text-gray-300',
    uncommon: 'text-green-300',
    rare: 'text-blue-300',
    epic: 'text-purple-300',
    legendary: 'text-amber-300',
  }[material.rarity];

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'relative w-full p-2 rounded-lg transition-all duration-300',
          'bg-gradient-to-br from-magic-purple-900/60 to-magic-purple-950/80',
          'border backdrop-blur-sm',
          rarityBorderClass,
          rarityGlowClass,
          selected ? 'ring-2 ring-magic-gold-400 scale-105' : 'hover:scale-102',
          onClick && 'cursor-pointer hover:brightness-110',
          !onClick && 'cursor-default'
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-md',
              'bg-magic-purple-800/50 border',
              rarityBorderClass
            )}
          >
            <TypeIcon size={16} className={rarityTextClass} />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="font-display font-semibold text-sm text-magic-gold-100 truncate">
              {material.name}
            </div>
            <div className="text-xs text-magic-purple-300">
              x{material.quantity}
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-4 rounded-xl transition-all duration-300 magic-card',
        'border backdrop-blur-sm overflow-hidden',
        rarityBorderClass,
        rarityGlowClass,
        selected && 'ring-2 ring-magic-gold-400',
        onClick && 'cursor-pointer hover:scale-[1.02] hover:brightness-110',
        !onClick && 'cursor-default'
      )}
    >
      {material.rarity === 'legendary' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent animate-shimmer" />
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'flex items-center justify-center w-14 h-14 rounded-lg',
            'bg-gradient-to-br from-magic-purple-800/60 to-magic-purple-900/80',
            'border-2',
            rarityBorderClass
          )}
        >
          <TypeIcon size={28} className={rarityTextClass} />
        </div>
        <RarityBadge rarity={material.rarity} size="sm" />
      </div>

      <h3 className={cn('font-display font-bold text-base mb-1', rarityTextClass)}>
        {material.name}
      </h3>

      <div className="text-xs text-magic-purple-300/70 mb-3">
        {typeLabels[material.type]}
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-magic-purple-300">品质</span>
        <div className="flex items-center gap-1">
          <Sparkles size={12} className="text-magic-gold-400" />
          <span className="font-display font-semibold text-magic-gold-300 text-sm">
            {material.quality}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-magic-purple-300">数量</span>
        <span className="font-display font-bold text-magic-gold-200 text-lg">
          x{material.quantity}
        </span>
      </div>
    </div>
  );
}
