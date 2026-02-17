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
        <div className="w-full md:w-80">
            <input 
               type="text"
               value={value}
               onChange={(e) => onChange(e.target.value)}
               placeholder={placeholder}
               disabled={disabled}
                className="w-full px-4 py-3 bg-slate-800/50 text-white
                         rounded-xl border border-white/20
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              
               />
        </div>
    );
};