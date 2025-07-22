import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import api from '../services/api'; // <-- MUDANÇA AQUI

const AvaliacaoModal = ({ mudanca, currentUser, onClose, onSuccess }) => {
    const [estrelas, setEstrelas] = useState(0);
    const [hover, setHover] = useState(0);
    const [comentario, setComentario] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (estrelas === 0) {
            alert('Por favor, selecione pelo menos uma estrela.');
            return;
        }
        setLoading(true);
        try {
            // MUDANÇA AQUI:
            await api.post('/avaliacoes/criar', {
                mudancaId: mudanca.id,
                motoristaId: mudanca.motoristaId,
                clienteId: currentUser.uid,
                estrelas,
                comentario
            });
            alert('Obrigado pela sua avaliação!');
            onSuccess();
        } catch (error) {
            console.error("Erro ao enviar avaliação", error);
            alert('Houve um erro ao enviar sua avaliação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Avaliar Serviço</h2>
                <p>Como foi o serviço de mudança de <span className="font-semibold">{mudanca.origem}</span> para <span className="font-semibold">{mudanca.destino}</span>?</p>
                <div className="flex justify-center my-6">
                    {[...Array(5)].map((star, index) => {
                        const ratingValue = index + 1;
                        return (
                            <label key={index}>
                                <input type="radio" name="rating" value={ratingValue} onClick={() => setEstrelas(ratingValue)} className="hidden"/>
                                <FaStar
                                    className="cursor-pointer"
                                    color={ratingValue <= (hover || estrelas) ? "#ffc107" : "#e4e5e9"}
                                    size={40}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(0)}
                                />
                            </label>
                        );
                    })}
                </div>
                <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Deixe um comentário (opcional)..."
                    className="w-full h-24 p-2 border rounded-md"
                />
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
                    <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400">
                        {loading ? 'Enviando...' : 'Enviar Avaliação'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvaliacaoModal;