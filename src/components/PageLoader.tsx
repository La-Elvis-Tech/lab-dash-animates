
import React, { useEffect, useState } from 'react';

const PageLoader = () => {
  // O loader fica visível por um tempo mínimo curtíssimo, mas soma fade suave caso a página carregue rápido
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Tempo minúsculo: o loader dura no mínimo 200ms (bom para UX), some se já carregou.
    const timer = setTimeout(() => setVisible(false), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-tr from-blue-50/90 to-blue-100/90 dark:from-neutral-800/90 dark:to-neutral-900/90 backdrop-blur transition-all animate-fade-in">
      <div className="w-16 h-16 flex items-center justify-center relative mb-3">
        <span className="absolute inset-0 rounded-full border-4 border-blue-400 border-r-transparent animate-spin" />
        <span className="relative z-10 block w-5 h-5 bg-blue-500/95 rounded-full shadow-md animate-pulse" />
      </div>
      <p className="text-blue-700 dark:text-blue-300 font-semibold tracking-tight animate-fade-in">
        Carregando...
      </p>
    </div>
  );
};
export default PageLoader;
