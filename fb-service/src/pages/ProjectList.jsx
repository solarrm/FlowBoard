import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { PROJECT_ENDPOINTS } from '../api/endpoints';
import { useAuth } from '../hooks/useAuth';

function ProjectList() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get(PROJECT_ENDPOINTS.GET_ALL);
            setProjects(res.data);
        } catch (error) {
            console.error('Ошибка при загрузке проектов:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async () => {
        try {
            const res = await api.post(PROJECT_ENDPOINTS.CREATE, {
                name: 'Новый проект',
                description: '',
                status: 'planned',
            });
            navigate(`/projects/${res.data.projectId}`);
        } catch (error) {
            console.error('Ошибка при создании проекта:', error);
            alert('❌ Ошибка при создании проекта');
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm('Удалить проект?')) return;

        try {
            await api.delete(PROJECT_ENDPOINTS.DELETE.replace(':id', projectId));
            setProjects(projects.filter((p) => p.projectId !== projectId));
            alert('✅ Проект удалён');
        } catch (error) {
            console.error('Ошибка при удалении проекта:', error);
            alert('❌ Ошибка при удалении проекта');
        }
    };

    const filteredProjects = projects.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="text-center py-10">Загрузка...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold dark:text-white">📁 Проекты</h1>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                    <button
                        onClick={handleCreateProject}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        ➕ Новый проект
                    </button>
                )}
            </div>

            <div>
                <input
                    type="text"
                    placeholder="Поиск проектов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {filteredProjects.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    Проектов не найдено
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.projectId}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition flex flex-col justify-between"
                        >
                            <div>
                                <Link
                                    to={`/projects/${project.projectId}`}
                                    className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline block mb-1"
                                >
                                    {project.name}
                                </Link>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-3">
                                    {project.description || 'Нет описания'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Статус: {project.status}
                                </p>
                                {project.startDate && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        С {new Date(project.startDate).toLocaleDateString('ru-RU')}
                                        {project.endDate &&
                                            ` по ${new Date(
                                                project.endDate
                                            ).toLocaleDateString('ru-RU')}`}
                                    </p>
                                )}
                            </div>
                            {(user?.role === 'admin' ||
                                project.authorId === user?.userId) && (
                                    <button
                                        onClick={() => handleDeleteProject(project.projectId)}
                                        className="mt-3 text-red-600 dark:text-red-400 hover:underline self-end text-sm"
                                    >
                                        🗑️ Удалить
                                    </button>   
                                )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProjectList;