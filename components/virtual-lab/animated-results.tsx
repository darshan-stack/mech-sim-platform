import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Plane } from '@react-three/drei';

/**
 * Animated FEA/CFD Results Demo
 * Animates a simple beam's deflection or a flow front for demonstration.
 */
function AnimatedBeam({ maxDeflection = 0.3 }) {
  const [deflection, setDeflection] = useState(0);
  React.useEffect(() => {
    let frame = 0;
    let anim: number;
    function animate() {
      setDeflection(Math.abs(Math.sin(frame / 30)) * maxDeflection);
      frame++;
      anim = requestAnimationFrame(animate);
    }
    anim = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(anim);
  }, [maxDeflection]);
  return (
    <Box args={[2, 0.2, 0.2]} position={[1, -0.1 * deflection, 0]} scale={[1, 1 + deflection, 1]}>
      <meshStandardMaterial color={deflection > 0 ? 'orange' : 'skyblue'} />
    </Box>
  );
}

export default function AnimatedResults() {
  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-2">Animated Simulation Results</h2>
      <Canvas style={{ height: 250, background: '#eee' }} camera={{ position: [3, 2, 3] }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} />
        <AnimatedBeam maxDeflection={0.3} />
        <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
          <meshStandardMaterial color="#ccc" />
        </Plane>
        <OrbitControls />
      </Canvas>
      <p className="mt-2 text-sm text-gray-600">This demo animates a beam's deflection. Real FEA/CFD would animate mesh results or flow fields.</p>
    </div>
  );
}
