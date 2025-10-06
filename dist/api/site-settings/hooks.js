"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSiteSettingsControllerRemove = exports.useSiteSettingsControllerUpdate = exports.useSiteSettingsControllerFindOne = exports.useSiteSettingsControllerFindAll = exports.useSiteSettingsControllerCreate = exports.useSiteSettingsControllerUpdateCurrent = exports.useSiteSettingsControllerGetCurrent = exports.useSiteSettingsControllerGetPublicSettings = void 0;
// Auto-generated hooks
const react_query_kit_1 = require("react-query-kit");
const axios_1 = __importDefault(require("@/lib/axios"));
exports.useSiteSettingsControllerGetPublicSettings = (0, react_query_kit_1.createQuery)({
    queryKey: ['site-settings'],
    fetcher: () => axios_1.default.get('/site-settings/public').then(res => res.data),
});
exports.useSiteSettingsControllerGetCurrent = (0, react_query_kit_1.createQuery)({
    queryKey: ['site-settings'],
    fetcher: () => axios_1.default.get('/site-settings/current').then(res => res.data),
});
exports.useSiteSettingsControllerUpdateCurrent = (0, react_query_kit_1.createMutation)({
    mutationKey: ['site-settings'],
    mutationFn: (data) => axios_1.default.patch('/site-settings/current', data),
});
exports.useSiteSettingsControllerCreate = (0, react_query_kit_1.createMutation)({
    mutationKey: ['site-settings'],
    mutationFn: (data) => axios_1.default.post('/site-settings', data),
});
exports.useSiteSettingsControllerFindAll = (0, react_query_kit_1.createQuery)({
    queryKey: ['site-settings'],
    fetcher: () => axios_1.default.get('/site-settings').then(res => res.data),
});
exports.useSiteSettingsControllerFindOne = (0, react_query_kit_1.createQuery)({
    queryKey: ({ id }) => ['site-settings', { id }],
    fetcher: ({ id }) => {
        return axios_1.default.get(`/site-settings/${id}`).then(res => res.data);
    },
});
exports.useSiteSettingsControllerUpdate = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['site-settings', id],
    mutationFn: (vars) => axios_1.default.patch(`/site-settings/${vars.id}`, vars),
});
exports.useSiteSettingsControllerRemove = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['site-settings', id],
    mutationFn: (vars) => axios_1.default.delete(`/site-settings/${vars.id}`),
});
//# sourceMappingURL=hooks.js.map