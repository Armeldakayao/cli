export interface UpdateUserDto {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    birthPlace?: string;
    nationality?: string;
    city?: string;
    email?: string;
    phone?: string;
}
export interface UpdateDocumentDto {
    /** Type de document */
    documentType?: 'identity_card' | 'passport' | 'driving_license' | 'birth_certificate' | 'diploma' | 'contract' | 'other';
    /** Description du document */
    description?: string;
}
//# sourceMappingURL=types.d.ts.map