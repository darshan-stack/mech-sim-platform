import React, { useState } from 'react';

/**
 * Custom Boundary Conditions UI for FEA/CFD
 * Allows user to define supports, loads, and fluid inlets/outlets for a simple domain.
 */
export default function CustomBoundaries() {
  const [boundaries, setBoundaries] = useState([
    { type: 'Fixed Support', value: '', id: 1 },
    { type: 'Force', value: '', id: 2 },
    { type: 'Fluid Inlet', value: '', id: 3 },
    { type: 'Fluid Outlet', value: '', id: 4 },
  ]);

  function updateBoundary(idx: number, value: string) {
    setBoundaries(b => b.map((bd, i) => (i === idx ? { ...bd, value } : bd)));
  }

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-2">Custom Boundary Conditions</h2>
      <ul className="mb-2">
        {boundaries.map((bd, idx) => (
          <li key={bd.id} className="mb-1 flex gap-2 items-center">
            <span className="w-32 inline-block font-medium">{bd.type}:</span>
            <input
              type="text"
              value={bd.value}
              onChange={e => updateBoundary(idx, e.target.value)}
              className="border px-2 py-1 rounded w-40"
              placeholder={`Specify for ${bd.type}`}
            />
          </li>
        ))}
      </ul>
      <p className="text-sm text-gray-600">(This UI is a placeholder. Real boundary condition assignment would be mesh/geometry-aware.)</p>
    </div>
  );
}
