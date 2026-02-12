import api from '../api/axiosInstance';

const get = async () => {
    const res = await api.get("/api/info");
    return res.data;
};

export default { get };