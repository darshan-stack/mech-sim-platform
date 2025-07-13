import React from 'react';
import dynamic from 'next/dynamic';
const Sketcher = dynamic(() => import('../components/cad/sketcher'), { ssr: false });

const sidebarItems = [
  { label: 'Sketch', icon: '✏️' },
  { label: '3D Model', icon: '🧩' },
  { label: 'Assembly', icon: '🔗' },
  { label: 'Simulation', icon: '⚙️' },
  { label: 'AI Generator', icon: '🤖' },
  { label: 'Files', icon: '📁' },
  { label: 'Settings', icon: '⚙️' },
  { label: 'Help', icon: '❓' },
];

export default function CADPage() {
  const [darkMode, setDarkMode] = React.useState(true);
  const [active, setActive] = React.useState('Sketch');

  return (
    <div className={`flex min-h-screen w-full ${darkMode ? 'bg-[#18181b]' : 'bg-blue-50'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside className={`h-screen w-20 flex flex-col items-center py-6 shadow-xl z-40 ${darkMode ? 'bg-[#23232b]' : 'bg-white'}`}>
        <div className="mb-8 text-3xl font-extrabold text-blue-600">CAD</div>
        <nav className="flex flex-col gap-6 flex-1">
          {sidebarItems.map(item => (
            <button
              key={item.label}
              title={item.label}
              onClick={() => setActive(item.label)}
              className={`text-2xl flex items-center justify-center w-12 h-12 rounded-lg ${active === item.label ? 'bg-blue-600 text-white' : darkMode ? 'text-gray-400' : 'text-gray-600'} hover:bg-blue-100`}
            >
              <span>{item.icon}</span>
            </button>
          ))}
        </nav>
        <button
          className={`mt-8 px-2 py-1 rounded text-xs ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? 'Light' : 'Dark'}
        </button>
      </aside>
      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Floating Top Bar */}
        <header className={`sticky top-0 z-30 flex items-center gap-4 px-8 py-3 shadow ${darkMode ? 'bg-[#23232b] text-white' : 'bg-white text-black'}`} style={{ minHeight: 64 }}>
          <button className="px-3 py-1 bg-blue-600 text-white rounded font-semibold">New</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded font-semibold">Save</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded font-semibold">Export</button>
          <button className="px-3 py-1 bg-gray-200 text-black rounded font-semibold">Undo</button>
          <button className="px-3 py-1 bg-gray-200 text-black rounded font-semibold">Redo</button>
          <div className="flex-1" />
          <input
            type="text"
            placeholder="AI Prompt: Describe your part or mechanism..."
            className="px-3 py-1 rounded border w-96 bg-white text-black"
            style={{ outline: 'none' }}
          />
          <button className="ml-2 px-3 py-1 bg-blue-600 text-white rounded font-semibold">Generate</button>
        </header>
        {/* Main Content Area */}
        <section className="flex-1 flex items-center justify-center p-0">
          {/* Show Sketcher for now, future: switch by active tab */}
          <div className="w-full h-full flex items-center justify-center">
            <Sketcher />
          </div>
        </section>
      </main>
    </div>
  );
}
