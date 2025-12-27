import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const MainLayout = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ projects: 12, tasks: 45 });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-xl">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-black bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                                    FlowBoard
                                </h1>
                                <p className="text-xs text-gray-500 font-medium">Рома</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button onClick={() => navigate('/projects')} className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-medium py-2 px-4 rounded-xl transition-all duration-200 hover:shadow-md">
                                Проекты
                            </button>
                            <button onClick={() => navigate('/')} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                                Выход
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;