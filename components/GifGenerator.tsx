import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { generateTextPrompt, generateImage, generateGifKeyframePrompts } from '../services/geminiService';
import { GIF_SYSTEM_PROMPT } from '../constants';
import { Spinner } from './Spinner';
import { PromptCard } from './PromptCard';
import { GifIcon, HistoryIcon, ExpandIcon } from './Icons';
import { HistoryItem, HistoryItemType, GifHistoryItem, StoryboardImage } from '../types';

interface GifProps {
    history: HistoryItem[];
    setHistory: (value: React.SetStateAction<HistoryItem[]>) => void;
    openLightbox: (image: StoryboardImage) => void;
}

export const GifGenerator: React.FC<GifProps> = ({ history, setHistory, openLightbox }) => {
  const [idea, setIdea] = useState<string>('');
  const [currentItem, setCurrentItem] = useState<GifHistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const localHistory = useMemo(() => 
    history.filter(item => item.type === HistoryItemType.GIF) as GifHistoryItem[]
  , [history]);

  useEffect(() => {
    if (!currentItem && localHistory.length > 0) {
      setCurrentItem(localHistory[0]);
    }
  }, [localHistory, currentItem]);

  const handleHistoryClick = useCallback((item: GifHistoryItem) => {
    setCurrentItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!idea.trim()) {
      setError('Please enter an idea for your GIF.');
      return;
    }
    setIsLoading(true);
    setError('');
    setCurrentItem(null);

    try {
      setLoadingStep('Crafting GIF script...');
      const gifScript = await generateTextPrompt(GIF_SYSTEM_PROMPT, idea);

      setLoadingStep('Breaking script into keyframes...');
      const keyframePrompts = await generateGifKeyframePrompts(gifScript);
      if (!keyframePrompts || keyframePrompts.length === 0) throw new Error('Could not generate GIF keyframes.');
      
      const images: StoryboardImage[] = [];
      for (let i = 0; i < keyframePrompts.length; i++) {
        const prompt = keyframePrompts[i];
        setLoadingStep(`Generating keyframe ${i + 1} of ${keyframePrompts.length}...`);
        const enrichedPrompt = `vibrant colors, clean lines, ${prompt}`;
        const url = await generateImage(enrichedPrompt, '1:1');
        images.push({ url, prompt });
      }
      
      const newItem: GifHistoryItem = {
          id: Date.now().toString(),
          type: HistoryItemType.GIF,
          timestamp: Date.now(),
          idea,
          generatedPrompt: gifScript,
          gifImages: images
      };

      setHistory(prev => [newItem, ...prev]);
      setCurrentItem(newItem);

    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  }, [idea, setHistory]);

  const renderGifStoryboard = (item: GifHistoryItem) => (
    <div className="mt-8 animate-fade-in">
        <h3 className="font-semibold text-lg text-white mb-4">Generated GIF Storyboard</h3>
        <div className="film-strip-container flex overflow-x-auto space-x-4 p-2 bg-brand-dark rounded-lg border border-brand-mid-gray">
            {item.gifImages.map((image, index) => (
                <div key={index} className="flex-shrink-0 w-64 sm:w-80 aspect-square relative group bg-black rounded-md overflow-hidden">
                    <img src={image.url} alt={image.prompt} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {index + 1}
                    </div>
                     <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-xs truncate" title={image.prompt}>{image.prompt}</p>
                    </div>
                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                        <button onClick={() => openLightbox(image)} className="text-white p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors" title="View Image">
                            <ExpandIcon />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="bg-brand-gray p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl border border-brand-mid-gray">
      <div className="flex items-center space-x-3 mb-4">
        <GifIcon />
        <h2 className="text-xl sm:text-2xl font-bold text-white">GIF Storyboard Generator</h2>
      </div>
      <p className="text-gray-400 mb-6 text-sm sm:text-base">Describe a looping animation, and we'll create a detailed script and a visual storyboard for it.</p>
      
      <div className="space-y-4">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="e.g., a robot slipping on a banana peel, endlessly"
          className="w-full h-28 p-4 bg-brand-dark border border-brand-mid-gray rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-shadow"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-brand-purple hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg"
        >
          {isLoading ? <Spinner /> : 'Generate GIF Storyboard'}
        </button>
      </div>

      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

      {isLoading && (
        <div className="flex flex-col items-center justify-center bg-brand-dark border border-brand-mid-gray rounded-lg h-40 mt-6 animate-pulse">
            <Spinner size="h-8 w-8" />
            <p className="mt-4 text-gray-400">{loadingStep}</p>
        </div>
      )}

      {!isLoading && currentItem && (
        <div className="mt-6 space-y-6 animate-fade-in">
          <PromptCard prompt={currentItem.generatedPrompt} title={`Generated GIF Script for "${currentItem.idea}"`} />
          {renderGifStoryboard(currentItem)}
        </div>
      )}

       {localHistory.length > 0 && (
         <div className="pt-8 mt-8 border-t border-brand-mid-gray">
            <div className="flex items-center space-x-3 mb-4">
                <HistoryIcon />
                <h3 className="text-xl font-bold text-white">GIF Storyboard History</h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
              {localHistory.map((item) => (
                <div 
                  key={item.id} 
                  className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 hover:border-brand-purple transition-all duration-300 transform hover:scale-105 ${currentItem?.id === item.id ? 'border-brand-purple' : 'border-brand-mid-gray'}`}
                  onClick={() => handleHistoryClick(item)}
                  title={`Click to view. Idea: ${item.idea}`}
                >
                  <img src={item.gifImages[0]?.url} alt={item.idea} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 flex items-center justify-center transition-opacity duration-300">
                    <button onClick={(e) => { e.stopPropagation(); openLightbox(item.gifImages[0]); }} className="text-white p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors opacity-0 group-hover:opacity-100" title="View Image">
                        <ExpandIcon />
                    </button>
                    <p className="absolute bottom-1 text-white text-center text-xs p-1 font-semibold truncate" title={item.idea}>{item.idea}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
      )}
    </div>
  );
};