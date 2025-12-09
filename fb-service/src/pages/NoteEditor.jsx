import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosInstance';
import { NOTES_ENDPOINTS } from '../api/endpoints';
import NoteComments from '../components/Notes/NoteComments';
import NoteSharing from '../components/Notes/NoteSharing';

function NoteEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [canEdit, setCanEdit] = useState(false);
    const [activeTab, setActiveTab] = useState('editor');

    useEffect(() => {
        fetchNote();
    }, [id]);

    const fetchNote = async () => {
        try {
            const res = await api.get(NOTES_ENDPOINTS.GET_BY_ID.replace(':id', id));
            setNote(res.data);
            setFormData({
                title: res.data.title,
                content: res.data.content || '',
            });

            const sharesRes = await api.get(
                NOTES_ENDPOINTS.GET_SHARES.replace(':id', id)
            );
            const userShare = sharesRes.data.find((s) => s.userId === user?.userId);
            setCanEdit(userShare?.canEdit || res.data.authorId === user?.userId);
        } catch (error) {
            console.error('Ошибка при загрузке заметки:', error);
            navigate('/notes');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        if (!canEdit) {
            alert('❌ У вас нет прав на редактирование');
            return;
        }

        setIsSaving(true);
        try {
            await api.put(
                NOTES_ENDPOINTS.UPDATE.replace(':id', id),
                formData
            );
            setNote({ ...note, ...formData });
            alert('✅ Заметка сохранена');
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            alert('❌ Ошибка при сохранении');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="text-center py-10">Загрузка...</div>;
    if (!note) return <div className="text-center py-10">Заметка не найдена</div>;

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate('/notes')}
                className="text-blue-600 dark:text-blue-400 hover:underline mb-4"
            >
                ← Вернуться к заметкам
            </button>

            <div className="flex gap-4 border-b border-gray-300 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('editor')}
                    className={`px-4 py-2 font-semibold ${activeTab === 'editor'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                >
                    ✏️ Редактор
                </button>
                <button
                    onClick={() => setActiveTab('comments')}
                    className={`px-4 py-2 font-semibold ${activeTab === 'comments'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                >
                    💬 Комментарии
                </button>
                <button
                    onClick={() => setActiveTab('sharing')}
                    className={`px-4 py-2 font-semibold ${activeTab === 'sharing'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                >
                    🔗 Доступ
                </button>
            </div>

            {activeTab === 'editor' && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
                    <div className="mb-4">
                        <label className="block font-semibold mb-2 text-gray-900 dark:text-white">
                            Название
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            disabled={!canEdit}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block font-semibold mb-2 text-gray-900 dark:text-white">
                            Содержание
                        </label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            disabled={!canEdit}
                            className="w-full h-96 px-4 py-2 border border-gray-300 rounded-lg bg-white text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 resize-none"
                            placeholder="Напишите содержание заметки..."
                        />
                    </div>

                    {canEdit && (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition"
                        >
                            {isSaving ? '💾 Сохранение...' : '💾 Сохранить'}
                        </button>
                    )}

                    {!canEdit && (
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                            ⚠️ У вас есть только права на просмотр этой заметки
                        </div>
                    )}

                    <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                        <p>Создано: {new Date(note.createdAt).toLocaleString('ru-RU')}</p>
                        <p>Обновлено: {new Date(note.updatedAt).toLocaleString('ru-RU')}</p>
                    </div>
                </div>
            )}

            {activeTab === 'comments' && <NoteComments noteId={id} />}

            {activeTab === 'sharing' && <NoteSharing noteId={id} />}
        </div>
    );
}

export default NoteEditor;
