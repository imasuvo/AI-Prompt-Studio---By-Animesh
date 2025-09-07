import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { VeoPromptGenerator } from './components/VeoPromptGenerator';
import { ImageGenerator } from './components/ImageGenerator';
import { GifGenerator } from './components/GifGenerator';
import { OverallHistory } from './components/OverallHistory';
import { GeneratorType, HistoryItem, StoryboardImage } from './types';
import { ImageLightbox } from './components/ImageLightbox';

// A custom hook to manage state with localStorage for persistence
const useLocalStorage = <T extends HistoryItem[]>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      // Resolve the new value if it's a function
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Define a safe storage limit (e.g., 4.5MB) to avoid quota errors
      const MAX_STORAGE_SIZE = 4.5 * 1024 * 1024; 
      
      let tempHistory = [...valueToStore];
      let jsonString = JSON.stringify(tempHistory);

      // If the data exceeds the limit, remove the oldest items until it fits.
      // New items are added to the front, so the oldest are at the end.
      while (jsonString.length > MAX_STORAGE_SIZE && tempHistory.length > 0) {
        tempHistory.pop(); // Remove the oldest item
        jsonString = JSON.stringify(tempHistory);
      }

      setStoredValue(tempHistory as T);
      window.localStorage.setItem(key, jsonString);

    } catch (error) {
      // This catch block will now mostly handle unforeseen issues rather than quota errors
      console.error("Error writing to localStorage", error);
    }
  };

  return [storedValue, setValue];
};


const App: React.FC = () => {
  const [activeGenerator, setActiveGenerator] = useState<GeneratorType>(GeneratorType.VEO);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('ai-studio-history', []);
  const [lightboxImage, setLightboxImage] = useState<StoryboardImage | null>(null);

  const openLightbox = (image: StoryboardImage) => setLightboxImage(image);
  const closeLightbox = () => setLightboxImage(null);

  const renderActiveGenerator = () => {
    switch (activeGenerator) {
      case GeneratorType.VEO:
        return <VeoPromptGenerator history={history} setHistory={setHistory} openLightbox={openLightbox} />;
      case GeneratorType.IMAGE:
        return <ImageGenerator history={history} setHistory={setHistory} openLightbox={openLightbox} />;
      case GeneratorType.GIF:
        return <GifGenerator history={history} setHistory={setHistory} openLightbox={openLightbox} />;
      case GeneratorType.HISTORY:
        return <OverallHistory history={history} openLightbox={openLightbox} />;
      default:
        return <VeoPromptGenerator history={history} setHistory={setHistory} openLightbox={openLightbox} />;
    }
  };

  const memoizedGenerator = useMemo(() => renderActiveGenerator(), [activeGenerator, history]);

  return (
    <div className="min-h-screen bg-brand-dark text-brand-light font-sans">
      <Header activeGenerator={activeGenerator} setActiveGenerator={setActiveGenerator} />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {memoizedGenerator}
        </div>
      </main>
      {lightboxImage && <ImageLightbox image={lightboxImage} onClose={closeLightbox} />}
    </div>
  );
};

export default App;