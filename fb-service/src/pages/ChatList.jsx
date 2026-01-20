import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { CHAT_ENDPOINTS } from '../api/endpoints';

function ChatList() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchChatRooms();
    }, []);

    const fetchChatRooms = async () => {
        try {
            const res = await api.get(CHAT_ENDPOINTS.GET_ROOMS);
            setChatRooms(res.data);
        } catch (error) {
            console.error('Ошибка загрузки чатов:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChatRoom = async () => {
        try {
            const res = await api.post(CHAT_ENDPOINTS.CREATE_ROOM, {
                name: 'Новый чат',
                projectId: null
            });
            navigate(`/chats/${res.data.roomId}`);
        } catch (error) {
            alert('❌ Ошибка создания чата');
        }
    };

    const filteredRooms = chatRooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="text-center py-10">Загрузка чатов...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">💬 Чаты</h1>
                <button
                    onClick={handleCreateChatRoom}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
                >
                    ➕ Новый чат
                </button>
            </div>

            <div>
                <input
                    type="text"
                    placeholder="Поиск чатов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {filteredRooms.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 p-6 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                        💬
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Чаты</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">Создайте первый чат для общения</p>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
                        onClick={handleCreateChatRoom}
                    >
                        Создать чат
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRooms.map((room) => (
                        <Link
                            key={room.roomId}
                            to={`/chats/${room.roomId}`}
                            className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-start space-x-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-semibold text-sm">#{room.name.slice(0, 2).toUpperCase()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {room.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {room.project?.name || 'Общий чат'}
                                    </p>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${room.unreadCount > 0
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                    }`}>
                                    {room.unreadCount || room.membersCount || 0}
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>{room.lastMessage?.time || 'Нет сообщений'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>{room.onlineCount} онлайн</span>
                                {room.onlineCount > 0 && (
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ChatList;
