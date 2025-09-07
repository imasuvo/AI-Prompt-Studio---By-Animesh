import React from 'react';
import { HistoryItem, HistoryItemType, StoryboardImage } from '../types';
import { FilmIcon, ImageIcon, GifIcon, HistoryIcon, ExpandIcon } from './Icons';

interface OverallHistoryProps {
  history: HistoryItem[];
  openLightbox: (image: StoryboardImage) => void;
}

const HistoryCard: React.FC<{ item: HistoryItem; openLightbox: (image: StoryboardImage) => void; }> = ({ item, openLightbox }) => {
  const renderContent = () => {
    switch (item.type) {
      case HistoryItemType.STORYBOARD:
        return (
          <>
            <div className="flex items-center space-x-2 text-brand-purple">
              <FilmIcon />
              <h4 className="font-bold">Storyboard</h4>
            </div>
            <p className="text-sm font-semibold text-white mt-2 truncate" title={item.idea}>Idea: "{item.idea}"</p>
            <div className="grid grid-cols-2 gap-1 mt-2">
                {item.storyboardImages.slice(0, 4).map((img, idx) => (
                    <div key={idx} className="group relative aspect-video rounded overflow-hidden">
                        <img src={img.url} className="w-full h-full object-cover" alt={img.prompt} />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                            <button onClick={() => openLightbox(img)} className="text-white p-1 rounded-full bg-black/50 hover:bg-black/75 transition-colors" title="View Image">
                                <ExpandIcon />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
          </>
        );
      case HistoryItemType.IMAGE:
        return (
          <>
            <div className="flex items-center space-x-2 text-brand-purple">
              <ImageIcon />
              <h4 className="font-bold">Image</h4>
            </div>
            <p className="text-sm font-semibold text-white mt-2 truncate" title={item.prompt}>Prompt: "{item.prompt}"</p>
            <div className="group relative aspect-video mt-2 rounded overflow-hidden">
                <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.prompt} />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <button onClick={() => openLightbox({url: item.imageUrl, prompt: item.prompt})} className="text-white p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors" title="View Image">
                        <ExpandIcon />
                    </button>
                </div>
            </div>
          </>
        );
      case HistoryItemType.GIF:
        return (
          <>
            <div className="flex items-center space-x-2 text-brand-purple">
              <GifIcon />
              <h4 className="font-bold">GIF Storyboard</h4>
            </div>
            <p className="text-sm font-semibold text-white mt-2 truncate" title={item.idea}>Idea: "{item.idea}"</p>
            <div className="grid grid-cols-2 gap-1 mt-2">
                {item.gifImages.slice(0, 4).map((img, idx) => (
                     <div key={idx} className="group relative aspect-square rounded overflow-hidden">
                        <img key={idx} src={img.url} className="w-full h-full object-cover" alt={img.prompt} />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                            <button onClick={() => openLightbox(img)} className="text-white p-1 rounded-full bg-black/50 hover:bg-black/75 transition-colors" title="View Image">
                                <ExpandIcon />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-brand-gray border border-brand-mid-gray rounded-lg shadow-lg p-4 flex flex-col justify-between animate-fade-in">
        <div>{renderContent()}</div>
        <p className="text-xs text-gray-500 mt-3 text-right">{new Date(item.timestamp).toLocaleString()}</p>
    </div>
  );
};

export const OverallHistory: React.FC<OverallHistoryProps> = ({ history, openLightbox }) => {
  const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="bg-brand-gray p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl border border-brand-mid-gray">
      <div className="flex items-center space-x-3 mb-6">
        <HistoryIcon />
        <h2 className="text-xl sm:text-2xl font-bold text-white">Overall History</h2>
      </div>
      
      {sortedHistory.length === 0 ? (
        <div className="text-center py-16">
            <p className="text-gray-400">Your generated content will appear here.</p>
            <p className="text-gray-500 text-sm">Start creating in other tabs to build your history!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedHistory.map(item => <HistoryCard key={item.id} item={item} openLightbox={openLightbox} />)}
        </div>
      )}
    </div>
  );
};