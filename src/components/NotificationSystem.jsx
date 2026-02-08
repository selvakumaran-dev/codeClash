import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    Info,
    X,
    Trophy,
    Lock,
    Zap
} from 'lucide-react';

const NotificationSystem = ({ notifications, onClose }) => {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md pointer-events-none">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <Notification
                        key={notification.id}
                        notification={notification}
                        onClose={onClose}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

const Notification = ({ notification, onClose }) => {
    const { id, type, title, message, duration = 5000, icon: CustomIcon } = notification;

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/30',
                    icon: CheckCircle2,
                    iconColor: 'text-green-400',
                    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                };
            case 'error':
                return {
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/30',
                    icon: XCircle,
                    iconColor: 'text-red-400',
                    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                };
            case 'warning':
                return {
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/30',
                    icon: AlertCircle,
                    iconColor: 'text-amber-400',
                    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                };
            case 'info':
                return {
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/30',
                    icon: Info,
                    iconColor: 'text-blue-400',
                    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                };
            case 'game':
                return {
                    bg: 'bg-accent-neon/10',
                    border: 'border-accent-neon/30',
                    icon: Trophy,
                    iconColor: 'text-accent-neon',
                    glow: 'shadow-neon-green'
                };
            case 'locked':
                return {
                    bg: 'bg-accent-chaos/10',
                    border: 'border-accent-chaos/30',
                    icon: Lock,
                    iconColor: 'text-accent-chaos',
                    glow: 'shadow-chaos'
                };
            default:
                return {
                    bg: 'bg-text-primary/10',
                    border: 'border-text-primary/30',
                    icon: Info,
                    iconColor: 'text-text-primary',
                    glow: ''
                };
        }
    };

    const styles = getTypeStyles();
    const Icon = CustomIcon || styles.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`pointer-events-auto relative overflow-hidden rounded-xl border ${styles.border} ${styles.bg} ${styles.glow} backdrop-blur-xl`}
        >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />

            <div className="relative p-4 flex items-start gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 ${styles.iconColor}`}>
                    <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {title && (
                        <h4 className="font-bold text-text-primary mb-1 text-sm">
                            {title}
                        </h4>
                    )}
                    <p className="text-text-secondary text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Close button */}
                <button
                    onClick={() => onClose(id)}
                    className="flex-shrink-0 text-text-secondary hover:text-text-primary transition-colors p-1 hover:bg-text-primary/10 rounded-lg"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Progress bar */}
            {duration > 0 && (
                <motion.div
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: duration / 1000, ease: 'linear' }}
                    className={`absolute bottom-0 left-0 right-0 h-1 ${styles.iconColor.replace('text-', 'bg-')} origin-left`}
                />
            )}
        </motion.div>
    );
};

// Hook to manage notifications
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (notification) => {
        const id = Date.now() + Math.random();
        setNotifications((prev) => [...prev, { ...notification, id }]);
        return id;
    };

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    // Convenience methods
    const success = (message, title = 'Success') => {
        return addNotification({ type: 'success', title, message });
    };

    const error = (message, title = 'Error') => {
        return addNotification({ type: 'error', title, message, duration: 7000 });
    };

    const warning = (message, title = 'Warning') => {
        return addNotification({ type: 'warning', title, message });
    };

    const info = (message, title = 'Info') => {
        return addNotification({ type: 'info', title, message });
    };

    const game = (message, title = 'Game Event') => {
        return addNotification({ type: 'game', title, message, duration: 4000 });
    };

    const locked = (message, title = 'Locked') => {
        return addNotification({ type: 'locked', title, message });
    };

    return {
        notifications,
        addNotification,
        removeNotification,
        clearAll,
        success,
        error,
        warning,
        info,
        game,
        locked
    };
};

export default NotificationSystem;
