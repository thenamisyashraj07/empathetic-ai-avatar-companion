
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WebcamCaptureProps {
  onEmotionDetected?: (emotion: string) => void;
  className?: string;
}

const MOCK_EMOTIONS = ['happy', 'sad', 'neutral', 'surprised', 'angry'];

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ 
  onEmotionDetected,
  className 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
            Camera access denied. Please enable camera permissions and try again.
          </div>
        )}
        
        {(!isActive && hasPermission !== false) && (
          <div className="text-white p-4 text-center">
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
