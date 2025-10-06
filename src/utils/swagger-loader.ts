// // // import axios from 'axios';
// // // import * as fs from 'fs-extra';
// // // import * as yaml from 'js-yaml';
// // // import { SwaggerSpec } from '../types/swagger';

// // // export class SwaggerLoader {
// // //   static async load(input: string, credentials?: { username: string; password: string }): Promise<SwaggerSpec> {
// // //     let content: string;

// // //     if (input.startsWith('http://') || input.startsWith('https://')) {
// // //       content = await this.loadFromUrl(input, credentials);
// // //     } else {
// // //       content = await fs.readFile(input, 'utf-8');
// // //     }

// // //     return this.parse(content);
// // //   }

// // //   private static async loadFromUrl(url: string, credentials?: { username: string; password: string }): Promise<string> {
// // //     const config: any = { timeout: 10000 };

// // //     if (credentials) {
// // //       const token = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
// // //       config.headers = { Authorization: `Basic ${token}` };
// // //     }

// // //     const response = await axios.get(url, config);
// // //     return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
// // //   }

// // //   private static parse(content: string): SwaggerSpec {
// // //     try {
// // //       const parsed = JSON.parse(content);
// // //       if (!parsed.paths) {
// // //         throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
// // //       }
// // //       return parsed;
// // //     } catch {
// // //       const parsed = yaml.load(content) as SwaggerSpec;
// // //       if (!parsed.paths) {
// // //         throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
// // //       }
// // //       return parsed;
// // //     }
// // //   }
// // // }


// // import axios from 'axios';
// // import * as fs from 'fs-extra';
// // import * as yaml from 'js-yaml';
// // import * as readline from 'readline';
// // import { SwaggerSpec } from '../types/swagger';

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

// //     try {
// //       const response = await axios.get(url, config);
// //       return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
// //     } catch (error: any) {
// //       // Gérer l'erreur 401 - Demander les identifiants
// //       if (error.response?.status === 401 && !credentials) {
// //         console.log('\n🔐 Authentication required (401 Unauthorized)');
// //         const newCredentials = await this.promptForCredentials();
// //         return this.loadFromUrl(url, newCredentials);
// //       }
      
// //       if (error.response?.status === 401 && credentials) {
// //         throw new Error('Authentication failed: Invalid credentials');
// //       }
      
// //       throw new Error(`Failed to fetch Swagger spec: ${error.message}`);
// //     }
// //   }

// //   private static async promptForCredentials(): Promise<{ username: string; password: string }> {
// //     const rl = readline.createInterface({
// //       input: process.stdin,
// //       output: process.stdout
// //     });

// //     return new Promise((resolve) => {
// //       rl.question('Username: ', (username) => {
// //         rl.question('Password: ', (password) => {
// //           rl.close();
// //           resolve({ username: username.trim(), password: password.trim() });
// //         });
// //       });
// //     });
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



// //=========UPDATING THIS FILE WILL CAUSE THE CLI TO BREAK ======
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
//       const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      
//       // Vérifier si c'est du HTML (page d'erreur)
//       if (content.trim().startsWith('<')) {
//         console.log('⚠️  Received HTML instead of Swagger spec. Trying common paths...');
//         return await this.tryCommonPaths(url, credentials);
//       }
      
//       return content;
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
      
//       // Erreur 404 - Essayer les chemins communs
//       if (error.response?.status === 404) {
//         console.log('⚠️  Swagger spec not found at this URL. Trying common paths...');
//         return await this.tryCommonPaths(url, credentials);
//       }
      
//       throw new Error(`Failed to fetch Swagger spec: ${error.message}`);
//     }
//   }

//   private static async tryCommonPaths(originalUrl: string, credentials?: { username: string; password: string }): Promise<string> {
//     // Extraire l'URL de base (sans le path)
//     const urlObj = new URL(originalUrl);
//     const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    
//     const commonPaths = [
//       '/api/swagger.json',
//       '/api-docs',
//       '/api-json',
//       '/api/docs-json',
//       '/swagger.json',
//       '/swagger/v1/swagger.json',
//       '/v1/swagger.json',
//       '/docs/swagger.json',
//       '/api/v1/swagger.json',
//       '/v2/swagger.json',
//       '/api/v2/swagger.json',
//     ];

//     for (const path of commonPaths) {
//       try {
//         const tryUrl = `${baseUrl}${path}`;
//         console.log(`   Trying ${tryUrl}...`);
        
//         const config: any = { timeout: 10000 };
//         if (credentials) {
//           const token = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
//           config.headers = { Authorization: `Basic ${token}` };
//         }
        
