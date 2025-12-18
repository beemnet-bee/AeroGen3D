import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Sky, 
  Stars, 
  ContactShadows
} from '@react-three/drei';
import * as THREE from 'three';
import { WeatherState } from '../types';

// Procedural Turbine Mesh
const TurbineModel: React.FC<{ 
  rpm: number; 
  yaw: number; 
  pitch: number;
  color: string;
}> = ({ rpm, yaw, pitch, color }) => {
  const bladeGroupRef = useRef<THREE.Group>(null);
  const nacelleRef = useRef<THREE.Group>(null);

  // Animate blades
  useFrame((state, delta) => {
    if (bladeGroupRef.current) {
      const rotationSpeed = (rpm / 60) * 2 * Math.PI * delta;
      bladeGroupRef.current.rotation.z -= rotationSpeed;
    }
    
    // Smoothly interpolate yaw
    if (nacelleRef.current) {
        nacelleRef.current.rotation.y = THREE.MathUtils.lerp(
            nacelleRef.current.rotation.y, 
            (yaw * Math.PI) / 180, 
            delta * 0.5
        );
    }
  });

  const materialProps = { 
    metalness: 0.6, 
    roughness: 0.2, 
    color: color 
  };

  // Convert pitch to radians for the 3D model (rotation around blade's Y axis locally)
  // We lerp the visual pitch for smoothness if physics snaps
  const visualPitchRad = (pitch * Math.PI) / 180;

  return (
    <group position={[0, -4, 0]}>
      {/* Tower */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.3, 0.6, 8, 32]} />
        <meshStandardMaterial {...materialProps} color="#cbd5e1" />
      </mesh>

      {/* Nacelle Group (Rotates with Yaw) */}
      <group ref={nacelleRef} position={[0, 8, 0]}>
        {/* Nacelle Body */}
        <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.5, 1.5, 4, 16]} />
          <meshStandardMaterial {...materialProps} color="#94a3b8" />
        </mesh>
        
        {/* Hub */}
        <mesh position={[0, 0, 1.3]} rotation={[Math.PI / 2, 0, 0]}>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.1} />
        </mesh>

        {/* Blades Group */}
        <group ref={bladeGroupRef} position={[0, 0, 1.3]}>
           {[0, 1, 2].map((i) => (
             <group key={i} rotation={[0, 0, (i * 2 * Math.PI) / 3]}>
                {/* Blade Pitch Pivot Group */}
                <group rotation={[0, visualPitchRad, 0]}>
                    {/* Single Blade (offset so pivot is at root) */}
                    <mesh position={[0, 2.5, 0]} rotation={[0, 0, 0]}>
                        <boxGeometry args={[0.3, 5, 0.05]} /> 
                        <meshStandardMaterial color="#f8fafc" metalness={0.1} roughness={0.2} />
                    </mesh>
                    {/* Aerodynamic twist visual */}
                    <mesh position={[0, 0.5, 0]} scale={[0.8, 1, 1]}>
                        <cylinderGeometry args={[0.1, 0.2, 1, 16]} />
                        <meshStandardMaterial color="#f8fafc" />
                    </mesh>
                </group>
             </group>
           ))}
        </group>
        
        {/* Anemometer on top */}
        <group position={[0, 0.6, -0.5]}>
             <mesh>
                 <cylinderGeometry args={[0.05, 0.05, 0.3]} />
                 <meshStandardMaterial color="#333" />
             </mesh>
             <mesh position={[0, 0.15, 0]} rotation={[0,0, Math.PI/2]}>
                <boxGeometry args={[0.4, 0.05, 0.05]} />
                <meshStandardMaterial color="#333" />
             </mesh>
        </group>
      </group>
    </group>
  );
};

interface SceneProps {
  rpm: number;
  pitch: number;
  weather: WeatherState;
}

const Scene: React.FC<SceneProps> = ({ rpm, pitch, weather }) => {
  const isNight = weather.timeOfDay === 'night';
  const isSunset = weather.timeOfDay === 'sunset';
  
  const sunPosition: [number, number, number] = useMemo(() => {
     if (isNight) return [0, -10, -10]; 
     if (isSunset) return [-10, 2, -10];
     return [10, 10, 10];
  }, [isNight, isSunset]);

  return (
    <Canvas shadows camera={{ position: [5, 2, 10], fov: 50 }}>
      <ambientLight intensity={isNight ? 0.2 : 0.5} />
      <directionalLight 
        position={sunPosition} 
        intensity={isNight ? 0 : 1.5} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
      />
      <pointLight position={[-2, 8, 2]} intensity={0.5} color={isSunset ? "#ff7e5f" : "#ffffff"} />

      <Sky 
        sunPosition={sunPosition} 
        turbidity={weather.turbulence * 10} 
        rayleigh={isSunset ? 0.5 : 3} 
        mieCoefficient={0.005} 
        mieDirectionalG={0.7} 
      />
      {isNight && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={isNight ? "#0f172a" : "#10b981"} roughness={1} />
      </mesh>
      <gridHelper args={[100, 100, 0xffffff, 0x555555]} position={[0, -3.99, 0]} />

      <TurbineModel rpm={rpm} pitch={pitch} yaw={weather.windDirection} color="#fff" />
      
      <ContactShadows position={[0, -4, 0]} opacity={0.5} scale={20} blur={2} far={4.5} />
      <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.1} maxDistance={25} minDistance={5} />
    </Canvas>
  );
};

export default Scene;
