"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthControllerChangePassword = exports.useAuthControllerResetPassword = exports.useAuthControllerForgotPassword = exports.useAuthControllerResendOtp = exports.useAuthControllerLoginWithOtp = exports.useAuthControllerVerifyOtp = exports.useAuthControllerLogin = exports.useAuthControllerRegister = void 0;
// Auto-generated hooks
const react_query_kit_1 = require("react-query-kit");
const axios_1 = __importDefault(require("@/lib/axios"));
exports.useAuthControllerRegister = (0, react_query_kit_1.createMutation)({
    mutationKey: ['auth'],
    mutationFn: (data) => axios_1.default.post('/auth/register', data),
});
exports.useAuthControllerLogin = (0, react_query_kit_1.createMutation)({
    mutationKey: ['auth'],
    mutationFn: (data) => axios_1.default.post('/auth/login', data),
});
exports.useAuthControllerVerifyOtp = (0, react_query_kit_1.createMutation)({
    mutationKey: ['auth'],
    mutationFn: (data) => axios_1.default.post('/auth/verify-otp', data),
});
exports.useAuthControllerLoginWithOtp = (0, react_query_kit_1.createMutation)({
    mutationKey: ['auth'],
    mutationFn: (data) => axios_1.default.post('/auth/login-with-otp', data),
});
exports.useAuthControllerResendOtp = (0, react_query_kit_1.createMutation)({
    mutationKey: ['auth'],
    mutationFn: () => axios_1.default.post('/auth/resend-otp'),
});
exports.useAuthControllerForgotPassword = (0, react_query_kit_1.createMutation)({
    mutationKey: ['auth'],
    mutationFn: (data) => axios_1.default.post('/auth/forgot-password', data),
});
exports.useAuthControllerResetPassword = (0, react_query_kit_1.createMutation)({
    mutationKey: ['auth'],
    mutationFn: (data) => axios_1.default.post('/auth/reset-password', data),
});
exports.useAuthControllerChangePassword = (0, react_query_kit_1.createMutation)({
    mutationKey: ['auth'],
    mutationFn: (data) => axios_1.default.patch('/auth/change-password', data),
});
//# sourceMappingURL=hooks.js.map