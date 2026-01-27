import api from '../api/axiosInstance';

const getUsers = async () => {
    const response = await api.get("/api/admin/users");
    return response.data;
};

const updateUserRole = async (userId, role) => {
    await api.put(`/api/admin/users/${userId}/role`, { role });
};

const updateUserStatus = async (userId, isActive) => {
    await api.put(`/api/admin/users/${userId}/status`, { isActive });
};

export default {
    getUsers,
    updateUserRole,
    updateUserStatus
};
