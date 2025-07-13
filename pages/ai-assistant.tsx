import React from 'react';
import dynamic from 'next/dynamic';
const PromptBox = dynamic(() => import('../components/ai/prompt-box'), { ssr: false });

export default function AIAssistantPage() {
  return (
    <div className="p-8">
      <PromptBox />
    </div>
  );
}
