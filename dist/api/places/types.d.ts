export interface CreatePlaceDto {
    title: string;
    description: string;
    details: string;
    gallery?: string[];
    reviews?: string[];
    phone?: string;
    website?: string;
    address: string;
    features?: string[];
    specialties?: string[];
    openingHours?: string;
    poster?: string;
    type: 'restaurant' | 'landmark' | 'activity' | 'hotel';
}
export interface UpdatePlaceDto {
    title?: string;
    description?: string;
    details?: string;
    gallery?: string[];
    reviews?: string[];
    phone?: string;
    website?: string;
    address?: string;
    features?: string[];
    specialties?: string[];
    openingHours?: string;
    poster?: string;
    type?: 'restaurant' | 'landmark' | 'activity' | 'hotel';
}
//# sourceMappingURL=types.d.ts.map