import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import { Mesh, Color } from 'three';
import { useTheme } from '@/hooks/use-theme';

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
  const { textColor } = useTheme();
  const isLeft = position[0] < 0;
  const textOffsetX = isLeft ? -1 : 1;
  const textRotationY = isLeft ? Math.PI/6 : -Math.PI/6;
  const meshRef = useRef<Mesh>(null);

  // Animação com GSAP
  useEffect(() => {
    if (!meshRef.current) return;

    // Configuração inicial
    meshRef.current.scale.set(1, 0, 1); // Começa "achatado"
    meshRef.current.position.y = 0;

    // Animação
    gsap.to(meshRef.current.scale, {
      y: 1,
      duration: 2.2,
      ease: "elastic.out(1, 0.9)",
      delay: position[0] * 0.3 // Delay escalonado
    });

    gsap.to(meshRef.current.position, {
      y: height / 2,
      duration: 2,
      ease: "power3.out",
      delay: position[0] * 0.3
    });

  }, [height, position]);

  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={[1, height, 1]}
        radius={0.06}
      >
        <meshStandardMaterial 
          color={color}
          metalness={0.4}
          roughness={0.1}
        />
      </RoundedBox>
      <Text
        position={[textOffsetX, height + 0.3, -0.5]}
        fontSize={0.25}
        color={textColor}
        anchorX={isLeft ? "right" : "left"}
        anchorY="bottom"
        rotation={[0, textRotationY, 0]}
      >
        {label}
      </Text>
      <Text
        position={[textOffsetX, height - 0.3, -0.3]}
        fontSize={0.25}
        color={textColor}
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
  const colors = ["#3a46ed", "#f5b083", "#5edd84", "#e76783"];
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
    <div className="h-auto w-full bg-white dark:bg-neutral-900/70 rounded-lg border-none">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="h-80 p-2 bg-white dark:bg-neutral-800/50 rounded-b-lg">
        <Canvas camera={{ position: [2, 2, 9], fov: 45 }}>
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[2, 5, 6]}
            intensity={1}
            color="#f7f7f7"
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

          {/* Chão */}
          <mesh position={[-0.2, 0, 0.4]}>
            <boxGeometry args={[3.5, 0.1, 3.5]} />
            <meshPhongMaterial color="#ececec" opacity={0.7} />
          </mesh>

          <OrbitControls
            target={[0, 2.2, 0]}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default Chart3D;
