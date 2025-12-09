import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axiosInstance';
import { NOTES_ENDPOINTS, USER_ENDPOINTS } from '../../api/endpoints';

function NoteSharing({ noteId }) {
    const { user } = useAuth();
    const [shares, setShares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newShareEmail, setNewShareEmail] = useState('');
    const [canEdit, setCanEdit] = useState(false);
    const [canComment, setCanComment] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchShares();
    }, [noteId]);

    const fetchShares = async () => {
        try {
            const res = await api.get(
                NOTES_ENDPOINTS.GET_SHARES.replace(':id', noteId)
            );
            setShares(res.data);
        } catch (error) {
            console.error('Ошибка при загрузке доступов:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddShare = async (e) => {
        e.preventDefault();
        if (!newShareEmail.trim()) {
            alert('❌ Введите email');
            return;
        }

        setIsAdding(true);
        try {
            const res = await api.post(
                NOTES_ENDPOINTS.ADD_SHARE.replace(':id', noteId),
                {
                    userEmail: newShareEmail,
                    canEdit,
                    canComment,
                }
            );

            setShares([...shares, res.data]);
            setNewShareEmail('');
            setCanEdit(false);
            setCanComment(true);
            alert('✅ Доступ предоставлен');
        } catch (error) {
            console.error('Ошибка при предоставлении доступа:', error);
            alert(
                error.response?.data?.message ||
                '❌ Ошибка при предоставлении доступа'
            );
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveShare = async (shareId) => {
        if (!window.confirm('Вы уверены?')) return;

        try {
            await api.delete(
                NOTES_ENDPOINTS.REMOVE_SHARE.replace(':id', noteId).replace(
                    ':shareId',
                    shareId
                )
            );
            setShares(shares.filter((s) => s.id !== shareId));
            alert('✅ Доступ удалён');
        } catch (error) {
            console.error('Ошибка при удалении доступа:', error);
            alert('❌ Ошибка при удалении доступа');
        }
    };

    if (loading) return <div className="text-center py-10">Загрузка...</div>;

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                🔗 Управление доступом
            </h2>

            <form onSubmit={handleAddShare} className="mb-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                    Предоставить доступ
                </h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                            Email пользователя
                        </label>
                        <input
                            type="email"
                            value={newShareEmail}
                            onChange={(e) => setNewShareEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <input
                                type="checkbox"
                                checked={canEdit}
                                onChange={(e) => setCanEdit(e.target.checked)}
                            />
                            <span>Может редактировать</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <input
                                type="checkbox"
                                checked={canComment}
                                onChange={(e) => setCanComment(e.target.checked)}
                            />
                            <span>Может комментировать</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isAdding}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                        {isAdding ? 'Добавление...' : '➕ Добавить'}
                    </button>
                </div>
            </form>

            <div>
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                    Пользователи с доступом
                </h3>
                {shares.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        Нет доступов
                    </div>
                ) : (
                    <div className="space-y-2">
                        {shares.map((share) => (
                            <div
                                key={share.id}
                                className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
                            >
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {share.user?.userName || share.user?.email}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {share.canEdit ? '✏️ Редактирование' : '👁️ Просмотр'}{' '}
                                        {share.canComment && '| 💬 Комментарии'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleRemoveShare(share.id)}
                                    className="text-red-600 dark:text-red-400 hover:underline"
                                >
                                    🗑️ Удалить
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default NoteSharing;