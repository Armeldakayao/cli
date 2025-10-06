export declare class FileUtils {
    static shouldOverwrite(filePath: string, preserveModified: boolean): Promise<boolean>;
    private static hasUserModifications;
    private static hasSignificantChanges;
    static writeIfShould(filePath: string, content: string, preserveModified: boolean): Promise<void>;
}
//# sourceMappingURL=file-utils.d.ts.map