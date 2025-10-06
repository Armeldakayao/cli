"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServiceDtoSchema = exports.createServiceDtoSchema = void 0;
// Auto-generated validation schemas
const zod_1 = require("zod");
exports.createServiceDtoSchema = zod_1.z.object({
    type: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    icon: zod_1.z.string().optional().nullable(),
    category: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().optional().nullable(),
    requiredDocuments: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    formFields: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    workflow: zod_1.z.object({}).optional().nullable(),
});
exports.updateServiceDtoSchema = zod_1.z.object({
    type: zod_1.z.string().optional().nullable(),
    title: zod_1.z.string().optional().nullable(),
    description: zod_1.z.string().optional().nullable(),
    icon: zod_1.z.string().optional().nullable(),
    category: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().optional().nullable(),
    requiredDocuments: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    formFields: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    workflow: zod_1.z.object({}).optional().nullable(),
});
//# sourceMappingURL=schemas.js.map