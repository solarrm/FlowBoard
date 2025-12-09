import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axiosInstance';
import { COMMENT_ENDPOINTS } from '../../api/endpoints';

function NoteComments({ noteId }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComments();
    }, [noteId]);

    const fetchComments = async () => {
        try {
            const res = await api.get(
                COMMENT_ENDPOINTS.GET_BY_NOTE.replace(':noteId', noteId)
            );
            setComments(res.data);
        } catch (error) {
            console.error('Ошибка при загрузке комментариев:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            alert('❌ Комментарий не может быть пустым');
            return;
        }

        try {
            const res = await api.post(COMMENT_ENDPOINTS.CREATE, {
                authorId: user.userId,
                noteId: parseInt(noteId),
                content: newComment,
            });

            setComments([...comments, res.data]);
            setNewComment('');
        } catch (error) {
            console.error('Ошибка при добавлении комментария:', error);
            alert('❌ Ошибка при добавлении комментария');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Вы уверены?')) return;

        try {
            await api.delete(COMMENT_ENDPOINTS.DELETE.replace(':id', commentId));
            setComments(comments.filter((c) => c.commentId !== commentId));
        } catch (error) {
            console.error('Ошибка при удалении:', error);
            alert('❌ Ошибка при удалении');
        }
    };

    if (loading) return <div className="text-center py-10">Загрузка...</div>;

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                💬 Комментарии
            </h2>

            <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Напишите комментарий..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                        ➕ Отправить
                    </button>
                </div>
            </form>

            {comments.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    Комментариев нет
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div
                            key={comment.commentId}
                            className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {comment.author?.userName || 'Неизвестный'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(comment.createdAt).toLocaleString('ru-RU')}
                                    </p>
                                </div>
                                {comment.authorId === user.userId && (
                                    <button
                                        onClick={() =>
                                            handleDeleteComment(comment.commentId)
                                        }
                                        className="text-red-600 dark:text-red-400 hover:underline text-sm"
                                    >
                                        🗑️ Удалить
                                    </button>
                                )}
                            </div>
                            <p className="text-gray-800 dark:text-gray-200">
                                {comment.content}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default NoteComments;