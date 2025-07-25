// Em: frontend/src/components/AnimatedLogo.jsx

import React from 'react';
import './AnimatedLogo.css';

/**
 * Componente de Logo Animada para o BahiaExpress.
 * - Totalmente acessível com tags <title> e <desc>.
 * - Animação pode ser pausada via prop.
 * - Altamente personalizável com props 'size' e 'className'.
 */
const AnimatedLogo = ({ size = '150px', className = '', paused = false }) => {
  // Combina classes CSS de forma segura
  const containerClasses = ['logo-container', className, paused ? 'paused' : ''].join(' ').trim();

  return (
    <div className={containerClasses} style={{ width: size }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 350 200"
        className="animated-truck-svg"
        role="img" // Acessibilidade: define o SVG como uma imagem
        aria-labelledby="logoTitle logoDesc" // Acessibilidade: linka com o título e descrição
      >
        {/* Acessibilidade: Título e Descrição para leitores de tela */}
        <title id="logoTitle">Logo Animada BahiaExpress</title>
        <desc id="logoDesc">Animação de um caminhão laranja em movimento com linhas de velocidade.</desc>
        
        {/* --- EFEITO DE VELOCIDADE --- */}
        <g className="speed-lines-group" fill="none" stroke="#f39c12" strokeWidth="8" strokeLinecap="round">
          <path d="M 10 90 H 80" />
          <path d="M 20 105 H 100" />
          <path d="M 10 120 H 80" />
        </g>
        
        {/* --- CAMINHÃO --- */}
        <g id="truck">
          {/* Estrutura redesenhada para maior fidelidade e preenchimento sólido */}
          <path 
            d="M130 70 H 230 V 130 H 130 V 70 M230 80 H 270 L 290 105 V 130 H 230 V 80"
            fill="#f39c12"
            stroke="#002244"
            strokeWidth="1.5"
          />
          {/* Vidro da cabine */}
          <rect x="235" y="85" width="38" height="20" fill="#3498db" />

          {/* Roda Traseira */}
          <g className="wheel" transform="translate(165, 140)">
            <circle r="20" fill="#2c3e50" stroke="#1c2833" strokeWidth="2" />
            <circle r="9" fill="#bdc3c7" />
          </g>
          
          {/* Roda Dianteira */}
          <g className="wheel" transform="translate(275, 140)">
            <circle r="20" fill="#2c3e50" stroke="#1c2833" strokeWidth="2" />
            <circle r="9" fill="#bdc3c7" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default AnimatedLogo;