"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUsersControllerUploadDocumentForUser = exports.useUsersControllerGetUserFiles = exports.useUsersControllerRemove = exports.useUsersControllerUpdate = exports.useUsersControllerFindOne = exports.useUsersControllerDeleteDocument = exports.useUsersControllerUpdateDocument = exports.useUsersControllerGetDocument = exports.useUsersControllerGetAllUserFiles = exports.useUsersControllerGetUserDocuments = exports.useUsersControllerUploadDocument = exports.useUsersControllerUploadProfilePhoto = exports.useUsersControllerUpdateProfile = exports.useUsersControllerGetProfile = exports.useUsersControllerFindAll = void 0;
// Auto-generated hooks
const react_query_kit_1 = require("react-query-kit");
const axios_1 = __importDefault(require("@/lib/axios"));
exports.useUsersControllerFindAll = (0, react_query_kit_1.createQuery)({
    queryKey: ({ page, limit }) => ['users', { page, limit }],
    fetcher: ({ page, limit }) => {
        const params = new URLSearchParams();
        if (page !== undefined)
            params.append('page', String(page));
        if (limit !== undefined)
            params.append('limit', String(limit));
        return axios_1.default.get(`/users?${params}`).then(res => res.data);
    },
});
exports.useUsersControllerGetProfile = (0, react_query_kit_1.createQuery)({
    queryKey: ['users'],
    fetcher: () => axios_1.default.get('/users/profile').then(res => res.data),
});
exports.useUsersControllerUpdateProfile = (0, react_query_kit_1.createMutation)({
    mutationKey: ['users'],
    mutationFn: (data) => axios_1.default.patch('/users/profile', data),
});
exports.useUsersControllerUploadProfilePhoto = (0, react_query_kit_1.createMutation)({
    mutationKey: ['users'],
    mutationFn: (data) => axios_1.default.post('/users/profile/photo', data),
});
exports.useUsersControllerUploadDocument = (0, react_query_kit_1.createMutation)({
    mutationKey: ['users'],
    mutationFn: (data) => axios_1.default.post('/users/documents', data),
});
exports.useUsersControllerGetUserDocuments = (0, react_query_kit_1.createQuery)({
    queryKey: ['users'],
    fetcher: () => axios_1.default.get('/users/documents').then(res => res.data),
});
exports.useUsersControllerGetAllUserFiles = (0, react_query_kit_1.createQuery)({
    queryKey: ({ includeInactive }) => ['users', { includeInactive }],
    fetcher: ({ includeInactive }) => {
        const params = new URLSearchParams();
        if (includeInactive !== undefined)
            params.append('includeInactive', String(includeInactive));
        return axios_1.default.get(`/users/files?${params}`).then(res => res.data);
    },
});
exports.useUsersControllerGetDocument = (0, react_query_kit_1.createQuery)({
    queryKey: ({ documentId }) => ['users', { documentId }],
    fetcher: ({ documentId }) => {
        return axios_1.default.get(`/users/documents/${documentId}`).then(res => res.data);
    },
});
exports.useUsersControllerUpdateDocument = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ documentId }) => ['users', documentId],
    mutationFn: (vars) => axios_1.default.patch(`/users/documents/${vars.documentId}`, vars),
});
exports.useUsersControllerDeleteDocument = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ documentId }) => ['users', documentId],
    mutationFn: (vars) => axios_1.default.delete(`/users/documents/${vars.documentId}`),
});
exports.useUsersControllerFindOne = (0, react_query_kit_1.createQuery)({
    queryKey: ({ id }) => ['users', { id }],
    fetcher: ({ id }) => {
        return axios_1.default.get(`/users/${id}`).then(res => res.data);
    },
});
exports.useUsersControllerUpdate = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['users', id],
    mutationFn: (vars) => axios_1.default.patch(`/users/${vars.id}`, vars),
});
exports.useUsersControllerRemove = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['users', id],
    mutationFn: (vars) => axios_1.default.delete(`/users/${vars.id}`),
});
exports.useUsersControllerGetUserFiles = (0, react_query_kit_1.createQuery)({
    queryKey: ({ id, includeInactive }) => ['users', { id, includeInactive }],
    fetcher: ({ id, includeInactive }) => {
        const params = new URLSearchParams();
        if (includeInactive !== undefined)
            params.append('includeInactive', String(includeInactive));
        return axios_1.default.get(`/users/${id}/files?${params}`).then(res => res.data);
    },
});
exports.useUsersControllerUploadDocumentForUser = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['users', id],
    mutationFn: (vars) => axios_1.default.post(`/users/${vars.id}/documents`, vars),
});
//# sourceMappingURL=hooks.js.map