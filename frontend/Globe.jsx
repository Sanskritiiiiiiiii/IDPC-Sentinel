import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

export default function Globe() {
  const globeRef = useRef();
  const pointsRef = useRef();

  // UseMemo prevents these points from being recalculated every frame, saving CPU
  const threatPoints = useMemo(() => [...Array(15)].map(() => {
    const phi = Math.acos(-1 + Math.random() * 2);
    const theta = Math.random() * Math.PI * 2;
    return [
      2.25 * Math.sin(phi) * Math.cos(theta),
      2.25 * Math.sin(phi) * Math.sin(theta),
      2.25 * Math.cos(phi)
    ];
  }), []);

  // Frame-rate independent rotation
  useFrame((state, delta) => {
    const rotationSpeed = delta * 0.15;
    if (globeRef.current) globeRef.current.rotation.y += rotationSpeed;
    if (pointsRef.current) pointsRef.current.rotation.y += rotationSpeed;
  });

  return (
    <group>
      <Stars radius={100} depth={20} count={1000} factor={2} saturation={0} fade speed={0.5} />
      
      {/* Reduced segments from 64 to 32 to cut GPU load by 75% */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshPhongMaterial
          color="#1e40af"
          emissive="#3b82f6"
          emissiveIntensity={0.5}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      <group ref={pointsRef}>
        {threatPoints.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        ))}
      </group>

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
    </group>
  );
}
