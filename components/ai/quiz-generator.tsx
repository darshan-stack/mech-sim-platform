import React, { useState } from 'react';
// Placeholder for AI quiz generation
export default function QuizGenerator({ topic }: { topic: string }) {
  const [quiz, setQuiz] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateQuiz = async () => {
    setLoading(true);
    // TODO: Integrate with OpenAI API or similar
    setTimeout(() => {
      setQuiz([
        `Sample question 1 for ${topic}?`,
        `Sample question 2 for ${topic}?`,
        `Sample question 3 for ${topic}?`,
      ]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="my-4">
      <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={generateQuiz} disabled={loading}>
        {loading ? 'Generating...' : `Generate Quiz on ${topic}`}
      </button>
      <ul className="mt-2 list-disc pl-6">
        {quiz.map((q, i) => <li key={i}>{q}</li>)}
      </ul>
    </div>
  );
}
