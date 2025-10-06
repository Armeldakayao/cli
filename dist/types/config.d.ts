export interface GeneratorConfig {
    outputDir: string;
    baseUrl?: string;
    template: 'tanstack-query' | 'rtk-query' | 'swr' | 'react-query-kit' | 'basic';
    structureMode: 'split' | 'group' | 'group-hooks';
    httpClient: 'axios' | 'fetch';
    validator: 'zod' | 'yup';
    stripBasePath?: string | boolean;
    includeTags?: string[];
    excludeTags?: string[];
    language: 'en' | 'fr';
    generateFakeData: boolean;
    preserveModified: boolean;
}
export interface Translations {
    generatedTypes: string;
    generatedSchemas: string;
    generatedApi: string;
    generatedHooks: string;
    generatedQueries: string;
    generatedMutations: string;
    generatedFakeData: string;
    queryHooks: string;
    mutationHooks: string;
    tooShort: string;
    tooLong: string;
    invalidFormat: string;
    invalidEmail: string;
    invalidUuid: string;
}
//# sourceMappingURL=config.d.ts.map