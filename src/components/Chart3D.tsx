import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { Mesh, MeshPhongMaterial, MeshStandardMaterial } from "three";
import { Value } from "@radix-ui/react-select";

interface Chart3DProps {
  data: Array<{ name: string; value: number }>;
  title: string;
}

const Bar3D: React.FC<{
  position: [number, number, number];
  height: number;
  color: string;
  label: string;
  value?: string | number;
}> = ({ position, height, color, label, value }) => {
  const isLeft = position[0] < 0;
  const textOffsetX = isLeft ? -1 : 1;
  const textRotationY = isLeft ? Math.PI/6 : -Math.PI/6;

  return (
    <group position={position}>
      <mesh position={[0, height/2, 0]}>
        <boxGeometry args={[1, height, 1]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>

      <Text
        position={[textOffsetX, height + 0.3, -0.5]}
        fontSize={0.25}
        color="#000000"
        anchorX={isLeft ? "right" : "left"}
        anchorY="bottom"
        rotation={[0, textRotationY, 0]}
      >
        {label}
      </Text>
      <Text
        position={[textOffsetX, height - 0.3, -0.3]}
        fontSize={0.25}
        color="#000000"
        anchorX={isLeft ? "right" : "left"}
        anchorY="bottom"
        rotation={[0, textRotationY, 0]}
      >
        {value !== undefined ? value + "%" : "N/A"}
      </Text>
    </group>
  );
};

const Chart3D: React.FC<Chart3DProps> = ({ data, title }) => {
  const colors = ["#3a46ed", "#2340a0", "#6599ee", "#3a96cc"];
  const maxValue = Math.max(...data.map((d) => d.value));
  const scale = 3 / maxValue;

  // Ordenar dados do maior para o menor
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // Posições nos quadrantes
  const quadrantPositions: [number, number, number][] = [
    [-0.8, 0, 0], // Quadrante 1 (topo esquerda)
    [0.3, 0, 0], // Quadrante 2 (topo direita)
    [-0.8, 0, 1.1], // Quadrante 3 (baixo esquerda)
    [0.3, 0, 1.1], // Quadrante 4 (baixo direita)
  ];

  return (
    <div className="h-auto w-full bg-white dark:bg-neutral-950/80 rounded-lg border-none">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="h-80 mb-8 bg-neutral-200  rounded-b-lg">
        <Canvas camera={{ position: [2, 2, 9], fov: 45 }}>
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            color="#c5c5c5"
          />

          {sortedData.map((item, index) => (
            <Bar3D
              key={item.name}
              position={quadrantPositions[index]}
              height={item.value * scale}
              color={colors[index]}
              label={item.name}
              value={item.value}
            />
          ))}

          {/* Linhas guia */}
          <mesh position={[-0.2, 0, 0.4]}>
            <boxGeometry args={[3.5, 0.1, 3.5]} />
            <meshPhongMaterial color="#e2e8f0" transparent opacity={0.9} />
          </mesh>

          <OrbitControls
            enableZoom={true}
            enableRotate={true}
            minDistance={6}
            maxDistance={10}
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
