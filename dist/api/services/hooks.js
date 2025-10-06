"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useServicesControllerRemove = exports.useServicesControllerUpdate = exports.useServicesControllerFindOne = exports.useServicesControllerFindByCategory = exports.useServicesControllerFindAll = exports.useServicesControllerCreate = void 0;
// Auto-generated hooks
const react_query_kit_1 = require("react-query-kit");
const axios_1 = __importDefault(require("@/lib/axios"));
exports.useServicesControllerCreate = (0, react_query_kit_1.createMutation)({
    mutationKey: ['services'],
    mutationFn: (data) => axios_1.default.post('/services', data),
});
exports.useServicesControllerFindAll = (0, react_query_kit_1.createQuery)({
    queryKey: ({ page, limit, category }) => ['services', { page, limit, category }],
    fetcher: ({ page, limit, category }) => {
        const params = new URLSearchParams();
        if (page !== undefined)
            params.append('page', String(page));
        if (limit !== undefined)
            params.append('limit', String(limit));
        if (category !== undefined)
            params.append('category', String(category));
        return axios_1.default.get(`/services?${params}`).then(res => res.data);
    },
});
exports.useServicesControllerFindByCategory = (0, react_query_kit_1.createQuery)({
    queryKey: ({ category, page, limit }) => ['services', { category, page, limit }],
    fetcher: ({ category, page, limit }) => {
        const params = new URLSearchParams();
        if (page !== undefined)
            params.append('page', String(page));
        if (limit !== undefined)
            params.append('limit', String(limit));
        return axios_1.default.get(`/services/category/${category}?${params}`).then(res => res.data);
    },
});
exports.useServicesControllerFindOne = (0, react_query_kit_1.createQuery)({
    queryKey: ({ id }) => ['services', { id }],
    fetcher: ({ id }) => {
        return axios_1.default.get(`/services/${id}`).then(res => res.data);
    },
});
exports.useServicesControllerUpdate = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['services', id],
    mutationFn: (vars) => axios_1.default.patch(`/services/${vars.id}`, vars),
});
exports.useServicesControllerRemove = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['services', id],
    mutationFn: (vars) => axios_1.default.delete(`/services/${vars.id}`),
});
//# sourceMappingURL=hooks.js.map