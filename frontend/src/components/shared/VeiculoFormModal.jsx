// C:/dev/frontend/src/components/shared/VeiculoFormModal.jsx

import React, { useState } from 'react';
import Modal from './Modal';

const VeiculoFormModal = ({ isOpen, onClose, onSave }) => {
  const [veiculoData, setVeiculoData] = useState({
    tipo: 'carro',
    modelo: '',
    quantidade: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVeiculoData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(veiculoData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Transporte de Veículo">
      <div className="space-y-4">
        <div>
          <label className="block font-semibold">Tipo de Veículo</label>
          <select name="tipo" value={veiculoData.tipo} onChange={handleChange} className="w-full p-2 border rounded bg-white">
            <option value="carro">Carro</option>
            <option value="moto">Moto</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold">Modelo(s)</label>
          <input type="text" name="modelo" value={veiculoData.modelo} onChange={handleChange} placeholder="Ex: Honda Civic, Yamaha Fazer 250" className="w-full p-2 border rounded"/>
        </div>
        <div>
          <label className="block font-semibold">Quantidade</label>
          <input type="number" name="quantidade" value={veiculoData.quantidade} onChange={handleChange} min="1" className="w-full p-2 border rounded"/>
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

export default VeiculoFormModal;