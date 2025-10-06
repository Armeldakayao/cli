"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCommentDtoSchema = exports.updateAnnouncementDtoSchema = exports.createAnnouncementDtoSchema = void 0;
// Auto-generated validation schemas
const zod_1 = require("zod");
exports.createAnnouncementDtoSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    details: zod_1.z.string(),
    gallery: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    date: zod_1.z.string(),
    type: zod_1.z.enum(["news", "press_release", "announcement", "communique"]),
    poster: zod_1.z.string().optional().nullable(),
    comments: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    tags: zod_1.z.array(zod_1.z.string()).optional().nullable(),
});
exports.updateAnnouncementDtoSchema = zod_1.z.object({
    title: zod_1.z.string().optional().nullable(),
    description: zod_1.z.string().optional().nullable(),
    details: zod_1.z.string().optional().nullable(),
    gallery: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    date: zod_1.z.string().optional().nullable(),
    type: zod_1.z.enum(["news", "press_release", "announcement", "communique"]).optional().nullable(),
    poster: zod_1.z.string().optional().nullable(),
    comments: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    tags: zod_1.z.array(zod_1.z.string()).optional().nullable(),
});
exports.addCommentDtoSchema = zod_1.z.object({
    comment: zod_1.z.string(),
});
//# sourceMappingURL=schemas.js.map