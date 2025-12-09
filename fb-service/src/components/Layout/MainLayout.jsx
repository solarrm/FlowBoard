import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/auth/login');
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-20'
                    } bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 flex flex-col`}
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <Link
                        to="/dashboard"
                        className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                    >
                        {sidebarOpen ? '🚀 FlowBoard' : '🚀'}
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavLink
                        to="/dashboard"
                        icon="📊"
                        label="Дашборд"
                        sidebarOpen={sidebarOpen}
                    />
                    <NavLink
                        to="/projects"
                        icon="📁"
                        label="Проекты"
                        sidebarOpen={sidebarOpen}
                    />
                    <NavLink
                        to="/tasks"
                        icon="✅"
                        label="Задачи"
                        sidebarOpen={sidebarOpen}
                    />
                    <NavLink
                        to="/notes"
                        icon="📝"
                        label="Заметки"
                        sidebarOpen={sidebarOpen}
                    />
                    <NavLink
                        to="/chats"
                        icon="💬"
                        label="Чаты"
                        sidebarOpen={sidebarOpen}
                    />
                    {user?.role === 'Администратор' && (
                        <NavLink
                            to="/admin"
                            icon="⚙️"
                            label="Админ"
                            sidebarOpen={sidebarOpen}
                        />
                    )}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <Link
                        to="/profile"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <span className="text-xl">👤</span>
                        {sidebarOpen && (
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user?.userName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user?.role}
                                </p>
                            </div>
                        )}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition text-red-600 dark:text-red-400"
                    >
                        <span>🔒</span>
                        {sidebarOpen && <span>Выйти</span>}
                    </button>
                </div>

                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute bottom-20 -right-3 bg-blue-600 text-white rounded-full p-1 shadow-lg"
                >
                    {sidebarOpen ? '◀' : '▶'}
                </button>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white dark:bg-gray-800 shadow-sm p-4 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Добро пожаловать, {user?.userName}! 👋
                    </h1>
                </header>

                <div className="flex-1 overflow-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

function NavLink({ to, icon, label, sidebarOpen }) {
    return (
        <Link
            to={to}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
            <span className="text-xl">{icon}</span>
            {sidebarOpen && <span className="font-medium">{label}</span>}
        </Link>
    );
}

export default MainLayout;