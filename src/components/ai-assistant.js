import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
export function AiAssistant() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const [messages, setMessages] = React.useState([
        {
            id: "1",
            content: "Hello! I'm your AeroPoints AI assistant. How can I help you with your flight rewards today?",
            sender: "assistant",
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = React.useState(false);
    const messagesEndRef = React.useRef(null);
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    const handleSendMessage = () => {
        if (inputValue.trim() === "")
            return;
        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            content: inputValue,
            sender: "user",
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsTyping(true);
        // Simulate AI response after a delay
        setTimeout(() => {
            const responses = [
                "I can help you find the best reward flights for your points. Where would you like to travel?",
                "Based on your points balance, you could book a business class flight to Europe or Asia. Would you like me to show you some options?",
                "The best value for your points right now would be flying to Tokyo with ANA or Singapore Airlines. Would you like more details?",
                "I see you're interested in maximizing your points. Have you considered transferring them to partner airlines for better redemption rates?"
            ];
            const aiMessage = {
                id: Date.now().toString(),
                content: responses[Math.floor(Math.random() * responses.length)],
                sender: "assistant",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        }, 1500);
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };
    // Scroll to bottom when messages change
    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    return (_jsxs(_Fragment, { children: [_jsx(motion.div, { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, className: "fixed bottom-6 right-6 z-50", children: _jsx(Button, { isIconOnly: true, color: "primary", size: "lg", radius: "full", className: "shadow-lg", onPress: handleOpen, children: _jsx(Icon, { icon: "lucide:message-circle", width: 24, height: 24 }) }) }), _jsx(Modal, { isOpen: isOpen, onClose: handleClose, size: "lg", scrollBehavior: "inside", backdrop: "blur", children: _jsx(ModalContent, { children: (onClose) => (_jsxs(_Fragment, { children: [_jsxs(ModalHeader, { className: "flex gap-2 items-center", children: [_jsx(Avatar, { src: "https://i.pravatar.cc/150?u=aeropoints-ai", className: "bg-primary", size: "sm" }), _jsx("span", { children: "AeroPoints AI Assistant" })] }), _jsx(ModalBody, { className: "p-4", children: _jsxs("div", { className: "flex flex-col gap-4 h-[400px] overflow-y-auto", children: [_jsxs(AnimatePresence, { children: [messages.map((message) => (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.3 }, className: `flex ${message.sender === "user" ? "justify-end" : "justify-start"}`, children: _jsxs("div", { className: `max-w-[80%] p-3 rounded-xl ${message.sender === "user"
                                                            ? "bg-primary text-white rounded-tr-none"
                                                            : "bg-default-100 rounded-tl-none"}`, children: [_jsx("p", { children: message.content }), _jsx("p", { className: "text-xs opacity-70 mt-1", children: message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })] }) }, message.id))), isTyping && (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "flex justify-start", children: _jsx("div", { className: "bg-default-100 p-3 rounded-xl rounded-tl-none", children: _jsxs("div", { className: "flex gap-1", children: [_jsx("span", { className: "animate-bounce", children: "\u2022" }), _jsx("span", { className: "animate-bounce", style: { animationDelay: "0.2s" }, children: "\u2022" }), _jsx("span", { className: "animate-bounce", style: { animationDelay: "0.4s" }, children: "\u2022" })] }) }) }))] }), _jsx("div", { ref: messagesEndRef })] }) }), _jsxs(ModalFooter, { className: "flex-col gap-2", children: [_jsxs("div", { className: "flex w-full gap-2", children: [_jsx(Input, { fullWidth: true, placeholder: "Type your message...", value: inputValue, onValueChange: setInputValue, onKeyPress: handleKeyPress, startContent: _jsx(Icon, { icon: "lucide:message-square", className: "text-default-400" }), className: "flex-grow" }), _jsx(Button, { color: "primary", isIconOnly: true, onPress: handleSendMessage, isDisabled: inputValue.trim() === "", children: _jsx(Icon, { icon: "lucide:send" }) })] }), _jsx("p", { className: "text-xs text-default-400 text-center w-full", children: "AI assistant can help with flight rewards, points usage, and travel recommendations." })] })] })) }) })] }));
}
