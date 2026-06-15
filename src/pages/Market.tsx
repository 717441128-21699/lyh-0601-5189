import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { suggestMarketPrice } from '@/utils/gameEngine';
import type { MarketListing, Material, MaterialType, Rarity } from '@/types';
import RarityBadge from '@/components/RarityBadge';
import {
  Store,
  User,
  ShoppingCart,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Coins,
  Package,
  Scroll,
  Droplets,
  Pencil,
  Image as ImageIcon,
  Sparkles,
  History,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type MarketTab = 'all' | 'pigment' | 'needle' | 'pattern' | 'stall';
type StallTab = 'listings' | 'history';

const rarityLabel: Record<Rarity, string> = {
  common: '普通',
  uncommon: '优秀',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const tabConfig: { key: MarketTab; label: string; icon: typeof Store }[] = [
  { key: 'all', label: '全部', icon: Store },
  { key: 'pigment', label: '颜料', icon: Droplets },
  { key: 'needle', label: '纹针', icon: Pencil },
  { key: 'pattern', label: '图案', icon: ImageIcon },
  { key: 'stall', label: '我的摊位', icon: User },
];

const stallTabConfig: { key: StallTab; label: string; icon: typeof Package }[] = [
  { key: 'listings', label: '上架物品', icon: Package },
  { key: 'history', label: '成交记录', icon: History },
];

interface PriceTrendProps {
  price: number;
  suggestedMin: number;
  suggestedMax: number;
}

function PriceTrend({ price, suggestedMin, suggestedMax }: PriceTrendProps) {
  const mid = (suggestedMin + suggestedMax) / 2;
  const diff = price - mid;
  const threshold = (suggestedMax - suggestedMin) * 0.1;

  let TrendIcon = Minus;
  let colorClass = 'text-magic-gold-300';
  let label = '持平';

  if (diff > threshold) {
    TrendIcon = TrendingUp;
    colorClass = 'text-rose-400';
    label = '偏高';
  } else if (diff < -threshold) {
    TrendIcon = TrendingDown;
    colorClass = 'text-emerald-400';
    label = '偏低';
  }

  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      <TrendIcon className="w-4 h-4" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

interface ListingCardProps {
  listing: MarketListing;
  isOwn?: boolean;
  onBuy?: () => void;
  onCancel?: () => void;
}

function ListingCard({ listing, isOwn = false, onBuy, onCancel }: ListingCardProps) {
  const isInRange = listing.price >= listing.suggestedMin && listing.price <= listing.suggestedMax;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="magic-card rune-border p-4 relative overflow-hidden"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-14 h-14 rounded-lg bg-magic-purple-800/60 flex items-center justify-center text-3xl border border-magic-gold-500/20">
          {listing.material.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-magic-gold-100 truncate">
              {listing.material.name}
            </h3>
            <RarityBadge rarity={listing.material.rarity} size="sm" showLabel={false} />
          </div>
          <div className="flex items-center gap-2 text-xs text-magic-gold-100/60">
            <span>{rarityLabel[listing.material.rarity]}</span>
            <span>·</span>
            <span>品质 {listing.material.quality}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-magic-gold-100/60">卖家</span>
          <span className="font-medium text-cyan-300">{listing.sellerName}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-magic-gold-100/60">数量</span>
          <span className="font-medium text-magic-gold-200">x{listing.material.quantity}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-magic-gold-100/60 text-sm">售价</span>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span
              className={`font-display font-bold text-lg ${
                isInRange ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              {listing.price.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="pt-1">
          <div className="flex items-center justify-between text-xs text-magic-gold-100/50 mb-1">
            <span>建议区间</span>
            <PriceTrend
              price={listing.price}
              suggestedMin={listing.suggestedMin}
              suggestedMax={listing.suggestedMax}
            />
          </div>
          <div className="relative h-2 rounded-full bg-magic-purple-900/80 overflow-hidden">
            <div className="absolute inset-y-0 left-0 right-0 bg-emerald-500/30" />
            <div
              className="absolute top-0 bottom-0 w-1.5 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50"
              style={{
                left: `${Math.max(
                  0,
                  Math.min(
                    100,
                    ((listing.price - listing.suggestedMin * 0.8) /
                      (listing.suggestedMax * 1.2 - listing.suggestedMin * 0.8)) *
                      100
                  )
                )}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-magic-gold-100/40 mt-1">
            <span>{listing.suggestedMin}</span>
            <span className="text-emerald-400/60">
              {listing.suggestedMin} ~ {listing.suggestedMax}
            </span>
            <span>{listing.suggestedMax}</span>
          </div>
        </div>
      </div>

      {isOwn ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          className="w-full py-2 rounded-lg bg-rose-600/30 border border-rose-500/40 text-rose-300 font-display font-semibold hover:bg-rose-600/50 transition-colors"
        >
          取消上架
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBuy}
          className="w-full py-2 rounded-lg magic-btn-gold flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          购买
        </motion.button>
      )}
    </motion.div>
  );
}

interface ListingModalProps {
  open: boolean;
  onClose: () => void;
}

function ListingModal({ open, onClose }: ListingModalProps) {
  const player = useGameStore((s) => s.player);
  const materials = useGameStore((s) => s.materials);
  const createListing = useGameStore((s) => s.createListing);

  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  const availableMaterials = useMemo(
    () => materials.filter((m) => m.quantity > 0),
    [materials]
  );

  const priceSuggestion = useMemo(() => {
    if (!selectedMaterial) return null;
    return suggestMarketPrice(selectedMaterial);
  }, [selectedMaterial]);

  useEffect(() => {
    if (selectedMaterial && priceSuggestion) {
      setPrice(priceSuggestion.suggested);
      setQuantity(1);
    }
  }, [selectedMaterial, priceSuggestion]);

  const isPriceInRange = priceSuggestion
    ? price >= priceSuggestion.min && price <= priceSuggestion.max
    : false;

  const handleConfirm = () => {
    if (!selectedMaterial || quantity <= 0 || price <= 0) return;
    const success = createListing(selectedMaterial.id, price, quantity);
    if (success) {
      setSelectedMaterial(null);
      setQuantity(1);
      setPrice(0);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="magic-card rune-border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-magic-gold-500/20">
              <h2 className="font-display font-bold text-xl text-magic-gold-200 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                上架商品
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-magic-purple-800/60 transition-colors"
              >
                <X className="w-5 h-5 text-magic-gold-300" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-magic-gold-200 mb-3">
                  选择材料
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                  {availableMaterials.map((mat) => {
                    const isSelected = selectedMaterial?.id === mat.id;
                    return (
                      <button
                        key={mat.id}
                        onClick={() => setSelectedMaterial(mat)}
                        className={`p-3 rounded-lg text-left transition-all border ${
                          isSelected
                            ? 'bg-magic-purple-700/60 border-magic-gold-400/60 ring-2 ring-magic-gold-400/40'
                            : 'bg-magic-purple-900/40 border-magic-gold-500/10 hover:border-magic-gold-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{mat.icon}</span>
                          <span className="font-display font-semibold text-sm text-magic-gold-100 truncate">
                            {mat.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <RarityBadge rarity={mat.rarity} size="sm" showLabel={false} />
                          <span className="text-magic-gold-100/60">x{mat.quantity}</span>
                        </div>
                      </button>
                    );
                  })}
                  {availableMaterials.length === 0 && (
                    <div className="col-span-full py-8 text-center text-magic-gold-100/50">
                      <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>暂无可上架的材料</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedMaterial && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-magic-gold-200 mb-2">
                      上架数量
                    </label>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg bg-magic-purple-800/60 border border-magic-gold-500/20 flex items-center justify-center text-magic-gold-200 hover:bg-magic-purple-700/60 transition-colors"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </motion.button>
                      <input
                        type="number"
                        min={1}
                        max={selectedMaterial.quantity}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, Math.min(selectedMaterial.quantity, parseInt(e.target.value) || 1))
                          )
                        }
                        className="flex-1 h-10 px-4 rounded-lg bg-magic-purple-900/60 border border-magic-gold-500/20 text-center font-display font-bold text-lg text-magic-gold-100 focus:outline-none focus:border-magic-gold-400/60"
                      />
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setQuantity(Math.min(selectedMaterial.quantity, quantity + 1))
                        }
                        className="w-10 h-10 rounded-lg bg-magic-purple-800/60 border border-magic-gold-500/20 flex items-center justify-center text-magic-gold-200 hover:bg-magic-purple-700/60 transition-colors"
                      >
                        <ChevronUp className="w-5 h-5" />
                      </motion.button>
                      <span className="text-sm text-magic-gold-100/60">
                        库存 {selectedMaterial.quantity}
                      </span>
                    </div>
                  </div>

                  {priceSuggestion && (
                    <div>
                      <label className="block text-sm font-medium text-magic-gold-200 mb-2">
                        定价（金币）
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setPrice(Math.max(1, price - 50))}
                            className="w-10 h-10 rounded-lg bg-magic-purple-800/60 border border-magic-gold-500/20 flex items-center justify-center text-magic-gold-200 hover:bg-magic-purple-700/60 transition-colors"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </motion.button>
                          <input
                            type="number"
                            min={1}
                            value={price}
                            onChange={(e) => setPrice(Math.max(1, parseInt(e.target.value) || 1))}
                            className={`flex-1 h-12 px-4 rounded-lg bg-magic-purple-900/60 border-2 text-center font-display font-bold text-xl focus:outline-none transition-colors ${
                              isPriceInRange
                                ? 'border-emerald-500/60 text-emerald-300'
                                : 'border-amber-500/60 text-amber-300'
                            }`}
                          />
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setPrice(price + 50)}
                            className="w-10 h-10 rounded-lg bg-magic-purple-800/60 border border-magic-gold-500/20 flex items-center justify-center text-magic-gold-200 hover:bg-magic-purple-700/60 transition-colors"
                          >
                            <ChevronUp className="w-5 h-5" />
                          </motion.button>
                        </div>

                        <div className="p-3 rounded-lg bg-magic-purple-900/40 border border-magic-gold-500/10">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-magic-gold-100/60">系统建议区间</span>
                            <span
                              className={`font-medium ${
                                isPriceInRange ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {isPriceInRange ? '✓ 价格合理' : '⚠ 偏离建议价'}
                            </span>
                          </div>
                          <div className="relative h-3 rounded-full bg-magic-purple-950 overflow-hidden">
                            <div
                              className="absolute inset-y-0 bg-gradient-to-r from-emerald-600/40 via-emerald-500/60 to-emerald-600/40"
                              style={{
                                left: '15%',
                                width: '70%',
                              }}
                            />
                            <div
                              className="absolute top-0 bottom-0 w-2 bg-amber-400 rounded-full shadow-lg shadow-amber-400/60"
                              style={{
                                left: `${Math.max(
                                  2,
                                  Math.min(
                                    98,
                                    ((price - priceSuggestion.min * 0.7) /
                                      (priceSuggestion.max * 1.3 - priceSuggestion.min * 0.7)) *
                                      100
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs mt-2">
                            <span className="text-magic-gold-100/40">
                              {priceSuggestion.min}
                            </span>
                            <span className="text-emerald-300 font-bold">
                              建议 {priceSuggestion.suggested}
                            </span>
                            <span className="text-magic-gold-100/40">
                              {priceSuggestion.max}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setPrice(priceSuggestion.min)}
                            className="flex-1 py-1.5 rounded-md bg-magic-purple-800/40 border border-magic-gold-500/20 text-xs text-magic-gold-200 hover:bg-magic-purple-700/40 transition-colors"
                          >
                            最低价 {priceSuggestion.min}
                          </button>
                          <button
                            onClick={() => setPrice(priceSuggestion.suggested)}
                            className="flex-1 py-1.5 rounded-md bg-emerald-600/30 border border-emerald-500/40 text-xs text-emerald-300 hover:bg-emerald-600/50 transition-colors"
                          >
                            建议价 {priceSuggestion.suggested}
                          </button>
                          <button
                            onClick={() => setPrice(priceSuggestion.max)}
                            className="flex-1 py-1.5 rounded-md bg-magic-purple-800/40 border border-magic-gold-500/20 text-xs text-magic-gold-200 hover:bg-magic-purple-700/40 transition-colors"
                          >
                            最高价 {priceSuggestion.max}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-lg bg-magic-purple-900/40 border border-magic-gold-500/10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-magic-gold-100/60">预计收入</span>
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span className="font-display font-bold text-lg text-amber-300">
                          {(price * quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 p-5 border-t border-magic-gold-500/20">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg bg-magic-purple-800/40 border border-magic-gold-500/20 font-display font-semibold text-magic-gold-200 hover:bg-magic-purple-700/40 transition-colors"
              >
                取消
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={!selectedMaterial || quantity <= 0 || price <= 0}
                className="flex-1 py-2.5 rounded-lg magic-btn-gold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                确认上架
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Market() {
  const player = useGameStore((s) => s.player);
  const marketListings = useGameStore((s) => s.marketListings);
  const tradeAnnouncements = useGameStore((s) => s.tradeAnnouncements);
  const buyListing = useGameStore((s) => s.buyListing);
  const cancelListing = useGameStore((s) => s.cancelListing);
  const setCurrentPage = useGameStore((s) => s.setCurrentPage);

  const [activeTab, setActiveTab] = useState<MarketTab>('all');
  const [stallTab, setStallTab] = useState<StallTab>('listings');
  const [showListingModal, setShowListingModal] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  useEffect(() => {
    setCurrentPage('market');
  }, [setCurrentPage]);

  useEffect(() => {
    if (tradeAnnouncements.length <= 1) return;
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % tradeAnnouncements.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [tradeAnnouncements.length]);

  const myListings = useMemo(
    () => marketListings.filter((l) => l.sellerId === player.id),
    [marketListings, player.id]
  );

  const filteredListings = useMemo(() => {
    if (activeTab === 'all' || activeTab === 'stall') return marketListings;
    return marketListings.filter((l) => l.material.type === activeTab);
  }, [marketListings, activeTab]);

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-magic-gold-200 flex items-center gap-3">
            <Store className="w-8 h-8" />
            交易市场
          </h1>
          <p className="text-magic-gold-100/60 mt-1">
            浏览全服商品，或在摊位出售你的材料
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-magic-purple-900/40 border border-magic-gold-500/20">
          <Coins className="w-5 h-5 text-amber-400" />
          <span className="font-display font-bold text-xl text-amber-300">
            {player.gold.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="magic-card rune-border overflow-hidden">
        <div className="p-3 bg-gradient-to-r from-magic-purple-800/60 to-magic-purple-900/60 border-b border-magic-gold-500/20 flex items-center gap-2">
          <Scroll className="w-4 h-4 text-magic-gold-400" />
          <span className="font-display font-bold text-sm text-magic-gold-200">
            全服成交公告
          </span>
        </div>
        <div className="relative h-12 overflow-hidden">
          <AnimatePresence mode="wait">
            {tradeAnnouncements[announcementIndex] && (
              <motion.div
                key={announcementIndex}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center px-6"
              >
                <p className="text-sm text-magic-gold-100/90">
                  <span className="text-cyan-300 font-semibold">
                    {tradeAnnouncements[announcementIndex].buyerName}
                  </span>
                  <span className="mx-2 text-magic-gold-400">从</span>
                  <span className="text-rose-300 font-semibold">
                    {tradeAnnouncements[announcementIndex].sellerName}
                  </span>
                  <span className="mx-2 text-magic-gold-400">处以</span>
                  <span className="text-amber-300 font-bold">
                    {tradeAnnouncements[announcementIndex].price.toLocaleString()}
                  </span>
                  <span className="mx-1 text-amber-300">金币</span>
                  <span className="mx-2 text-magic-gold-400">购买了</span>
                  <span className="text-emerald-300 font-semibold">
                    {tradeAnnouncements[announcementIndex].materialName}
                  </span>
                  <span className="ml-1 text-magic-gold-100/60">
                    x{tradeAnnouncements[announcementIndex].quantity}
                  </span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
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
              {tab.key !== 'stall' && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-magic-gold-500/20' : 'bg-magic-purple-800/60'
                  }`}
                >
                  {tab.key === 'all'
                    ? marketListings.length
                    : marketListings.filter((l) => l.material.type === tab.key).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'stall' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {stallTabConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = stallTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setStallTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-display font-semibold transition-all ${
                      isActive
                        ? 'bg-magic-purple-700/60 text-magic-gold-100 border border-magic-gold-500/30'
                        : 'bg-magic-purple-900/40 text-magic-gold-100/70 border border-magic-gold-500/10 hover:border-magic-gold-500/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowListingModal(true)}
              className="magic-btn-gold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              上架物品
            </motion.button>
          </div>

          {stallTab === 'listings' ? (
            <div>
              {myListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {myListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      isOwn
                      onCancel={() => cancelListing(listing.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="magic-card rune-border py-16 text-center">
                  <Package className="w-16 h-16 mx-auto mb-4 text-magic-gold-400/40" />
                  <p className="text-magic-gold-100/60 mb-4">
                    您还没有上架任何物品
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowListingModal(true)}
                    className="magic-btn inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    立即上架
                  </motion.button>
                </div>
              )}
            </div>
          ) : (
            <div className="magic-card rune-border p-6">
              <h3 className="font-display font-bold text-lg text-magic-gold-300 mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                成交记录
              </h3>
              <div className="space-y-2">
                {tradeAnnouncements
                  .filter(
                    (a) =>
                      a.sellerName === player.name || a.buyerName === player.name
                  )
                  .map((ann) => (
                    <div
                      key={ann.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-magic-purple-900/40 border border-magic-gold-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            ann.sellerName === player.name
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {ann.sellerName === player.name ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <ShoppingCart className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-magic-gold-100">
                            {ann.sellerName === player.name ? '出售' : '购买'}{' '}
                            <span className="font-semibold text-emerald-300">
                              {ann.materialName}
                            </span>{' '}
                            x{ann.quantity}
                          </p>
                          <p className="text-xs text-magic-gold-100/50">
                            {ann.sellerName === player.name
                              ? `买家：${ann.buyerName}`
                              : `卖家：${ann.sellerName}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span
                          className={`font-display font-bold ${
                            ann.sellerName === player.name
                              ? 'text-emerald-300'
                              : 'text-rose-300'
                          }`}
                        >
                          {ann.sellerName === player.name ? '+' : '-'}
                          {ann.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                {tradeAnnouncements.filter(
                  (a) =>
                    a.sellerName === player.name || a.buyerName === player.name
                ).length === 0 && (
                  <div className="py-8 text-center text-magic-gold-100/50">
                    <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>暂无成交记录</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isOwn={listing.sellerId === player.id}
              onBuy={() =>
                listing.sellerId !== player.id && buyListing(listing.id)
              }
              onCancel={() => cancelListing(listing.id)}
            />
          ))}
          {filteredListings.length === 0 && (
            <div className="col-span-full magic-card rune-border py-16 text-center">
              <Store className="w-16 h-16 mx-auto mb-4 text-magic-gold-400/40" />
              <p className="text-magic-gold-100/60">暂无商品</p>
            </div>
          )}
        </div>
      )}

      <ListingModal
        open={showListingModal}
        onClose={() => setShowListingModal(false)}
      />
    </div>
  );
}
