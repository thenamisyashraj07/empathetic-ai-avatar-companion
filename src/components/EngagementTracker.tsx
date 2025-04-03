
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Brain, BrainCircuit } from 'lucide-react';

interface EngagementTrackerProps {
  level: number;
  context?: 'learning' | 'assessment' | 'interview';
  className?: string;
}

export const EngagementTracker: React.FC<EngagementTrackerProps> = ({
  level,
  context = 'learning',
  className
}) => {
  // Normalize level to 0-100 scale for progress component
  const normalizedLevel = level * 10;
  
  // Determine color based on engagement level
  const getColorClass = () => {
    if (level <= 3) return "text-red-500";
    if (level <= 6) return "text-yellow-500";
    return "text-green-500";
  };
  
  // Get appropriate label based on context and level
  const getEngagementLabel = () => {
    if (context === 'learning') {
      if (level <= 3) return "Disengaged";
      if (level <= 6) return "Attentive";
      return "Highly Engaged";
    } else if (context === 'assessment') {
      if (level <= 3) return "Struggling";
      if (level <= 6) return "Focused";
      return "Confident";
    } else {
      return "Engagement Level";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <BrainCircuit className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">
            {getEngagementLabel()}
          </span>
        </div>
        <span className={cn("text-sm font-bold", getColorClass())}>
          {level}/10
        </span>
      </div>
      
      <Progress 
        value={normalizedLevel} 
        className={cn(
          "h-2",
          level <= 3 ? "bg-red-200" : level <= 6 ? "bg-yellow-200" : "bg-green-200"
        )}
      />
      
      {context === 'learning' && level <= 3 && (
        <p className="text-xs text-muted-foreground mt-1">
          Suggestion: Try asking a question to increase engagement
        </p>
      )}
      
      {context === 'assessment' && level <= 3 && (
        <p className="text-xs text-muted-foreground mt-1">
          Suggestion: Take a moment to review the question carefully
        </p>
      )}
    </div>
  );
};
