import React, { useState } from 'react';
// Placeholder for AI explanation
export default function ExplainConcept({ concept }: { concept: string }) {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const explain = async () => {
    setLoading(true);
    // TODO: Integrate with OpenAI API or similar
    setTimeout(() => {
      setExplanation(`This is a sample explanation for: ${concept}`);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="my-4">
      <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={explain} disabled={loading}>
        {loading ? 'Explaining...' : `Explain: ${concept}`}
      </button>
      <div className="mt-2 bg-gray-100 p-2 rounded min-h-[40px]">
        {explanation}
      </div>
    </div>
  );
}
