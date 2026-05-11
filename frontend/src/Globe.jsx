import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";

export default function Globe() {
  const globeRef = useRef();
  const pointsRef = useRef();

  // Slow rotation to simulate a surveillance satellite view
  useFrame((state, delta) => {
    if (globeRef.current) globeRef.current.rotation.y += delta * 0.15;
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.15;
  });

  // Generate random threat points across the globe surface
  const threatPoints = [...Array(20)].map(() => {
    const phi = Math.acos(-1 + Math.random() * 2);
    const theta = Math.random() * Math.PI * 2;
    return [
      2.3 * Math.sin(phi) * Math.cos(theta),
      2.3 * Math.sin(phi) * Math.sin(theta),
      2.3 * Math.cos(phi)
    ];
  });

  return (
    <group>
      {/* Deep Space Atmosphere */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Main Holographic Globe Shell */}
        <mesh ref={globeRef}>
          <sphereGeometry args={[2.2, 64, 64]} />
          <meshPhongMaterial
            color="#1e40af"
            emissive="#3b82f6"
            emissiveIntensity={0.5}
            wireframe
            transparent
            opacity={0.2}
          />
        </mesh>

        {/* Inner Solid Core */}
        <mesh>
          <sphereGeometry args={[2.15, 64, 64]} />
          <meshPhongMaterial
            color="#05070a"
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Active Threat Points */}
        <group ref={pointsRef}>
          {threatPoints.map((pos, i) => (
            <mesh key={i} position={pos}>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshBasicMaterial color="#ef4444" />
              <pointLight distance={0.5} intensity={2} color="#ef4444" />
            </mesh>
          ))}
        </group>
      </Float>

      {/* Global Illumination */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
    </group>
  );
}
