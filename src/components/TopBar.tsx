import { useEffect, useState } from 'react';
import {
  Coins,
  Star,
  Zap,
  Bell,
  Flame,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

export default function TopBar() {
  const player = useGameStore((state) => state.player);
  const notifications = useGameStore((state) => state.ui.notifications);
  const tattooFever = useGameStore((state) => state.ui.tattooFever);
  const checkTattooFeverExpiry = useGameStore((state) => state.checkTattooFeverExpiry);

  const [feverTimeLeft, setFeverTimeLeft] = useState<number>(0);

  useEffect(() => {
    checkTattooFeverExpiry();
    if (!tattooFever.active) {
      setFeverTimeLeft(0);
      return;
    }

    const updateTime = () => {
      const remaining = Math.max(0, tattooFever.endTime - Date.now());
      setFeverTimeLeft(remaining);
      if (remaining <= 0) {
        checkTattooFeverExpiry();
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [tattooFever.active, tattooFever.endTime, checkTattooFeverExpiry]);

  const formatFeverTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const totalCritRate = player.critRate + (tattooFever.active ? tattooFever.bonusCritRate : 0);

  return (
    <header className="h-16 bg-gradient-to-r from-magic-purple-900/80 via-magic-purple-800/70 to-magic-purple-900/80 border-b border-magic-gold-500/20 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 z-30">
      <div className="hidden lg:block">
        <div className="font-display text-sm text-magic-purple-300/60">
          欢迎回来，<span className="text-magic-gold-300">{player.name}</span>
        </div>
      </div>

      <div className="lg:hidden flex-1" />

      <div className="flex items-center gap-2 lg:gap-4">
        {tattooFever.active && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-magic-blood-500/30 to-magic-gold-500/20 border border-magic-gold-500/40 animate-pulse">
            <Flame size={18} className="text-magic-gold-400" />
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-display text-magic-gold-300 font-bold">纹身热潮</span>
              <span className="text-xs text-magic-gold-200/80">
                +{(tattooFever.bonusCritRate * 100).toFixed(0)}% 暴击 · {formatFeverTime(feverTimeLeft)}
              </span>
            </div>
            <Flame size={18} className="text-magic-gold-400 sm:hidden" />
          </div>
        )}

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-magic-purple-950/50 border border-magic-gold-500/20">
          <Coins size={18} className="text-magic-gold-400" />
          <span className="font-display font-semibold text-magic-gold-200 text-sm">
            {player.gold.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-magic-purple-950/50 border border-magic-purple-500/30">
          <Star size={18} className="text-magic-purple-300" />
          <span className="font-display font-semibold text-magic-purple-200 text-sm">
            Lv.{player.level}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-magic-purple-950/50 border border-magic-blood-500/30">
          <Zap size={18} className={cn(tattooFever.active ? 'text-magic-gold-400' : 'text-magic-blood-400')} />
          <span className="font-display font-semibold text-sm">
            <span className={cn(tattooFever.active ? 'text-magic-gold-300' : 'text-magic-blood-300')}>
              {(totalCritRate * 100).toFixed(0)}%
            </span>
            {tattooFever.active && (
              <span className="text-magic-gold-500 text-xs ml-1">
                (+{(tattooFever.bonusCritRate * 100).toFixed(0)}%)
              </span>
            )}
          </span>
        </div>

        <div className="relative">
          <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-magic-purple-950/50 border border-magic-gold-500/20 hover:border-magic-gold-500/40 transition-colors">
            <Bell size={18} className="text-magic-gold-300" />
          </button>
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-magic-blood-500 rounded-full border-2 border-magic-purple-900">
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
