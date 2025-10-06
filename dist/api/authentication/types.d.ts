export interface RegisterDto {
    firstName: string;
    lastName: string;
    birthDate: string;
    birthPlace: string;
    nationality: string;
    city: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    idType: string;
    idNumber: string;
    acceptTerms: boolean;
    acceptDataPolicy: boolean;
    /** Rôle de l'utilisateur */
    role?: 'user' | 'admin' | 'moderator';
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface VerifyOtpDto {
    /** Code OTP à 6 chiffres reçu par email */
    code: string;
    /** ID de l'utilisateur */
    userId: string;
}
export interface LoginOtpDto {
    /** Email de l'utilisateur */
    email: string;
    /** Code OTP reçu par email */
    otpCode: string;
}
export interface ForgotPasswordDto {
    email: string;
}
export interface ResetPasswordDto {
    token: string;
    newPassword: string;
}
export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
//# sourceMappingURL=types.d.ts.map