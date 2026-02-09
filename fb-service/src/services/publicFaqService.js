import api from '../api/axiosInstance';

const getFaqs = async (categoryId) => {
    const res = await api.get("/api/faq", {
        params: { categoryId }
    });
    return res.data;
};

const getCategories = async () => {
    const res = await api.get("/api/faq/categories");
    return res.data;
};

export default {
    getFaqs,
    getCategories
};