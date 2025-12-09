import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function Login() {
    const [formData, setFormData] = useState({
        login: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const inputClasses =
        'w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
    const errorClasses = 'text-red-600 text-sm mt-1';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Очистка ошибки при изменении
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.login.trim()) newErrors.login = 'Логин обязателен';
        if (!formData.password.trim()) newErrors.password = 'Пароль обязателен';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            await login(formData.login, formData.password);
            navigate('/dashboard');
        } catch (error) {
            setErrors({ submit: error.response?.data?.message || 'Ошибка при входе' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center mb-6 text-black dark:text-white">
                    🚀 FlowBoard
                </h1>
                <h2 className="text-xl font-semibold text-center mb-4 text-black dark:text-white">
                    Вход
                </h2>

                {errors.submit && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
                        {errors.submit}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1 text-black dark:text-white">
                            Логин
                        </label>
                        <input
                            type="text"
                            name="login"
                            value={formData.login}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="Введите логин"
                        />
                        {errors.login && <p className={errorClasses}>{errors.login}</p>}
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-black dark:text-white">
                            Пароль
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="Введите пароль"
                        />
                        {errors.password && <p className={errorClasses}>{errors.password}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition"
                    >
                        {isLoading ? 'Загрузка...' : 'Войти'}
                    </button>
                </form>

                <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
                    <p>
                        Нет аккаунта?{' '}
                        <Link to="/auth/register" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Зарегистрироваться
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;