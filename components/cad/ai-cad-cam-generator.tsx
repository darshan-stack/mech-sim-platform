import React, { useState } from 'react';

export default function AICadCamGenerator({ onGenerate }: { onGenerate: (result: any) => void }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      // Call backend API for AI generation
      const resp = await fetch('/api/ai-cad-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!resp.ok) {
        let msg = 'API error';
        try {
          const errData = await resp.json();
          msg = errData.error || msg;
          if (errData.raw) msg += ` (AI returned: ${errData.raw})`;
        } catch {}
        throw new Error(msg);
      }
      const data = await resp.json();
      setLoading(false);
      if (!data || !data.entities) {
        setError('AI did not return valid geometry.');
        return;
      }
      onGenerate(data);
    } catch (e: any) {
      setError(`Failed to generate model: ${e.message}`);
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      <div className="font-bold mb-2 text-lg">AI Prompt-based CAD/CAM Generator</div>
      <textarea
        className="w-full border rounded p-2 mb-2"
        rows={2}
        placeholder="Describe your mechanism or part (e.g. 'Generate a four-bar linkage with fixed pivots and a coupler')"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />
      <div className="flex gap-2 items-center">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          )}
          {loading ? 'Generating...' : 'Generate'}
        </button>
        {error && <span className="text-red-500 ml-2">{error}</span>}
      </div>
    </div>
  );
}
