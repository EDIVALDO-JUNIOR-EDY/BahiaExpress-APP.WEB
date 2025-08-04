// C:/dev/frontend/src/components/shared/ResumoVolumes.jsx
import React from 'react';
import { FaBox, FaShoppingBag, FaHome, FaCubes } from 'react-icons/fa';

const ResumoVolumes = ({ comodos }) => {
    // Calcular totais
    const totais = comodos.reduce((acc, comodo) => {
        const totalItens = comodo.itens.reduce((sum, item) => sum + parseInt(item.qt || 0), 0);
        return {
            totalComodos: acc.totalComodos + 1,
            totalItens: acc.totalItens + totalItens
        };
    }, { totalComodos: 0, totalItens: 0 });

    // Calcular estimativas
    const estimativaCaixas = Math.ceil(totais.totalItens / 5);
    const estimativaSacolas = Math.ceil(totais.totalItens / 3);

    return (
        <div className="bg-brand-surface p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-center flex items-center justify-center">
                <FaCubes className="mr-2 text-brand-blue" />
                4. TOTAL DE VOLUMES DE EMBALAGENS
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Total de Cômodos */}
                <div className="bg-white p-4 rounded-md text-center">
                    <div className="flex items-center justify-center mb-2">
                        <FaHome className="text-2xl text-brand-orange" />
                    </div>
                    <h3 className="font-semibold text-gray-700">Total de Cômodos</h3>
                    <p className="text-3xl font-bold text-brand-blue">{totais.totalComodos}</p>
                </div>
                
                {/* Total de Itens */}
                <div className="bg-white p-4 rounded-md text-center">
                    <div className="flex items-center justify-center mb-2">
                        <FaCubes className="text-2xl text-brand-blue" />
                    </div>
                    <h3 className="font-semibold text-gray-700">Total de Itens</h3>
                    <p className="text-3xl font-bold text-brand-blue">{totais.totalItens}</p>
                </div>
                
                {/* Estimativa de Caixas */}
                <div className="bg-white p-4 rounded-md text-center">
                    <div className="flex items-center justify-center mb-2">
                        <FaBox className="text-2xl text-brand-orange" />
                    </div>
                    <h3 className="font-semibold text-gray-700">Estimativa de Caixas</h3>
                    <p className="text-3xl font-bold text-brand-blue">{estimativaCaixas}</p>
                </div>
                
                {/* Estimativa de Sacolas */}
                <div className="bg-white p-4 rounded-md text-center">
                    <div className="flex items-center justify-center mb-2">
                        <FaShoppingBag className="text-2xl text-brand-orange" />
                    </div>
                    <h3 className="font-semibold text-gray-700">Estimativa de Sacolas</h3>
                    <p className="text-3xl font-bold text-brand-blue">{estimativaSacolas}</p>
                </div>
            </div>
            
            {/* Detalhamento por Cômodo */}
            <div className="bg-white p-4 rounded-md">
                <h3 className="font-semibold text-gray-700 mb-3">Detalhamento por Cômodo:</h3>
                <div className="space-y-2">
                    {comodos.map((comodo, index) => {
                        const totalItensComodo = comodo.itens.reduce((sum, item) => sum + parseInt(item.qt || 0), 0);
                        return (
                            <div key={comodo.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="font-medium">{comodo.nome}</span>
                                <span className="text-brand-blue font-semibold">{totalItensComodo} itens</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ResumoVolumes;