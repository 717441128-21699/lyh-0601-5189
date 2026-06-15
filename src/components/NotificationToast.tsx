import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { NotificationType } from '@/types';
import { cn } from '@/lib/utils';

interface NotificationIconProps {
  type: NotificationType;
}

function NotificationIcon({ type }: NotificationIconProps) {
  const iconClass = {
    success: 'text-magic-green-400',
    error: 'text-magic-blood-400',
    warning: 'text-magic-gold-400',
    info: 'text-magic-blue-400',
  }[type];

  const Icon = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }[type];

  return <Icon size={22} className={iconClass} />;
}

interface ToastItemProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  onClose: (id: string) => void;
}

function ToastItem({ id, type, title, message, onClose }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const borderClass = {
    success: 'border-magic-green-500/40',
    error: 'border-magic-blood-500/40',
    warning: 'border-magic-gold-500/40',
    info: 'border-magic-blue-500/40',
  }[type];

  const bgClass = {
    success: 'from-magic-green-500/10',
    error: 'from-magic-blood-500/10',
    warning: 'from-magic-gold-500/10',
    info: 'from-magic-blue-500/10',
  }[type];

  const glowClass = {
    success: 'shadow-[0_0_20px_rgba(34,197,94,0.2)]',
    error: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    warning: 'shadow-[0_0_20px_rgba(234,179,8,0.2)]',
    info: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'relative w-80 rounded-lg border backdrop-blur-md overflow-hidden',
        'bg-gradient-to-r to-magic-purple-950/95',
        bgClass,
        borderClass,
        glowClass
      )}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1">
        <div
          className={cn(
            'h-full w-full',
            type === 'success' && 'bg-magic-green-500',
            type === 'error' && 'bg-magic-blood-500',
            type === 'warning' && 'bg-magic-gold-500',
            type === 'info' && 'bg-magic-blue-500'
          )}
        />
      </div>

      <div className="p-4 pl-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-0.5">
            <NotificationIcon type={type} />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-display font-bold text-sm text-magic-gold-200 mb-1">
              {title}
            </h4>
            <p className="text-xs text-magic-purple-200/80 leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={() => onClose(id)}
            className="flex-shrink-0 p-1 rounded-md text-magic-purple-400 hover:text-magic-gold-200 hover:bg-magic-purple-800/50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 4, ease: 'linear' }}
        className={cn(
          'absolute bottom-0 left-0 right-0 h-0.5 origin-left',
          type === 'success' && 'bg-magic-green-500',
          type === 'error' && 'bg-magic-blood-500',
          type === 'warning' && 'bg-magic-gold-500',
          type === 'info' && 'bg-magic-blue-500'
        )}
      />
    </motion.div>
  );
}

export default function NotificationToast() {
  const notifications = useGameStore((state) => state.ui.notifications);
  const removeNotification = useGameStore((state) => state.removeNotification);

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.slice(0, 5).map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <ToastItem
              id={notification.id}
              type={notification.type}
              title={notification.title}
              message={notification.message}
              onClose={removeNotification}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
