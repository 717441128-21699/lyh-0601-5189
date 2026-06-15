import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Palette,
  Trophy,
  ShoppingBag,
  Users,
  FileBarChart,
  Crown,
  Menu,
  X,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { PageType } from '@/types';
import { cn } from '@/lib/utils';

const routeMap: Record<PageType, string> = {
  dashboard: '/',
  workshop: '/workshop',
  'workshop-create': '/workshop/create',
  competition: '/competition',
  'competition-live': '/competition/live',
  market: '/market',
  guild: '/guild',
  reports: '/reports',
  leaderboard: '/leaderboard',
  'player-profile': '/player',
};

interface NavItem {
  id: PageType;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'workshop', label: '纹身工坊', icon: Palette },
  { id: 'competition', label: '纹身大赛', icon: Trophy },
  { id: 'market', label: '交易市场', icon: ShoppingBag },
  { id: 'guild', label: '公会系统', icon: Users },
  { id: 'reports', label: '产业报告', icon: FileBarChart },
  { id: 'leaderboard', label: '排行榜', icon: Crown },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setCurrentPage = useGameStore((state) => state.setCurrentPage);

  const pathToPage: Record<string, PageType> = {
    '/': 'dashboard',
    '/workshop': 'workshop',
    '/workshop/create': 'workshop-create',
    '/competition': 'competition',
    '/competition/live': 'competition-live',
    '/market': 'market',
    '/guild': 'guild',
    '/reports': 'reports',
    '/leaderboard': 'leaderboard',
  };
  const currentPage = pathToPage[location.pathname] || 'dashboard';

  const handleNavClick = (page: PageType) => {
    const route = routeMap[page];
    if (route) {
      setCurrentPage(page);
      navigate(route);
    }
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-magic-gold-500/20">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-magic-gold-400">
            纹身大师
          </h1>
          <button
            className="lg:hidden text-magic-gold-300 hover:text-magic-gold-100 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id ||
            (item.id === 'workshop' && currentPage === 'workshop-create') ||
            (item.id === 'competition' && currentPage === 'competition-live');

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300',
                'text-left font-medium',
                isActive
                  ? 'bg-gradient-to-r from-magic-purple-600/50 to-magic-purple-500/30 text-magic-gold-300 border border-magic-gold-500/40 shadow-lg shadow-magic-purple-500/20'
                  : 'text-magic-purple-200/80 hover:text-magic-gold-200 hover:bg-magic-purple-800/30 border border-transparent hover:border-magic-gold-500/20'
              )}
            >
              <Icon
                size={20}
                className={cn(
                  'transition-colors',
                  isActive ? 'text-magic-gold-400' : 'text-magic-purple-300'
                )}
              />
              <span className="font-display">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-magic-gold-500/20">
        <div className="text-xs text-magic-purple-300/60 font-display">
          v1.0.0 · 纹身帝国
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-magic-purple-800/80 border border-magic-gold-500/30 text-magic-gold-300 backdrop-blur-sm"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={24} />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 h-screen',
          'bg-gradient-to-b from-magic-purple-900/95 to-magic-purple-950/95',
          'border-r border-magic-gold-500/20 backdrop-blur-md',
          'transform transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
