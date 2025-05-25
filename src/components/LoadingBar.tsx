import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";          // estilos default       // (opcional) customizações

// Opcional: crie um arquivo `nprogress-custom.css` ao lado para customizar
// .nprogress .bar { background: #7f00ff; height: 3px; }

export const LoadingBar = () => {
  const location = useLocation();
  useEffect(() => {
    NProgress.start();
    // pequena espera para mostrar o progresso mínimos de 200ms
    const timer = setTimeout(() => NProgress.done(), 200);
    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location]);

  return null;
};
