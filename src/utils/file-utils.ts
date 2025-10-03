import * as fs from 'fs-extra';
import * as path from 'path';

export class FileUtils {
  static async shouldOverwrite(filePath: string, preserveModified: boolean): Promise<boolean> {
    if (!preserveModified) return true;
    
    const exists = await fs.pathExists(filePath);
    if (!exists) return true;

    const content = await fs.readFile(filePath, 'utf-8');
    return !this.hasUserModifications(content);
  }

  private static hasUserModifications(content: string): boolean {
    const markers = [
      '// CUSTOM',
      '// Modified',
      '// TODO',
      '// KEEP',
      '// USER:',
      '/* CUSTOM',
      '/* Modified'
    ];

    return markers.some(marker => content.includes(marker)) || this.hasSignificantChanges(content);
  }

  private static hasSignificantChanges(content: string): boolean {
    const extraImports = (content.match(/^import .+ from/gm) || []).length > 10;
    const customFunctions = content.includes('// Custom function') || 
                            content.includes('export const custom') ||
                            content.includes('export function custom');
    return extraImports || customFunctions;
  }

  static async writeIfShould(filePath: string, content: string, preserveModified: boolean): Promise<void> {
    if (await this.shouldOverwrite(filePath, preserveModified)) {
      await fs.writeFile(filePath, content);
    } else {
      console.log(`   ⚠️  Skipped ${path.relative(process.cwd(), filePath)} (has user modifications)`);
    }
  }
}