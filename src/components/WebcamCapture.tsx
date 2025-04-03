
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface WebcamCaptureProps {
  onEmotionDetected?: (emotion: string) => void;
  onAttentionStatus?: (isAttentive: boolean, message?: string) => void;
  className?: string;
  autoStart?: boolean;
}

const MOCK_EMOTIONS = ['happy', 'sad', 'neutral', 'surprised', 'angry'];
const ATTENTION_MESSAGES = [
  "Please look at the screen to continue the lesson",
  "I notice you're looking away. Let's focus on the material",
  "Try to maintain good posture for better learning",
  "Are you still with me? Please focus on the screen",
  "Let's stay engaged with the material"
];

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ 
  onEmotionDetected,
  onAttentionStatus,
  className,
  autoStart = false
}) => {
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isAttentive, setIsAttentive] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Auto-start camera if requested
  useEffect(() => {
    if (autoStart && !isActive && hasPermission !== false) {
      startWebcam();
    }
  }, [autoStart]);

  // Mock emotion detection for demo purposes
  useEffect(() => {
    if (isActive && onEmotionDetected) {
      const interval = setInterval(() => {
        const randomEmotion = MOCK_EMOTIONS[Math.floor(Math.random() * MOCK_EMOTIONS.length)];
        onEmotionDetected(randomEmotion);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isActive, onEmotionDetected]);
  
  // Mock attention status detection
  useEffect(() => {
    if (isActive && onAttentionStatus) {
      const interval = setInterval(() => {
        // Simulate attention status changes (70% chance of being attentive)
        const randomAttention = Math.random() > 0.3;
        
        if (randomAttention !== isAttentive) {
          setIsAttentive(randomAttention);
          
          if (!randomAttention) {
            // Student not paying attention, send a random message
            const message = ATTENTION_MESSAGES[Math.floor(Math.random() * ATTENTION_MESSAGES.length)];
            onAttentionStatus(false, message);
            
            toast({
              title: "Attention Alert",
              description: message,
              variant: "destructive"
            });
          } else {
            onAttentionStatus(true);
          }
        }
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [isActive, onAttentionStatus, isAttentive, toast]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
        setHasPermission(true);
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setHasPermission(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsActive(false);
  };

  const toggleWebcam = () => {
    if (isActive) {
      stopWebcam();
    } else {
      startWebcam();
    }
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative rounded-lg overflow-hidden bg-black mb-4 w-full aspect-video flex items-center justify-center">
        {hasPermission === false && (
          <div className="text-white p-4 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            Camera access denied. Please enable camera permissions and try again.
          </div>
        )}
        
        {(!isActive && hasPermission !== false) && (
          <div className="text-white p-4 text-center">
            <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Enable camera to activate emotion detection
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "w-full h-full object-cover",
            !isActive && "hidden"
          )}
        />
        
        {isActive && !isAttentive && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Attention needed
          </div>
        )}
      </div>
      
      <Button 
        onClick={toggleWebcam}
        variant={isActive ? "destructive" : "default"}
        className="mb-2"
      >
        {isActive ? (
          <>
            <CameraOff className="mr-2 h-4 w-4" />
            Stop Camera
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4" />
            Start Camera
          </>
        )}
      </Button>
    </div>
  );
};
