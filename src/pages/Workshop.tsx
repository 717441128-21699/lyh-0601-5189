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
  CheckSquare,
  Square,
  Check,
  Folder,
  ChevronDown,
  Edit3,
  Trash2,
  Info,
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
type GroupType = 'none' | 'favorite';

interface FilterState {
  affixType: string | null;
  sortBy: SortType;
  favoritesOnly: boolean;
  searchQuery: string;
  groupBy: GroupType;
}

interface BatchState {
  selectedIds: Set<string>;
  isSelectMode: boolean;
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
  isSelected: boolean;
  isSelectMode: boolean;
  onToggleFavorite: () => void;
  onUpdateTags: (tags: string[]) => void;
  onToggleSelect: () => void;
  cardRef: (el: HTMLDivElement | null) => void;
}

function TattooCard({
  tattoo,
  isNew,
  isSelected,
  isSelectMode,
  onToggleFavorite,
  onUpdateTags,
  onToggleSelect,
  cardRef,
}: TattooCardProps) {
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
      onClick={isSelectMode ? onToggleSelect : undefined}
      className={`relative p-4 rounded-lg bg-magic-purple-900/50 border overflow-hidden group transition-all ${
        isNew
          ? 'border-magic-gold-400 ring-2 ring-magic-gold-400/50 shadow-lg shadow-magic-gold-500/20'
          : isSelected
          ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-500/20'
          : 'border-magic-gold-500/30 hover:border-magic-gold-500/50'
      } ${isSelectMode ? 'cursor-pointer' : ''}`}
    >
      {isSelectMode && (
        <div className="absolute top-2 left-2 z-20">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
            isSelected
              ? 'bg-cyan-500 text-white'
              : 'bg-magic-purple-800/80 border border-magic-gold-500/30 text-magic-gold-100/50'
          }`}>
            {isSelected ? <Check className="w-4 h-4" /> : null}
          </div>
        </div>
      )}

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
          {!isSelectMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={`p-1 rounded transition-colors ${
                tattoo.isFavorite
                  ? 'text-rose-400 hover:text-rose-300'
                  : 'text-magic-gold-100/30 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${tattoo.isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
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
              {!isSelectMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(tag);
                  }}
                  className="ml-0.5 hover:text-rose-300"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </span>
          ))}
          {!isSelectMode && showTagInput ? (
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
          ) : !isSelectMode ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTagInput(true);
              }}
              className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-magic-purple-700/40 text-magic-gold-300/50 border border-magic-gold-500/20 hover:text-cyan-300 hover:border-cyan-500/30 transition-colors"
            >
              <Plus className="w-2.5 h-2.5" />
              标签
            </button>
          ) : null}
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
    groupBy: 'none',
  });
  const [batch, setBatch] = useState<BatchState>({
    selectedIds: new Set(),
    isSelectMode: false,
  });
  const [showBatchTagModal, setShowBatchTagModal] = useState(false);
  const [batchTagInput, setBatchTagInput] = useState('');
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

  const groupedTattoos = useMemo(() => {
    if (filters.groupBy === 'favorite') {
      const favorites = filteredTattoos.filter((t) => t.isFavorite);
      const nonFavorites = filteredTattoos.filter((t) => !t.isFavorite);
      return [
        { key: 'favorites', label: '我的收藏', tattoos: favorites, icon: Heart },
        { key: 'all', label: '全部作品', tattoos: nonFavorites, icon: Layers },
      ].filter((g) => g.tattoos.length > 0);
    }
    return [{ key: 'all', label: '全部作品', tattoos: filteredTattoos, icon: Layers }];
  }, [filteredTattoos, filters.groupBy]);

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

  const toggleSelect = (tattooId: string) => {
    setBatch((prev) => {
      const newSelected = new Set(prev.selectedIds);
      if (newSelected.has(tattooId)) {
        newSelected.delete(tattooId);
      } else {
        newSelected.add(tattooId);
      }
      return { ...prev, selectedIds: newSelected };
    });
  };

  const selectAll = () => {
    if (batch.selectedIds.size === filteredTattoos.length) {
      setBatch((prev) => ({ ...prev, selectedIds: new Set() }));
    } else {
      setBatch((prev) => ({
        ...prev,
        selectedIds: new Set(filteredTattoos.map((t) => t.id)),
      }));
    }
  };

  const exitSelectMode = () => {
    setBatch({ selectedIds: new Set(), isSelectMode: false });
  };

  const handleBatchAddTags = () => {
    const tags = batchTagInput
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tags.length === 0) return;

    batch.selectedIds.forEach((id) => {
      const tattoo = tattoos.find((t) => t.id === id);
      if (tattoo) {
        const existingTags = new Set(tattoo.tags || []);
        tags.forEach((tag) => existingTags.add(tag));
        updateTattooTags(id, Array.from(existingTags));
      }
    });

    setBatchTagInput('');
    setShowBatchTagModal(false);
    exitSelectMode();
  };

  const handleBatchRemoveFavorite = () => {
    batch.selectedIds.forEach((id) => {
      const tattoo = tattoos.find((t) => t.id === id);
      if (tattoo?.isFavorite) {
        toggleTattooFavorite(id);
      }
    });
    exitSelectMode();
  };

  useEffect(() => {
    if (latestCreatedTattooId) {
      setHighlightedId(latestCreatedTattooId);

      const tattoo = tattoos.find((t) => t.id === latestCreatedTattooId);
      if (tattoo) {
        const isVisibleInCurrentFilter =
          (!filters.favoritesOnly || tattoo.isFavorite) &&
          (!filters.affixType || tattoo.affixes.some((a) => a.name === filters.affixType)) &&
          (!filters.searchQuery.trim() ||
            tattoo.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
            tattoo.patternName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
            tattoo.tags?.some((tag) => tag.toLowerCase().includes(filters.searchQuery.toLowerCase())));

        if (!isVisibleInCurrentFilter) {
          setFilters((prev) => ({
            ...prev,
            favoritesOnly: false,
            affixType: null,
            searchQuery: '',
          }));
        }
      }

      const scrollTimer = setTimeout(() => {
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
        clearTimeout(scrollTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [latestCreatedTattooId, clearLatestCreatedTattooId, tattoos, filters]);

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
        <div className="flex gap-3">
          {batch.isSelectMode ? (
            <>
              <span className="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 font-display text-sm">
                已选择 {batch.selectedIds.size} / {filteredTattoos.length}
              </span>
              <button
                onClick={exitSelectMode}
                className="px-4 py-2 rounded-lg bg-magic-purple-800/40 border border-magic-gold-500/20 text-magic-gold-200 font-display hover:bg-magic-purple-700/40 transition-colors"
              >
                取消选择
              </button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setBatch((prev) => ({ ...prev, isSelectMode: true }))}
              className="px-4 py-2 rounded-lg bg-magic-purple-800/40 border border-magic-gold-500/20 text-magic-gold-200 font-display flex items-center gap-2 hover:bg-magic-purple-700/40 transition-colors"
            >
              <CheckSquare className="w-4 h-4" />
              批量管理
            </motion.button>
          )}
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
      </div>

      {batch.isSelectMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="magic-card rune-border p-4 bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 border-cyan-500/30"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={selectAll}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-magic-purple-800/60 border border-magic-gold-500/30 text-magic-gold-200 text-sm hover:bg-magic-purple-700/60 transition-colors"
              >
                {batch.selectedIds.size === filteredTattoos.length ? (
                  <><CheckSquare className="w-4 h-4" /> 取消全选</>
                ) : (
                  <><Square className="w-4 h-4" /> 全选</>
                )}
              </button>
              <span className="text-cyan-200 font-display">
                已选择 {batch.selectedIds.size} 件作品
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowBatchTagModal(true)}
                disabled={batch.selectedIds.size === 0}
                className="px-4 py-2 rounded-lg bg-cyan-600/30 border border-cyan-500/40 text-cyan-200 font-display text-sm flex items-center gap-2 hover:bg-cyan-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit3 className="w-4 h-4" />
                批量添加标签
              </button>
              <button
                onClick={handleBatchRemoveFavorite}
                disabled={batch.selectedIds.size === 0}
                className="px-4 py-2 rounded-lg bg-rose-600/30 border border-rose-500/40 text-rose-200 font-display text-sm flex items-center gap-2 hover:bg-rose-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                批量取消收藏
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showBatchTagModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowBatchTagModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="magic-card rune-border w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-magic-gold-500/20">
                <h2 className="font-display font-bold text-xl text-magic-gold-200 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-cyan-400" />
                  批量添加标签
                </h2>
                <button
                  onClick={() => setShowBatchTagModal(false)}
                  className="p-1.5 rounded-lg hover:bg-magic-purple-800/60 transition-colors"
                >
                  <X className="w-5 h-5 text-magic-gold-300" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm text-magic-gold-200 mb-2">
                    输入标签（多个标签用逗号或空格分隔）
                  </label>
                  <input
                    type="text"
                    value={batchTagInput}
                    onChange={(e) => setBatchTagInput(e.target.value)}
                    placeholder="例如：火焰, 力量, 守护"
                    className="w-full px-4 py-3 rounded-lg bg-magic-purple-800/60 border border-magic-gold-500/30 text-magic-gold-100 placeholder-magic-gold-100/40 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="p-3 rounded-lg bg-magic-purple-900/40 border border-magic-gold-500/10 flex items-start gap-2">
                  <Info className="w-4 h-4 text-magic-gold-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-magic-gold-100/60">
                    将为选中的 {batch.selectedIds.size} 件作品添加标签。已有的标签不会重复添加。
                  </p>
                </div>
              </div>
              <div className="p-5 border-t border-magic-gold-500/20 flex gap-3">
                <button
                  onClick={() => setShowBatchTagModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-magic-purple-800/40 border border-magic-gold-500/20 font-display font-semibold text-magic-gold-200 hover:bg-magic-purple-700/40 transition-colors"
                >
                  取消
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBatchAddTags}
                  disabled={!batchTagInput.trim()}
                  className="flex-1 py-2.5 rounded-lg magic-btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认添加
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

            <select
              value={filters.groupBy}
              onChange={(e) => setFilters({ ...filters, groupBy: e.target.value as GroupType })}
              className="px-3 py-2 rounded-lg bg-magic-purple-900/40 border border-magic-gold-500/20 text-magic-gold-100 text-sm focus:outline-none focus:border-magic-gold-500/50"
            >
              <option value="none">不分组</option>
              <option value="favorite">按收藏分组</option>
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

        {groupedTattoos.map((group) => {
          const GroupIcon = group.icon;
          return (
            <div key={group.key} className="mb-8 last:mb-0">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-magic-gold-500/20">
                <GroupIcon className="w-5 h-5 text-magic-gold-300" />
                <h3 className="font-display font-bold text-lg text-magic-gold-200">
                  {group.label}
                </h3>
                <span className="text-sm text-magic-gold-100/50">
                  ({group.tattoos.length} 件)
                </span>
              </div>
              {group.tattoos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {group.tattoos.map((tattoo) => (
                    <TattooCard
                      key={tattoo.id}
                      tattoo={tattoo}
                      isNew={highlightedId === tattoo.id}
                      isSelected={batch.selectedIds.has(tattoo.id)}
                      isSelectMode={batch.isSelectMode}
                      onToggleFavorite={() => toggleTattooFavorite(tattoo.id)}
                      onUpdateTags={(tags) => updateTattooTags(tattoo.id, tags)}
                      onToggleSelect={() => toggleSelect(tattoo.id)}
                      cardRef={setCardRef(tattoo.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-magic-gold-100/50">
                  <Scroll className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>暂无作品</p>
                </div>
              )}
            </div>
          );
        })}

        {filteredTattoos.length === 0 && tattoos.length > 0 && (
          <div className="py-12 text-center">
            <Scroll className="w-16 h-16 mx-auto mb-4 text-magic-gold-400/40" />
            <p className="text-magic-gold-100/60 mb-4">
              没有符合条件的作品
            </p>
            <button
              onClick={() => setFilters({
                affixType: null,
                sortBy: 'newest',
                favoritesOnly: false,
                searchQuery: '',
                groupBy: 'none',
              })}
              className="px-4 py-2 rounded-lg magic-btn"
            >
              重置筛选条件
            </button>
          </div>
        )}

        {tattoos.length === 0 && (
          <div className="py-16 text-center">
            <Scroll className="w-16 h-16 mx-auto mb-4 text-magic-gold-400/40" />
            <p className="text-magic-gold-100/60 mb-4">
              还没有作品，去绘制你的第一个纹身吧！
            </p>
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
