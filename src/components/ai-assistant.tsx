import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Avatar, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AeroPoints AI assistant. How can I help you with your flight rewards today?",
      sender: "assistant",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    
    // Add user message
    const userMessage: Message = {
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
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          isIconOnly
          color="primary"
          size="lg"
          radius="full"
          className="shadow-lg"
          onPress={handleOpen}
        >
          <Icon icon="lucide:message-circle" width={24} height={24} />
        </Button>
      </motion.div>

      <Modal 
        isOpen={isOpen} 
        onClose={handleClose}
        size="lg"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex gap-2 items-center">
                <Avatar
                  src="https://i.pravatar.cc/150?u=aeropoints-ai"
                  className="bg-primary"
                  size="sm"
                />
                <span>AeroPoints AI Assistant</span>
              </ModalHeader>
              <ModalBody className="p-4">
                <div className="flex flex-col gap-4 h-[400px] overflow-y-auto">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-xl ${
                            message.sender === "user"
                              ? "bg-primary text-white rounded-tr-none"
                              : "bg-default-100 rounded-tl-none"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-default-100 p-3 rounded-xl rounded-tl-none">
                          <div className="flex gap-1">
                            <span className="animate-bounce">•</span>
                            <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>•</span>
                            <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>•</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </ModalBody>
              <ModalFooter className="flex-col gap-2">
                <div className="flex w-full gap-2">
                  <Input
                    fullWidth
                    placeholder="Type your message..."
                    value={inputValue}
                    onValueChange={setInputValue}
                    onKeyPress={handleKeyPress}
                    startContent={<Icon icon="lucide:message-square" className="text-default-400" />}
                    className="flex-grow"
                  />
                  <Button
                    color="primary"
                    isIconOnly
                    onPress={handleSendMessage}
                    isDisabled={inputValue.trim() === ""}
                  >
                    <Icon icon="lucide:send" />
                  </Button>
                </div>
                <p className="text-xs text-default-400 text-center w-full">
                  AI assistant can help with flight rewards, points usage, and travel recommendations.
                </p>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}