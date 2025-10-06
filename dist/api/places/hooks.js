"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePlacesControllerRemove = exports.usePlacesControllerUpdate = exports.usePlacesControllerFindOne = exports.usePlacesControllerFindHotels = exports.usePlacesControllerFindActivities = exports.usePlacesControllerFindLandmarks = exports.usePlacesControllerFindRestaurants = exports.usePlacesControllerFindAll = exports.usePlacesControllerCreate = void 0;
// Auto-generated hooks
const react_query_kit_1 = require("react-query-kit");
const axios_1 = __importDefault(require("@/lib/axios"));
exports.usePlacesControllerCreate = (0, react_query_kit_1.createMutation)({
    mutationKey: ['places'],
    mutationFn: (data) => axios_1.default.post('/places', data),
});
exports.usePlacesControllerFindAll = (0, react_query_kit_1.createQuery)({
    queryKey: ({ page, limit, type, search }) => ['places', { page, limit, type, search }],
    fetcher: ({ page, limit, type, search }) => {
        const params = new URLSearchParams();
        if (page !== undefined)
            params.append('page', String(page));
        if (limit !== undefined)
            params.append('limit', String(limit));
        if (type !== undefined)
            params.append('type', String(type));
        if (search !== undefined)
            params.append('search', String(search));
        return axios_1.default.get(`/places?${params}`).then(res => res.data);
    },
});
exports.usePlacesControllerFindRestaurants = (0, react_query_kit_1.createQuery)({
    queryKey: ({ page, limit }) => ['places', { page, limit }],
    fetcher: ({ page, limit }) => {
        const params = new URLSearchParams();
        if (page !== undefined)
            params.append('page', String(page));
        if (limit !== undefined)
            params.append('limit', String(limit));
        return axios_1.default.get(`/places/restaurants?${params}`).then(res => res.data);
    },
});
exports.usePlacesControllerFindLandmarks = (0, react_query_kit_1.createQuery)({
    queryKey: ({ page, limit }) => ['places', { page, limit }],
    fetcher: ({ page, limit }) => {
        const params = new URLSearchParams();
        if (page !== undefined)
            params.append('page', String(page));
        if (limit !== undefined)
            params.append('limit', String(limit));
        return axios_1.default.get(`/places/landmarks?${params}`).then(res => res.data);
    },
});
exports.usePlacesControllerFindActivities = (0, react_query_kit_1.createQuery)({
    queryKey: ({ page, limit }) => ['places', { page, limit }],
    fetcher: ({ page, limit }) => {
        const params = new URLSearchParams();
        if (page !== undefined)
            params.append('page', String(page));
        if (limit !== undefined)
            params.append('limit', String(limit));
        return axios_1.default.get(`/places/activities?${params}`).then(res => res.data);
    },
});
exports.usePlacesControllerFindHotels = (0, react_query_kit_1.createQuery)({
    queryKey: ({ page, limit }) => ['places', { page, limit }],
    fetcher: ({ page, limit }) => {
        const params = new URLSearchParams();
        if (page !== undefined)
            params.append('page', String(page));
        if (limit !== undefined)
            params.append('limit', String(limit));
        return axios_1.default.get(`/places/hotels?${params}`).then(res => res.data);
    },
});
exports.usePlacesControllerFindOne = (0, react_query_kit_1.createQuery)({
    queryKey: ({ id }) => ['places', { id }],
    fetcher: ({ id }) => {
        return axios_1.default.get(`/places/${id}`).then(res => res.data);
    },
});
exports.usePlacesControllerUpdate = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['places', id],
    mutationFn: (vars) => axios_1.default.patch(`/places/${vars.id}`, vars),
});
exports.usePlacesControllerRemove = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['places', id],
    mutationFn: (vars) => axios_1.default.delete(`/places/${vars.id}`),
});
//# sourceMappingURL=hooks.js.map