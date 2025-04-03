
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AvatarDisplayProps {
  emotion?: string;
  isAnimating?: boolean;
  className?: string;
}

// In a real implementation, we would have different avatar images/animations for each emotion
// For now, we'll simulate this with text and subtle UI changes
export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ 
  emotion = 'neutral',
  isAnimating = false,
  className 
}) => {
  const [waveAnimation, setWaveAnimation] = useState(false);
  
  // Trigger wave animation occasionally when the avatar is animating
  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setWaveAnimation(true);
        setTimeout(() => setWaveAnimation(false), 2500);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Get the avatar styling based on the current emotion
  const getEmotionStyle = () => {
    switch(emotion) {
      case 'happy':
        return 'bg-gradient-to-br from-green-300 to-companion';
      case 'sad':
        return 'bg-gradient-to-br from-blue-300 to-companion-dark';
      case 'angry':
        return 'bg-gradient-to-br from-red-300 to-companion';
      case 'surprised':
        return 'bg-gradient-to-br from-yellow-300 to-companion';
      case 'anxious':
        return 'bg-gradient-to-br from-orange-300 to-companion-dark';
      case 'excited':
        return 'bg-gradient-to-br from-pink-300 to-companion';
      case 'calm':
        return 'bg-gradient-to-br from-sky-300 to-companion-light';
      default:
        return 'bg-gradient-companion';
    }
  };

  // Get the avatar's emotion expression
  const getEmotionExpression = () => {
    switch(emotion) {
      case 'happy':
        return '😊';
      case 'sad':
        return '😔';
      case 'angry':
        return '😠';
      case 'surprised':
        return '😲';
      case 'anxious':
        return '😰';
      case 'excited':
        return '😃';
      case 'calm':
        return '😌';
      default:
        return '🙂';
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-4", 
      className
    )}>
      <div className={cn(
        "relative rounded-full p-1 transition-all duration-500 shadow-lg",
        getEmotionStyle(),
        isAnimating && "animate-pulse"
      )}>
        <Avatar className="w-32 h-32 border-4 border-white">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="text-6xl bg-white">
            {getEmotionExpression()}
          </AvatarFallback>
        </Avatar>
        
        {waveAnimation && (
          <div className="absolute -right-2 -bottom-2 text-4xl animate-wave origin-bottom-right">
            👋
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center font-medium text-lg">
        {isAnimating ? (
          <span className="text-companion-dark">I'm feeling {emotion}</span>
        ) : (
          <span className="text-muted-foreground">AI Companion</span>
        )}
      </div>
    </div>
  );
};
