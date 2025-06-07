
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface DataPoint {
  x: number;
  y: number;
  z: number;
  value: number;
  label: string;
}

interface Chart3DProps {
  data: DataPoint[];
  width?: number;
  height?: number;
}

function DataPoint3D({ position, value, label, color }: { 
  position: [number, number, number]; 
  value: number; 
  label: string;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const scale = Math.max(0.5, value / 100);

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[scale, scale, scale]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, scale/2 + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

export default function Chart3D({ data, width = 400, height = 300 }: Chart3DProps) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  const processedData = useMemo(() => {
    return data.map((point, index) => ({
      ...point,
      color: colors[index % colors.length]
    }));
  }, [data]);

  return (
    <div style={{ width, height }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} />
        
        {processedData.map((point, index) => (
          <DataPoint3D
            key={index}
            position={[point.x, point.y, point.z]}
            value={point.value}
            label={point.label}
            color={point.color}
          />
        ))}
        
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}
