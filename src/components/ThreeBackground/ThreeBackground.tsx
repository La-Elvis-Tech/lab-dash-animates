import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { Mesh, MeshStandardMaterial, Color } from 'three'
import './ThreeBackground.css'

function Model() {
  // carrega o GLB
  const { scene } = useGLTF('/models/DD.glb')

   // Remover texturas e aplicar cor sólida
  scene.traverse((child) => {
    if (child.isMesh) {
      // Se quiser substituir totalmente o material:
      child.material = new MeshStandardMaterial({
        color: new Color('#5900ff'), // aqui a cor desejada
      })
    }
  })
  return <primitive object={scene} position={[0, -1, 0]} rotation={[ 0, Math.PI / 2 , Math.PI / 2]}  scale={3}  />
}

export default function ThreeBackground() {
  return (
    <div className="three-bg-container">
      <Canvas
        gl={{ antialias: true }}
        camera={{ position: [0, 1, 0], fov: 60 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Model />
          {/* ambiente HDR para reflexos sutis (opcional) */}
          <Environment preset="city" />
        </Suspense>
        {/* desabilite controles se não quiser interação */}
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
}
