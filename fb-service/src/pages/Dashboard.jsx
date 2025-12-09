import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosInstance';
import { PROJECT_ENDPOINTS, TASK_ENDPOINTS } from '../api/endpoints';

function Dashboard() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [recentTasks, setRecentTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsRes, tasksRes] = await Promise.all([
                    api.get(PROJECT_ENDPOINTS.GET_ALL),
                    api.get(TASK_ENDPOINTS.GET_BY_PROJECT.replace(':projectId', '*')),
                ]);

                setProjects(projectsRes.data.slice(0, 5));
                setRecentTasks(tasksRes.data.slice(0, 10));
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center py-10">Загрузка...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg shadow-lg">
                <h1 className="text-4xl font-bold mb-2">Добро пожаловать, {user?.userName}! 👋</h1>
                <p className="text-lg opacity-90">Роль: <strong>{user?.role}</strong></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                        📁 Недавние проекты
                    </h2>
                    {projects.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">Нет проектов</p>
                    ) : (
                        <ul className="space-y-2">
                            {projects.map((project) => (
                                <li
                                    key={project.projectId}
                                    className="p-3 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer"
                                >
                                    <a
                                        href={`/projects/${project.projectId}`}
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {project.name}
                                    </a>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Статус: {project.status}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                        ✅ Недавние задачи
                    </h2>
                    {recentTasks.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">Нет задач</p>
                    ) : (
                        <ul className="space-y-2">
                            {recentTasks.map((task) => (
                                <li
                                    key={task.taskId}
                                    className="p-3 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer"
                                >
                                    <a
                                        href={`/tasks/${task.taskId}`}
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {task.title}
                                    </a>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Статус: {task.status} | Приоритет: {task.priority}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;