import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance';
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from '../api/endpoints';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get(USER_ENDPOINTS.GET_PROFILE)
                .then((res) => {
                    setUser(res.data);
                    setError(null);
                })
                .catch((err) => {
                    console.error('Ошибка при загрузке профиля:', err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    setError('Ошибка аутентификации');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (login, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
                login,
                password,
            });

            const { token, refreshToken, user: userData } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(userData);
            return userData;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Ошибка при входе';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (email, login, userName, password, dateOfBirth, country) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post(AUTH_ENDPOINTS.REGISTER, {
                email,
                login,
                userName,
                password,
                dateOfBirth,
                country,
            });

            const { token, refreshToken, user: userData } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(userData);
            return userData;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Ошибка при регистрации';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setLoading(true);
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await api.post(AUTH_ENDPOINTS.LOGOUT, { refreshToken });
            }
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setError(null);
        } catch (err) {
            console.error('Ошибка при выходе:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const hasRole = useCallback((role) => {
        if (!user) return false;
        return user.role === role;
    }, [user]);

    const canEditProject = useCallback((project) => {
        if (!user) return false;
        return user.role === 'admin' || project.authorId === user.userId;
    }, [user]);

    const canEditNote = useCallback((noteShare) => {
        if (!user) return false;
        return noteShare.canEdit;
    }, [user]);

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        hasRole,
        canEditProject,
        canEditNote,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
