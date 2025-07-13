import React from 'react';
import SideNote from '../../ui/side-note';
export default function GearTrainExperiment() {
  return (
    <div className="p-4 flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold mb-2">Gear Train Mechanism</h2>
        {/* Controls for gear sizes, number of gears, etc. */}
        {/* 2D/3D gear simulation (Three.js) */}
        <div className="mt-2">[Gear teeth interaction simulation here]</div>
      </div>
      <div className="w-full lg:w-80 flex-shrink-0">
        <SideNote
          title="Important Formulae & Points"
          points={[
            'Gear ratio: N2/N1 = T1/T2',
            'Velocity ratio: VR = Driver speed / Driven speed',
            'Used in gearboxes for speed and torque conversion',
          ]}
        />
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded shadow-sm mb-4">
          <div className="font-semibold text-blue-700 mb-1">Real-World Application</div>
          <div>Gearbox in vehicles</div>
        </div>
      </div>
    </div>
  );
}
