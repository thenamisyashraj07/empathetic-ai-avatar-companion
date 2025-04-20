
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Cloud, Float, MeshDistortMaterial, MeshWobbleMaterial, Text3D } from '@react-three/drei';
import * as THREE from 'three';

interface BackgroundSceneProps {
  context: 'learning' | 'assessment' | 'interview';
}

const FuturisticSphere = ({ color, position, speed = 1.5 }: { color: THREE.Color; position?: [number, number, number]; speed?: number }) => (
  <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5}>
    <mesh position={position}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial color={color} speed={2} distort={0.3} radius={1} />
    </mesh>
  </Float>
);

const FuturisticText = ({ text, position, color }: { text: string; position: [number, number, number]; color: string }) => (
  <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
    <Text3D 
      position={position}
      size={0.5}
      height={0.1}
      curveSegments={12}
      bevelEnabled
      bevelThickness={0.01}
      bevelSize={0.02}
      bevelOffset={0}
      bevelSegments={5}
      font="/fonts/Inter_Bold.json"
    >
      {text}
      <MeshWobbleMaterial 
        color={color} 
        factor={0.1} 
        speed={1} 
        metalness={0.8}
        roughness={0.2}
      />
    </Text3D>
  </Float>
);

const AnimatedParticles = ({ count = 100, color = "#ffffff" }) => {
  const points = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (points.current) {
      points.current.rotation.x += 0.0005;
      points.current.rotation.y += 0.0003;
    }
  });
  
  const positions = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, [count]);
  
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        color={color} 
        sizeAttenuation 
        transparent 
        opacity={0.8}
      />
    </points>
  );
};

const BackgroundScene: React.FC<BackgroundSceneProps> = ({ context }) => {
  const getBackgroundColor = () => {
    switch (context) {
      case 'learning':
        return new THREE.Color('#0a0d21'); // Deeper space blue
      case 'assessment':
        return new THREE.Color('#0a1515'); // Deeper forest
      case 'interview':
        return new THREE.Color('#120a21'); // Deeper royal purple
      default:
        return new THREE.Color('#000000');
    }
  };

  const getThemeColor = () => {
    switch (context) {
      case 'learning':
        return '#6366f1'; // Indigo
      case 'assessment':
        return '#10b981'; // Green
      case 'interview':
        return '#8b5cf6'; // Purple
      default:
        return '#ffffff';
    }
  };

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 15] }}>
        <color attach="background" args={[getBackgroundColor()]} />
        <fog attach="fog" args={[getBackgroundColor().getHex(), 10, 25]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        
        {context === 'learning' && (
          <>
            <Stars radius={100} depth={50} count={7000} factor={4} saturation={1} fade speed={1.5} />
            <Cloud
              opacity={0.5}
              speed={0.4}
              position={[0, 2, 0]}
              segments={20}
            />
            <AnimatedParticles count={200} color="#4f46e5" />
            <Float speed={2} rotationIntensity={2} floatIntensity={2}>
              <mesh position={[-4, -2, -5]}>
                <torusKnotGeometry args={[1, 0.3, 128, 16]} />
                <MeshDistortMaterial color="#4f46e5" speed={2} distort={0.5} />
              </mesh>
            </Float>
            <FuturisticSphere color={new THREE.Color('#6366f1')} position={[3, 1, -2]} />
            <FuturisticSphere color={new THREE.Color('#818cf8')} position={[-3, -1, -3]} speed={1} />
            <FuturisticText text="LEARN" position={[-2.5, 3, -5]} color="#6366f1" />
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
            <AnimatedParticles count={150} color="#10b981" />
            <Float speed={1} rotationIntensity={1} floatIntensity={1}>
              <mesh position={[4, 2, -3]}>
                <octahedronGeometry args={[1]} />
                <MeshDistortMaterial color="#22c55e" speed={2} distort={0.4} />
              </mesh>
            </Float>
            <FuturisticSphere color={new THREE.Color('#10b981')} position={[2, -2, -3]} />
            <FuturisticSphere color={new THREE.Color('#34d399')} position={[-2, 2, -4]} speed={1.2} />
            <FuturisticText text="ASSESS" position={[-2.8, 3, -5]} color="#10b981" />
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
            <AnimatedParticles count={180} color="#8b5cf6" />
            <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1.5}>
              <mesh position={[-3, 0, -4]}>
                <dodecahedronGeometry args={[1]} />
                <MeshDistortMaterial color="#8b5cf6" speed={2} distort={0.6} />
              </mesh>
            </Float>
            <FuturisticSphere color={new THREE.Color('#7c3aed')} position={[3, -1, -2]} />
            <FuturisticSphere color={new THREE.Color('#a78bfa')} position={[-2, 2, -3]} speed={1.3} />
            <FuturisticText text="INTERVIEW" position={[-4, 3, -5]} color="#8b5cf6" />
          </>
        )}
      </Canvas>
    </div>
  );
};

export default BackgroundScene;
