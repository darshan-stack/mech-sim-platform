import React, { useState } from 'react';

/**
 * Simple Fluid Dynamics Demo: Visualizes a 1D pipe and allows changing flow rate.
 * This is a placeholder for a real CFD solver, but demonstrates flow visualization.
 */
export default function FluidDynamicsModule() {
  const [flow, setFlow] = useState(1);

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-2">Fluid Dynamics Module (Demo)</h2>
      <div className="mb-2 flex items-center gap-2">
        <label>Flow Rate:</label>
        <input
          type="range"
          min={0}
          max={10}
          step={0.1}
          value={flow}
          onChange={e => setFlow(Number(e.target.value))}
        />
        <span>{flow.toFixed(1)}</span>
      </div>
      <FullscreenCanvasWrapper height={64}>
        <div className="relative h-16 w-full bg-blue-100 rounded">
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-8 bg-blue-400 rounded"
            style={{ width: `${10 * flow}%`, transition: 'width 0.3s' }}
          />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold">Flow</span>
        </div>
        {/* Color map legend for advanced visualization */}
        <div className="absolute bottom-2 left-2 bg-white bg-opacity-80 px-2 py-1 rounded shadow">
          <span className="text-xs">Color Map: </span>
          <span className="inline-block w-16 h-3 bg-gradient-to-r from-blue-400 via-green-300 to-yellow-400 align-middle" style={{ verticalAlign: 'middle' }} />
        </div>
      </FullscreenCanvasWrapper>
      <p className="mt-2 text-sm text-gray-600">This is a visual demo. Real CFD would solve Navier-Stokes equations.</p>
      {/* XY Analysis Plot */}
      <div className="mt-4">
        <AnalysisXYPlot title="Flow vs. X" xLabel="X" yLabel="Flow" />
      </div>
    </div>
  );
}
