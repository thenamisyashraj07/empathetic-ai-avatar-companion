
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  emotion?: string;
}

interface ChatInterfaceProps {
  detectedEmotion?: string;
  onSendMessage?: (message: string) => void;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  detectedEmotion,
  onSendMessage,
  className 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI companion. How are you feeling today?",
      sender: 'ai'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Notify parent component if callback provided
    if (onSendMessage) {
      onSendMessage(inputValue);
    }
    
    // Simulate AI response based on detected emotion
    simulateResponse(inputValue, detectedEmotion);
  };

  const simulateResponse = (userMessage: string, emotion?: string) => {
    setIsTyping(true);
    
    // Simulate typing delay (1-2 seconds)
    setTimeout(() => {
      const response = generateEmotionalResponse(userMessage, emotion);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: response,
        sender: 'ai',
        emotion
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, Math.random() * 1000 + 1000);
  };

  const generateEmotionalResponse = (message: string, emotion?: string): string => {
    // Simple rule-based responses based on detected emotion
    if (emotion === 'happy') {
      return `I'm glad you're feeling happy! ${message.includes('?') ? 'That's a great question!' : 'Thanks for sharing that with me!'} I'm here to keep the positive vibes going. 😊`;
    } else if (emotion === 'sad') {
      return `I notice you might be feeling down. Remember that it's okay to feel this way sometimes. I'm here to listen and support you. Is there anything specific that's troubling you?`;
    } else if (emotion === 'angry') {
      return `I understand that you might be feeling frustrated right now. Taking deep breaths can sometimes help. Would you like to talk more about what's bothering you?`;
    } else if (emotion === 'anxious' || emotion === 'surprised') {
      return `It seems like something might have caught you off guard. I'm here to help you process these feelings. Would you like to talk more about it?`;
    } else if (emotion === 'excited') {
      return `Your enthusiasm is contagious! I'm excited too! Tell me more about what's got you so energized!`;
    } else if (emotion === 'calm') {
      return `I appreciate this peaceful moment we're sharing. It's nice to have these balanced conversations. What's on your mind?`;
    } else {
      // Default/neutral response
      if (message.toLowerCase().includes('how are you')) {
        return "I'm doing well, thank you for asking! I'm here to assist and chat with you. How can I help you today?";
      } else if (message.toLowerCase().includes('help')) {
        return "I'd be happy to help! I can chat with you, answer questions, or just keep you company. What do you need assistance with?";
      } else if (message.endsWith('?')) {
        return "That's an interesting question. I'm designed to be a supportive companion. While I don't have all the answers, I can certainly try to help or just listen.";
      } else {
        return "Thank you for sharing that with me. I'm designed to be a supportive presence. Is there anything specific you'd like to talk about?";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className={cn("flex flex-col bg-card rounded-lg shadow-lg h-full", className)}>
      <div className="px-4 py-3 border-b flex items-center">
        <MessageCircle className="h-5 w-5 mr-2 text-companion" />
        <h2 className="font-medium">AI Companion Chat</h2>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex max-w-[80%] rounded-lg p-3",
                message.sender === 'user' 
                  ? "ml-auto bg-primary text-primary-foreground" 
                  : "mr-auto bg-secondary text-secondary-foreground"
              )}
            >
              {message.text}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex mr-auto bg-secondary text-secondary-foreground max-w-[80%] rounded-lg p-3">
              <div className="flex space-x-1 items-center">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
