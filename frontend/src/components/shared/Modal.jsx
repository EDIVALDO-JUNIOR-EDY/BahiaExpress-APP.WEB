// C:/dev/frontend/src/components/shared/Modal.jsx
import React from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    // Overlay de fundo
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      {/* Container do Modal */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Cabeçalho do Modal */}
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes size={24} />
          </button>
        </header>
        
        {/* Conteúdo Principal (onde o formulário específico entrará) */}
        <main className="p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Modal;