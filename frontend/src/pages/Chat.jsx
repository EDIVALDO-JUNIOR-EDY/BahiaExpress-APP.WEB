// CÓDIGO NOVO PARA: frontend/src/pages/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { FaPaperPlane } from 'react-icons/fa';

const Chat = () => {
    const { mudancaId } = useParams(); // Pega o ID da mudança/chat da URL
    const { currentUser } = useAuth();
    const [mensagens, setMensagens] = useState([]);
    const [novaMensagem, setNovaMensagem] = useState('');
    const dummy = useRef(); // Para rolar a tela para a última mensagem

    // Efeito para buscar mensagens em tempo real com o Firebase SDK
    useEffect(() => {
        if (!mudancaId) return;

        const q = query(
            collection(db, 'chats', mudancaId, 'mensagens'),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = [];
            querySnapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() });
            });
            setMensagens(msgs);
            // Rola para a nova mensagem
            dummy.current.scrollIntoView({ behavior: 'smooth' });
        });

        return () => unsubscribe(); // Limpa o "ouvinte" ao sair da página

    }, [mudancaId]);

    const handleEnviarMensagem = async (e) => {
        e.preventDefault();
        if (novaMensagem.trim() === '' || !currentUser) return;

        await addDoc(collection(db, 'chats', mudancaId, 'mensagens'), {
            texto: novaMensagem,
            autorId: currentUser.uid,
            autorNome: currentUser.nome || currentUser.displayName,
            createdAt: new Date()
        });

        setNovaMensagem('');
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto border rounded-lg">
            <header className="bg-gray-100 p-4 border-b font-bold">
                Chat sobre a mudança ID: {mudancaId}
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {mensagens.map(msg => (
                    <div key={msg.id} className={`flex ${msg.autorId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.autorId === currentUser.uid ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            <p className="font-bold text-sm">{msg.autorNome}</p>
                            <p>{msg.texto}</p>
                        </div>
                    </div>
                ))}
                <div ref={dummy}></div> {/* Ponto invisível para onde a tela vai rolar */}
            </main>

            <footer className="p-4 bg-gray-100 border-t">
                <form onSubmit={handleEnviarMensagem} className="flex space-x-2">
                    <input
                        value={novaMensagem}
                        onChange={(e) => setNovaMensagem(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 p-2 border rounded-full"
                    />
                    <button type="submit" className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700">
                        <FaPaperPlane />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default Chat;