//         const response = await axios.get(tryUrl, config);
//         const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        
//         // Vérifier que c'est bien du JSON/YAML et pas du HTML
//         if (!content.trim().startsWith('<')) {
//           console.log(`   ✅ Found Swagger spec at ${tryUrl}`);
//           return content;
//         }
//       } catch (e) {
//         // Continuer vers le prochain path
//         continue;
//       }
//     }
    
//     throw new Error(`Could not find Swagger JSON/YAML spec at any common path. Please provide the direct URL to the specification.`);
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


import axios from 'axios';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import * as readline from 'readline';
import { SwaggerSpec } from '../types/swagger';

export class SwaggerLoader {
  static async load(input: string, credentials?: { username: string; password: string }): Promise<SwaggerSpec> {
    let content: string;

    if (input.startsWith('http://') || input.startsWith('https://')) {
      content = await this.loadFromUrl(input, credentials);
    } else {
      content = await fs.readFile(input, 'utf-8');
    }

    return this.parse(content);
  }

  private static async loadFromUrl(url: string, credentials?: { username: string; password: string }): Promise<string> {
    const config: any = { timeout: 10000 };

    if (credentials) {
      const token = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
      config.headers = { Authorization: `Basic ${token}` };
    }

    try {
      const response = await axios.get(url, config);
      const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

      // Vérifier si c'est du HTML (page d'erreur)
      if (content.trim().startsWith('<')) {
        console.log('⚠️  Received HTML instead of Swagger spec. Trying common paths...');
        return await this.tryCommonPaths(url, credentials);
      }

      // Vérifier que c'est bien du Swagger/OpenAPI
      const parsed = this.tryParseJSON(content);
      if (parsed.swagger || parsed.openapi) return content;

      console.log('⚠️  Content found but not Swagger/OpenAPI. Trying common paths...');
      return await this.tryCommonPaths(url, credentials);

    } catch (error: any) {
      if (error.response?.status === 401 && !credentials) {
        console.log('\n🔐 Authentication required (401 Unauthorized)');
        const newCredentials = await this.promptForCredentials();
        return this.loadFromUrl(url, newCredentials);
      }

      if (error.response?.status === 401 && credentials) {
        throw new Error('Authentication failed: Invalid credentials');
      }

      if (error.response?.status === 404) {
        console.log('⚠️  Swagger spec not found at this URL. Trying common paths...');
        return await this.tryCommonPaths(url, credentials);
      }

      throw new Error(`Failed to fetch Swagger spec: ${error.message}`);
    }
  }

  private static async tryCommonPaths(originalUrl: string, credentials?: { username: string; password: string }): Promise<string> {
    const urlObj = new URL(originalUrl);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    const pathPrefix = urlObj.pathname.replace(/\/+$/, ''); // retire le slash final

    const commonPaths = [
      '/swagger.json',
      '/swagger/v1/swagger.json',
      '/swagger/v2/swagger.json',
      '/swagger-ui/swagger.json',
      '/api/swagger.json',
      '/api/v1/swagger.json',
      '/api/v2/swagger.json',
      '/api/docs/swagger.json',
      '/api-docs',
      '/api-json',
      '/api/docs-json',
      '/docs/swagger.json',
      '/openapi.json',
      '/openapi/v1.json',
      '/api/openapi.json',
      '/api/v1/openapi.json',
      `${pathPrefix}/swagger.json`,
      `${pathPrefix}/openapi.json`,
    ];

    for (const path of commonPaths) {
      try {
        const tryUrl = `${baseUrl}${path}`;
        console.log(`   Trying ${tryUrl}...`);

        const config: any = { timeout: 10000 };
        if (credentials) {
          const token = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
          config.headers = { Authorization: `Basic ${token}` };
        }

        const response = await axios.get(tryUrl, config);
        const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

        const parsed = this.tryParseJSON(content);
        if (parsed.swagger || parsed.openapi) {
          console.log(`   ✅ Found Swagger spec at ${tryUrl}`);
          return content;
        }
      } catch {
        continue;
      }
    }

    throw new Error(`Could not find Swagger JSON/YAML spec at any common path. Please provide the direct URL to the specification.`);
  }

  private static tryParseJSON(content: string): any {
    try {
      return JSON.parse(content);
    } catch {
      try {
        return yaml.load(content);
      } catch {
        return {};
      }
    }
  }

  private static async promptForCredentials(): Promise<{ username: string; password: string }> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
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

  private static parse(content: string): SwaggerSpec {
    const parsed = this.tryParseJSON(content) as SwaggerSpec;
    if (!parsed.paths) {
      throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
    }
    return parsed;
  }
}
