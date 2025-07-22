import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; // <-- MUDANÇA AQUI
import StarRating from '../components/StarRating';
import { FaTruck, FaCalendarAlt, FaUserCheck } from 'react-icons/fa';

const PerfilMotorista = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                // MUDANÇA AQUI:
                const response = await api.get(`/perfil/motorista/${id}`);
                setPerfil(response.data);
            } catch (error) {
                console.error("Erro ao carregar perfil:", error);
                alert("Não foi possível carregar o perfil deste motorista.");
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchPerfil();
        }
    }, [id]);

    if (loading) return <div className="p-8 text-center">Carregando perfil...</div>;
    if (!perfil) return <div className="p-8 text-center">Perfil não encontrado.</div>;

    return (
        <div className="bg-gray-100 min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">{"< Voltar"}</button>
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <div className="flex items-center space-x-6">
                        <img className="h-24 w-24 rounded-full object-cover" src={`https://i.pravatar.cc/150?u=${id}`} alt="Foto do motorista" />
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">{perfil.nome}</h1>
                            <div className="flex items-center mt-2">
                                <StarRating rating={perfil.mediaEstrelas} />
                                <span className="ml-2 text-xl font-semibold text-gray-700">{perfil.mediaEstrelas}</span>
                                <span className="ml-2 text-gray-500">({perfil.avaliacoes.length} avaliações)</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 border-t pt-8">
                        <div className="flex items-center space-x-3"><FaTruck className="text-blue-500" size={24} /><p>Veículo: <span className="font-semibold">{perfil.tipoVeiculo}</span></p></div>
                        <div className="flex items-center space-x-3"><FaCalendarAlt className="text-blue-500" size={24} /><p>Membro desde: <span className="font-semibold">{perfil.membroDesde}</span></p></div>
                        <div className="flex items-center space-x-3"><FaUserCheck className="text-green-500" size={24} /><p className="font-semibold">Verificado</p></div>
                    </div>
                </div>
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">O que os clientes dizem</h2>
                    <div className="space-y-4">
                        {perfil.avaliacoes.map((aval, index) => (
                            <div key={index} className="bg-white p-5 rounded-lg shadow">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold">{aval.clienteId}</h3> {/* Idealmente, buscaria o nome do cliente */}
                                    <StarRating rating={aval.estrelas} />
                                </div>
                                <p className="text-gray-600 mt-2">"{aval.comentario}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilMotorista;