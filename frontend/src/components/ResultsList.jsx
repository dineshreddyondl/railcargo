import React from 'react';
import ResultCard from './ResultCard';

const ResultsList = ({ results }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg animate-fadeIn">
      <div className="flex justify-between items-center mb-6 flex-wrap">
        <h2 className="text-xl font-bold text-gray-800">📋 SEARCH RESULTS</h2>
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
          Found {results.length} provider{results.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-5">
        {results.map((provider, index) => (
          <ResultCard key={index} provider={provider} />
        ))}
      </div>
    </div>
  );
};

export default ResultsList;