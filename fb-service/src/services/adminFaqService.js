import api from '../api/axiosInstance';

const getFaqs = async () => {
    const res = await api.get("/api/admin/faq");
    return res.data;
};

const createFaq = async (data) => {
    return api.post("/api/admin/faq", data);
};

const updateFaq = async (id, data) => {
    return api.put(`/api/admin/faq/${id}`, data);
};

const updateFaqStatus = async (id, isActive) => {
    return api.put(`/api/admin/faq/${id}/status`, isActive);
};

const deleteFaq = async (id) => {
    return api.delete(`/api/admin/faq/${id}`);
};

const getCategories = async () => {
    const res = await api.get("/api/admin/faq/categories");
    return res.data;
};

const createCategory = async (name) => {
    return api.post("/api/admin/faq/categories", name, {
        headers: { "Content-Type": "application/json" }
    });
};

const deleteCategory = async (id) => {
    return api.delete(`/api/admin/faq/categories/${id}`);
};

export default {
    getFaqs,
    createFaq,
    updateFaq,
    updateFaqStatus,
    deleteFaq,
    getCategories,
    createCategory,
    deleteCategory
};