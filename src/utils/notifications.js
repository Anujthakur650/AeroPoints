import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
export const Notification = ({ type, title, message, duration = 5000, onClose }) => {
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
    return (_jsx(motion.div, { initial: { opacity: 0, y: -50, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -50, scale: 0.95 }, className: `fixed top-4 right-4 z-50 ${style.background} border ${style.border} ${style.text} px-6 py-4 rounded-xl backdrop-blur-sm max-w-md`, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Icon, { icon: style.icon, className: "text-xl mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-semibold", children: title }), message && _jsx("p", { className: "text-sm mt-1 opacity-90", children: message })] }), onClose && (_jsx("button", { onClick: onClose, className: "text-current opacity-70 hover:opacity-100 transition-opacity", children: _jsx(Icon, { icon: "lucide:x", className: "text-lg" }) }))] }) }));
};
export const showNotification = (notification) => {
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
