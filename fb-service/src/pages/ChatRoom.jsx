import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosInstance';
import { CHAT_ENDPOINTS } from '../api/endpoints';
import { createSignalRConnection } from '../api/apiSignalR';

function ChatRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [connection, setConnection] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const newConnection = createSignalRConnection('/chatHub');

        setConnection(newConnection);

        return () => {
            newConnection.stop();
        };
    }, []);

    useEffect(() => {
        const init = async () => {
            if (connection) {
                connection.on('ReceiveMessage', (message) => {
                    setMessages(prev => [...prev, message]);
                });

                try {
                    await connection.start();
                    await connection.invoke('JoinChat', parseInt(roomId));
                } catch (error) {
                    console.error('SignalR:', error);
                }
            }
        };

        init();
        fetchMessages();
    }, [connection, roomId]);

    const fetchMessages = async () => {
        try {
            const res = await api.get(CHAT_ENDPOINTS.GET_MESSAGES.replace(':roomId', roomId));
            setMessages(res.data);
        } catch (error) {
            console.error('Сообщения:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !connection) return;

        try {
            await connection.invoke('SendMessage', parseInt(roomId), newMessage.trim());
            setNewMessage('');
        } catch (error) {
            console.error('Отправка:', error);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600 dark:text-gray-400">Загрузка чата...</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-4xl mx-auto flex flex-col">
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/chats')}
                            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                        >
                            <span>←</span>
                            <span>Чаты</span>
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Комната #{roomId}
                        </h2>
                        <div className="w-12 flex items-center">
                            {connection?.state === 'Connected' ? (
                                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                            ) : (
                                <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {messages.map((message) => (
                        <div
                            key={message.messageId}
                            className={`flex ${message.userId === user?.userId ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-md px-6 py-3 rounded-2xl shadow-lg transform transition-all duration-200 ${message.userId === user?.userId
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm translate-x-2'
                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-bl-sm -translate-x-2'
                                }`}>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/30 dark:border-gray-600">
                                    <span className="text-xs opacity-75 font-medium">
                                        {message.userName || 'Пользователь'}
                                    </span>
                                    <span className={`text-xs opacity-75 font-mono ${message.userId === user?.userId ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                        {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {messages.length === 0 && (
                        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                            <div className="w-24 h-24 mx-auto mb-6 p-6 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                                💬
                            </div>
                            <p className="text-xl">Начните разговор!</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendMessage} className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex gap-3 items-end">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Напишите сообщение..."
                            className="flex-1 px-6 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-lg resize-none"
                            disabled={!connection || connection.state !== 'Connected'}
                            maxLength={1000}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || !connection || connection.state !== 'Connected'}
                            className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl disabled:shadow-none disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                        >
                            ➤
                        </button>
                    </div>
                    {!connection && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                            Подключение к чату...
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}

export default ChatRoom;