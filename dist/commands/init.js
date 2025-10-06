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
exports.initCommand = initCommand;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const axios_config_1 = require("../templates/axios-config");
function initCommand(program) {
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
                await fs.writeFile(axiosPath, axios_config_1.AXIOS_CONFIG_TEMPLATE);
                console.log('✓ Created lib/axios.ts');
            }
            else {
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
            }
            else {
                console.log('⚠ lib/query-keys.ts already exists');
            }
            console.log('\n✨ Initialization complete!');
            console.log('Next: Run swagger-to-tanstack generate -i <swagger-url>');
        }
        catch (error) {
            console.error('Error:', error?.message || 'Unknown error');
            process.exit(1);
        }
    });
}
//# sourceMappingURL=init.js.map