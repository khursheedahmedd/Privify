"use client";

import React from "react";

const MetadataCard = ({ metadata }) => {
  if (!metadata || Object.keys(metadata).length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg max-w-full mx-auto mt-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Metadata</h2>
      <div className="divide-y divide-gray-200 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {Object.entries(metadata).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center py-4">
            <span className="text-gray-700 font-medium">{key}</span>
            <span className="text-gray-900">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetadataCard;
