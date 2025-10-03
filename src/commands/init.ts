import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import { AXIOS_CONFIG_TEMPLATE } from '../templates/axios-config';

export function initCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize project with lib/axios.ts and lib/query-keys.ts')
    .action(async () => {
      try {
        console.log('Initializing project...');
        const libDir = path.join(process.cwd(), 'lib');
        await fs.ensureDir(libDir);

        // Créer lib/axios.ts
        const axiosPath = path.join(libDir, 'axios.ts');
        if (!await fs.pathExists(axiosPath)) {
          await fs.writeFile(axiosPath, AXIOS_CONFIG_TEMPLATE);
          console.log('✓ Created lib/axios.ts');
        } else {
          console.log('⚠ lib/axios.ts already exists');
        }

        // Créer lib/query-keys.ts
        const queryKeysPath = path.join(libDir, 'query-keys.ts');
        if (!await fs.pathExists(queryKeysPath)) {
          const queryKeysTemplate = `// Query keys will be populated by swagger-to-tanstack generate
export const queryKeys = {} as const;
`;
          await fs.writeFile(queryKeysPath, queryKeysTemplate);
          console.log('✓ Created lib/query-keys.ts');
        } else {
          console.log('⚠ lib/query-keys.ts already exists');
        }

        console.log('\n✨ Initialization complete!');
        console.log('Next: Run swagger-to-tanstack generate -i <swagger-url>');
      } catch (error: any) {
        console.error('Error:', error?.message || 'Unknown error');
        process.exit(1);
      }
    });
}