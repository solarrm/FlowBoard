import { Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const MainLayout = ({ user }) => {
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();

    return (
        <div className={`min-h-screen ${theme === 'dark'
                ? 'bg-gray-900 text-white'
                : 'bg-white'
            }`}>
            <header className={`bg-white/700 backdrop-blur-xl border-b ${theme === 'dark'
                    ? 'border-gray-700/50 bg-gray-800/80'
                    : 'border-gray-300/50 bg-gray-200'
                } sticky top-0 z-50 shadow-xl`}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                FB
                            </div>
                            <div>
                                <h1 className={`text-2xl font-black ${theme === 'dark'
                                        ? 'text-white'
                                        : 'bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent'
                                    }`}>
                                    FlowBoard
                                </h1>
                                {user && (
                                    <p className="text-sm text-gray-500">
                                        {user.name || user.username}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                                className="p-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all"
                                title="Переключить тему"
                            >
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </button>

                            <button
                                onClick={() => navigate('/projects')}
                                className="bg-white hover:bg-gray-400 border border-gray-400 text-gray-700 font-medium py-2 px-6 rounded-xl transition-all duration-200 hover:shadow-md dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-900 dark:border-gray-900"
                            >
                                Проекты
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    navigate('/auth/login');
                                }}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Выход
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;