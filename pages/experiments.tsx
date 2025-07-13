import React from 'react';
import Link from 'next/link';

const komExperiments = [
  { name: 'Slider Crank Mechanism', path: '/simulations/kom/slider-crank', app: 'IC Engine piston movement' },
  { name: 'Four-Bar Chain Mechanism', path: '/simulations/kom/four-bar-linkage', app: 'Bicycle pedal & crank system' },
  { name: 'Gear Train Mechanism', path: '/simulations/kom/gear-train', app: 'Gearbox in vehicles' },
  { name: 'Cam-Follower Mechanism', path: '/simulations/kom/cam-follower', app: 'Valve timing in IC engines' },
  { name: 'Geneva Mechanism', path: '/simulations/kom/geneva', app: 'Watch ticking mechanism' },
  { name: 'Belt and Rope Drive', path: '/simulations/kom/belt-drive', app: 'Conveyor belts' },
  { name: 'Flywheel Analysis', path: '/simulations/kom/flywheel', app: 'Energy storage in engines' },
];

const fluidExperiments = [
  { name: 'Bernoulli’s Theorem', path: '/simulations/fluid/bernoulli', app: 'Aircraft wing lift' },
  { name: 'Reynolds Number', path: '/simulations/fluid/reynolds', app: 'Pipe flow in water supply' },
  { name: 'Venturimeter & Orificemeter', path: '/simulations/fluid/venturimeter', app: 'Measuring flow rates' },
  { name: 'Hydraulic Jump', path: '/simulations/fluid/hydraulic-jump', app: 'Dams & spillways' },
  { name: 'Flow over Weirs', path: '/simulations/fluid/weir', app: 'River flow control' },
  { name: 'Pipe Friction', path: '/simulations/fluid/pipe-friction', app: 'Pipeline design' },
  { name: 'Boundary Layer', path: '/simulations/fluid/boundary-layer', app: 'Drag on vehicles' },
];

export default function ExperimentsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Experiment Library</h1>
      <h2 className="text-xl font-semibold mb-2">Kinematics of Machines (KOM)</h2>
      <ul className="mb-6">
        {komExperiments.map(exp => (
          <li key={exp.path} className="mb-2">
            <Link href={exp.path} className="text-blue-700 underline font-medium">{exp.name}</Link>
            <span className="ml-2 text-gray-500">({exp.app})</span>
          </li>
        ))}
      </ul>
      <h2 className="text-xl font-semibold mb-2">Fluid Dynamics</h2>
      <ul>
        {fluidExperiments.map(exp => (
          <li key={exp.path} className="mb-2">
            <Link href={exp.path} className="text-blue-700 underline font-medium">{exp.name}</Link>
            <span className="ml-2 text-gray-500">({exp.app})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
