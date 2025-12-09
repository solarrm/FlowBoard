import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosInstance';
import { USER_ENDPOINTS, AUTH_ENDPOINTS } from '../api/endpoints';

function ProfileSettings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setFormData({
                userName: user.userName || '',
                email: user.email || '',
                country: user.country || '',
                dateOfBirth: user.dateOfBirth || '',
                profilePicture: user.profilePicture || '',
            });
            setLoading(false);
        }
    }, [user]);

    const inputClasses =
        'w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(USER_ENDPOINTS.UPDATE_PROFILE, formData);
            alert('✅ Изменения сохранены');
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            alert('❌ Ошибка при сохранении');
        }
    };

    const handleLogout = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            if (refreshToken) {
                await api.post(AUTH_ENDPOINTS.LOGOUT, { refreshToken });
            }
            await logout();
            navigate('/auth/login');
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                    👤 Настройки профиля
                </h2>

                {user?.profilePicture && (
                    <div className="mb-6 text-center">
                        <img
                            src={user.profilePicture}
                            alt="Аватар"
                            className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-blue-500"
                        />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium mb-2 text-gray-900 dark:text-white">
                            ID
                        </label>
                        <input
                            type="text"
                            value={user?.userId}
                            disabled
                            className={`${inputClasses} bg-gray-100 dark:bg-gray-700`}
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-2 text-gray-900 dark:text-white">
                            Имя
                        </label>
                        <input
                            type="text"
                            name="userName"
                            value={formData?.userName || ''}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-2 text-gray-900 dark:text-white">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData?.email || ''}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-2 text-gray-900 dark:text-white">
                            Страна
                        </label>
                        <input
                            type="text"
                            name="country"
                            value={formData?.country || ''}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-2 text-gray-900 dark:text-white">
                            Дата рождения
                        </label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData?.dateOfBirth || ''}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-2 text-gray-900 dark:text-white">
                            Аватар (URL)
                        </label>
                        <input
                            type="text"
                            name="profilePicture"
                            value={formData?.profilePicture || ''}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition"
                        >
                            💾 Сохранить
                        </button>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition"
                        >
                            🔒 Выйти
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProfileSettings;