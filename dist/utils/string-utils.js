"use strict";
// export class StringUtils {
//     static capitalize(str: string): string {
//       return str.charAt(0).toUpperCase() + str.slice(1);
//     }
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtils = void 0;
//     static toCamelCase(str: string): string {
//       return str
//         .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
//         .replace(/^(.)/, (char) => char.toLowerCase());
//     }
//     static toPascalCase(str: string): string {
//       return this.capitalize(this.toCamelCase(str));
//     }
//     static toKebabCase(str: string): string {
//       return str
//         .replace(/([a-z])([A-Z])/g, '$1-$2')
//         .replace(/[\s_]+/g, '-')
//         .toLowerCase();
//     }
//     static extractRefName(ref: string): string {
//       return ref.split('/').pop() || '';
//     }
//   }
class StringUtils {
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    static toCamelCase(str) {
        return str
            .replace(/[-_\s](.)/g, (_, char) => char.toUpperCase())
            .replace(/^(.)/, (char) => char.toLowerCase())
            .replace(/[^a-zA-Z0-9]/g, '');
    }
    static toPascalCase(str) {
        return this.capitalize(this.toCamelCase(str));
    }
    static toKebabCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .replace(/[^a-zA-Z0-9-]/g, '')
            .toLowerCase();
    }
    static extractRefName(ref) {
        return ref.split('/').pop() || '';
    }
    /**
     * Normalise un nom de tag pour créer un nom de dossier valide
     * Exemples:
     * "Site Settings" -> "site-settings"
     * "Actualités/Communiqués/Blogs" -> "actualites-communiques-blogs"
     * "user management" -> "user-management"
     */
    static normalizeTagName(tag) {
        return tag
            .toLowerCase()
            .replace(/[àáâãäå]/g, 'a')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/[òóôõö]/g, 'o')
            .replace(/[ùúûü]/g, 'u')
            .replace(/[ýÿ]/g, 'y')
            .replace(/[ñ]/g, 'n')
            .replace(/[ç]/g, 'c')
            .replace(/[/\\]/g, '-') // Remplacer slashes par tirets
            .replace(/[\s_]+/g, '-') // Remplacer espaces et underscores par tirets
            .replace(/[^a-z0-9-]/g, '') // Supprimer caractères spéciaux
            .replace(/-+/g, '-') // Supprimer tirets multiples
            .replace(/^-|-$/g, ''); // Supprimer tirets au début/fin
    }
}
exports.StringUtils = StringUtils;
//# sourceMappingURL=string-utils.js.map