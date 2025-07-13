import React from 'react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Mechanical Engineering Learning Platform</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/simulations" className="block bg-blue-100 hover:bg-blue-200 rounded p-6 shadow">
          <div className="text-xl font-semibold mb-2">Simulations</div>
          <div>Explore interactive experiments in KOM and Fluid Dynamics</div>
        </Link>
        <Link href="/cad" className="block bg-green-100 hover:bg-green-200 rounded p-6 shadow">
          <div className="text-xl font-semibold mb-2">CAD Modeling</div>
          <div>Sketch and model mechanisms in 2D/3D</div>
        </Link>
        <Link href="/ai-assistant" className="block bg-yellow-100 hover:bg-yellow-200 rounded p-6 shadow">
          <div className="text-xl font-semibold mb-2">AI Assistant</div>
          <div>Ask questions, generate designs, get quizzes</div>
        </Link>
      </div>
    </div>
  );
}
