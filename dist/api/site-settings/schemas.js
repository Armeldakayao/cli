"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSiteSettingsDtoSchema = exports.updateSiteSettingsDtoSchema = void 0;
// Auto-generated validation schemas
const zod_1 = require("zod");
const schemas_1 = require("../shared/schemas");
exports.updateSiteSettingsDtoSchema = zod_1.z.object({});
exports.createSiteSettingsDtoSchema = zod_1.z.object({
    siteName: zod_1.z.string().optional().nullable(),
    logo: zod_1.z.string().optional().nullable(),
    favicon: zod_1.z.string().optional().nullable(),
    primaryColor: zod_1.z.string().optional().nullable(),
    secondaryColor: zod_1.z.string().optional().nullable(),
    phone: zod_1.z.string().optional().nullable(),
    email: zod_1.z.string().optional().nullable(),
    address: zod_1.z.string().optional().nullable(),
    city: zod_1.z.string().optional().nullable(),
    country: zod_1.z.string().optional().nullable(),
    postalCode: zod_1.z.string().optional().nullable(),
    latitude: zod_1.z.number().optional().nullable(),
    longitude: zod_1.z.number().optional().nullable(),
    website: zod_1.z.string().optional().nullable(),
    facebook: zod_1.z.string().optional().nullable(),
    twitter: zod_1.z.string().optional().nullable(),
    instagram: zod_1.z.string().optional().nullable(),
    linkedin: zod_1.z.string().optional().nullable(),
    youtube: zod_1.z.string().optional().nullable(),
    description: zod_1.z.string().optional().nullable(),
    welcomeMessage: zod_1.z.string().optional().nullable(),
    footerText: zod_1.z.string().optional().nullable(),
    businessHours: zod_1.z.object({}).optional().nullable(),
    defaultLanguage: zod_1.z.string().optional().nullable(),
    supportedLanguages: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    timezone: zod_1.z.string().optional().nullable(),
    currency: zod_1.z.string().optional().nullable(),
    allowRegistration: zod_1.z.boolean().optional().nullable(),
    requireEmailVerification: zod_1.z.boolean().optional().nullable(),
    maintenanceMode: zod_1.z.boolean().optional().nullable(),
    maintenanceMessage: zod_1.z.string().optional().nullable(),
    emergencyContacts: zod_1.z.array(schemas_1.emergencyContactDtoSchema).optional().nullable(),
    importantLinks: zod_1.z.array(schemas_1.importantLinkDtoSchema).optional().nullable(),
});
//# sourceMappingURL=schemas.js.map