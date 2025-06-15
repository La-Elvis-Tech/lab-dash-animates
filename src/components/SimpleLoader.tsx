
import React from 'react';

const SimpleLoader = () => (
  <div className="flex items-center justify-center h-16">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-400/70 border-t-transparent"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 bg-blue-400 rounded-full opacity-70"></div>
      </div>
    </div>
  </div>
);

export default React.memo(SimpleLoader);
