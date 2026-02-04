import api from '../api/axiosInstance';

const getAll = async () => {
    const res = await api.get("/api/admin/news");
    return res.data;
};

const create = async (data) => {
    return api.post("/api/admin/news", data);
};

const update = async (id, data) => {
    return api.put(`/api/admin/news/${id}`, data);
};

const toggleStatus = async (id, isPublished) => {
    return api.put(`/api/admin/news/${id}/status`, isPublished);
};

const remove = async (id) => {
    return api.delete(`/api/admin/news/${id}`);
};

export default {
    getAll,
    create,
    update,
    toggleStatus,
    remove
};