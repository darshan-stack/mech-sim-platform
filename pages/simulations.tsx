import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Cog, Droplet, ArrowRight } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarProvider } from '../components/ui/sidebar';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../components/ui/breadcrumb';

const komExperiments = [
  { name: 'Slider Crank Mechanism', key: 'slider-crank' },
  { name: 'Four-Bar Chain Mechanism', key: 'four-bar-linkage' },
  { name: 'Gear Train Mechanism', key: 'gear-train' },
  { name: 'Cam-Follower Mechanism', key: 'cam-follower' },
  { name: 'Geneva Mechanism', key: 'geneva' },
  { name: 'Belt and Rope Drive', key: 'belt-drive' },
  { name: 'Flywheel Analysis', key: 'flywheel' },
];

const fluidExperiments = [
  { name: 'Bernoulli’s Theorem', key: 'bernoulli' },
  { name: 'Reynolds Number', key: 'reynolds' },
  { name: 'Venturimeter & Orificemeter', key: 'venturimeter' },
  { name: 'Hydraulic Jump', key: 'hydraulic-jump' },
  { name: 'Flow over Weirs', key: 'weir' },
  { name: 'Pipe Friction', key: 'pipe-friction' },
  { name: 'Boundary Layer', key: 'boundary-layer' },
];

const experimentIcons: Record<string, JSX.Element> = {
  kom: <Cog className="inline mr-1 w-5 h-5 text-blue-600" />, fluid: <Droplet className="inline mr-1 w-5 h-5 text-cyan-600" />
};

const experimentDescriptions: Record<string, string> = {
  'slider-crank': 'Simulate the classic slider-crank mechanism with interactive controls and real-time visualization.',
  'four-bar-linkage': 'Explore the four-bar chain mechanism, analyze coupler curves, and understand Grashof’s law.',
  'gear-train': 'Visualize gear trains, calculate gear ratios, and see real-world gearbox applications.',
  'cam-follower': 'Study cam profiles, follower motions, and pressure angles in engine valve systems.',
  'geneva': 'Understand the Geneva mechanism for intermittent motion with step-by-step simulation.',
  'belt-drive': 'Experiment with belt and rope drives, velocity ratios, and slip analysis.',
  'flywheel': 'Analyze flywheel energy storage and fluctuations in engines.',
  'bernoulli': 'Apply Bernoulli’s theorem to fluid flow and visualize pressure-velocity relationships.',
  'reynolds': 'Explore laminar and turbulent flows using Reynolds number simulation.',
  'venturimeter': 'Measure flow rates with venturimeter/orificemeter experiments.',
  'hydraulic-jump': 'Simulate hydraulic jumps and energy dissipation in open channels.',
  'weir': 'Study flow measurement over weirs and analyze discharge coefficients.',
  'pipe-friction': 'Investigate frictional losses in pipes and plot Moody diagrams.',
  'boundary-layer': 'Visualize boundary layer development and separation in fluid flows.',
};

export default function SimulationsPage() {
  const [tab, setTab] = useState<'kom' | 'fluid'>('kom');
  const currentExperiments = tab === 'kom' ? komExperiments : fluidExperiments;
  return (
    <div className="min-h-screen bg-blue-50 p-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Simulations Library</h1>
      <p className="text-gray-600 max-w-2xl mb-8">Browse all interactive experiments in Kinematics of Machines (KOM) and Fluid Dynamics. Click on an experiment for detailed theory, simulation notes, and 3D visualization.</p>
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setTab('kom')}
          className={`px-4 py-2 rounded font-medium transition ${tab === 'kom' ? 'bg-blue-600 text-white' : 'bg-white border border-blue-600 text-blue-700'}`}
        >
          <Cog className="inline w-4 h-4 mr-1" /> KOM
        </button>
        <button
          onClick={() => setTab('fluid')}
          className={`px-4 py-2 rounded font-medium transition ${tab === 'fluid' ? 'bg-cyan-600 text-white' : 'bg-white border border-cyan-600 text-cyan-700'}`}
        >
          <Droplet className="inline w-4 h-4 mr-1" /> Fluid
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentExperiments.map(exp => (
          <div key={exp.key} className="bg-white rounded-xl shadow border border-gray-200 flex flex-col p-6 h-full">
            <div className="flex items-center gap-2 mb-2">
              {tab === 'kom' ? <Cog className="w-5 h-5 text-blue-500" /> : <Droplet className="w-5 h-5 text-cyan-500" />}
              <h2 className="text-lg font-semibold">{exp.name}</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4 flex-1">{experimentDescriptions[exp.key]}</p>
            <Link href={`/simulations/${tab}/${exp.key}`} className="mt-auto inline-flex items-center gap-1 text-blue-600 font-medium hover:underline">
              View Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
