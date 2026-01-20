import { HubConnectionBuilder } from '@microsoft/signalr';
import api from './axiosInstance';

const getSignalRUrl = (hubPath) => {
    return `${api.defaults.baseURL}${hubPath}`;
};

export const createSignalRConnection = (hubPath = '/chatHub') => {
    return new HubConnectionBuilder()
        .withUrl(getSignalRUrl(hubPath), {
            accessTokenFactory: () => {
                return api.defaults.headers.common['Authorization']?.replace('Bearer ', '') || '';
            }
        })
        .withAutomaticReconnect()
        .build();
};
