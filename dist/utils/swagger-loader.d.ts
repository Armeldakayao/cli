import { SwaggerSpec } from '../types/swagger';
export declare class SwaggerLoader {
    static load(input: string, credentials?: {
        username: string;
        password: string;
    }): Promise<SwaggerSpec>;
    private static loadFromUrl;
    private static tryCommonPaths;
    private static promptForCredentials;
    private static parse;
}
//# sourceMappingURL=swagger-loader.d.ts.map