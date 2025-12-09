import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { TASK_ENDPOINTS } from '../api/endpoints';

function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await api.get(TASK_ENDPOINTS.GET_BY_PROJECT.replace(':projectId', '*'));
                setTasks(res.data);
            } catch (error) {
                console.error('Ошибка при загрузке задач:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const filteredTasks = tasks.filter((task) => {
        if (filter === 'all') return true;
        return task.status === filter;
    });

    if (loading) return <div className="text-center py-10">Загрузка...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">✅ Задачи</h1>
                <Link
                    to="/tasks/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                    ➕ Новая задача
                </Link>
            </div>

            <div className="flex gap-2">
                {['all', 'todo', 'in_progress', 'done'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg transition ${filter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        {status === 'all'
                            ? 'Все'
                            : status === 'todo'
                                ? 'К выполнению'
                                : status === 'in_progress'
                                    ? 'В работе'
                                    : 'Готово'}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((task) => (
                    <Link key={task.taskId} to={`/tasks/${task.taskId}`}>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {task.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                                {task.description}
                            </p>
                            <div className="flex justify-between items-center">
                                <span
                                    className={`px-2 py-1 rounded text-sm font-medium ${task.status === 'done'
                                            ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : task.status === 'in_progress'
                                                ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                : 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}
                                >
                                    {task.status}
                                </span>
                                <span className={`text-sm font-bold ${getPriorityColor(task.priority)}`}>
                                    Приоритет: {task.priority}
                                </span>
                            </div>
                            {task.dueDate && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    До: {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                                </p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {filteredTasks.length === 0 && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    Задач не найдено
                </div>
            )}
        </div>
    );
}

function getPriorityColor(priority) {
    switch (priority) {
        case 1:
            return 'text-green-600 dark:text-green-400';
        case 2:
            return 'text-yellow-600 dark:text-yellow-400';
        case 3:
            return 'text-orange-600 dark:text-orange-400';
        case 4:
            return 'text-red-600 dark:text-red-400';
        default:
            return 'text-gray-600 dark:text-gray-400';
    }
}

export default TaskList;