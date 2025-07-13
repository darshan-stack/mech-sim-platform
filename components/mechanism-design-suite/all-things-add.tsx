import React, { useState } from 'react';

/**
 * AllThingsAddMechanism: A demo component allowing users to add various mechanism elements to a list.
 * This can be extended to add different mechanism modules.
 */
export default function AllThingsAddMechanism() {
  const [elements, setElements] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      setElements([...elements, input.trim()]);
      setInput('');
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-2">All Things Add Mechanism</h2>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add mechanism element..."
          className="border px-2 py-1 rounded"
        />
        <button onClick={handleAdd} className="bg-blue-500 text-white px-3 py-1 rounded">Add</button>
      </div>
      <ul className="list-disc pl-6">
        {elements.map((el, idx) => (
          <li key={idx}>{el}</li>
        ))}
      </ul>
    </div>
  );
}
