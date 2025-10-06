"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordDtoSchema = exports.resetPasswordDtoSchema = exports.forgotPasswordDtoSchema = exports.loginOtpDtoSchema = exports.verifyOtpDtoSchema = exports.loginDtoSchema = exports.registerDtoSchema = void 0;
// Auto-generated validation schemas
const zod_1 = require("zod");
exports.registerDtoSchema = zod_1.z.object({
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    birthDate: zod_1.z.string(),
    birthPlace: zod_1.z.string(),
    nationality: zod_1.z.string(),
    city: zod_1.z.string(),
    email: zod_1.z.string(),
    phone: zod_1.z.string(),
    password: zod_1.z.string(),
    confirmPassword: zod_1.z.string(),
    idType: zod_1.z.string(),
    idNumber: zod_1.z.string(),
    acceptTerms: zod_1.z.boolean(),
    acceptDataPolicy: zod_1.z.boolean(),
    role: zod_1.z.enum(["user", "admin", "moderator"]).optional().nullable(),
});
exports.loginDtoSchema = zod_1.z.object({
    email: zod_1.z.string(),
    password: zod_1.z.string(),
});
exports.verifyOtpDtoSchema = zod_1.z.object({
    code: zod_1.z.string(),
    userId: zod_1.z.string(),
});
exports.loginOtpDtoSchema = zod_1.z.object({
    email: zod_1.z.string(),
    otpCode: zod_1.z.string(),
});
exports.forgotPasswordDtoSchema = zod_1.z.object({
    email: zod_1.z.string(),
});
exports.resetPasswordDtoSchema = zod_1.z.object({
    token: zod_1.z.string(),
    newPassword: zod_1.z.string(),
});
exports.changePasswordDtoSchema = zod_1.z.object({
    currentPassword: zod_1.z.string(),
    newPassword: zod_1.z.string(),
});
//# sourceMappingURL=schemas.js.map