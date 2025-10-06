"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationDtoSchema = void 0;
// Auto-generated validation schemas
const zod_1 = require("zod");
exports.createNotificationDtoSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    message: zod_1.z.string(),
    type: zod_1.z.enum(["info", "warning", "success", "error", "document"]),
    serviceRequestId: zod_1.z.string().optional().nullable(),
});
//# sourceMappingURL=schemas.js.map