import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Plane } from '@react-three/drei';

/**
 * Real-World Example: Cantilever Beam FEA (Demo)
 * This simulates a cantilever beam under a point load at the end, visualizing deflection.
 * (For demonstration, not a real FEA solver)
 */
function DeformedBeam({ load = 1000, length = 2, E = 200e9, I = 8e-6 }) {
  // Calculate max deflection using delta = (F*L^3)/(3*E*I)
  const delta = (load * Math.pow(length, 3)) / (3 * E * I);
  // Map delta to y-scale for visualization
  const yScale = 1 + Math.min(delta * 100, 0.3); // exaggerate for demo
  return (
    <Box args={[length, 0.2, 0.2]} position={[length / 2, -0.1 * (yScale - 1), 0]} scale={[1, yScale, 1]}>
      <meshStandardMaterial color={yScale > 1 ? 'orange' : 'skyblue'} />
    </Box>
  );
}

export default function FEA3DRealWorld() {
  const [load, setLoad] = useState(1000); // Newtons
  const [length, setLength] = useState(2); // meters
  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-2">Cantilever Beam FEA (Real-World Demo)</h2>
      <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center">
        <label>Load (N): <input type="number" value={load} onChange={e => setLoad(Number(e.target.value))} className="border px-2 py-1 rounded w-24 ml-2" /></label>
        <label>Length (m): <input type="number" value={length} onChange={e => setLength(Number(e.target.value))} className="border px-2 py-1 rounded w-24 ml-2" /></label>
      </div>
      <FullscreenCanvasWrapper height={250}>
        <Canvas style={{ height: '100%', background: '#eee' }} camera={{ position: [3, 2, 3] }}>
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} />
          <DeformedBeam load={load} length={length} />
          <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
            <meshStandardMaterial color="#ccc" />
          </Plane>
          <OrbitControls />
        </Canvas>
        {/* Color map legend for advanced visualization */}
        <div className="absolute bottom-2 left-2 bg-white bg-opacity-80 px-2 py-1 rounded shadow">
          <span className="text-xs">Color Map: </span>
          <span className="inline-block w-16 h-3 bg-gradient-to-r from-skyblue via-orange to-red-500 align-middle" style={{ verticalAlign: 'middle' }} />
        </div>
      </FullscreenCanvasWrapper>
      <p className="mt-2 text-sm text-gray-600">Deflection is exaggerated for visualization. Formula: δ = (F·L³)/(3·E·I)</p>
      {/* XY Analysis Plot */}
      <div className="mt-4">
        <AnalysisXYPlot title="Deflection vs. X" xLabel="X" yLabel="Deflection" />
      </div>
    </div>
  );
}
