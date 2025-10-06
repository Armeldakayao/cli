export interface CreateNotificationDto {
    userId: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error' | 'document';
    serviceRequestId?: string;
}
//# sourceMappingURL=types.d.ts.map