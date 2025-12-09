import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { TASK_ENDPOINTS, TIME_ENTRY_ENDPOINTS } from '../api/endpoints';
import TaskTimer from '../components/Task/TaskTimer';

function TaskDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchTask();
    }, [id]);

    const fetchTask = async () => {
        try {
            const res = await api.get(TASK_ENDPOINTS.GET_BY_ID.replace(':id', id));
            setTask(res.data);
            setFormData(res.data);
        } catch (error) {
            console.error('Ошибка при загрузке задачи:', error);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(TASK_ENDPOINTS.UPDATE.replace(':id', id), formData);
            setTask(formData);
            setIsEditing(false);
            alert('✅ Задача обновлена');
        } catch (error) {
            console.error('Ошибка при обновлении:', error);
            alert('❌ Ошибка при обновлении');
        }
    };

    if (loading) return <div className="text-center py-10">Загрузка...</div>;
    if (!task) return <div className="text-center py-10">Задача не найдена</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => navigate('/tasks')}
                className="text-blue-600 dark:text-blue-400 hover:underline mb-4"
            >
                ← Вернуться к задачам
            </button>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
                {!isEditing ? (
                    <>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {task.title}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    {task.description}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                            >
                                ✏️ Редактировать
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Статус</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {task.status}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Приоритет</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {task.priority}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Срок выполнения</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {task.dueDate
                                        ? new Date(task.dueDate).toLocaleDateString('ru-RU')
                                        : 'Не установлен'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Дата создания</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {new Date(task.createdAt).toLocaleDateString('ru-RU')}
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block font-medium mb-2">Название</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Описание</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block font-medium mb-2">Статус</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="todo">К выполнению</option>
                                    <option value="in_progress">В работе</option>
                                    <option value="done">Готово</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium mb-2">Приоритет</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="1">Низкий</option>
                                    <option value="2">Средний</option>
                                    <option value="3">Высокий</option>
                                    <option value="4">Критичный</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Срок выполнения</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate?.split('T')[0]}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg"
                            >
                                💾 Сохранить
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-lg"
                            >
                                ❌ Отменить
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <TaskTimer taskId={id} />
        </div>
    );
}

export default TaskDetail;