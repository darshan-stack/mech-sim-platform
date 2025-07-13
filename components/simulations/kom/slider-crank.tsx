import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FullscreenCanvasWrapper from '../../virtual-lab/fullscreen-canvas-wrapper';
import AnalysisXYPlot from '../../virtual-lab/analysis-xy-plot';
import SideNote from '../../ui/side-note';

export default function SliderCrankExperiment() {
  const [angle, setAngle] = useState(0);
  const [crankLength, setCrankLength] = useState(2);
  const [rodLength, setRodLength] = useState(6);

  // Dummy data for plot
  const data = Array.from({ length: 100 }, (_, i) => ({
    time: i * 0.1,
    position: Math.sin(i * 0.1),
    velocity: Math.cos(i * 0.1),
  }));

  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold mb-2">Slider-Crank Mechanism</h2>
        <div className="mb-2 flex gap-2 items-center flex-wrap">
          <label>Crank Length:</label>
          <input type="range" min={1} max={5} step={0.1} value={crankLength} onChange={e => setCrankLength(Number(e.target.value))} />
          <span>{crankLength}</span>
          <label>Rod Length:</label>
          <input type="range" min={2} max={10} step={0.1} value={rodLength} onChange={e => setRodLength(Number(e.target.value))} />
          <span>{rodLength}</span>
        </div>
        <FullscreenCanvasWrapper height={300}>
          <Canvas camera={{ position: [7, 5, 7] }} style={{ height: '100%' }}>
            {/* Mechanism visualization here */}
            <ambientLight intensity={0.7} />
            <pointLight position={[10, 10, 10]} />
            {/* ... */}
            <OrbitControls />
          </Canvas>
        </FullscreenCanvasWrapper>
        <div className="mt-4">
          <AnalysisXYPlot
            title="Position & Velocity vs. Time"
            xLabel="Time"
            yLabel="Position / Velocity"
            data={{
              labels: data.map(d => d.time.toFixed(2)),
              datasets: [
                { label: 'Position', data: data.map(d => d.position), borderColor: 'blue', tension: 0.4 },
                { label: 'Velocity', data: data.map(d => d.velocity), borderColor: 'green', tension: 0.4 },
              ],
            }}
          />
        </div>
      </div>
      <div className="w-full lg:w-80 flex-shrink-0">
        <SideNote
          title="Important Formulae & Points"
          points={[
            'Slider displacement: x = r cos(θ) + sqrt(l² - r² sin²(θ))',
            'Velocity: v = -r sin(θ) ω - (r² sin(θ) cos(θ) ω) / sqrt(l² - r² sin²(θ))',
            'Used in IC engine piston motion',
          ]}
        />
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded shadow-sm mb-4">
          <div className="font-semibold text-blue-700 mb-1">Real-World Application</div>
          <div>IC Engine piston movement</div>
        </div>
      </div>
    </div>
  );
}

