import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

interface AvatarDisplayProps {
  emotion?: string;
  isAnimating?: boolean;
  isSpeaking?: boolean;
  className?: string;
  message?: string | null;
}

// Enhanced 3D Avatar Component
const Avatar3D = ({ emotion = 'neutral', isAnimating = false, isSpeaking = false }) => {
  // Enhanced emotion colors with gradients
  const getEmotionColor = () => {
    switch(emotion) {
      case 'happy': return new THREE.Color('#4ade80').multiplyScalar(1.2);
      case 'sad': return new THREE.Color('#60a5fa').multiplyScalar(1.2);
      case 'angry': return new THREE.Color('#f87171').multiplyScalar(1.2);
      case 'surprised': return new THREE.Color('#facc15').multiplyScalar(1.2);
      case 'anxious': return new THREE.Color('#fb923c').multiplyScalar(1.2);
      case 'excited': return new THREE.Color('#ec4899').multiplyScalar(1.2);
      case 'calm': return new THREE.Color('#38bdf8').multiplyScalar(1.2);
      default: return new THREE.Color('#8b5cf6').multiplyScalar(1.2);
    }
  };

  return (
    <>
      {/* Enhanced Head with better shading */}
      <mesh position={[0, 0, 0]} scale={isAnimating ? [1.05, 1.05, 1.05] : [1, 1, 1]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          color={getEmotionColor()} 
          metalness={0.3}
          roughness={0.7}
          envMapIntensity={1}
        />
      </mesh>
      
      {/* Enhanced Eyes with depth */}
      <mesh position={[-0.3, 0.2, 0.85]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          clearcoat={1}
          clearcoatRoughness={0}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0.3, 0.2, 0.85]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          clearcoat={1}
          clearcoatRoughness={0}
          metalness={0.1}
        />
      </mesh>
      
      {/* Enhanced Pupils with shine */}
      <mesh position={[-0.3, 0.2, 0.98]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial 
          color="#000000"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0.3, 0.2, 0.98]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial 
          color="#000000"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Enhanced Mouth with better animations */}
      {emotion === 'happy' || emotion === 'excited' ? (
        <mesh 
          position={[0, -0.3, 0.85]} 
          rotation={[0, 0, isSpeaking ? Math.sin(Date.now() * 0.01) * 0.1 : 0]}
        >
          <torusGeometry args={[0.4, 0.12, 32, 100, Math.PI]} />
          <meshPhysicalMaterial 
            color="#000000"
            clearcoat={0.5}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
      ) : emotion === 'sad' ? (
        <mesh 
          position={[0, -0.5, 0.85]} 
          rotation={[Math.PI, 0, 0]}
        >
          <torusGeometry args={[0.3, 0.1, 32, 100, Math.PI]} />
          <meshPhysicalMaterial 
            color="#000000"
            clearcoat={0.5}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
      ) : (
        <mesh 
          position={[0, -0.3, 0.85]} 
          scale={isSpeaking ? [1, 0.5 + Math.sin(Date.now() * 0.01) * 0.2, 1] : [1, 0.2, 1]}
        >
          <boxGeometry args={[0.5, 0.12, 0.12]} />
          <meshPhysicalMaterial 
            color="#000000"
            clearcoat={0.5}
            metalness={0.5}
            roughness={0.2}
          />
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

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-4", 
      className
    )}>
      {/* Always use 3D Avatar */}
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
      
      <div className="mt-4 text-center font-medium text-lg">
        {isAnimating ? (
          <span className="text-companion-dark">
            {isSpeaking ? "I'm speaking..." : `I'm feeling ${emotion}`}
          </span>
        ) : (
          <span className="text-muted-foreground">AI Companion</span>
        )}
      </div>
    </div>
  );
};
