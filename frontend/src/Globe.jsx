import React, { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, useTexture, Line, Html } from "@react-three/drei";
import * as THREE from "three";

export default function Globe() {
  const globeRef = useRef();
  const pointsRef = useRef();
  const [hovered, setHovered] = useState(null);
  
  const earthTexture = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');

  const { threatData, arcs } = useMemo(() => {
    const points = [...Array(6)].map((_, i) => {
      const phi = Math.acos(-1 + Math.random() * 2);
      const theta = Math.random() * Math.PI * 2;
      return {
        id: i,
        pos: [2.22 * Math.sin(phi) * Math.cos(theta), 2.22 * Math.sin(phi) * Math.sin(theta), 2.22 * Math.cos(phi)],
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.x.x`
      };
    });

    const target = new THREE.Vector3(0, 2.22, 0); 
    const arcLines = points.map(p => {
      const start = new THREE.Vector3(...p.pos);
      const mid = start.clone().lerp(target, 0.5).normalize().multiplyScalar(3.6); 
      const curve = new THREE.QuadraticBezierCurve3(start, mid, target);
      return curve.getPoints(32);
    });

    return { threatData: points, arcs: arcLines };
  }, []);

  useFrame((state, delta) => {
    const speed = delta * 0.1;
    if (globeRef.current) globeRef.current.rotation.y += speed;
    if (pointsRef.current) pointsRef.current.rotation.y += speed;
    
    pointsRef.current.children.forEach((child, i) => {
      if (child.type === "Group") {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 4 + i) * 0.2;
        child.children[0].scale.set(pulse, pulse, pulse);
      }
    });
  });

  return (
    <group position={[0, -0.4, 0]} scale={0.75}> {/* Reduced scale and lowered position for better fit */}
      <Stars radius={100} depth={5} count={200} factor={1} fade />
      
      <mesh ref={globeRef}>
        <sphereGeometry args={[2.2, 48, 48]} />
        <meshStandardMaterial 
          map={earthTexture} 
          emissive="#1a2a4a" 
          emissiveIntensity={0.4} 
          metalness={0.2} 
          roughness={0.7} 
        />
      </mesh>

      <group ref={pointsRef}>
        {threatData.map((data, i) => (
          <group key={data.id}>
            <mesh 
              position={data.pos}
              onPointerOver={() => setHovered(data)}
              onPointerOut={() => setHovered(null)}
            >
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshBasicMaterial color={hovered?.id === data.id ? "#ffffff" : "#b30000"} />
              
              {hovered?.id === data.id && (
                <Html distanceFactor={10} position={[0, 0.4, 0]}>
                  <div style={{ 
                    background: 'rgba(5, 5, 10, 0.95)', 
                    color: '#ff4444', 
                    padding: '8px 12px', 
                    borderRadius: '2px', 
                    border: '1px solid #8b0000',
                    backdropFilter: 'blur(10px)',
                    fontSize: '10px',
                    fontFamily: 'monospace'
                  }}>
                    SRC_IP: {data.ip}
                  </div>
                </Html>
              )}
            </mesh>

            <Line 
              points={arcs[i]} 
              color="#8b0000" 
              lineWidth={1.5} 
              transparent 
              opacity={0.5} 
            />
          </group>
        ))}
      </group>

      <ambientLight intensity={0.8} /> 
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, -5, 5]} intensity={1.2} color="#224488" />
    </group>
  );
}
