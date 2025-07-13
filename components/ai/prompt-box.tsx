import React, { useState } from 'react';

export default function PromptBox() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleAsk = () => {
    // Placeholder: Integrate with AI backend
    setResponse(`AI Response for: "${prompt}"`);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">AI Prompt Assistant</h2>
      <div className="flex gap-2 mb-2">
        <input
          className="border rounded px-2 py-1 flex-1"
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Ask a question or generate a design..."
        />
        <button className="bg-green-600 text-white rounded px-4 py-1" onClick={handleAsk}>Ask</button>
      </div>
      <div className="border rounded p-2 bg-gray-50 min-h-[60px]">
        {response || <span className="text-gray-400">AI responses will appear here.</span>}
      </div>
    </div>
  );
}
