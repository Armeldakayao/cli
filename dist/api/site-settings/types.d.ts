import type { EmergencyContactDto, ImportantLinkDto } from '../shared/types';
export interface UpdateSiteSettingsDto {
}
export interface CreateSiteSettingsDto {
    siteName?: string;
    logo?: string;
    favicon?: string;
    primaryColor?: string;
    secondaryColor?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    description?: string;
    welcomeMessage?: string;
    footerText?: string;
    businessHours?: any;
    defaultLanguage?: string;
    supportedLanguages?: string[];
    timezone?: string;
    currency?: string;
    allowRegistration?: boolean;
    requireEmailVerification?: boolean;
    maintenanceMode?: boolean;
    maintenanceMessage?: string;
    emergencyContacts?: EmergencyContactDto[];
    importantLinks?: ImportantLinkDto[];
}
//# sourceMappingURL=types.d.ts.map