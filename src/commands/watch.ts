import { Command } from 'commander';
import * as fs from 'fs';
import { GeneratorConfig } from '../types/config';
import { SwaggerLoader } from '../utils/swagger-loader';
import { BaseGenerator } from '../generators/base';

export function watchCommand(program: Command): void {
  program
    .command('watch')
    .description('Watch Swagger spec and regenerate on changes')
    .requiredOption('-i, --input <input>', 'Swagger spec file path')
    .option('-o, --output <dir>', 'Output directory', './src/api')
    .option('-t, --template <template>', 'Template', 'tanstack-query')
    .option('-s, --structure <mode>', 'Structure', 'group-hooks')
    .option('--http-client <client>', 'HTTP client', 'fetch')
    .option('--validator <validator>', 'Validator', 'zod')
    .option('--strip-base-path [path]', 'Strip base path')
    .option('-l, --language <lang>', 'Language', 'en')
    .action(async (options) => {
      try {
        if (options.input.startsWith('http')) {
          throw new Error('Watch mode only works with local files');
        }

        console.log(`👀 Watching ${options.input} for changes...`);

        const config: GeneratorConfig = {
          outputDir: options.output,
          template: options.template,
          structureMode: options.structure,
          httpClient: options.httpClient,
          validator: options.validator,
          stripBasePath: options.stripBasePath === 'true' ? true : options.stripBasePath || false,
          includeTags: [],
          excludeTags: [],
          language: options.language,
          generateFakeData: false,
          preserveModified: true,
        };

        // Génération initiale
        const spec = await SwaggerLoader.load(options.input);
        const generator = new BaseGenerator(spec, config);
        await generator.generate();

        // Watch pour les changements
        fs.watch(options.input, async (eventType: string) => {
          if (eventType === 'change') {
            console.log('\n🔄 Swagger spec changed, regenerating...');
            try {
              const newSpec = await SwaggerLoader.load(options.input);
              const newGenerator = new BaseGenerator(newSpec, config);
              await newGenerator.generate();
            } catch (error: any) {
              console.error('❌ Error:', error?.message);
            }
          }
        });

        console.log('Press Ctrl+C to stop watching');
      } catch (error: any) {
        console.error('❌ Error:', error?.message || 'Unknown error');
        process.exit(1);
      }
    });
}