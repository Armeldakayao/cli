"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUploadControllerUploadDocuments = exports.useUploadControllerUploadAvatar = exports.useUploadControllerUploadFiles = exports.useUploadControllerUploadFile = void 0;
// Auto-generated hooks
const react_query_kit_1 = require("react-query-kit");
const axios_1 = __importDefault(require("@/lib/axios"));
exports.useUploadControllerUploadFile = (0, react_query_kit_1.createMutation)({
    mutationKey: ['upload'],
    mutationFn: (data) => axios_1.default.post('/upload/single', data),
});
exports.useUploadControllerUploadFiles = (0, react_query_kit_1.createMutation)({
    mutationKey: ['upload'],
    mutationFn: (data) => axios_1.default.post('/upload/multiple', data),
});
exports.useUploadControllerUploadAvatar = (0, react_query_kit_1.createMutation)({
    mutationKey: ['upload'],
    mutationFn: (data) => axios_1.default.post('/upload/avatar', data),
});
exports.useUploadControllerUploadDocuments = (0, react_query_kit_1.createMutation)({
    mutationKey: ['upload'],
    mutationFn: (data) => axios_1.default.post('/upload/documents', data),
});
//# sourceMappingURL=hooks.js.map