import React from 'react';
import { TabButton } from './TabButton';
import { GeneratorType } from '../types';
import { FilmIcon, ImageIcon, GifIcon, HistoryIcon } from './Icons';

interface HeaderProps {
  activeGenerator: GeneratorType;
  setActiveGenerator: (generator: GeneratorType) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeGenerator, setActiveGenerator }) => {
  return (
    <header className="bg-brand-gray/50 backdrop-blur-sm sticky top-0 z-10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 sm:h-20">
          <div className="flex items-center shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center flex-wrap justify-center text-center">
              <span>AI Prompt <span className="text-brand-purple">Studio</span></span>
              <span className="text-base sm:text-lg font-light text-gray-400 ml-2 whitespace-nowrap">- By Animesh</span>
            </h1>
          </div>
          <nav className="flex items-center space-x-1 sm:space-x-2 mt-3 sm:mt-0 w-full sm:w-auto justify-center">
            <TabButton
              label="Storyboard Generator"
              isActive={activeGenerator === GeneratorType.VEO}
              onClick={() => setActiveGenerator(GeneratorType.VEO)}
              icon={<FilmIcon />}
            />
            <TabButton
              label="Image Generator"
              isActive={activeGenerator === GeneratorType.IMAGE}
              onClick={() => setActiveGenerator(GeneratorType.IMAGE)}
              icon={<ImageIcon />}
            />
            <TabButton
              label="GIF Storyboard"
              isActive={activeGenerator === GeneratorType.GIF}
              onClick={() => setActiveGenerator(GeneratorType.GIF)}
              icon={<GifIcon />}
            />
            <TabButton
              label="Overall History"
              isActive={activeGenerator === GeneratorType.HISTORY}
              onClick={() => setActiveGenerator(GeneratorType.HISTORY)}
              icon={<HistoryIcon />}
            />
          </nav>
        </div>
      </div>
    </header>
  );
};