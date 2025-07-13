import React, { useState } from 'react';

/**
 * Real-World Example: Pipe Flow (Demo)
 * Calculates and visualizes flow velocity for water in a pipe using Q = v*A.
 * (For demonstration, not a real CFD solver)
 */
const PI = Math.PI;
const waterDensity = 1000; // kg/m^3
const waterViscosity = 0.001; // Pa.s

function calcArea(diameter) {
  return PI * Math.pow(diameter / 2, 2);
}

function calcVelocity(flowRate, diameter) {
  return flowRate / calcArea(diameter);
}

export default function FluidDynamicsRealWorld() {
  const [flowRate, setFlowRate] = useState(0.01); // m^3/s
  const [diameter, setDiameter] = useState(0.1); // meters
  const velocity = calcVelocity(flowRate, diameter);

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-2">Pipe Flow (Real-World Demo)</h2>
      <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center">
        <label>Flow Rate (m³/s): <input type="number" step="0.001" value={flowRate} onChange={e => setFlowRate(Number(e.target.value))} className="border px-2 py-1 rounded w-32 ml-2" /></label>
        <label>Pipe Diameter (m): <input type="number" step="0.01" value={diameter} onChange={e => setDiameter(Number(e.target.value))} className="border px-2 py-1 rounded w-32 ml-2" /></label>
      </div>
      <FullscreenCanvasWrapper height={64}>
        <div className="relative h-16 w-full bg-blue-100 rounded">
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-8 bg-blue-400 rounded"
            style={{ width: `${Math.min(velocity * 100, 100)}%`, transition: 'width 0.3s' }}
          />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold">Velocity: {velocity.toFixed(2)} m/s</span>
        </div>
        {/* Color map legend for advanced visualization */}
        <div className="absolute bottom-2 left-2 bg-white bg-opacity-80 px-2 py-1 rounded shadow">
          <span className="text-xs">Color Map: </span>
          <span className="inline-block w-16 h-3 bg-gradient-to-r from-blue-400 via-green-300 to-yellow-400 align-middle" style={{ verticalAlign: 'middle' }} />
        </div>
      </FullscreenCanvasWrapper>
      <p className="mt-2 text-sm text-gray-600">Q = v·A, where Q is flow rate, v is velocity, A is pipe cross-section area.</p>
      {/* XY Analysis Plot */}
      <div className="mt-4">
        <AnalysisXYPlot title="Velocity vs. X" xLabel="X" yLabel="Velocity" />
      </div>
    </div>
  );
}
