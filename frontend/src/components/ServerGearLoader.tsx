// src/components/ServerGearLoader.tsx
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Line } from "@react-three/drei";
import * as THREE from "three";

// Gear mesh component
function Gear({ radius = 1, thickness = 0.4, teeth = 12, color = "#00bfff", speed = 0.01, position = [0, 0, 0] }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Rotate gear continuously
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += speed;
    }
  });

  // Create simple gear geometry
  const geometry = new THREE.CylinderGeometry(radius, radius, thickness, 64, 1, false);
  geometry.rotateX(Math.PI / 2);

  return (
    <mesh ref={meshRef} geometry={geometry} position={position}>
      <meshPhysicalMaterial
        color={color}
        metalness={0.7}
        roughness={0.2}
        transparent
        opacity={0.5}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

// Pulsing energy line component
function EnergyLine({ points }: { points: [number, number, number][] }) {
  const materialRef = useRef<THREE.LineBasicMaterial>(null!);
  let pulse = 0;

  useFrame(() => {
    pulse += 0.03;
    if (materialRef.current) {
      materialRef.current.color = new THREE.Color(`hsl(${(pulse * 40) % 360}, 80%, 60%)`);
    }
  });

  const vectorPoints = points.map((p) => new THREE.Vector3(...p));
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(vectorPoints);

  return <line geometry={lineGeometry} ref={materialRef}><lineBasicMaterial color="#00ffff" linewidth={2} /></line>;
}

export default function ServerGearLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-200">
      <Canvas shadows>
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[0, 3, 6]} fov={35} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <pointLight position={[-5, 3, -5]} intensity={0.5} />

        {/* Transparent glass server shell */}
        <mesh>
          <boxGeometry args={[4, 4, 4]} />
          <meshPhysicalMaterial
            color="#a0d8ff"
            transparent
            opacity={0.15}
            roughness={0}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Three interlocking gears */}
        <Gear radius={1.2} thickness={0.5} teeth={16} color="#00bfff" speed={0.01} position={[0, 0, 0]} />
        <Gear radius={0.8} thickness={0.4} teeth={12} color="#00ffff" speed={-0.015} position={[1.5, 0, 0]} />
        <Gear radius={0.8} thickness={0.4} teeth={12} color="#00ffff" speed={-0.015} position={[-1.5, 0, 0]} />

        {/* Energy lines */}
        <EnergyLine points={[[0, 0, 0], [1.5, 0, 0]]} />
        <EnergyLine points={[[0, 0, 0], [-1.5, 0, 0]]} />

        {/* Optional subtle floor reflection */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.03} />
        </mesh>
      </Canvas>
    </div>
  );
}
