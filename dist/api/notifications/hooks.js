"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNotificationsControllerRemove = exports.useNotificationsControllerMarkAllAsRead = exports.useNotificationsControllerMarkAsRead = exports.useNotificationsControllerGetUnreadCount = exports.useNotificationsControllerFindMine = exports.useNotificationsControllerCreate = void 0;
// Auto-generated hooks
const react_query_kit_1 = require("react-query-kit");
const axios_1 = __importDefault(require("@/lib/axios"));
exports.useNotificationsControllerCreate = (0, react_query_kit_1.createMutation)({
    mutationKey: ['notifications'],
    mutationFn: (data) => axios_1.default.post('/notifications', data),
});
exports.useNotificationsControllerFindMine = (0, react_query_kit_1.createQuery)({
    queryKey: ({ page, limit }) => ['notifications', { page, limit }],
    fetcher: ({ page, limit }) => {
        const params = new URLSearchParams();
        if (page !== undefined)
            params.append('page', String(page));
        if (limit !== undefined)
            params.append('limit', String(limit));
        return axios_1.default.get(`/notifications?${params}`).then(res => res.data);
    },
});
exports.useNotificationsControllerGetUnreadCount = (0, react_query_kit_1.createQuery)({
    queryKey: ['notifications'],
    fetcher: () => axios_1.default.get('/notifications/unread-count').then(res => res.data),
});
exports.useNotificationsControllerMarkAsRead = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['notifications', id],
    mutationFn: (vars) => axios_1.default.patch(`/notifications/${vars.id}/read`),
});
exports.useNotificationsControllerMarkAllAsRead = (0, react_query_kit_1.createMutation)({
    mutationKey: ['notifications'],
    mutationFn: () => axios_1.default.patch('/notifications/read-all'),
});
exports.useNotificationsControllerRemove = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['notifications', id],
    mutationFn: (vars) => axios_1.default.delete(`/notifications/${vars.id}`),
});
//# sourceMappingURL=hooks.js.map