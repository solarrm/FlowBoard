import api from '../api/axiosInstance';

const getAll = async () => {
    const res = await api.get("/api/news");
    return res.data;
};

const getById = async (id) => {
    const res = await api.get(`/api/news/${id}`);
    return res.data;
};

export default {
    getAll,
    getById
};