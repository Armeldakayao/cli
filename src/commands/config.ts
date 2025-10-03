import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import { RTK_CONFIG_TEMPLATE } from '../templates/rtk-config';

export function configCommand(program: Command): void {
  program
    .command('config')
    .description('Generate RTK Query config file (services/config.ts)')
    .option('-o, --output <dir>', 'Output directory', './src/services')
    .action(async (options) => {
      try {
        console.log('Generating RTK Query config...');
        const configDir = path.join(process.cwd(), options.output);
        await fs.ensureDir(configDir);

        const configPath = path.join(configDir, 'config.ts');
        
        if (await fs.pathExists(configPath)) {
          console.log('⚠️  Config already exists, skipping...');
          return;
        }

        await fs.writeFile(configPath, RTK_CONFIG_TEMPLATE);
        console.log(`✅ Created ${configPath}`);
        console.log('Import: @/services/config');
      } catch (error: any) {
        console.error('❌ Error:', error?.message || 'Unknown error');
        process.exit(1);
      }
    });
}