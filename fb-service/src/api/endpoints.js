export const AUTH_ENDPOINTS = {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
};

export const USER_ENDPOINTS = {
    GET_PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile',
    CHANGE_PASSWORD: '/api/user/change-password',
    GET_NOTIFICATIONS: '/api/user/notifications',
    MARK_NOTIFICATION_READ: '/api/user/notifications/:id/read',
};

export const PROJECT_ENDPOINTS = {
    GET_ALL: '/api/projects',
    GET_BY_ID: '/api/projects/:id',
    CREATE: '/api/projects',
    UPDATE: '/api/projects/:id',
    DELETE: '/api/projects/:id',
    GET_MEMBERS: '/api/projects/:id/members',
    ADD_MEMBER: '/api/projects/:id/members',
    REMOVE_MEMBER: '/api/projects/:id/members/:memberId',
};

export const TASK_ENDPOINTS = {
    GET_BY_PROJECT: '/api/projects/:projectId/tasks',
    GET_BY_ID: '/api/tasks/:id',
    CREATE: '/api/tasks',
    UPDATE: '/api/tasks/:id',
    DELETE: '/api/tasks/:id',
    CHANGE_STATUS: '/api/tasks/:id/status',
    GET_TIME_ENTRIES: '/api/tasks/:id/time-entries',
};

export const TIME_ENTRY_ENDPOINTS = {
    CREATE: '/api/time-entries',
    STOP: '/api/time-entries/:id/stop',
    GET_BY_TASK: '/api/tasks/:taskId/time-entries',
};

export const NOTES_ENDPOINTS = {
    GET_ALL: '/api/notes',
    GET_BY_ID: '/api/notes/:id',
    CREATE: '/api/notes',
    UPDATE: '/api/notes/:id',
    DELETE: '/api/notes/:id',
    GET_SHARES: '/api/notes/:id/shares',
    ADD_SHARE: '/api/notes/:id/shares',
    REMOVE_SHARE: '/api/notes/:id/shares/:shareId',
};

export const CHAT_ENDPOINTS = {
    GET_ROOMS: '/api/chat/rooms',
    CREATE_ROOM: '/api/chat/rooms',
    GET_MESSAGES: '/api/chat/{roomId}/messages',
    SEND_MESSAGE: '/api/chat/{roomId}/messages'
};

export const COMMENT_ENDPOINTS = {
    GET_BY_TASK: '/api/tasks/:taskId/comments',
    GET_BY_NOTE: '/api/notes/:noteId/comments',
    CREATE: '/api/comments',
    UPDATE: '/api/comments/:id',
    DELETE: '/api/comments/:id',
};