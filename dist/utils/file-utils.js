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
exports.FileUtils = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class FileUtils {
    static async shouldOverwrite(filePath, preserveModified) {
        if (!preserveModified)
            return true;
        const exists = await fs.pathExists(filePath);
        if (!exists)
            return true;
        const content = await fs.readFile(filePath, 'utf-8');
        return !this.hasUserModifications(content);
    }
    static hasUserModifications(content) {
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
    static hasSignificantChanges(content) {
        const extraImports = (content.match(/^import .+ from/gm) || []).length > 10;
        const customFunctions = content.includes('// Custom function') ||
            content.includes('export const custom') ||
            content.includes('export function custom');
        return extraImports || customFunctions;
    }
    static async writeIfShould(filePath, content, preserveModified) {
        if (await this.shouldOverwrite(filePath, preserveModified)) {
            await fs.writeFile(filePath, content);
        }
        else {
            console.log(`   ⚠️  Skipped ${path.relative(process.cwd(), filePath)} (has user modifications)`);
        }
    }
}
exports.FileUtils = FileUtils;
//# sourceMappingURL=file-utils.js.map