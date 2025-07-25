// CÓDIGO COMPLETO E DEFINITIVO para frontend/src/components/shared/LoadingSpinner.jsx

import React from 'react';

const LoadingSpinner = () => {
  return (
    // Container que cobre a tela inteira com um fundo semi-transparente
    <div className="flex justify-center items-center fixed inset-0 bg-white bg-opacity-75 z-50">
      {/* O círculo animado */}
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;