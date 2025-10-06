export declare class StringUtils {
    static capitalize(str: string): string;
    static toCamelCase(str: string): string;
    static toPascalCase(str: string): string;
    static toKebabCase(str: string): string;
    static extractRefName(ref: string): string;
    /**
     * Normalise un nom de tag pour créer un nom de dossier valide
     * Exemples:
     * "Site Settings" -> "site-settings"
     * "Actualités/Communiqués/Blogs" -> "actualites-communiques-blogs"
     * "user management" -> "user-management"
     */
    static normalizeTagName(tag: string): string;
}
//# sourceMappingURL=string-utils.d.ts.map