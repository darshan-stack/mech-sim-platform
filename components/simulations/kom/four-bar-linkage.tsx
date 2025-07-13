import React from 'react';
import SideNote from '../../ui/side-note';
export default function FourBarLinkageExperiment() {
  return (
    <div className="p-4 flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold mb-2">Four-Bar Chain Mechanism</h2>
        {/* Controls for link lengths, animation speed, etc. */}
        {/* 2D/3D dynamic linkage simulation (Three.js) */}
        <div className="mt-2">[Dynamic linkage simulation here]</div>
      </div>
      <div className="w-full lg:w-80 flex-shrink-0">
        <SideNote
          title="Important Formulae & Points"
          points={[
            'Grashof’s Law: S + L ≤ P + Q',
            'Coupler curve: Path traced by a point on the coupler link',
            'Used in bicycle pedal and crank system',
          ]}
        />
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded shadow-sm mb-4">
          <div className="font-semibold text-blue-700 mb-1">Real-World Application</div>
          <div>Bicycle pedal & crank system</div>
        </div>
      </div>
    </div>
  );
}
