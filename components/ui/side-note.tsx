import React from 'react';

export default function SideNote({ title, points }: { title: string; points: string[] }) {
  return (
    <aside className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded shadow-sm max-w-xs text-sm">
      <div className="font-semibold text-yellow-700 mb-2">{title}</div>
      <ul className="list-disc pl-5">
        {points.map((pt, i) => <li key={i}>{pt}</li>)}
      </ul>
    </aside>
  );
}
