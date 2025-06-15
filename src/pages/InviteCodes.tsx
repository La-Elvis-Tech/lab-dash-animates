
import React from 'react';
import InviteCodeDisplay from '@/components/InviteCodeDisplay';

const InviteCodes = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Códigos de Convite
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Visualize os códigos disponíveis para criar contas
        </p>
      </div>
      
      <InviteCodeDisplay />
    </div>
  );
};

export default InviteCodes;
