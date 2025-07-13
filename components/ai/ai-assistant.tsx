import React, { useState } from 'react';

/**
 * AI Assistant Component
 * Supports: theory Q&A, 3D notes, PDF, design/code, image generation
 * Talks to /api/ai-assistant backend (Gemini)
 */

const TYPE_OPTIONS = [
  { label: 'Theory Q&A', value: 'theory' },
  { label: '3D Model Notes', value: '3dnotes' },
  { label: 'PDF', value: 'pdf' },
  { label: 'Design/Code', value: 'design' },
  { label: 'Image', value: 'image' },
];

export default function AIAssistant() {
  const [type, setType] = useState('theory');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Unknown error');
      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function renderResult() {
    if (!result) return null;
    // Handle Gemini text output
    if (result.candidates && result.candidates[0]?.content?.parts) {
      return (
        <div className="mt-4 p-3 bg-gray-100 rounded text-black whitespace-pre-wrap">
          {result.candidates[0].content.parts.map((part: any, i: number) =>
            part.text ? <div key={i}>{part.text}</div> : null
          )}
        </div>
      );
    }
    // Handle image output (if supported)
    if (result.image) {
      return <img src={result.image} alt="AI generated" className="mt-4 rounded shadow" />;
    }
    return <pre className="mt-4">{JSON.stringify(result, null, 2)}</pre>;
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 bg-white rounded-xl shadow-xl p-6 max-w-md w-full border border-gray-200">
      <div className="font-bold text-lg mb-2">AI Assistant</div>
      <div className="flex gap-2 mb-2">
        {TYPE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`px-2 py-1 rounded ${type === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setType(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <textarea
        className="w-full border rounded p-2 mb-2"
        rows={3}
        placeholder="Ask me anything..."
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />
      <button
        className="w-full py-2 rounded bg-green-600 text-white font-semibold disabled:opacity-50"
        disabled={loading || !prompt.trim()}
        onClick={handleGenerate}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>
      {error && (
        <div className="mt-2 text-red-600">
          <div>{error}</div>
          {/* Show error details if available */}
          {typeof result === 'object' && result && result.details && (
            <pre className="text-xs mt-1 bg-red-50 border border-red-200 rounded p-2 overflow-x-auto">
              {typeof result.details === 'object' ? JSON.stringify(result.details, null, 2) : String(result.details)}
            </pre>
          )}
        </div>
      )}
      {renderResult()}
    </div>
  );
}
