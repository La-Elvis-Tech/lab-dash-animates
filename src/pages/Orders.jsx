
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Orders = () => {
  const pageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef}>
      <h1 className="text-3xl font-bold text-gray-800">Pedidos</h1>
      <p className="text-gray-500 mt-1 mb-6">Gerencie os pedidos de itens laboratoriais</p>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-xl font-medium text-gray-700">Página em desenvolvimento</h2>
        <p className="text-gray-500 mt-2">
          Esta funcionalidade estará disponível em breve!
        </p>
      </div>
    </div>
  );
};

export default Orders;
