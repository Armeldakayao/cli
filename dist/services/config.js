"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseQuery = exports.apiInstance = exports.RESPONSE_BODY_KEY = exports.ResponseError = exports.invalidateOn = void 0;
const react_1 = require("@reduxjs/toolkit/query/react");
// Utility pour invalider les tags conditionnellement
const invalidateOn = ({ success, error }) => {
    return (result, _error, _arg) => result ? (success ?? []) : (error ?? []);
};
exports.invalidateOn = invalidateOn;
// Configuration du baseQuery
const getBaseQuery = () => (0, react_1.fetchBaseQuery)({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: async (headers) => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (!headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    },
});
exports.getBaseQuery = getBaseQuery;
// Classe pour gérer les erreurs de réponse
class ResponseError extends Error {
    constructor({ status, data }) {
        super();
        switch (status) {
            case "TIMEOUT_ERROR":
                this.globalError = "Request timed out. Please try again.";
                break;
            case "FETCH_ERROR":
                this.globalError = "Cannot reach out to the server. Please try again.";
                break;
            case "PARSING_ERROR":
                this.globalError = "Error parsing server response.";
                break;
            default:
                if (data && typeof data === 'object') {
                    const responseData = data;
                    this.globalError = responseData.message || "Something went wrong. Please try again.";
                    this.fieldsErrors = responseData.errors;
                }
                else {
                    this.globalError = "Something went wrong. Please try again.";
                }
                break;
        }
    }
    export(fieldsMap) {
        return {
            message: this.globalError,
            errors: fieldsMap && this.fieldsErrors
                ? Object.keys(this.fieldsErrors).reduce((acc, key) => ({
                    ...acc,
                    [fieldsMap[key] || key]: this.fieldsErrors[key],
                }), {})
                : this.fieldsErrors || {},
        };
    }
}
exports.ResponseError = ResponseError;
// Clé pour extraire le body de la réponse
exports.RESPONSE_BODY_KEY = "data";
// Instance de l'API
exports.apiInstance = (0, react_1.createApi)({
    reducerPath: 'api',
    tagTypes: [
        "Auth",
        "Users",
        // Add your tag types here
    ],
    baseQuery: getBaseQuery(),
    endpoints: () => ({}),
});
//# sourceMappingURL=config.js.map