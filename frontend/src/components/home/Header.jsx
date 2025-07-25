// CÓDIGO COM CAMINHO CORRIGIDO para frontend/src/components/home/Header.jsx

import React from 'react';
import AnimatedLogo from '../shared/AnimatedLogo'; 

const Header = () => {
  return (
    <header className="text-center py-10 md:py-12">
      <AnimatedLogo size="96px" className="mx-auto mb-5" />
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">BahiaExpress</h1>
      <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">A solução completa para suas cargas e mudanças na Bahia.</p>
    </header>
  );
};

export default Header;