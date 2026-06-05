import React from 'react';

const ResultCard = ({ provider }) => {
  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl">🏢</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">
            {provider.contractor_name || 'N/A'}
          </h3>
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mt-1">
            {provider.comp || 'N/A'}
          </span>
        </div>
      </div>

      <div className="h-px bg-gray-200 my-4"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🚆</div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Train No.</div>
            <div className="text-sm font-medium">{provider.train_no || 'N/A'}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-2xl">📊</div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Capacity</div>
            <div className="text-sm font-medium">{provider.capacity || 'N/A'} tons</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-2xl">👤</div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Contact</div>
            <div className="text-sm font-medium">{provider.name || 'N/A'}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-2xl">📞</div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Mobile</div>
            <div className="text-sm font-medium">+91 {provider.mobile || 'N/A'}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 md:col-span-2">
          <div className="text-2xl">✉️</div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Email</div>
            <div className="text-sm font-medium break-all">{provider.emailid || 'N/A'}</div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 my-4"></div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="text-xl">🗺️</div>
        <span className="text-sm text-gray-600">
          {provider.src || 'N/A'} → {provider.dest || 'N/A'}
        </span>
      </div>
    </div>
  );
};

export default ResultCard;
