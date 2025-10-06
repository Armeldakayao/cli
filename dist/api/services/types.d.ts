export interface CreateServiceDto {
    /** Type unique du service */
    type: string;
    /** Titre du service */
    title: string;
    /** Description du service */
    description: string;
    /** Icône du service */
    icon?: string;
    /** Catégorie du service */
    category?: string;
    /** Service actif ou non */
    isActive?: boolean;
    /** Documents requis */
    requiredDocuments?: string[];
    /** Configuration des champs du formulaire */
    formFields?: string[];
    /** Configuration du workflow de traitement */
    workflow?: any;
}
export interface UpdateServiceDto {
    /** Type unique du service */
    type?: string;
    /** Titre du service */
    title?: string;
    /** Description du service */
    description?: string;
    /** Icône du service */
    icon?: string;
    /** Catégorie du service */
    category?: string;
    /** Service actif ou non */
    isActive?: boolean;
    /** Documents requis */
    requiredDocuments?: string[];
    /** Configuration des champs du formulaire */
    formFields?: string[];
    /** Configuration du workflow de traitement */
    workflow?: any;
}
//# sourceMappingURL=types.d.ts.map