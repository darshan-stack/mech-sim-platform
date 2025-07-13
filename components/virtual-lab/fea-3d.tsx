import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Plane } from '@react-three/drei';
import FullscreenCanvasWrapper from './fullscreen-canvas-wrapper';
import AnalysisXY3DPlot from './analysis-xy-3d-plot';

/**
 * Simple 3D FEA Demo: Visualizes a cube mesh and shows a basic static deformation.
 * This is a placeholder for a real FEA solver, but demonstrates 3D mesh and result display.
 */
function DeformedCube({ deformation = 0.2 }) {
  // Simulate deformation by scaling one axis
  return (
    <Box args={[1, 1, 1]} scale={[1 + deformation, 1, 1]}>
      <meshStandardMaterial color={deformation > 0 ? 'orange' : 'skyblue'} />
    </Box>
  );
}

export default function FEA3DSimulation() {
  const [deformation, setDeformation] = useState(0.2);

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-2">3D FEA Simulation (Demo)</h2>
      <div className="mb-2 flex items-center gap-2">
        <label>Deformation:</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={deformation}
          onChange={e => setDeformation(Number(e.target.value))}
        />
        <span>{deformation.toFixed(2)}</span>
      </div>
      <FullscreenCanvasWrapper height={300}>
        <Canvas style={{ height: '100%', background: '#eee' }} camera={{ position: [3, 3, 3] }}>
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} />
          <DeformedCube deformation={deformation} />
          <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
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
      <p className="mt-2 text-sm text-gray-600">This is a visual demo. Real FEA would require mesh, boundary, solver, and results.</p>
      {/* 3D XY Analysis Plot: Position vs. Velocity vs. Time */}
      <div className="mt-4">
        {/* Example data for 3D plot: X = time, Y = deformation, Z = velocity (dummy) */}
        {typeof AnalysisXY3DPlot === 'function' ? (
          <AnalysisXY3DPlot
            title="Deformation 3D Analysis"
            xLabel="Time"
            yLabel="Deformation"
            zLabel="Velocity"
            dataPoints={Array.from({ length: 20 }, (_, i) => ({ x: i, y: deformation * i, z: Math.sin(i) }))}
          />
        ) : (
          <div className="bg-yellow-100 text-yellow-700 p-2 rounded">3D chart dependency not installed. Please install <code>chartjs-chart-3d</code> for 3D plots.</div>
        )}
      </div>
    </div>
  );
}
