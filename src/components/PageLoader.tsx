
import React from 'react';

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="relative mx-auto mb-3 w-16 h-16">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-blue-600 border-b-transparent border-r-blue-300 border-l-blue-200 shadow-lg"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-4 h-4 rounded-full bg-blue-600 opacity-70"></span>
        </div>
      </div>
      <p className="mt-2 text-base font-medium text-blue-900 dark:text-blue-300 animate-fade-in">Carregando...</p>
    </div>
  </div>
);

export default PageLoader;
