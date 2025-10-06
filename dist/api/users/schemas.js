"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDocumentDtoSchema = exports.updateUserDtoSchema = void 0;
// Auto-generated validation schemas
const zod_1 = require("zod");
exports.updateUserDtoSchema = zod_1.z.object({
    firstName: zod_1.z.string().optional().nullable(),
    lastName: zod_1.z.string().optional().nullable(),
    birthDate: zod_1.z.string().optional().nullable(),
    birthPlace: zod_1.z.string().optional().nullable(),
    nationality: zod_1.z.string().optional().nullable(),
    city: zod_1.z.string().optional().nullable(),
    email: zod_1.z.string().optional().nullable(),
    phone: zod_1.z.string().optional().nullable(),
});
exports.updateDocumentDtoSchema = zod_1.z.object({
    documentType: zod_1.z.enum(["identity_card", "passport", "driving_license", "birth_certificate", "diploma", "contract", "other"]).optional().nullable(),
    description: zod_1.z.string().optional().nullable(),
});
//# sourceMappingURL=schemas.js.map