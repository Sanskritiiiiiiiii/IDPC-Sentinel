import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, useTexture } from "@react-three/drei";

export default function Globe() {
  const globeRef = useRef();
  const pointsRef = useRef();

  // 1. High-contrast Earth Texture
  const earthTexture = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');

  // 2. Reduce points to 10 for maximum performance in VirtualBox
  const threatPoints = useMemo(() => [...Array(10)].map(() => {
    const phi = Math.acos(-1 + Math.random() * 2);
    const theta = Math.random() * Math.PI * 2;
    return [
      2.22 * Math.sin(phi) * Math.cos(theta),
      2.22 * Math.sin(phi) * Math.sin(theta),
      2.22 * Math.cos(phi)
    ];
  }), []);

  useFrame((state, delta) => {
    const speed = delta * 0.15;
    if (globeRef.current) globeRef.current.rotation.y += speed;
    if (pointsRef.current) pointsRef.current.rotation.y += speed;
  });

  return (
    <group>
      {/* Dim the stars so the globe is the focus */}
      <Stars radius={100} depth={10} count={500} factor={1} fade speed={0.5} />
      
      <mesh ref={globeRef}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshStandardMaterial 
          map={earthTexture} 
          emissive="#224488" // Creates a blue "inner glow" so it stands out from black
          emissiveIntensity={0.6}
          roughness={0.5}
          metalness={0.5}
        />
      </mesh>

      {/* Brighter Threat Points */}
      <group ref={pointsRef}>
        {threatPoints.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#ff2222" />
            <pointLight distance={0.4} intensity={5} color="#ff0000" />
          </mesh>
        ))}
      </group>

      {/* Increased light intensity to stop the 'mixing' with background */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />
    </group>
  );
}
