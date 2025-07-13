import React from 'react';
export default function PipeFrictionExperiment() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Pipe Friction</h2>
      {/* Controls for pipe length, diameter, roughness, etc. */}
      {/* Head loss due to friction simulation */}
      <div className="mt-2">[Head loss due to friction simulation here]</div>
      <div className="mt-4 p-2 bg-blue-50 rounded">
        <b>Real-World Application:</b> Pipeline design
      </div>
    </div>
  );
}
