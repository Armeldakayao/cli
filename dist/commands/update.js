"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommand = updateCommand;
const swagger_loader_1 = require("../utils/swagger-loader");
const base_1 = require("../generators/base");
function parseList(value) {
    return value.split(',').map(t => t.trim());
}
function updateCommand(program) {
    program
        .command('update')
        .description('Update generated files (preserves user modifications)')
        .requiredOption('-i, --input <input>', 'Swagger spec file path or URL')
        .option('-o, --output <dir>', 'Output directory', './src/api')
        .option('-t, --template <template>', 'Template', 'tanstack-query')
        .option('-s, --structure <mode>', 'Structure', 'group-hooks')
        .option('--http-client <client>', 'HTTP client', 'fetch')
        .option('--validator <validator>', 'Validator', 'zod')
        .option('--strip-base-path [path]', 'Strip base path')
        .option('--include-tags <tags>', 'Include tags', parseList)
        .option('--exclude-tags <tags>', 'Exclude tags', parseList)
        .option('-l, --language <lang>', 'Language', 'en')
        .option('-u, --username <username>', 'Basic auth username')
        .option('-p, --password <password>', 'Basic auth password')
        .action(async (options) => {
        try {
            const config = {
                outputDir: options.output,
                template: options.template,
                structureMode: options.structure,
                httpClient: options.httpClient,
                validator: options.validator,
                stripBasePath: options.stripBasePath === 'true' ? true : options.stripBasePath || false,
                includeTags: options.includeTags || [],
                excludeTags: options.excludeTags || [],
                language: options.language,
                generateFakeData: false,
                preserveModified: true, // TOUJOURS préserver en mode update
            };
            console.log('🔄 Updating files (preserving modifications)...');
            let credentials;
            if (options.username && options.password) {
                credentials = { username: options.username, password: options.password };
            }
            const spec = await swagger_loader_1.SwaggerLoader.load(options.input, credentials);
            const generator = new base_1.BaseGenerator(spec, config);
            await generator.generate();
        }
        catch (error) {
            console.error('❌ Error:', error?.message || 'Unknown error');
            process.exit(1);
        }
    });
}
//# sourceMappingURL=update.js.map