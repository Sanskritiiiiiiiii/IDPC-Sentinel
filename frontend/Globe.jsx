import React, { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, useTexture, Line, Html } from "@react-three/drei";
import * as THREE from "three";

// Helper function to turn any real IP string into fixed, unique coordinates on the sphere
function convertIpToCoordinates(ipString, radius = 2.22) {
  if (!ipString || ipString === "Unknown") {
    // Fallback if IP data is missing
    return { pos: [0, radius, 0], ipDisplay: "0.0.0.0" };
  }

  // Simple string hashing to get reproducible pseudo-random fractions between 0 and 1
  let hash = 0;
  for (let i = 0; i < ipString.length; i++) {
    hash = ipString.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const seed1 = Math.abs(Math.sin(hash + 1));
  const seed2 = Math.abs(Math.cos(hash + 2));

  // Convert fractions to spherical angles
  const phi = Math.acos(-1 + seed1 * 2); 
  const theta = seed2 * Math.PI * 2;

  // Render x, y, z positions on sphere surface
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);

  return {
    pos: [x, y, z],
    ipDisplay: ipString
  };
}

export default function Globe({ liveAlerts = [] }) {
  const globeRef = useRef();
  const pointsRef = useRef();
  const [hovered, setHovered] = useState(null);
  
  const earthTexture = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');

  // Dynamically calculate points and arcs based on real data array passed from App.js
  const { threatData, arcs } = useMemo(() => {
    // If no real alerts exist yet, provide a single harmless default baseline center point
    const processedAlerts = liveAlerts.length > 0 ? liveAlerts : [
      { alert: { src_ip: "10.0.2.15", signature: "Sentinel Standby Core Node" } }
    ];

    // Take up to the 10 most recent threat alerts to prevent performance lagging
    const itemsToProcess = processedAlerts.slice(0, 10);

    const points = itemsToProcess.map((item, idx) => {
      const srcIp = item?.alert?.src_ip || "127.0.0.1";
      const { pos, ipDisplay } = convertIpToCoordinates(srcIp);
      return {
        id: `${srcIp}-${idx}`,
        pos: pos,
        ip: ipDisplay,
        signature: item?.alert?.signature || "Suspicious Activity Detected"
      };
    });

    // The destination center target (where the threat attack curves strike down)
    const target = new THREE.Vector3(0, 2.22, 0); 
    const arcLines = points.map(p => {
      const start = new THREE.Vector3(...p.pos);
      // Curve midheight peaks out to a scalar bounds of 3.3
      const mid = start.clone().lerp(target, 0.5).normalize().multiplyScalar(3.3); 
      const curve = new THREE.QuadraticBezierCurve3(start, mid, target);
      return curve.getPoints(32);
    });

    return { threatData: points, arcs: arcLines };
  }, [liveAlerts]);

  useFrame((state, delta) => {
    const speed = delta * 0.05; // Slightly slower elegant spin speed
    if (globeRef.current) globeRef.current.rotation.y += speed;
    if (pointsRef.current) pointsRef.current.rotation.y += speed;
    
    if (pointsRef.current && pointsRef.current.children.length > 0) {
      pointsRef.current.children.forEach((child, i) => {
        if (child.type === "Group" && child.children[0]) {
          const pulse = 1 + Math.sin(state.clock.elapsedTime * 5 + i) * 0.2;
          child.children[0].scale.set(pulse, pulse, pulse);
        }
      });
    }
  });

  return (
    <group position={[0, -0.2, 0]} scale={1.1}> 
      <Stars radius={100} depth={5} count={150} factor={1} fade />
      
      <mesh ref={globeRef}>
        <sphereGeometry args={[2.2, 48, 48]} />
        <meshStandardMaterial 
          map={earthTexture} 
          emissive="#0d1b3a" 
          emissiveIntensity={0.6} 
          metalness={0.1} 
          roughness={0.6} 
        />
      </mesh>

      <group ref={pointsRef}>
        {threatData.map((data, i) => (
          <group key={data.id}>
            {/* The Threat Attack Coordinate Node */}
            <mesh 
              position={data.pos}
              onPointerOver={() => setHovered(data)}
              onPointerOut={() => setHovered(null)}
            >
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshBasicMaterial color={hovered?.id === data.id ? "#3bccff" : "#ef4444"} />
              
              {hovered?.id === data.id && (
                <Html distanceFactor={8} position={[0, 0.3, 0]} center>
                  <div style={{ 
                    background: 'rgba(3, 7, 18, 0.95)', 
                    color: '#f8fafc', 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    backdropFilter: 'blur(8px)',
                    fontSize: '9px',
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
                  }}>
                    <div style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '2px' }}>⚠️ {data.signature}</div>
                    <span style={{ color: '#94a3b8' }}>SOURCE IP:</span> {data.ip}
                  </div>
                </Html>
              )}
            </mesh>

            {/* The Vector Arc Path linking attack origin point to targets */}
            <Line 
              points={arcs[i]} 
              color="#ef4444" 
              lineWidth={1.2} 
              transparent 
              opacity={0.4} 
            />
          </group>
        ))}
      </group>

      <ambientLight intensity={0.7} /> 
      <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-10, -5, 5]} intensity={1.0} color="#1d4ed8" />
    </group>
  );
}
