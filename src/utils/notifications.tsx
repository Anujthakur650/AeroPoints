import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const typeStyles = {
    success: {
      background: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-300',
      icon: 'lucide:check-circle'
    },
    error: {
      background: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-300',
      icon: 'lucide:alert-circle'
    },
    warning: {
      background: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      text: 'text-yellow-300',
      icon: 'lucide:alert-triangle'
    },
    info: {
      background: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-300',
      icon: 'lucide:info'
    }
  };

  const style = typeStyles[type];

  React.useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      className={`fixed top-4 right-4 z-50 ${style.background} border ${style.border} ${style.text} px-6 py-4 rounded-xl backdrop-blur-sm max-w-md`}
    >
      <div className="flex items-start gap-3">
        <Icon icon={style.icon} className="text-xl mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          {message && <p className="text-sm mt-1 opacity-90">{message}</p>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <Icon icon="lucide:x" className="text-lg" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export const showNotification = (notification: NotificationProps) => {
  // This would typically integrate with a global notification system
  // For now, we'll create a simple implementation
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  const handleClose = () => {
    container.remove();
    notification.onClose?.();
  };
  
  // In a real app, you'd use React.render or a state management solution
  console.log(`${notification.type.toUpperCase()}: ${notification.title}${notification.message ? ` - ${notification.message}` : ''}`);
}; 