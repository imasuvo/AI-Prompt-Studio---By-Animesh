
import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './Icons';

interface PromptCardProps {
  prompt: string;
  title?: string;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, title = "Generated Prompt" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-brand-gray border border-brand-mid-gray rounded-lg shadow-lg mt-6 animate-fade-in">
      <div className="flex justify-between items-center p-4 border-b border-brand-mid-gray">
        <h3 className="font-semibold text-lg text-white">{title}</h3>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 bg-brand-mid-gray hover:bg-gray-600 text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-gray focus:ring-brand-purple"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-4">
        <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
          {prompt}
        </p>
      </div>
    </div>
  );
};
