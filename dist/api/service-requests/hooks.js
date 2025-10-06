"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useServiceRequestsControllerAddTreatmentDocuments = exports.useServiceRequestsControllerAddDocuments = exports.useServiceRequestsControllerFinalizeTreatment = exports.useServiceRequestsControllerUpdateTreatment = exports.useServiceRequestsControllerCreateTreatment = exports.useServiceRequestsControllerFindOne = exports.useServiceRequestsControllerGetAgentWorkload = exports.useServiceRequestsControllerGetStatistics = exports.useServiceRequestsControllerFindByReference = exports.useServiceRequestsControllerGetUserRequests = exports.useServiceRequestsControllerFindAll = exports.useServiceRequestsControllerCreateMariageRequest = exports.useServiceRequestsControllerCreatePartenariatRequest = exports.useServiceRequestsControllerCreateRdvRequest = void 0;
// Auto-generated hooks
const react_query_kit_1 = require("react-query-kit");
const axios_1 = __importDefault(require("@/lib/axios"));
exports.useServiceRequestsControllerCreateRdvRequest = (0, react_query_kit_1.createMutation)({
    mutationKey: ['service-requests'],
    mutationFn: (data) => axios_1.default.post('/service-requests/rdv', data),
});
exports.useServiceRequestsControllerCreatePartenariatRequest = (0, react_query_kit_1.createMutation)({
    mutationKey: ['service-requests'],
    mutationFn: (data) => axios_1.default.post('/service-requests/partenariat', data),
});
exports.useServiceRequestsControllerCreateMariageRequest = (0, react_query_kit_1.createMutation)({
    mutationKey: ['service-requests'],
    mutationFn: (data) => axios_1.default.post('/service-requests/mariage', data),
});
exports.useServiceRequestsControllerFindAll = (0, react_query_kit_1.createQuery)({
    queryKey: ({ agentId, priorite, etat, type, limit, page }) => ['service-requests', { agentId, priorite, etat, type, limit, page }],
    fetcher: ({ agentId, priorite, etat, type, limit, page }) => {
        const params = new URLSearchParams();
        if (agentId !== undefined)
            params.append('agentId', String(agentId));
        if (priorite !== undefined)
            params.append('priorite', String(priorite));
        if (etat !== undefined)
            params.append('etat', String(etat));
        if (type !== undefined)
            params.append('type', String(type));
        if (limit !== undefined)
            params.append('limit', String(limit));
        if (page !== undefined)
            params.append('page', String(page));
        return axios_1.default.get(`/service-requests?${params}`).then(res => res.data);
    },
});
exports.useServiceRequestsControllerGetUserRequests = (0, react_query_kit_1.createQuery)({
    queryKey: ({ etat, type, limit, page }) => ['service-requests', { etat, type, limit, page }],
    fetcher: ({ etat, type, limit, page }) => {
        const params = new URLSearchParams();
        if (etat !== undefined)
            params.append('etat', String(etat));
        if (type !== undefined)
            params.append('type', String(type));
        if (limit !== undefined)
            params.append('limit', String(limit));
        if (page !== undefined)
            params.append('page', String(page));
        return axios_1.default.get(`/service-requests/my-requests?${params}`).then(res => res.data);
    },
});
exports.useServiceRequestsControllerFindByReference = (0, react_query_kit_1.createQuery)({
    queryKey: ({ reference }) => ['service-requests', { reference }],
    fetcher: ({ reference }) => {
        return axios_1.default.get(`/service-requests/reference/${reference}`).then(res => res.data);
    },
});
exports.useServiceRequestsControllerGetStatistics = (0, react_query_kit_1.createQuery)({
    queryKey: ({ agentId, type, dateFin, dateDebut }) => ['service-requests', { agentId, type, dateFin, dateDebut }],
    fetcher: ({ agentId, type, dateFin, dateDebut }) => {
        const params = new URLSearchParams();
        if (agentId !== undefined)
            params.append('agentId', String(agentId));
        if (type !== undefined)
            params.append('type', String(type));
        if (dateFin !== undefined)
            params.append('dateFin', String(dateFin));
        if (dateDebut !== undefined)
            params.append('dateDebut', String(dateDebut));
        return axios_1.default.get(`/service-requests/statistics?${params}`).then(res => res.data);
    },
});
exports.useServiceRequestsControllerGetAgentWorkload = (0, react_query_kit_1.createQuery)({
    queryKey: ({ agentId }) => ['service-requests', { agentId }],
    fetcher: ({ agentId }) => {
        return axios_1.default.get(`/service-requests/agent-workload/${agentId}`).then(res => res.data);
    },
});
exports.useServiceRequestsControllerFindOne = (0, react_query_kit_1.createQuery)({
    queryKey: ({ id }) => ['service-requests', { id }],
    fetcher: ({ id }) => {
        return axios_1.default.get(`/service-requests/${id}`).then(res => res.data);
    },
});
exports.useServiceRequestsControllerCreateTreatment = (0, react_query_kit_1.createMutation)({
    mutationKey: ['service-requests'],
    mutationFn: (data) => axios_1.default.post('/service-requests/treatments', data),
});
exports.useServiceRequestsControllerUpdateTreatment = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['service-requests', id],
    mutationFn: (vars) => axios_1.default.patch(`/service-requests/treatments/${vars.id}`, vars),
});
exports.useServiceRequestsControllerFinalizeTreatment = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['service-requests', id],
    mutationFn: (vars) => axios_1.default.post(`/service-requests/treatments/${vars.id}/finalize`),
});
exports.useServiceRequestsControllerAddDocuments = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['service-requests', id],
    mutationFn: (vars) => axios_1.default.post(`/service-requests/${vars.id}/documents`),
});
exports.useServiceRequestsControllerAddTreatmentDocuments = (0, react_query_kit_1.createMutation)({
    mutationKey: ({ id }) => ['service-requests', id],
    mutationFn: (vars) => axios_1.default.post(`/service-requests/treatments/${vars.id}/documents`),
});
//# sourceMappingURL=hooks.js.map