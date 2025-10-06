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
exports.configCommand = configCommand;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const rtk_config_1 = require("../templates/rtk-config");
function configCommand(program) {
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
            await fs.writeFile(configPath, rtk_config_1.RTK_CONFIG_TEMPLATE);
            console.log(`✅ Created ${configPath}`);
            console.log('Import: @/services/config');
        }
        catch (error) {
            console.error('❌ Error:', error?.message || 'Unknown error');
            process.exit(1);
        }
    });
}
//# sourceMappingURL=config.js.map