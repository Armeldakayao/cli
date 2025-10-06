"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAnnouncementsControllerGetRecentNews = exports.useAnnouncementsControllerGetAllAnnouncements = exports.useAnnouncementsControllerAddComment = exports.useAnnouncementsControllerFindGeneralAnnouncements = exports.useAnnouncementsControllerFindCommuniques = exports.useAnnouncementsControllerFindPressReleases = exports.useAnnouncementsControllerFindNews = exports.useAnnouncementsControllerSearch = exports.useAnnouncementsControllerGetStats = exports.useAnnouncementsControllerActivate = exports.useAnnouncementsControllerDeactivate = exports.useAnnouncementsControllerFindOne = exports.useAnnouncementsControllerRemove = exports.useAnnouncementsControllerUpdate = exports.useAnnouncementsControllerFindAll = exports.useAnnouncementsControllerCreate = void 0;
// Auto-generated hooks
const react_query_kit_1 = require("react-query-kit");
const axios_1 = __importDefault(require("@/lib/axios"));
exports.useAnnouncementsControllerCreate = (0, react_query_kit_1.createMutation)({
    mutationKey: ['communiques'],
    mutationFn: (data) => axios_1.default.post('/communiques', data),
});
exports.useAnnouncementsControllerFindAll = (0, react_query_kit_1.createQuery)({
    queryKey: ({ page, limit, type, search, tags }) => ['communiques', { page, limit, type, search, tags }],
    fetcher: ({ page, limit, type, search, tags }) => {
        const params = new URLSearchParams();
        if (page !== undefined)
            params.append('page', String(page));
        if (limit !== undefined)
            params.append('limit', String(limit));
        if (type !== undefined)
            params.append('type', String(type));
        if (search !== undefined)
            params.append('search', String(search));
        if (tags !== undefined)
            params.append('tags', String(tags));
        return axios_1.default.get(`/communiques?${params}`).then(res => res.data);
    },
});
exports.useAnnouncementsControllerUpdate = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['communiques', id],
    mutationFn: (vars) => axios_1.default.patch(`/communiques/${vars.id}`, vars),
});
exports.useAnnouncementsControllerRemove = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['communiques', id],
    mutationFn: (vars) => axios_1.default.delete(`/communiques/${vars.id}`),
});
exports.useAnnouncementsControllerFindOne = (0, react_query_kit_1.createQuery)({
    queryKey: ({ id }) => ['communiques', { id }],
    fetcher: ({ id }) => {
        return axios_1.default.get(`/communiques/${id}`).then(res => res.data);
    },
});
exports.useAnnouncementsControllerDeactivate = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['communiques', id],
    mutationFn: (vars) => axios_1.default.patch(`/communiques/${vars.id}/deactivate`),
});
exports.useAnnouncementsControllerActivate = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['communiques', id],
    mutationFn: (vars) => axios_1.default.patch(`/communiques/${vars.id}/activate`),
});
exports.useAnnouncementsControllerGetStats = (0, react_query_kit_1.createQuery)({
    queryKey: ['communiques'],
    fetcher: () => axios_1.default.get('/communiques/stats').then(res => res.data),
});
exports.useAnnouncementsControllerSearch = (0, react_query_kit_1.createQuery)({
    queryKey: ({ q, page, limit }) => ['communiques', { q, page, limit }],
    fetcher: ({ q, page, limit }) => {
        const params = new URLSearchParams();
        if (q !== undefined)
            params.append('q', String(q));
        if (page !== undefined)
            params.append('page', String(page));
        if (limit !== undefined)
            params.append('limit', String(limit));
        return axios_1.default.get(`/communiques/search?${params}`).then(res => res.data);
    },
});
exports.useAnnouncementsControllerFindNews = (0, react_query_kit_1.createQuery)({
    queryKey: ({ page, limit }) => ['communiques', { page, limit }],
    fetcher: ({ page, limit }) => {
        const params = new URLSearchParams();
        if (page !== undefined)
            params.append('page', String(page));
        if (limit !== undefined)
            params.append('limit', String(limit));
        return axios_1.default.get(`/communiques/actualites?${params}`).then(res => res.data);
    },
});
exports.useAnnouncementsControllerFindPressReleases = (0, react_query_kit_1.createQuery)({
    queryKey: ({ page, limit }) => ['communiques', { page, limit }],
    fetcher: ({ page, limit }) => {
        const params = new URLSearchParams();
        if (page !== undefined)
            params.append('page', String(page));
        if (limit !== undefined)
            params.append('limit', String(limit));
        return axios_1.default.get(`/communiques/communiques-presse?${params}`).then(res => res.data);
    },
});
exports.useAnnouncementsControllerFindCommuniques = (0, react_query_kit_1.createQuery)({
    queryKey: ({ page, limit }) => ['communiques', { page, limit }],
    fetcher: ({ page, limit }) => {
        const params = new URLSearchParams();
        if (page !== undefined)
            params.append('page', String(page));
        if (limit !== undefined)
            params.append('limit', String(limit));
        return axios_1.default.get(`/communiques/communiques?${params}`).then(res => res.data);
    },
});
exports.useAnnouncementsControllerFindGeneralAnnouncements = (0, react_query_kit_1.createQuery)({
    queryKey: ({ page, limit }) => ['communiques', { page, limit }],
    fetcher: ({ page, limit }) => {
        const params = new URLSearchParams();
        if (page !== undefined)
            params.append('page', String(page));
        if (limit !== undefined)
            params.append('limit', String(limit));
        return axios_1.default.get(`/communiques/annonces?${params}`).then(res => res.data);
    },
});
exports.useAnnouncementsControllerAddComment = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['communiques', id],
    mutationFn: (vars) => axios_1.default.post(`/communiques/${vars.id}/comment`, vars),
});
exports.useAnnouncementsControllerGetAllAnnouncements = (0, react_query_kit_1.createQuery)({
    queryKey: ({ page, limit, type }) => ['communiques', { page, limit, type }],
    fetcher: ({ page, limit, type }) => {
        const params = new URLSearchParams();
        if (page !== undefined)
            params.append('page', String(page));
        if (limit !== undefined)
            params.append('limit', String(limit));
        if (type !== undefined)
            params.append('type', String(type));
        return axios_1.default.get(`/communiques/annonces/all?${params}`).then(res => res.data);
    },
});
exports.useAnnouncementsControllerGetRecentNews = (0, react_query_kit_1.createQuery)({
    queryKey: ['communiques'],
    fetcher: () => axios_1.default.get('/communiques/actualites/recentes').then(res => res.data),
});
//# sourceMappingURL=hooks.js.map