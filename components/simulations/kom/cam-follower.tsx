import React from 'react';
import SideNote from '../../ui/side-note';
export default function CamFollowerExperiment() {
  return (
    <div className="p-4 flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold mb-2">Cam-Follower Mechanism</h2>
        {/* Controls for cam profile, follower type, etc. */}
        {/* Cam profile animation and follower motion */}
        <div className="mt-2">[Profile animation here]</div>
      </div>
      <div className="w-full lg:w-80 flex-shrink-0">
        <SideNote
          title="Important Formulae & Points"
          points={[
            'Cam displacement diagram: shows follower motion vs. cam angle',
            'Pressure angle: affects smoothness of motion',
            'Used in valve timing of IC engines',
          ]}
        />
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded shadow-sm mb-4">
          <div className="font-semibold text-blue-700 mb-1">Real-World Application</div>
          <div>Valve timing in IC engines</div>
        </div>
      </div>
    </div>
  );
}
