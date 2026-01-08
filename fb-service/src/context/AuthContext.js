import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance';
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from '../api/endpoints';
import { useContext } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get(USER_ENDPOINTS.GET_PROFILE)
                .then((res) => {
                    setUser(res.data);
                    setError(null);
                    setIsAuthenticated(true);
                })
                .catch((err) => {
                    console.error('Ошибка при загрузке профиля:', err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    setError('Ошибка аутентификации');
                    setIsAuthenticated(false);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
            setIsAuthenticated(false);
        }
    }, []);

    const login = useCallback(async (LoginOrEmail, Password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
                LoginOrEmail,
                Password,
            });

            const { token, refreshToken, user: userData } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(userData);
            setIsAuthenticated(true);
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
            setIsAuthenticated(false);
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
        isAuthenticated,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
