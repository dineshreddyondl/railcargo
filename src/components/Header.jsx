import React from 'react';

const Header = () => {
  return (
    <div className="text-center bg-white rounded-2xl p-8 mb-8 shadow-lg">
      <div className="text-5xl mb-2">🚂</div>
      <h1 className="text-3xl font-bold text-primary mb-2 tracking-wide">
        RAILWAY CARGO FINDER
      </h1>
      <p className="text-gray-500 text-sm">
        Find transport providers for your route
      </p>
    </div>
  );
};

export default Header;
