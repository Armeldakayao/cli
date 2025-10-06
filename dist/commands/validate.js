"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCommand = validateCommand;
const swagger_loader_1 = require("../utils/swagger-loader");
function validateCommand(program) {
    program
        .command('validate')
        .description('Validate Swagger/OpenAPI specification')
        .requiredOption('-i, --input <input>', 'Swagger spec file path or URL')
        .option('-u, --username <username>', 'Basic auth username')
        .option('-p, --password <password>', 'Basic auth password')
        .action(async (options) => {
        try {
            console.log('🔍 Validating Swagger specification...');
            let credentials;
            if (options.username && options.password) {
                credentials = { username: options.username, password: options.password };
            }
            const spec = await swagger_loader_1.SwaggerLoader.load(options.input, credentials);
            console.log(`\n✅ Valid ${spec.openapi ? 'OpenAPI' : 'Swagger'} specification`);
            console.log(`📝 Title: ${spec.info?.title}`);
            console.log(`🔢 Version: ${spec.info?.version}`);
            console.log(`🛣️  Paths: ${Object.keys(spec.paths).length}`);
            console.log(`📦 Schemas: ${Object.keys(spec.components?.schemas || spec.definitions || {}).length}`);
            if (spec.tags && spec.tags.length > 0) {
                console.log(`🏷️  Tags: ${spec.tags.map(t => t.name).join(', ')}`);
            }
            if (spec.basePath) {
                console.log(`🌐 Base Path: ${spec.basePath}`);
            }
        }
        catch (error) {
            console.error('❌ Invalid specification:', error?.message || 'Unknown error');
            process.exit(1);
        }
    });
}
//# sourceMappingURL=validate.js.map