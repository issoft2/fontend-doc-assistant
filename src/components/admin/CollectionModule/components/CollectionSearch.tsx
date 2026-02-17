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
               className="
               w-full px-4 py-3
               border rounded-md text-sm
               bg-white text-gray-900
               placeholder-gray-400
               focus:outline-none
               focus:ring-2 focus:ring-blue-500"
               />
        </div>
    );
};