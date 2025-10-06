"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCommand = generateCommand;
const swagger_loader_1 = require("../utils/swagger-loader");
const base_1 = require("../generators/base");
function parseList(value) {
    return value.split(',').map(t => t.trim());
}
function validateOptions(options) {
    const validTemplates = ['tanstack-query', 'rtk-query', 'swr', 'react-query-kit', 'basic'];
    if (!validTemplates.includes(options.template)) {
        throw new Error(`Template must be one of: ${validTemplates.join(', ')}`);
    }
    const validStructures = ['split', 'group', 'group-hooks'];
    if (!validStructures.includes(options.structure)) {
        throw new Error(`Structure must be one of: ${validStructures.join(', ')}`);
    }
    const validHttpClients = ['axios', 'fetch'];
    if (!validHttpClients.includes(options.httpClient)) {
        throw new Error(`HTTP client must be: ${validHttpClients.join(' or ')}`);
    }
    const validValidators = ['zod', 'yup'];
    if (!validValidators.includes(options.validator)) {
        throw new Error(`Validator must be: ${validValidators.join(' or ')}`);
    }
    const validLanguages = ['en', 'fr'];
    if (!validLanguages.includes(options.language)) {
        throw new Error('Language must be "en" or "fr"');
    }
    // Vérifier compatibilité template/structure
    if (options.template !== 'tanstack-query' && options.structure !== 'group-hooks') {
        console.warn(`⚠️  ${options.template} only supports group-hooks structure. Forcing structure to group-hooks.`);
        options.structure = 'group-hooks';
    }
}
function generateCommand(program) {
    program
        .command('generate')
        .description('Generate API functions, hooks, types, and schemas from Swagger spec')
        .requiredOption('-i, --input <input>', 'Swagger spec file path or URL')
        .option('-o, --output <dir>', 'Output directory', './src/api')
        .option('-t, --template <template>', 'Template: tanstack-query, rtk-query, swr, react-query-kit, basic', 'tanstack-query')
        .option('-s, --structure <mode>', 'Structure: split, group, group-hooks', 'group-hooks')
        .option('--http-client <client>', 'HTTP client: axios or fetch', 'fetch')
        .option('--validator <validator>', 'Schema validator: zod or yup', 'zod')
        .option('--strip-base-path [path]', 'Strip base path from routes')
        .option('--include-tags <tags>', 'Only generate specific tags (comma-separated)', parseList)
        .option('--exclude-tags <tags>', 'Exclude specific tags (comma-separated)', parseList)
        .option('-l, --language <lang>', 'Language: en or fr', 'en')
        .option('--fake-data', 'Generate fake data for testing')
        .option('--preserve-modified', 'Skip overwriting modified files')
        .option('-u, --username <username>', 'Basic auth username')
        .option('-p, --password <password>', 'Basic auth password')
        .action(async (options) => {
        try {
            validateOptions(options);
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
                generateFakeData: options.fakeData || false,
                preserveModified: options.preserveModified || false,
            };
            console.log(`📋 Template: ${options.template}`);
            console.log(`📁 Structure: ${options.structure}`);
            console.log(`🌐 HTTP Client: ${options.httpClient}`);
            console.log(`✅ Validator: ${options.validator}`);
            if ((config?.includeTags?.length ?? 0) > 0) {
                console.log(`🏷️ Including tags: ${config.includeTags.join(", ")}`);
            }
            if ((config?.excludeTags?.length ?? 0) > 0) {
                console.log(`🚫 Excluding tags: ${config.excludeTags.join(", ")}`);
            }
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
//# sourceMappingURL=generate.js.map