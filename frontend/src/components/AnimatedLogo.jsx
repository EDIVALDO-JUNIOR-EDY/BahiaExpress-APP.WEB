// Em frontend/src/components/AnimatedLogo.jsx

import React from 'react';
import './AnimatedLogo.css';

// Adicionamos a propriedade 'size' para controlar as dimensões
const AnimatedLogo = ({ size = '150px' }) => {
  return (
    // O estilo agora é controlado pela propriedade 'size'
    <div className="logo-container" style={{ width: size, height: 'auto' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 200"
        className="animated-truck-svg"
      >
        {/* Efeito de Velocidade */}
        <g id="speed-lines" className="speed-lines">
          <line x1="50" y1="90" x2="110" y2="90" strokeWidth="10" />
          <line x1="40" y1="105" x2="120" y2="105" strokeWidth="10" />
          <line x1="50" y1="120" x2="110" y2="120" strokeWidth="10" />
        </g>

        {/* Caminhão */}
        <g id="truck">
          {/* Chassi e Estrada */}
          <line x1="100" y1="140" x2="320" y2="140" stroke="#f39c12" strokeWidth="4" />
          
          {/* Corpo do Caminhão */}
          <path d="M150,80 h100 v50 h-100 z" fill="#f39c12" />
          
          {/* Cabine */}
          <path d="M250,80 h40 l15,25 v25 h-55 z" fill="#f39c12" />
          <path d="M260,105 h30 v25 h-30 z" fill="#3498db" stroke="#2980b9" strokeWidth="2" />

          {/* Rodas - Adicionamos classes para animá-las */}
          <g className="wheel">
            <circle cx="180" cy="140" r="15" fill="#333" />
            <circle cx="180" cy="140" r="7" fill="#ddd" />
          </g>
          <g className="wheel">
            <circle cx="280" cy="140" r="15" fill="#333" />
            <circle cx="280" cy="140" r="7" fill="#ddd" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default AnimatedLogo;