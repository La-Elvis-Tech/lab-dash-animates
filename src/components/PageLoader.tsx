
import React from 'react';

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 dark:border-neutral-100 mx-auto"></div>
      <p className="mt-4 text-neutral-500 dark:text-neutral-400">Carregando...</p>
    </div>
  </div>
);

export default PageLoader;
