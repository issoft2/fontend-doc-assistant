import React from "react";

interface CollectionSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export const CollectionSearch: React.FC<CollectionSearchProps> = ({
    value,
    onChange,
    placeholder = "Search collections...",
    disabled = false,
}) => {
    return (
      <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              <input
                type="text"
                placeholder={placeholder}
                disabled={disabled}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-14 px-6 text-lg font-light bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-white/20 rounded-3xl backdrop-blur-xl text-white placeholder-white/40 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-400/20 shadow-2xl hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300"
              />
          </div>
        </div>
     
    );
};