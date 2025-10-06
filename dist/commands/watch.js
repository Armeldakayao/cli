"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchCommand = watchCommand;
const fs = __importStar(require("fs"));
const swagger_loader_1 = require("../utils/swagger-loader");
const base_1 = require("../generators/base");
function watchCommand(program) {
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
            const config = {
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
            const spec = await swagger_loader_1.SwaggerLoader.load(options.input);
            const generator = new base_1.BaseGenerator(spec, config);
            await generator.generate();
            // Watch pour les changements
            fs.watch(options.input, async (eventType) => {
                if (eventType === 'change') {
                    console.log('\n🔄 Swagger spec changed, regenerating...');
                    try {
                        const newSpec = await swagger_loader_1.SwaggerLoader.load(options.input);
                        const newGenerator = new base_1.BaseGenerator(newSpec, config);
                        await newGenerator.generate();
                    }
                    catch (error) {
                        console.error('❌ Error:', error?.message);
                    }
                }
            });
            console.log('Press Ctrl+C to stop watching');
        }
        catch (error) {
            console.error('❌ Error:', error?.message || 'Unknown error');
            process.exit(1);
        }
    });
}
//# sourceMappingURL=watch.js.map