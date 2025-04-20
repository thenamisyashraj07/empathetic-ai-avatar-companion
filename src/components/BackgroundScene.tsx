
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Cloud } from '@react-three/drei';
import * as THREE from 'three';

interface BackgroundSceneProps {
  context: 'learning' | 'assessment' | 'interview';
}

const BackgroundScene: React.FC<BackgroundSceneProps> = ({ context }) => {
  const getBackgroundColor = () => {
    switch (context) {
      case 'learning':
        return new THREE.Color('#1a237e'); // Deep blue for learning
      case 'assessment':
        return new THREE.Color('#1b5e20'); // Deep green for assessment
      case 'interview':
        return new THREE.Color('#4a148c'); // Deep purple for interview
      default:
        return new THREE.Color('#000000');
    }
  };

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 15] }}>
        <color attach="background" args={[getBackgroundColor()]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Different elements based on context */}
        {context === 'learning' && (
          <>
            <Stars radius={100} depth={50} count={5000} factor={4} />
            <Cloud
              opacity={0.5}
              speed={0.4}
              width={10}
              depth={1.5}
              segments={20}
            />
          </>
        )}
        
        {context === 'assessment' && (
          <>
            <Stars radius={50} depth={50} count={3000} factor={4} />
            <Cloud
              opacity={0.3}
              speed={0.2}
              width={20}
              depth={2}
              segments={15}
            />
          </>
        )}
        
        {context === 'interview' && (
          <>
            <Stars radius={70} depth={50} count={4000} factor={4} />
            <Cloud
              opacity={0.4}
              speed={0.3}
              width={15}
              depth={1.8}
              segments={18}
            />
          </>
        )}
      </Canvas>
    </div>
  );
};

export default BackgroundScene;
