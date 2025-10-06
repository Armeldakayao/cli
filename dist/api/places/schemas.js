"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePlaceDtoSchema = exports.createPlaceDtoSchema = void 0;
// Auto-generated validation schemas
const zod_1 = require("zod");
exports.createPlaceDtoSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    details: zod_1.z.string(),
    gallery: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    reviews: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    phone: zod_1.z.string().optional().nullable(),
    website: zod_1.z.string().optional().nullable(),
    address: zod_1.z.string(),
    features: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    specialties: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    openingHours: zod_1.z.string().optional().nullable(),
    poster: zod_1.z.string().optional().nullable(),
    type: zod_1.z.enum(["restaurant", "landmark", "activity", "hotel"]),
});
exports.updatePlaceDtoSchema = zod_1.z.object({
    title: zod_1.z.string().optional().nullable(),
    description: zod_1.z.string().optional().nullable(),
    details: zod_1.z.string().optional().nullable(),
    gallery: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    reviews: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    phone: zod_1.z.string().optional().nullable(),
    website: zod_1.z.string().optional().nullable(),
    address: zod_1.z.string().optional().nullable(),
    features: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    specialties: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    openingHours: zod_1.z.string().optional().nullable(),
    poster: zod_1.z.string().optional().nullable(),
    type: zod_1.z.enum(["restaurant", "landmark", "activity", "hotel"]).optional().nullable(),
});
//# sourceMappingURL=schemas.js.map