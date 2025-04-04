import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import * as THREE from 'three';

interface AvatarDisplayProps {
  emotion?: string;
  isAnimating?: boolean;
  isSpeaking?: boolean;
  className?: string;
  message?: string | null;
}

// Simple 3D Avatar Component
const Avatar3D = ({ emotion = 'neutral', isAnimating = false, isSpeaking = false }) => {
  // Color based on emotion
  const getEmotionColor = () => {
    switch(emotion) {
      case 'happy': return '#4ade80'; // green
      case 'sad': return '#60a5fa'; // blue
      case 'angry': return '#f87171'; // red
      case 'surprised': return '#facc15'; // yellow
      case 'anxious': return '#fb923c'; // orange
      case 'excited': return '#ec4899'; // pink
      case 'calm': return '#38bdf8'; // sky
      default: return '#8b5cf6'; // purple (default companion color)
    }
  };

  return (
    <>
      {/* Head */}
      <mesh position={[0, 0, 0]} scale={isAnimating ? [1.05, 1.05, 1.05] : [1, 1, 1]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={getEmotionColor()} />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.3, 0.2, 0.85]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.3, 0.2, 0.85]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Pupils */}
      <mesh position={[-0.3, 0.2, 0.98]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.3, 0.2, 0.98]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Mouth - changes based on emotion and speaking state */}
      {emotion === 'happy' || emotion === 'excited' ? (
        <mesh position={[0, -0.3, 0.85]} rotation={[0, 0, isSpeaking ? Math.PI * 0.1 : 0]}>
          <torusGeometry args={[0.4, 0.1, 16, 100, Math.PI]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      ) : emotion === 'sad' ? (
        <mesh position={[0, -0.5, 0.85]} rotation={[Math.PI, 0, 0]}>
          <torusGeometry args={[0.3, 0.08, 16, 100, Math.PI]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      ) : (
        <mesh position={[0, -0.3, 0.85]} scale={isSpeaking ? [1, 0.5 + Math.sin(Date.now() * 0.01) * 0.2, 1] : [1, 0.2, 1]}>
          <boxGeometry args={[0.5, 0.1, 0.1]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      )}
    </>
  );
};

// Main Avatar Display Component
export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ 
  emotion = 'neutral',
  isAnimating = false,
  isSpeaking = false,
  className,
  message
}) => {
  const [waveAnimation, setWaveAnimation] = useState(false);
  const [use3DAvatar, setUse3DAvatar] = useState(true);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  
  // Display speech bubble when the message changes
  useEffect(() => {
    if (message) {
      setSpeechBubble(message);
      
      // Keep the speech bubble visible as long as isSpeaking is true
      if (!isSpeaking) {
        // If not speaking, clear after delay
        const timer = setTimeout(() => {
          setSpeechBubble(null);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    } else if (!isSpeaking) {
      // Clear bubble when message is removed and not speaking
      setSpeechBubble(null);
    }
  }, [message, isSpeaking]);
  
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

  const toggleAvatarType = () => {
    setUse3DAvatar(!use3DAvatar);
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-4", 
      className
    )}>
      {use3DAvatar ? (
        // 3D Avatar with speech bubble
        <div className={cn(
          "relative rounded-lg overflow-hidden w-full aspect-square max-w-xs transition-all duration-500 shadow-lg",
          isAnimating && "ring-2 ring-companion"
        )}>
          <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <Suspense fallback={null}>
              <Avatar3D 
                emotion={emotion} 
                isAnimating={isAnimating} 
                isSpeaking={isSpeaking} 
              />
            </Suspense>
            <OrbitControls 
              enableZoom={false} 
              enablePan={false}
              autoRotate={isAnimating}
              autoRotateSpeed={0.5}
              minPolarAngle={Math.PI/4}
              maxPolarAngle={Math.PI/1.5}
            />
          </Canvas>
          
          {waveAnimation && (
            <div className="absolute right-4 bottom-4 text-4xl animate-wave origin-bottom-right">
              👋
            </div>
          )}
          
          {speechBubble && (
            <div className={cn(
              "absolute top-0 right-0 max-w-[90%] bg-white border-2 border-companion rounded-2xl p-3 m-3 shadow-lg text-sm",
              isSpeaking ? "animate-pulse-subtle" : "animate-fade-in"
            )}>
              {speechBubble}
              <div className="absolute bottom-0 right-6 w-4 h-4 bg-white border-r-2 border-b-2 border-companion transform rotate-45 translate-y-2"></div>
            </div>
          )}
        </div>
      ) : (
        // 2D Avatar (Original)
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
          
          {speechBubble && (
            <div className={cn(
              "absolute top-full left-1/2 -translate-x-1/2 mt-4 max-w-[200px] bg-white border-2 border-companion rounded-2xl p-3 shadow-lg text-sm",
              isSpeaking ? "animate-pulse-subtle" : "animate-fade-in"
            )}>
              {speechBubble}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-companion transform -rotate-45"></div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 text-center font-medium text-lg">
        {isAnimating ? (
          <span className="text-companion-dark">
            {isSpeaking ? "I'm speaking..." : `I'm feeling ${emotion}`}
          </span>
        ) : (
          <span className="text-muted-foreground">AI Companion</span>
        )}
      </div>
      
      <button 
        onClick={toggleAvatarType}
        className="mt-2 text-xs text-muted-foreground hover:text-companion transition-colors"
      >
        Switch to {use3DAvatar ? '2D' : '3D'} Avatar
      </button>
    </div>
  );
};
