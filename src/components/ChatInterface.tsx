import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, Mic, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { textToSpeech } from '@/utils/textToSpeech';

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
  context?: 'learning' | 'assessment' | 'interview';
  engagementLevel?: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  detectedEmotion,
  onSendMessage,
  className,
  context = 'learning',
  engagementLevel = 5
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: getInitialMessage(context),
      sender: 'ai'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    setMessages([
      {
        id: Date.now().toString(),
        text: getInitialMessage(context),
        sender: 'ai'
      }
    ]);
  }, [context]);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI && !recognitionRef.current) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
          setTimeout(() => {
            handleSendMessage(transcript);
          }, 300);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  function getInitialMessage(context: string): string {
    switch (context) {
      case 'learning':
        return "Hello! I'm your AI learning companion. How can I help with your studies today?";
      case 'assessment':
        return "Welcome to your assessment session. I'll be monitoring your responses to ensure academic integrity. Feel free to ask any questions about the process.";
      case 'interview':
        return "Welcome to your virtual interview session. I'm here to help you practice and provide feedback on your responses. What position are you interviewing for?";
      default:
        return "Hello! I'm your AI companion. How are you feeling today?";
    }
  }

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    if (onSendMessage) {
      onSendMessage(messageText);
    }
    
    simulateResponse(messageText, detectedEmotion);
  };

  const simulateResponse = (userMessage: string, emotion?: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const response = generateContextAwareResponse(userMessage, emotion, context, engagementLevel);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: response,
        sender: 'ai',
        emotion
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      textToSpeech.speak(response);
    }, Math.random() * 1000 + 1000);
  };

  const generateContextAwareResponse = (message: string, emotion?: string, context?: string, engagement?: number): string => {
    if (context === 'learning') {
      if (engagement && engagement < 3) {
        return "I notice you seem disengaged. Would you like to take a short break or try a different approach to this topic?";
      }
      
      if (message.toLowerCase().includes('quiz') || message.toLowerCase().includes('test')) {
        return "I can help you prepare for your quiz. Would you like to go through some practice questions together?";
      }
      
      if (message.toLowerCase().includes('explain') || message.toLowerCase().includes('understand')) {
        return "I'd be happy to explain that concept. Let me break it down step by step, and please stop me if anything is unclear.";
      }
    } 
    else if (context === 'assessment') {
      if (message.length < 20) {
        return "Could you elaborate on your answer a bit more? This will help me better assess your understanding.";
      }
      
      if (message.toLowerCase().includes('hint') || message.toLowerCase().includes('help')) {
        return "While I can't provide direct answers during an assessment, I can guide you to think about the key concepts you've learned that might apply here.";
      }
      
      if (message.toLowerCase().includes('time') || message.toLowerCase().includes('left')) {
        return "You still have plenty of time for this assessment. Take your time to think through your answers carefully.";
      }
    }
    else if (context === 'interview') {
      if (message.toLowerCase().includes('nervous') || message.toLowerCase().includes('anxious')) {
        return "It's completely normal to feel nervous before an interview. Take a deep breath, and remember that this is just a conversation to see if you're a good fit for each other.";
      }
      
      if (message.toLowerCase().includes('strength') || message.toLowerCase().includes('weakness')) {
        return "That's a common interview question. When discussing strengths, be specific and provide examples. For weaknesses, show self-awareness and how you're working to improve.";
      }
      
      if (message.toLowerCase().includes('salary') || message.toLowerCase().includes('compensation')) {
        return "When discussing compensation, it's good to have researched the market rate for your position and experience level. Be confident in your value, but also flexible.";
      }
    }
    
    if (emotion === 'happy') {
      return "I'm glad you're feeling happy! " + (message.includes('?') ? "That's a great question!" : "Thanks for sharing that with me!") + " I'm here to keep the positive vibes going. 😊";
    } else if (emotion === 'sad') {
      return "I notice you might be feeling down. Remember that it's okay to feel this way sometimes. I'm here to listen and support you. Is there anything specific that's troubling you?";
    } else if (emotion === 'angry') {
      return "I understand that you might be feeling frustrated right now. Taking deep breaths can sometimes help. Would you like to talk more about what's bothering you?";
    } else if (emotion === 'anxious' || emotion === 'surprised') {
      return "It seems like something might have caught you off guard. I'm here to help you process these feelings. Would you like to talk more about it?";
    } else if (emotion === 'excited') {
      return "Your enthusiasm is contagious! I'm excited too! Tell me more about what's got you so energized!";
    } else if (emotion === 'calm') {
      return "I appreciate this peaceful moment we're sharing. It's nice to have these balanced conversations. What's on your mind?";
    } else {
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

  const toggleListening = () => {
    if (!isListening && recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
      
      toast({
        title: "Voice Recognition Active",
        description: "I'm listening to you now. Speak clearly...",
      });
    } else if (isListening && recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
      
      toast({
        title: "Voice Recognition Stopped",
        description: "I've stopped listening.",
      });
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        text: getInitialMessage(context),
        sender: 'ai'
      }
    ]);
    toast({
      title: "Chat Cleared",
      description: "Our conversation has been reset.",
    });
  };

  const getPlaceholderText = () => {
    switch (context) {
      case 'learning':
        return "Ask about a topic or concept...";
      case 'assessment':
        return "Answer the question or ask for clarification...";
      case 'interview':
        return "Respond to the interview question...";
      default:
        return "Type a message...";
    }
  };

  return (
    <div className={cn("flex flex-col bg-card rounded-lg shadow-lg h-full", className)}>
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-companion" />
          <h2 className="font-medium">
            {context === 'learning' && "Learning Assistant"}
            {context === 'assessment' && "Assessment Monitor"}
            {context === 'interview' && "Interview Coach"}
            {!context && "AI Companion Chat"}
          </h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={clearChat}
          title="Clear chat"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col max-w-[80%] rounded-lg p-3",
                message.sender === 'user' 
                  ? "ml-auto bg-primary text-primary-foreground" 
                  : "mr-auto bg-secondary text-secondary-foreground"
              )}
            >
              {message.emotion && message.sender === 'ai' && (
                <div className="text-xs opacity-70 mb-1">
                  Responding to: {message.emotion} emotion
                </div>
              )}
              <div>{message.text}</div>
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
            placeholder={getPlaceholderText()}
            className="flex-1"
            disabled={isListening}
          />
          <Button 
            variant={isListening ? "secondary" : "outline"}
            size="icon"
            onClick={toggleListening}
            className={isListening ? "animate-pulse" : ""}
            title="Voice input"
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => handleSendMessage()} 
            disabled={!inputValue.trim()}
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {context === 'assessment' && (
          <div className="mt-2 text-xs text-muted-foreground">
            <strong>Note:</strong> Your responses are being analyzed for academic integrity.
          </div>
        )}
        
        {detectedEmotion && (
          <div className="mt-2 text-xs text-muted-foreground">
            Detected emotion: <span className="font-medium text-companion">{detectedEmotion}</span>
          </div>
        )}
      </div>
    </div>
  );
};
