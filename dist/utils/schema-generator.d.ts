import { SchemaObject } from '../types/swagger';
import { Translations } from '../types/config';
export declare class SchemaGenerator {
    private translations;
    constructor(translations: Translations);
    generateZod(property: SchemaObject, schemas: Record<string, SchemaObject>): string;
    generateYup(property: SchemaObject, schemas: Record<string, SchemaObject>): string;
}
//# sourceMappingURL=schema-generator.d.ts.map