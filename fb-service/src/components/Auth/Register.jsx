import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function Register() {
    const [formData, setFormData] = useState({
        email: '',
        login: '',
        userName: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        country: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
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
        if (!formData.email.trim()) newErrors.email = 'Email обязателен';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = 'Некорректный email';

        if (!formData.login.trim()) newErrors.login = 'Логин обязателен';
        if (!formData.userName.trim()) newErrors.userName = 'Имя обязательно';
        if (!formData.password.trim()) newErrors.password = 'Пароль обязателен';
        if (formData.password.length < 6) newErrors.password = 'Пароль должен быть не менее 6 символов';
        if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = 'Пароли не совпадают';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Дата рождения обязательна';
        if (!formData.country.trim()) newErrors.country = 'Страна обязательна';

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
            await register(
                formData.email,
                formData.login,
                formData.userName,
                formData.password,
                formData.dateOfBirth,
                formData.country
            );
            navigate('/dashboard');
        } catch (error) {
            setErrors({ submit: error.response?.data?.message || 'Ошибка при регистрации' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center mb-2 text-black dark:text-white">
                    🚀 FlowBoard
                </h1>
                <h2 className="text-xl font-semibold text-center mb-4 text-black dark:text-white">
                    Регистрация
                </h2>

                {errors.submit && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
                        {errors.submit}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block font-medium mb-1 text-black dark:text-white">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="your@email.com"
                        />
                        {errors.email && <p className={errorClasses}>{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-black dark:text-white">Логин</label>
                        <input
                            type="text"
                            name="login"
                            value={formData.login}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="username"
                        />
                        {errors.login && <p className={errorClasses}>{errors.login}</p>}
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-black dark:text-white">Имя</label>
                        <input
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="Иван Петров"
                        />
                        {errors.userName && <p className={errorClasses}>{errors.userName}</p>}
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
                            placeholder="••••••"
                        />
                        {errors.password && <p className={errorClasses}>{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-black dark:text-white">
                            Подтвердите пароль
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="••••••"
                        />
                        {errors.confirmPassword && (
                            <p className={errorClasses}>{errors.confirmPassword}</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-black dark:text-white">
                            Дата рождения
                        </label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                        {errors.dateOfBirth && (
                            <p className={errorClasses}>{errors.dateOfBirth}</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-black dark:text-white">
                            Страна
                        </label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="Россия"
                        />
                        {errors.country && <p className={errorClasses}>{errors.country}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition"
                    >
                        {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
                    <p>
                        Уже есть аккаунт?{' '}
                        <Link to="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Войти
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;