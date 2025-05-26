import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { Mesh, MeshPhongMaterial } from "three";

interface Chart3DProps {
  data: Array<{ name: string; value: number }>;
  title: string;
}

const Bar3D: React.FC<{
  position: [number, number, number];
  height: number;
  color: string;
  label: string;
}> = ({ position, height, color, label }) => {
  const meshRef = useRef<Mesh>(null);

  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, height / 2, 0]}>
        <boxGeometry args={[0.6, height, 0.6]} />
        <meshPhongMaterial color={color} shininess={100} specular="#ffffff" />
      </mesh>
      <Text
        position={[0, height + 0.5, 0]}
        fontSize={0.3}
        color="#2d3748"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.25}
        color="#4a5568"
        anchorX="center"
        anchorY="middle"
      >
        {height.toFixed(0)}
      </Text>
    </group>
  );
};

const Chart3D: React.FC<Chart3DProps> = ({ data, title }) => {
  const colors = ["#7C3AED", "#10B981", "#3B82F6", "#F59E0B"];
  const maxValue = Math.max(...data.map((d) => d.value));
  const scale = 3 / maxValue;

  // Ordenar dados do maior para o menor
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // Posições nos quadrantes
  const quadrantPositions: [number, number, number][] = [
    [-0.3, 0, 1], // Quadrante 1 (topo esquerda)
    [0.3, 0, 1], // Quadrante 2 (topo direita)
    [-0.3, 0, 1.6], // Quadrante 3 (baixo esquerda)
    [0.3, 0, 1.6], // Quadrante 4 (baixo direita)
  ];

  return (
    <div className="h-96 w-full bg-white dark:bg-gray-900 rounded-lg border">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="h-80">
        <Canvas camera={{ position: [-10, 12, -10], fov: 45 }}>
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            color="#ffffff"
          />

          {sortedData.map((item, index) => (
            <Bar3D
              key={item.name}
              position={quadrantPositions[index]}
              height={item.value * scale}
              color={colors[index]}
              label={item.name}
            />
          ))}

          {/* Linhas guia */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[4.5, 0.1, 4.5]} />
            <meshPhongMaterial color="#e2e8f0" transparent opacity={0.3} />
          </mesh>

          <OrbitControls
            enableZoom={true}
            enableRotate={true}
            minDistance={8}
            maxDistance={14}
            enablePan={false}
            target={[0, 2, 0]}
            minPolarAngle={Math.PI/3}   // Ângulo mínimo de 30 graus (impede visão de cima)
            maxPolarAngle={Math.PI/2.2} // Ângulo máximo de ~80 graus (impede visão de baixo)
            minAzimuthAngle={-Math.PI/4} // Rotação horizontal mínima
            maxAzimuthAngle={Math.PI/4}  // Rotação horizontal máxima
          />
        </Canvas>
      </div>
    </div>
  );
};

export default Chart3D;
