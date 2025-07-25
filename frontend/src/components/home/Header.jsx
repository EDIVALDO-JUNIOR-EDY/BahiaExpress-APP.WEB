// CÓDIGO COMPLETO E ATUALIZADO para frontend/src/components/home/Header.jsx
import React from 'react';
// Lembre-se de colocar seu arquivo de logo nesta pasta e ajustar o nome se necessário
import logo from '../../assets/logo-bahia-express.png'; 

const Header = () => (
    <header className="text-center py-10 md:py-12">
        <img 
            src={logo} 
            alt="Logo BahiaExpress" 
            className="mx-auto h-20 w-20 md:h-24 md:w-24 mb-4" 
        />
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
            BahiaExpress
        </h1>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            A solução completa para suas cargas e mudanças na Bahia.
        </p>
    </header>
);

export default Header;