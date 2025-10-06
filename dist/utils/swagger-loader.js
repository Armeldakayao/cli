"use strict";
// // import axios from 'axios';
// // import * as fs from 'fs-extra';
// // import * as yaml from 'js-yaml';
// // import { SwaggerSpec } from '../types/swagger';
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerLoader = void 0;
// // export class SwaggerLoader {
// //   static async load(input: string, credentials?: { username: string; password: string }): Promise<SwaggerSpec> {
// //     let content: string;
// //     if (input.startsWith('http://') || input.startsWith('https://')) {
// //       content = await this.loadFromUrl(input, credentials);
// //     } else {
// //       content = await fs.readFile(input, 'utf-8');
// //     }
// //     return this.parse(content);
// //   }
// //   private static async loadFromUrl(url: string, credentials?: { username: string; password: string }): Promise<string> {
// //     const config: any = { timeout: 10000 };
// //     if (credentials) {
// //       const token = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
// //       config.headers = { Authorization: `Basic ${token}` };
// //     }
// //     const response = await axios.get(url, config);
// //     return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
// //   }
// //   private static parse(content: string): SwaggerSpec {
// //     try {
// //       const parsed = JSON.parse(content);
// //       if (!parsed.paths) {
// //         throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
// //       }
// //       return parsed;
// //     } catch {
// //       const parsed = yaml.load(content) as SwaggerSpec;
// //       if (!parsed.paths) {
// //         throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
// //       }
// //       return parsed;
// //     }
// //   }
// // }
// import axios from 'axios';
// import * as fs from 'fs-extra';
// import * as yaml from 'js-yaml';
// import * as readline from 'readline';
// import { SwaggerSpec } from '../types/swagger';
// export class SwaggerLoader {
//   static async load(input: string, credentials?: { username: string; password: string }): Promise<SwaggerSpec> {
//     let content: string;
//     if (input.startsWith('http://') || input.startsWith('https://')) {
//       content = await this.loadFromUrl(input, credentials);
//     } else {
//       content = await fs.readFile(input, 'utf-8');
//     }
//     return this.parse(content);
//   }
//   private static async loadFromUrl(url: string, credentials?: { username: string; password: string }): Promise<string> {
//     const config: any = { timeout: 10000 };
//     if (credentials) {
//       const token = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
//       config.headers = { Authorization: `Basic ${token}` };
//     }
//     try {
//       const response = await axios.get(url, config);
//       return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
//     } catch (error: any) {
//       // Gérer l'erreur 401 - Demander les identifiants
//       if (error.response?.status === 401 && !credentials) {
//         console.log('\n🔐 Authentication required (401 Unauthorized)');
//         const newCredentials = await this.promptForCredentials();
//         return this.loadFromUrl(url, newCredentials);
//       }
//       if (error.response?.status === 401 && credentials) {
//         throw new Error('Authentication failed: Invalid credentials');
//       }
//       throw new Error(`Failed to fetch Swagger spec: ${error.message}`);
//     }
//   }
//   private static async promptForCredentials(): Promise<{ username: string; password: string }> {
//     const rl = readline.createInterface({
//       input: process.stdin,
//       output: process.stdout
//     });
//     return new Promise((resolve) => {
//       rl.question('Username: ', (username) => {
//         rl.question('Password: ', (password) => {
//           rl.close();
//           resolve({ username: username.trim(), password: password.trim() });
//         });
//       });
//     });
//   }
//   private static parse(content: string): SwaggerSpec {
//     try {
//       const parsed = JSON.parse(content);
//       if (!parsed.paths) {
//         throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
//       }
//       return parsed;
//     } catch {
//       const parsed = yaml.load(content) as SwaggerSpec;
//       if (!parsed.paths) {
//         throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
//       }
//       return parsed;
//     }
//   }
// }
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs-extra"));
const yaml = __importStar(require("js-yaml"));
const readline = __importStar(require("readline"));
class SwaggerLoader {
    static async load(input, credentials) {
        let content;
        if (input.startsWith('http://') || input.startsWith('https://')) {
            content = await this.loadFromUrl(input, credentials);
        }
        else {
            content = await fs.readFile(input, 'utf-8');
        }
        return this.parse(content);
    }
    static async loadFromUrl(url, credentials) {
        const config = { timeout: 10000 };
        if (credentials) {
            const token = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
            config.headers = { Authorization: `Basic ${token}` };
        }
        try {
            const response = await axios_1.default.get(url, config);
            const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
            // Vérifier si c'est du HTML (page d'erreur)
            if (content.trim().startsWith('<')) {
                console.log('⚠️  Received HTML instead of Swagger spec. Trying common paths...');
                return await this.tryCommonPaths(url, credentials);
            }
            return content;
        }
        catch (error) {
            // Gérer l'erreur 401 - Demander les identifiants
            if (error.response?.status === 401 && !credentials) {
                console.log('\n🔐 Authentication required (401 Unauthorized)');
                const newCredentials = await this.promptForCredentials();
                return this.loadFromUrl(url, newCredentials);
            }
            if (error.response?.status === 401 && credentials) {
                throw new Error('Authentication failed: Invalid credentials');
            }
            // Erreur 404 - Essayer les chemins communs
            if (error.response?.status === 404) {
                console.log('⚠️  Swagger spec not found at this URL. Trying common paths...');
                return await this.tryCommonPaths(url, credentials);
            }
            throw new Error(`Failed to fetch Swagger spec: ${error.message}`);
        }
    }
    static async tryCommonPaths(originalUrl, credentials) {
        // Extraire l'URL de base (sans le path)
        const urlObj = new URL(originalUrl);
        const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
        const commonPaths = [
            '/api/swagger.json',
            '/api-docs',
            '/api-json',
            '/api/docs-json',
            '/swagger.json',
            '/swagger/v1/swagger.json',
            '/v1/swagger.json',
            '/docs/swagger.json',
            '/api/v1/swagger.json',
            '/v2/swagger.json',
            '/api/v2/swagger.json',
        ];
        for (const path of commonPaths) {
            try {
                const tryUrl = `${baseUrl}${path}`;
                console.log(`   Trying ${tryUrl}...`);
                const config = { timeout: 10000 };
                if (credentials) {
                    const token = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
                    config.headers = { Authorization: `Basic ${token}` };
                }
                const response = await axios_1.default.get(tryUrl, config);
                const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
                // Vérifier que c'est bien du JSON/YAML et pas du HTML
                if (!content.trim().startsWith('<')) {
                    console.log(`   ✅ Found Swagger spec at ${tryUrl}`);
                    return content;
                }
            }
            catch (e) {
                // Continuer vers le prochain path
                continue;
            }
        }
        throw new Error(`Could not find Swagger JSON/YAML spec at any common path. Please provide the direct URL to the specification.`);
    }
    static async promptForCredentials() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        return new Promise((resolve) => {
            rl.question('Username: ', (username) => {
                rl.question('Password: ', (password) => {
                    rl.close();
                    resolve({ username: username.trim(), password: password.trim() });
                });
            });
        });
    }
    static parse(content) {
        try {
            const parsed = JSON.parse(content);
            if (!parsed.paths) {
                throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
            }
            return parsed;
        }
        catch {
            const parsed = yaml.load(content);
            if (!parsed.paths) {
                throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
            }
            return parsed;
        }
    }
}
exports.SwaggerLoader = SwaggerLoader;
//# sourceMappingURL=swagger-loader.js.map