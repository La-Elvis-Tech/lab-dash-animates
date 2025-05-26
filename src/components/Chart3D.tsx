
import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Mesh } from 'three';

interface Chart3DProps {
  data: Array<{ name: string; value: number }>;
  title: string;
}

const Bar3D: React.FC<{ position: [number, number, number]; height: number; color: string; label: string }> = ({
  position,
  height,
  color,
  label,
}) => {
  const meshRef = useRef<Mesh>(null);

  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, height / 2, 0]}>
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {label}
      </Text>
      <Text
        position={[0, height + 0.3, 0]}
        fontSize={0.25}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {height.toFixed(0)}
      </Text>
    </group>
  );
};

const Chart3D: React.FC<Chart3DProps> = ({ data, title }) => {
  const colors = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9'];
  const maxValue = Math.max(...data.map(d => d.value));
  const scale = 3 / maxValue; // Scale to max height of 3

  return (
    <div className="h-96 w-full bg-white dark:bg-gray-900 rounded-lg border">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{title}</h3>
      </div>
      <div className="h-80">
        <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          
          {data.map((item, index) => (
            <Bar3D
              key={item.name}
              position={[(index - data.length / 2 + 0.5) * 2, 0, 0]}
              height={item.value * scale}
              color={colors[index % colors.length]}
              label={item.name}
            />
          ))}
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={15}
          />
          
          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#f0f0f0" transparent opacity={0.3} />
          </mesh>
        </Canvas>
      </div>
    </div>
  );
};

export default Chart3D;
