import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const PageLoader = () => {
  const [loading, setLoading] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, [loc]);

  if (!loading) return null;
  
  return (
    <div className="m-80 fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="flex flex-col  items-center gap-4">
        {/* Spinner com múltiplas animações */}
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent rounded-full 
            border-t-emerald-400 animate-spin-slow border-r-emerald-400"></div>
          <div className="absolute inset-0 border-4 border-transparent rounded-full 
            border-b-sky-400 animate-spin-slower border-l-sky-400"></div>
        </div>

        {/* Mensagem com efeito de pulso */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-sky-400 
            bg-clip-text text-transparent animate-pulse">
            Carregando Magia...
          </span>
          <p className="text-md text-white/70 text-center">
            Prepare-se para uma experiência incrível!
          </p>
        </div>

        {/* Efeito de pontos flutuantes */}
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-3 w-3 mt-4 bg-emerald-400 rounded-full 
              animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
};