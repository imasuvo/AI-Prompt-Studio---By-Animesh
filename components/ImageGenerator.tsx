import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { generateImage } from '../services/geminiService';
import { Spinner } from './Spinner';
import { ImageIcon, DownloadIcon, HistoryIcon, AspectRatio16x9Icon, AspectRatio1x1Icon, AspectRatio9x16Icon, AspectRatio4x5Icon, ExpandIcon } from './Icons';
import { HistoryItem, HistoryItemType, ImageHistoryItem, ApiAspectRatio, StoryboardImage } from '../types';

interface ImageProps {
    history: HistoryItem[];
    setHistory: (value: React.SetStateAction<HistoryItem[]>) => void;
    openLightbox: (image: StoryboardImage) => void;
}

const RATIOS: { label: string; value: ApiAspectRatio; icon: React.ReactNode }[] = [
  { label: '16:9', value: '16:9', icon: <AspectRatio16x9Icon /> },
  { label: '1:1', value: '1:1', icon: <AspectRatio1x1Icon /> },
  { label: '9:16', value: '9:16', icon: <AspectRatio9x16Icon /> },
  { label: '4:5', value: '3:4', icon: <AspectRatio4x5Icon /> }, // Map label to supported API value
];

export const ImageGenerator: React.FC<ImageProps> = ({ history, setHistory, openLightbox }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [selectedRatio, setSelectedRatio] = useState<ApiAspectRatio>('16:9');
  const [currentItem, setCurrentItem] = useState<ImageHistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const localHistory = useMemo(() => 
    history.filter(item => item.type === HistoryItemType.IMAGE) as ImageHistoryItem[]
  , [history]);

  useEffect(() => {
    // Set the most recent image as the current one on initial load or when history changes
    if (!currentItem && localHistory.length > 0) {
      setCurrentItem(localHistory[0]);
    }
  }, [localHistory, currentItem]);

  const handleDownload = useCallback((imageUrl: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    const fileName = prompt.substring(0, 40).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${fileName || 'generated-image'}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);
  
  const handleHistoryClick = useCallback((item: ImageHistoryItem) => {
    setCurrentItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for your image.');
      return;
    }
    setIsLoading(true);
    setError('');
    setCurrentItem(null);

    try {
      const enrichedPrompt = `cinematic, photorealistic, 8k, masterpiece, ${prompt}`;
      const url = await generateImage(enrichedPrompt, selectedRatio);
      
      const newItem: ImageHistoryItem = { 
        id: url, // image url is unique enough for a key
        type: HistoryItemType.IMAGE,
        timestamp: Date.now(),
        imageUrl: url, 
        prompt: prompt,
      };

      setHistory(prev => [newItem, ...prev]);
      setCurrentItem(newItem);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [prompt, selectedRatio, setHistory]);

  return (
    <div className="bg-brand-gray p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl border border-brand-mid-gray">
      <div className="flex items-center space-x-3 mb-4">
        <ImageIcon />
        <h2 className="text-xl sm:text-2xl font-bold text-white">Image Generator</h2>
      </div>
      <p className="text-gray-400 mb-6 text-sm sm:text-base">Describe the image you want to create. Be as descriptive as you like!</p>
      
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., a majestic lion wearing a crown, sitting on a throne on the moon"
          className="w-full h-28 p-4 bg-brand-dark border border-brand-mid-gray rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-shadow"
          disabled={isLoading}
        />

        <div className="my-4">
          <p className="text-sm font-medium text-gray-400 mb-3 text-center">Select Aspect Ratio</p>
          <div className="flex justify-center items-center gap-2 sm:gap-4">
            {RATIOS.map((ratio) => (
              <button
                key={ratio.label}
                onClick={() => setSelectedRatio(ratio.value)}
                title={ratio.label}
                className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border-2 transition-all duration-200 w-20 h-20 sm:w-24 sm:h-24
                  ${selectedRatio === ratio.value
                    ? 'bg-brand-purple/20 border-brand-purple text-white'
                    : 'bg-brand-dark border-brand-mid-gray hover:border-gray-500 text-gray-400'
                  }`}
              >
                {ratio.icon}
                <span className="text-xs sm:text-sm font-semibold">{ratio.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-brand-purple hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg"
        >
          {isLoading ? <Spinner /> : 'Generate Image'}
        </button>
      </div>

      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

      <div className="mt-6">
        {isLoading && (
          <div className="flex flex-col items-center justify-center bg-brand-dark border border-brand-mid-gray rounded-lg h-64 sm:h-80 animate-pulse">
            <Spinner size="h-12 w-12" />
            <p className="mt-4 text-gray-400">Conjuring your masterpiece...</p>
          </div>
        )}
        
        {!isLoading && currentItem && (
          <div className="space-y-8 animate-fade-in">
            {/* Current Image Display */}
            <div>
              <div className="relative group bg-brand-dark rounded-lg overflow-hidden border border-brand-mid-gray shadow-lg">
                <img src={currentItem.imageUrl} alt={currentItem.prompt} className="w-full h-auto object-contain mx-auto" />
                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <button onClick={() => openLightbox({ url: currentItem.imageUrl, prompt: currentItem.prompt })} className="text-white p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors" title="View Image">
                        <ExpandIcon />
                    </button>
                </div>
              </div>
              <div className="mt-4 flex flex-col items-center gap-3">
                <button
                  onClick={() => handleDownload(currentItem.imageUrl, currentItem.prompt)}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg"
                >
                  <DownloadIcon />
                  <span>Download Image</span>
                </button>
                 <p className="text-sm text-gray-400 text-center italic">Prompt: "{currentItem.prompt}"</p>
              </div>
            </div>

            {/* History Section */}
            {localHistory.length > 1 && (
              <div className="pt-8 border-t border-brand-mid-gray">
                <div className="flex items-center space-x-3 mb-4">
                  <HistoryIcon />
                  <h3 className="text-xl font-bold text-white">Generation History</h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
                  {localHistory.filter(item => item.id !== currentItem.id).map((item) => (
                    <div 
                      key={item.id} 
                      className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 border-brand-mid-gray hover:border-brand-purple transition-all duration-300 transform hover:scale-105"
                      onClick={() => handleHistoryClick(item)}
                      title={`Click to view. Prompt: ${item.prompt}`}
                    >
                      <img src={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 flex items-center justify-center transition-opacity duration-300">
                         <button onClick={(e) => { e.stopPropagation(); openLightbox({ url: item.imageUrl, prompt: item.prompt }); }} className="text-white p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors opacity-0 group-hover:opacity-100" title="View Image">
                            <ExpandIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};