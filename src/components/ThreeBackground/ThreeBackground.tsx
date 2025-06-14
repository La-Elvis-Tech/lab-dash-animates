
import React, { Suspense, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { Mesh, MeshStandardMaterial, Color, Group } from 'three'
import './ThreeBackground.css'

// Preload the model for better performance
useGLTF.preload('/models/base.glb')

function Model() {
  const { scene } = useGLTF('/models/base.glb')
  const modelRef = useRef<Group>(null)

  // Memoize the material to avoid recreating it on every render
  const optimizedMaterial = useMemo(() => 
    new MeshStandardMaterial({
      color: new Color('#120fd1'),
      metalness: 0.6,
      roughness: 0.1,
    }), []
  )

  useFrame((state, delta) => {
    if (modelRef.current) {
      // Reduce rotation speed and use more efficient animation
      modelRef.current.rotation.z += 0.5 * delta
    }
  })

  useEffect(() => {
    // Optimize the model once when it loads
    scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = optimizedMaterial
        child.castShadow = true
        child.receiveShadow = true
        // Optimize geometry
        if (child.geometry) {
          child.geometry.computeBoundingSphere()
        }
      }
    })
  }, [scene, optimizedMaterial])

  return (
    <group ref={modelRef} position={[0, -1, 0.3]} scale={0.3}>
      <primitive object={scene} rotation={[Math.PI / 2, -2, Math.PI / 1]} />
    </group>
  )
}

// Memoize the entire component to prevent unnecessary re-renders
export default React.memo(function ThreeBackground() {
  return (
    <div className="three-bg-container">
      <Canvas
        gl={{ 
          antialias: false, // Disable antialiasing for better performance
          alpha: true,
          powerPreference: "high-performance"
        }}
        shadows={false} // Disable shadows for better performance
        camera={{ position: [0, 1, 0], fov: 60 }}
        frameloop="demand" // Only render when needed
        performance={{ min: 0.5 }} // Lower performance threshold
      >
        {/* Simplified lighting for better performance */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />

        <Suspense fallback={null}>
          <Model />
          {/* Use simpler environment */}
          <Environment preset="dawn" />
        </Suspense>
        
        <OrbitControls 
          enableDamping={true}
        />
      </Canvas>
    </div>
  )
})
