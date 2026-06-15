import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import type { Material, Tattoo, MaterialType, Rarity, TattooAffix } from '@/types';
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
  Heart,
  Tag,
  Filter,
  ArrowUpDown,
  X,
  Search,
  Clock,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

type SortType = 'newest' | 'oldest' | 'power-high' | 'power-low';

interface FilterState {
  affixType: string | null;
  sortBy: SortType;
  favoritesOnly: boolean;
  searchQuery: string;
}

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

interface TattooCardProps {
  tattoo: Tattoo;
  isNew: boolean;
  onToggleFavorite: () => void;
  onUpdateTags: (tags: string[]) => void;
  cardRef: (el: HTMLDivElement | null) => void;
}

function TattooCard({ tattoo, isNew, onToggleFavorite, onUpdateTags, cardRef }: TattooCardProps) {
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tattoo.tags?.includes(trimmed)) {
      const newTags = [...(tattoo.tags || []), trimmed];
      onUpdateTags(newTags);
    }
    setTagInput('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tattoo.tags?.filter((t) => t !== tagToRemove) || [];
    onUpdateTags(newTags);
  };

  useEffect(() => {
    if (showTagInput && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [showTagInput]);

  return (
    <motion.div
      ref={cardRef}
      initial={isNew ? { scale: 0.9, opacity: 0 } : {}}
      animate={isNew ? { scale: 1, opacity: 1 } : {}}
      transition={isNew ? { type: 'spring', stiffness: 300, damping: 20 } : {}}
      whileHover={{ scale: 1.03, y: -4 }}
      className={`relative p-4 rounded-lg bg-magic-purple-900/50 border overflow-hidden group ${
        isNew
          ? 'border-magic-gold-400 ring-2 ring-magic-gold-400/50 shadow-lg shadow-magic-gold-500/20'
          : 'border-magic-gold-500/30'
      }`}
    >
      {isNew && (
        <div className="absolute top-2 right-2 z-10">
          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold animate-pulse">
            NEW
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-br from-magic-purple-600/20 via-transparent to-magic-gold-500/10 opacity-60" />

      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <div className="w-full aspect-square rounded-lg bg-magic-purple-800/60 flex flex-col items-center justify-center mb-3 border border-magic-gold-500/20">
            <Scroll className="w-10 h-10 text-magic-gold-400 mb-1" />
            <p className="font-display text-[10px] text-magic-gold-300/70">
              {tattoo.patternName}
            </p>
          </div>
        </div>

        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display font-bold text-magic-gold-100 text-sm line-clamp-1 flex-1 pr-2">
            {tattoo.name}
          </h3>
          <button
            onClick={onToggleFavorite}
            className={`p-1 rounded transition-colors ${
              tattoo.isFavorite
                ? 'text-rose-400 hover:text-rose-300'
                : 'text-magic-gold-100/30 hover:text-rose-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${tattoo.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1 mb-2 min-h-[20px]">
          {tattoo.affixes.map((affix, idx) => (
            <span
              key={idx}
              className="text-[10px] px-1.5 py-0.5 rounded bg-magic-purple-700/60 text-magic-gold-200 border border-magic-gold-500/20"
            >
              {affix.name}+{affix.value}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-1 mb-2 min-h-[20px]">
          {tattoo.tags?.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-0.5 hover:text-rose-300"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          {showTagInput ? (
            <div className="flex items-center gap-1">
              <input
                ref={tagInputRef}
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag();
                  if (e.key === 'Escape') setShowTagInput(false);
                }}
                onBlur={handleAddTag}
                placeholder="标签"
                className="w-16 text-[10px] px-1.5 py-0.5 rounded bg-magic-purple-800/80 border border-cyan-500/50 text-cyan-200 placeholder-cyan-400/50 focus:outline-none"
              />
            </div>
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-magic-purple-700/40 text-magic-gold-300/50 border border-magic-gold-500/20 hover:text-cyan-300 hover:border-cyan-500/30 transition-colors"
            >
              <Plus className="w-2.5 h-2.5" />
              标签
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-magic-gold-100/50">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-magic-gold-300" />
              <span className="text-magic-gold-300 font-semibold">+{tattoo.powerBonus}</span>
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              {(tattoo.specialEffectChance * 100).toFixed(0)}%
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(tattoo.createdAt)}
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
  const latestCreatedTattooId = useGameStore((s) => s.latestCreatedTattooId);
  const setCurrentPage = useGameStore((s) => s.setCurrentPage);
  const toggleTattooFavorite = useGameStore((s) => s.toggleTattooFavorite);
  const updateTattooTags = useGameStore((s) => s.updateTattooTags);
  const clearLatestCreatedTattooId = useGameStore((s) => s.clearLatestCreatedTattooId);

  const [activeTab, setActiveTab] = useState<MaterialType>('pigment');
  const [filters, setFilters] = useState<FilterState>({
    affixType: null,
    sortBy: 'newest',
    favoritesOnly: false,
    searchQuery: '',
  });
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const tattooRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const allAffixTypes = useMemo(() => {
    const types = new Set<string>();
    tattoos.forEach((t) => {
      t.affixes.forEach((a) => types.add(a.name));
    });
    return Array.from(types).sort();
  }, [tattoos]);

  const filteredMaterials = useMemo(
    () => materials.filter((m) => m.type === activeTab && m.quantity > 0),
    [materials, activeTab]
  );

  const filteredTattoos = useMemo(() => {
    let result = [...tattoos];

    if (filters.favoritesOnly) {
      result = result.filter((t) => t.isFavorite);
    }

    if (filters.affixType) {
      result = result.filter((t) => t.affixes.some((a) => a.name === filters.affixType));
    }

    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.patternName.toLowerCase().includes(query) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'oldest':
        result.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'power-high':
        result.sort((a, b) => b.powerBonus - a.powerBonus);
        break;
      case 'power-low':
        result.sort((a, b) => a.powerBonus - b.powerBonus);
        break;
    }

    return result;
  }, [tattoos, filters]);

  const stats = useMemo(() => {
    const totalMaterials = materials.reduce((sum, m) => sum + m.quantity, 0);
    const totalTattoos = tattoos.length;
    const avgPower = totalTattoos > 0
      ? Math.round(tattoos.reduce((sum, t) => sum + t.powerBonus, 0) / totalTattoos)
      : 0;
    const favoriteCount = tattoos.filter((t) => t.isFavorite).length;
    return { totalMaterials, totalTattoos, avgPower, favoriteCount };
  }, [materials, tattoos]);

  const handleCreate = () => {
    setCurrentPage('workshop-create');
    navigate('/workshop/create');
  };

  const setCardRef = (tattooId: string) => (el: HTMLDivElement | null) => {
    tattooRefs.current.set(tattooId, el);
  };

  useEffect(() => {
    if (latestCreatedTattooId) {
      setHighlightedId(latestCreatedTattooId);

      const timer = setTimeout(() => {
        const card = tattooRefs.current.get(latestCreatedTattooId);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
      }, 100);

      const clearTimer = setTimeout(() => {
        clearLatestCreatedTattooId();
        setHighlightedId(null);
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [latestCreatedTattooId, clearLatestCreatedTattooId]);

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <p className="text-sm text-magic-gold-100/60">平均魔力</p>
            <p className="font-display font-bold text-2xl text-magic-gold-200">
              +{stats.avgPower}
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="magic-card rune-border p-5 flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-xl bg-magic-purple-700/60 flex items-center justify-center">
            <Heart className="w-7 h-7 text-rose-400" />
          </div>
          <div>
            <p className="text-sm text-magic-gold-100/60">收藏数量</p>
            <p className="font-display font-bold text-2xl text-rose-300">
              {stats.favoriteCount}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <h2 className="font-display font-bold text-xl text-magic-gold-300 flex items-center gap-2">
            <Star className="w-5 h-5" />
            作品展示墙
            <span className="ml-2 text-sm font-normal text-magic-gold-100/50">
              共 {filteredTattoos.length} 件
            </span>
          </h2>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-magic-gold-100/40" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                placeholder="搜索作品..."
                className="pl-9 pr-3 py-2 rounded-lg bg-magic-purple-900/40 border border-magic-gold-500/20 text-magic-gold-100 text-sm placeholder-magic-gold-100/40 focus:outline-none focus:border-magic-gold-500/50 w-40"
              />
            </div>

            <select
              value={filters.affixType || ''}
              onChange={(e) => setFilters({ ...filters, affixType: e.target.value || null })}
              className="px-3 py-2 rounded-lg bg-magic-purple-900/40 border border-magic-gold-500/20 text-magic-gold-100 text-sm focus:outline-none focus:border-magic-gold-500/50"
            >
              <option value="">全部词缀</option>
              {allAffixTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as SortType })}
              className="px-3 py-2 rounded-lg bg-magic-purple-900/40 border border-magic-gold-500/20 text-magic-gold-100 text-sm focus:outline-none focus:border-magic-gold-500/50"
            >
              <option value="newest">最新创建</option>
              <option value="oldest">最早创建</option>
              <option value="power-high">魔力从高到低</option>
              <option value="power-low">魔力从低到高</option>
            </select>

            <button
              onClick={() => setFilters({ ...filters, favoritesOnly: !filters.favoritesOnly })}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-all ${
                filters.favoritesOnly
                  ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
                  : 'bg-magic-purple-900/40 border border-magic-gold-500/20 text-magic-gold-100 hover:border-magic-gold-500/40'
              }`}
            >
              <Heart className={`w-4 h-4 ${filters.favoritesOnly ? 'fill-current' : ''}`} />
              仅收藏
            </button>
          </div>
        </div>

        {filteredTattoos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredTattoos.map((tattoo) => (
              <TattooCard
                key={tattoo.id}
                tattoo={tattoo}
                isNew={highlightedId === tattoo.id}
                onToggleFavorite={() => toggleTattooFavorite(tattoo.id)}
                onUpdateTags={(tags) => updateTattooTags(tattoo.id, tags)}
                cardRef={setCardRef(tattoo.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Scroll className="w-16 h-16 mx-auto mb-4 text-magic-gold-400/40" />
            <p className="text-magic-gold-100/60 mb-4">
              {tattoos.length === 0 ? '还没有作品，去绘制你的第一个纹身吧！' : '没有符合条件的作品'}
            </p>
            {tattoos.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCreate}
                className="magic-btn inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                开始绘制
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
