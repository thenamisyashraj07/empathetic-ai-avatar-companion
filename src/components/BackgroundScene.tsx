
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Cloud, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface BackgroundSceneProps {
  context: 'learning' | 'assessment' | 'interview';
}

const FuturisticSphere = ({ color }: { color: THREE.Color }) => (
  <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial color={color} speed={2} distort={0.3} radius={1} />
    </mesh>
  </Float>
);

const BackgroundScene: React.FC<BackgroundSceneProps> = ({ context }) => {
  const getBackgroundColor = () => {
    switch (context) {
      case 'learning':
        return new THREE.Color('#0a192f'); // Deep space blue
      case 'assessment':
        return new THREE.Color('#162521'); // Deep forest
      case 'interview':
        return new THREE.Color('#1f1135'); // Royal purple
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
        
        {context === 'learning' && (
          <>
            <Stars radius={100} depth={50} count={7000} factor={4} saturation={1} fade speed={1.5} />
            <Cloud
              opacity={0.5}
              speed={0.4}
              position={[0, 2, 0]}
              segments={20}
            />
            <Float speed={2} rotationIntensity={2} floatIntensity={2}>
              <mesh position={[-4, -2, -5]}>
                <torusKnotGeometry args={[1, 0.3, 128, 16]} />
                <MeshDistortMaterial color="#4f46e5" speed={2} distort={0.5} />
              </mesh>
            </Float>
            <FuturisticSphere color={new THREE.Color('#6366f1')} />
          </>
        )}
        
        {context === 'assessment' && (
          <>
            <Stars radius={50} depth={50} count={5000} factor={4} saturation={0.8} fade speed={1} />
            <Cloud
              opacity={0.3}
              speed={0.2}
              position={[0, 1, 0]}
              segments={15}
            />
            <Float speed={1} rotationIntensity={1} floatIntensity={1}>
              <mesh position={[4, 2, -3]}>
                <octahedronGeometry args={[1]} />
                <MeshDistortMaterial color="#22c55e" speed={2} distort={0.4} />
              </mesh>
            </Float>
            <FuturisticSphere color={new THREE.Color('#10b981')} />
          </>
        )}
        
        {context === 'interview' && (
          <>
            <Stars radius={70} depth={50} count={6000} factor={4} saturation={1} fade speed={2} />
            <Cloud
              opacity={0.4}
              speed={0.3}
              position={[0, 3, 0]}
              segments={18}
            />
            <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1.5}>
              <mesh position={[-3, 0, -4]}>
                <dodecahedronGeometry args={[1]} />
                <MeshDistortMaterial color="#8b5cf6" speed={2} distort={0.6} />
              </mesh>
            </Float>
            <FuturisticSphere color={new THREE.Color('#7c3aed')} />
          </>
        )}
      </Canvas>
    </div>
  );
};

export default BackgroundScene;

