import type { ConjointDto } from '../shared/types';
export interface CreateRdvRequestDto {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    profession: string;
    institution: string;
    nationalId: string;
    meetingTarget: string;
    otherMeetingTarget?: string;
    subject: string;
    otherSubject?: string;
    preferredSlot1: string;
    preferredSlot2: string;
    preferredSlot3: string;
    meetingType: string;
    certifyAccuracy: boolean;
    authorizeContact: boolean;
}
export interface CreatePartenariatRequestDto {
    nom: string;
    prenom: string;
    email: string;
    organizationName: string;
    organizationType: string;
    otherOrganizationType?: string;
    activitySector: string;
    otherActivitySector?: string;
    originCountry: string;
    originCity: string;
    creationYear: number;
    website?: string;
    contactName: string;
    contactFunction: string;
    contactPhone: string;
    contactEmail: string;
    partnershipNature: string;
    otherPartnershipNature?: string;
    concernedService: string;
    proposalDescription: string;
    mairieObjectives: string;
    structureObjectives: string;
    partnershipDuration: string;
    startDate: string;
    certifyAccuracy: boolean;
    authorizeContact: boolean;
    acknowledgeNoValidation: boolean;
}
export interface CreateMariageRequestDto {
    conjoint1: ConjointDto;
    conjoint2: ConjointDto;
    marriageType: string;
    guestEstimate: number;
    celebrationLanguage: string;
    otherCelebrationLanguage?: string;
    date1: string;
    time1: string;
    date2: string;
    time2: string;
    date3: string;
    time3: string;
    reserveRoom: boolean;
    roomType?: string;
    photoSpace: boolean;
    onlinePayment: boolean;
    certifyAccuracy: boolean;
    authorizeContact: boolean;
}
export interface CreateTreatmentDto {
    demandeId: string;
    agentNom: string;
    agentPrenom: string;
    agentEmail: string;
    agentService?: string;
    commentairesInternes?: string;
    messageAgent?: string;
    dateEcheance?: string;
    notifyByEmail?: boolean;
    documentsRequis?: string[];
    tempsEstime?: number;
}
export interface UpdateTreatmentDto {
    etat?: string;
    resultat?: string;
    etapeWorkflow?: string;
    commentairesInternes?: string;
    commentairesPublics?: string;
    messageAgent?: string;
    dateEcheance?: string;
    notifyByEmail?: boolean;
    notifyBySms?: boolean;
    documentsRequis?: string[];
    tempsEstime?: number;
}
//# sourceMappingURL=types.d.ts.map