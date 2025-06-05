
import React, { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { Mesh, MeshStandardMaterial, Color, Group, Box3, Vector3 } from 'three'
import './ThreeBackground.css'

function Model() {
  const { scene } = useGLTF('/models/base.glb')
  const modelRef = useRef<Group>(null)

  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.z += 1 * delta

    }
  })

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = new MeshStandardMaterial({
          color: new Color('#120fd1'),
          metalness: 0.6,  // Ajustado para melhor reflexo
          roughness: 0.1,  // Ajustado para sombras mais definidas
        })
        child.castShadow = true  // Habilita sombra projetada
        child.receiveShadow = true  // Habilita sombra recebida
      }
    })
  }, [scene])

  return (
    <group ref={modelRef} position={[0, -1, 0.3]} scale={0.35}>
      <primitive object={scene} rotation={[Math.PI / 2, -2, Math.PI / 1 ]} />
    </group>
  )
}

export default function ThreeBackground() {
  return (
    <div className="three-bg-container">
      <Canvas
        gl={{ antialias: true }}
        shadows // Habilita sistema de sombras
        camera={{ position: [0, 1, 0], fov: 60 }}
      >
        {/* Luz ambiente reduzida para aumentar contraste */}
        <ambientLight intensity={0.3} />
        
        {/* Luz direcional principal com sombras */}
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={1.5} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        <Suspense fallback={null}>
          <Model />
          {/* Ambiente com maior intensidade */}
          <Environment preset="city" />
        </Suspense>
        
        <OrbitControls />
      </Canvas>
    </div>
  )
}
