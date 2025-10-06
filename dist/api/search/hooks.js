"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSearchControllerGlobalSearch = void 0;
// Auto-generated hooks
const react_query_kit_1 = require("react-query-kit");
const axios_1 = __importDefault(require("@/lib/axios"));
exports.useSearchControllerGlobalSearch = (0, react_query_kit_1.createQuery)({
    queryKey: ({ query, type }) => ['search', { query, type }],
    fetcher: ({ query, type }) => {
        const params = new URLSearchParams();
        if (query !== undefined)
            params.append('query', String(query));
        if (type !== undefined)
            params.append('type', String(type));
        return axios_1.default.get(`/search?${params}`).then(res => res.data);
    },
});
//# sourceMappingURL=hooks.js.map