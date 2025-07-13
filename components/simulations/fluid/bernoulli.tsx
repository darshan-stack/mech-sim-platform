import React, { useState } from 'react';
import FullscreenCanvasWrapper from '../../virtual-lab/fullscreen-canvas-wrapper';
import AnalysisXYPlot from '../../virtual-lab/analysis-xy-plot';
import SideNote from '../../ui/side-note';

export default function BernoulliExperiment() {
  const [velocity, setVelocity] = useState(2);
  const [height, setHeight] = useState(1);
  const [pressure, setPressure] = useState(100);

  // Dummy data for plot
  const data = Array.from({ length: 50 }, (_, i) => ({
    x: i,
    pressure: pressure - i * 1.5,
    velocity: velocity + i * 0.1,
  }));

  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-2">Bernoulli’s Theorem</h2>
      <div className="mb-2 flex gap-2 items-center">
        <label>Velocity:</label>
        <input type="range" min={0.5} max={5} step={0.1} value={velocity} onChange={e => setVelocity(Number(e.target.value))} />
        <span>{velocity}</span>
        <label>Height:</label>
        <input type="range" min={0} max={5} step={0.1} value={height} onChange={e => setHeight(Number(e.target.value))} />
        <span>{height}</span>
      </div>
    <div className="flex-1">
      <FullscreenCanvasWrapper height={250}>
        {/* Visualization: animated flow, color map, etc. */}
        <div className="flex items-center justify-center h-full">[Flow Visualization Here]</div>
      </FullscreenCanvasWrapper>
      <div className="mt-4">
        <AnalysisXYPlot
          title="Pressure & Velocity vs. X"
          xLabel="X"
          yLabel="Pressure / Velocity"
          data={{
            labels: data.map(d => d.x),
            datasets: [
              { label: 'Pressure', data: data.map(d => d.pressure), borderColor: 'red', tension: 0.4 },
              { label: 'Velocity', data: data.map(d => d.velocity), borderColor: 'blue', tension: 0.4 },
            ],
          }}
        />
      </div>
    </div>
    <div className="w-full lg:w-80 flex-shrink-0 mt-8 lg:mt-0">
      <SideNote
        title="Key Concepts & Formulae"
        points={[
          'Bernoulli’s Equation: P + 0.5ρv² + ρgh = constant',
          'Pressure drops as velocity increases (for streamline flow)',
        ]}
      />
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded shadow-sm mb-4">
        <div className="font-semibold text-blue-700 mb-1">Real-World Application</div>
        <div>Aircraft wing lift, carburetors, venturimeter</div>
      </div>
    </div>
  </div>
  );
}
