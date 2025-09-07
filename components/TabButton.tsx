import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

export const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, icon }) => {
  const baseClasses = "flex items-center space-x-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-brand-purple";
  const activeClasses = "bg-brand-purple text-white shadow-md";
  const inactiveClasses = "text-gray-300 hover:bg-brand-mid-gray hover:text-white";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.split(' ')[0]}</span>
    </button>
  );
};