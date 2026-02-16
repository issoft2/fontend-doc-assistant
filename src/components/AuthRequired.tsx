import React from "react";

export const AuthRequired: React.FC = () => {
    return (
        <div className="flex items-center jsutify-center h-64">
            <div className="text-center">
                <h2 className="text-lg font-semibold text-slate-800">
                    Authentication Required
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                    Please sign in to continue.
                </p>
            </div>
        </div>
    );

};