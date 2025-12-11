import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { PROJECT_ENDPOINTS, TASK_ENDPOINTS } from '../api/endpoints';
import { useAuth } from '../hooks/useAuth';

function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editData, setEditData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberRole, setNewMemberRole] = useState('member');

    useEffect(() => {
        fetchAll();
    }, [id]);

    const fetchAll = async () => {
        try {
            const [projectRes, membersRes, tasksRes] = await Promise.all([
                api.get(PROJECT_ENDPOINTS.GET_BY_ID.replace(':id', id)),
                api.get(PROJECT_ENDPOINTS.GET_MEMBERS.replace(':id', id)),
                api.get(TASK_ENDPOINTS.GET_BY_PROJECT.replace(':projectId', id)),
            ]);
            setProject(projectRes.data);
            setEditData(projectRes.data);
            setMembers(membersRes.data);
            setTasks(tasksRes.data);
        } catch (error) {
            console.error('Ошибка при загрузке данных проекта:', error);
            navigate('/projects');
        } finally {
            setLoading(false);
        }
    };

    const canManageProject =
        user?.role === 'admin' || project?.authorId === user?.userId;

    const handleProjectChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProjectSave = async (e) => {
        e.preventDefault();
        try {
            await api.put(PROJECT_ENDPOINTS.UPDATE.replace(':id', id), editData);
            setProject(editData);
            setIsEditing(false);
            alert('✅ Проект обновлён');
        } catch (error) {
            console.error('Ошибка при обновлении проекта:', error);
            alert('❌ Ошибка при обновлении проекта');
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberEmail.trim()) {
            alert('Введите email участника');
            return;
        }

        try {
            const res = await api.post(PROJECT_ENDPOINTS.ADD_MEMBER.replace(':id', id), {
                email: newMemberEmail,
                projectRole: newMemberRole,
            });
            setMembers([...members, res.data]);
            setNewMemberEmail('');
            setNewMemberRole('member');
            alert('✅ Участник добавлен');
        } catch (error) {
            console.error('Ошибка при добавлении участника:', error);
            alert(error.response?.data?.message || '❌ Ошибка при добавлении участника');
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm('Удалить участника из проекта?')) return;

        try {
            await api.delete(
                PROJECT_ENDPOINTS.REMOVE_MEMBER.replace(':id', id).replace(
                    ':memberId',
                    memberId
                )
            );
            setMembers(members.filter((m) => m.memberId !== memberId));
            alert('✅ Участник удалён');
        } catch (error) {
            console.error('Ошибка при удалении участника:', error);
            alert('❌ Ошибка при удалении участника');
        }
    };

    const handleCreateTask = async () => {
        try {
            const res = await api.post(TASK_ENDPOINTS.CREATE, {
                projectId: parseInt(id),
                title: 'Новая задача',
                description: '',
                status: 'todo',
                priority: 2,
            });
            setTasks([...tasks, res.data]);
            navigate(`/tasks/${res.data.taskId}`);
        } catch (error) {
            console.error('Ошибка при создании задачи:', error);
            alert('❌ Ошибка при создании задачи');
        }
    };

    if (loading) return <div className="text-center py-10">Загрузка...</div>;
    if (!project) return <div className="text-center py-10">Проект не найден</div>;

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate('/projects')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
            >
                ← Вернуться к проектам
            </button>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                {!isEditing ? (
                    <>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {project.name}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    {project.description || 'Нет описания'}
                                </p>
                            </div>
                            {canManageProject && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                >
                                    ✏️ Редактировать
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                            <div>
                                <p className="font-semibold">Статус</p>
                                <p>{project.status}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Автор</p>
                                <p>{project.author?.userName || 'Неизвестно'}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Дата начала</p>
                                <p>
                                    {project.startDate
                                        ? new Date(project.startDate).toLocaleDateString('ru-RU')
                                        : 'Не указана'}
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold">Дата окончания</p>
                                <p>
                                    {project.endDate
                                        ? new Date(project.endDate).toLocaleDateString('ru-RU')
                                        : 'Не указана'}
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleProjectSave} className="space-y-4">
                        <div>
                            <label className="block font-semibold mb-2 text-gray-900 dark:text-white">
                                Название
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={editData.name}
                                onChange={handleProjectChange}
                                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-2 text-gray-900 dark:text-white">
                                Описание
                            </label>
                            <textarea
                                name="description"
                                value={editData.description}
                                onChange={handleProjectChange}
                                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block font-semibold mb-2 text-gray-900 dark:text-white">
                                    Статус
                                </label>
                                <select
                                    name="status"
                                    value={editData.status}
                                    onChange={handleProjectChange}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="planned">Запланирован</option>
                                    <option value="in_progress">В работе</option>
                                    <option value="completed">Завершён</option>
                                    <option value="archived">Архив</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-2 text-gray-900 dark:text-white">
                                    Дата начала
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={editData.startDate?.split('T')[0] || ''}
                                    onChange={handleProjectChange}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-2 text-gray-900 dark:text-white">
                                    Дата окончания
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={editData.endDate?.split('T')[0] || ''}
                                    onChange={handleProjectChange}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
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

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        👥 Участники проекта
                    </h2>
                </div>

                {canManageProject && (
                    <form onSubmit={handleAddMember} className="mb-6 flex flex-wrap gap-2 items-center">
                        <input
                            type="email"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            placeholder="Email участника"
                            className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                        <select
                            value={newMemberRole}
                            onChange={(e) => setNewMemberRole(e.target.value)}
                            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                        >
                            <option value="manager">Менеджер</option>
                            <option value="member">Участник</option>
                            <option value="observer">Наблюдатель</option>
                        </select>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            ➕ Добавить
                        </button>
                    </form>
                )}

                {members.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">
                        Участников пока нет
                    </p>
                ) : (
                    <div className="space-y-2">
                        {members.map((member) => (
                            <div
                                key={member.memberId}
                                className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                            >
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {member.user?.userName || member.user?.email}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Роль: {member.projectRole}
                                    </p>
                                </div>
                                {canManageProject && member.userId !== project.authorId && (
                                    <button
                                        onClick={() => handleRemoveMember(member.memberId)}
                                        className="text-red-600 dark:text-red-400 hover:underline text-sm"
                                    >
                                        🗑️ Удалить
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        ✅ Задачи проекта
                    </h2>
                    <button
                        onClick={handleCreateTask}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        ➕ Новая задача
                    </button>
                </div>

                {tasks.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">
                        Задач пока нет
                    </p>
                ) : (
                    <div className="space-y-2">
                        {tasks.map((task) => (
                            <Link key={task.taskId} to={`/tasks/${task.taskId}`}>
                                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {task.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Статус: {task.status} | Приоритет: {task.priority}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProjectDetail;