// C:/dev/frontend/src/components/shared/PetFormModal.jsx

import React, { useState } from 'react';
import Modal from './Modal'; // Importa nosso modal genérico

const PetFormModal = ({ isOpen, onClose, onSave }) => {
  const [petData, setPetData] = useState({
    quantidade: 1,
    raca: '',
    tamanho: 'pequeno',
    possuiGaiola: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPetData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = () => {
    // Passa os dados para o componente pai (SolicitarMudanca)
    onSave(petData);
    onClose(); // Fecha o modal
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Transporte de Pet">
      <div className="space-y-4">
        <div>
          <label className="block font-semibold">Quantidade de Animais</label>
          <input type="number" name="quantidade" value={petData.quantidade} onChange={handleChange} min="1" className="w-full p-2 border rounded"/>
        </div>
        <div>
          <label className="block font-semibold">Raça(s)</label>
          <input type="text" name="raca" value={petData.raca} onChange={handleChange} placeholder="Ex: Vira-lata, Poodle" className="w-full p-2 border rounded"/>
        </div>
        <div>
          <label className="block font-semibold">Tamanho Predominante</label>
          <select name="tamanho" value={petData.tamanho} onChange={handleChange} className="w-full p-2 border rounded bg-white">
            <option value="pequeno">Pequeno (até 10kg)</option>
            <option value="medio">Médio (10kg a 25kg)</option>
            <option value="grande">Grande (acima de 25kg)</option>
          </select>
        </div>
        <div className="flex items-center">
          <input type="checkbox" name="possuiGaiola" id="possuiGaiola" checked={petData.possuiGaiola} onChange={handleChange} className="h-5 w-5"/>
          <label htmlFor="possuiGaiola" className="ml-2">Eu possuo a gaiola de transporte adequada.</label>
        </div>
        <div className="bg-yellow-100 p-3 rounded-md text-yellow-800 text-sm">
          <strong>Atenção:</strong> A alimentação e a higiene do pet durante a viagem são de responsabilidade do cliente.
        </div>
        <div className="flex justify-end pt-4">
          <button onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700">
            Salvar Detalhes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PetFormModal;