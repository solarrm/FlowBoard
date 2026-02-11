import api from '../api/axiosInstance';

const getAll = async () => {
    const res = await api.get("/api/admin/news");
    return res.data;
};

const create = (data) => {
    return api.post("/api/admin/news", data);
};

const uploadImage = (id, formData) => {
    return api.post(`/api/admin/news/${id}/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
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

const removeImage = (id) => {
    return api.delete(`/api/admin/news/${id}/image`);
};

export default {
    getAll,
    create,
    uploadImage,
    update,
    toggleStatus,
    remove,
    removeImage
};