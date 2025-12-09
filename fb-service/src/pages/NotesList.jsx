import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { NOTES_ENDPOINTS } from '../api/endpoints';

function NotesList() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await api.get(NOTES_ENDPOINTS.GET_ALL);
            setNotes(res.data);
        } catch (error) {
            console.error('Ошибка при загрузке заметок:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNote = async () => {
        try {
            const res = await api.post(NOTES_ENDPOINTS.CREATE, {
                title: 'Новая заметка',
                content: '',
            });
            navigate(`/notes/${res.data.noteId}`);
        } catch (error) {
            console.error('Ошибка при создании заметки:', error);
            alert('❌ Ошибка при создании заметки');
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту заметку?')) {
            return;
        }

        try {
            await api.delete(NOTES_ENDPOINTS.DELETE.replace(':id', noteId));
            setNotes(notes.filter((n) => n.noteId !== noteId));
            alert('✅ Заметка удалена');
        } catch (error) {
            console.error('Ошибка при удалении заметки:', error);
            alert('❌ Ошибка при удалении');
        }
    };

    const filteredNotes = notes.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="text-center py-10">Загрузка...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📝 Заметки</h1>
                <button
                    onClick={handleCreateNote}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                    ➕ Новая заметка
                </button>
            </div>

            <div>
                <input
                    type="text"
                    placeholder="Поиск заметок..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {filteredNotes.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    Заметок не найдено
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredNotes.map((note) => (
                        <div
                            key={note.noteId}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition"
                        >
                            <Link
                                to={`/notes/${note.noteId}`}
                                className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline block mb-2"
                            >
                                {note.title}
                            </Link>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                                {note.content || 'Пустая заметка'}
                            </p>
                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                <span>
                                    {new Date(note.createdAt).toLocaleDateString('ru-RU')}
                                </span>
                                <button
                                    onClick={() => handleDeleteNote(note.noteId)}
                                    className="text-red-600 dark:text-red-400 hover:underline"
                                >
                                    🗑️ Удалить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default NotesList;