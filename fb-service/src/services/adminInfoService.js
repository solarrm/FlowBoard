import api from '../api/axiosInstance';

const get = async () => {
    const res = await api.get("/api/admin/info");
    return res.data;
};

const update = (data) => {
    return api.put("/api/admin/info", data);
};

export default {
    get,
    update
};