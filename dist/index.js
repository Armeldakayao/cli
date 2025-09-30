// // #!/usr/bin/env node
// // import { Command } from 'commander';
// // import fs from 'fs-extra';
// // import path from 'path';
// // import axios from 'axios';
// // import yaml from 'js-yaml';
// // import { fileURLToPath } from 'url';
// // import { dirname } from 'path';
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = dirname(__filename);
// // interface SwaggerProperty {
// //   type?: string;
// //   format?: string;
// //   items?: SwaggerProperty;
// //   $ref?: string;
// //   enum?: string[];
// //   properties?: { [key: string]: SwaggerProperty };
// //   required?: string[];
// //   description?: string;
// //   example?: any;
// //   minimum?: number;
// //   maximum?: number;
// //   minLength?: number;
// //   maxLength?: number;
// //   pattern?: string;
// // }
// // interface SwaggerParameter {
// //   name: string;
// //   in: 'query' | 'path' | 'body' | 'header' | 'formData';
// //   required?: boolean;
// //   type?: string;
// //   schema?: SwaggerProperty;
// //   description?: string;
// // }
// // interface SwaggerResponse {
// //   description: string;
// //   schema?: SwaggerProperty;
// //   content?: {
// //     [mediaType: string]: {
// //       schema: SwaggerProperty;
// //     };
// //   };
// // }
// // interface SwaggerEndpoint {
// //   tags?: string[];
// //   summary?: string;
// //   description?: string;
// //   operationId?: string;
// //   parameters?: SwaggerParameter[];
// //   requestBody?: {
// //     content: {
// //       [mediaType: string]: {
// //         schema: SwaggerProperty;
// //       };
// //     };
// //     required?: boolean;
// //   };
// //   responses: {
// //     [statusCode: string]: SwaggerResponse;
// //   };
// // }
// // interface SwaggerSpec {
// //   swagger?: string;
// //   openapi?: string;
// //   info?: {
// //     title: string;
// //     version: string;
// //   };
// //   servers?: Array<{ url: string; description?: string }>;
// //   host?: string;
// //   basePath?: string;
// //   schemes?: string[];
// //   paths: {
// //     [path: string]: {
// //       [method: string]: SwaggerEndpoint;
// //     };
// //   };
// //   components?: {
// //     schemas?: {
// //       [name: string]: SwaggerProperty;
// //     };
// //   };
// //   definitions?: {
// //     [name: string]: SwaggerProperty;
// //   };
// //   tags?: Array<{
// //     name: string;
// //     description?: string;
// //   }>;
// // }
// // interface GeneratorConfig {
// //   outputDir: string;
// //   baseUrl: string;
// //   language: 'en' | 'fr';
// // }
// // const translations = {
// //   en: {
// //     generatedTypes: 'Auto-generated TypeScript types from Swagger/OpenAPI spec',
// //     generatedSchemas: 'Auto-generated Zod schemas from Swagger/OpenAPI spec',
// //     generatedApi: 'Auto-generated API functions from Swagger/OpenAPI spec',
// //     generatedHooks: 'Auto-generated React Query hooks from Swagger/OpenAPI spec',
// //     queryHooks: 'Query Hooks',
// //     mutationHooks: 'Mutation Hooks',
// //     getAll: 'Get all',
// //     getById: 'Get by ID',
// //     create: 'Create',
// //     update: 'Update',
// //     delete: 'Delete',
// //     tooShort: 'Too short',
// //     tooLong: 'Too long',
// //     invalidFormat: 'Invalid format',
// //     invalidEmail: 'Invalid email',
// //     invalidUuid: 'Invalid UUID',
// //     required: 'Required',
// //   },
// //   fr: {
// //     generatedTypes: 'Types TypeScript auto-générés depuis la spécification Swagger/OpenAPI',
// //     generatedSchemas: 'Schémas Zod auto-générés depuis la spécification Swagger/OpenAPI',
// //     generatedApi: 'Fonctions API auto-générées depuis la spécification Swagger/OpenAPI',
// //     generatedHooks: 'Hooks React Query auto-générés depuis la spécification Swagger/OpenAPI',
// //     queryHooks: 'Hooks de Requête',
// //     mutationHooks: 'Hooks de Mutation',
// //     getAll: 'Récupérer tout',
// //     getById: 'Récupérer par ID',
// //     create: 'Créer',
// //     update: 'Mettre à jour',
// //     delete: 'Supprimer',
// //     tooShort: 'Trop court',
// //     tooLong: 'Trop long',
// //     invalidFormat: 'Format invalide',
// //     invalidEmail: 'Email invalide',
// //     invalidUuid: 'UUID invalide',
// //     required: 'Requis',
// //   },
// // };
// // class SwaggerToTanStackGenerator {
// //   private spec: SwaggerSpec;
// //   private config: GeneratorConfig;
// //   private t: typeof translations.en;
// //   constructor(spec: SwaggerSpec, config: GeneratorConfig) {
// //     this.spec = spec;
// //     this.config = config;
// //     this.t = translations[config.language];
// //   }
// //   private capitalize(str: string): string {
// //     return str.charAt(0).toUpperCase() + str.slice(1);
// //   }
// //   private toCamelCase(str: string): string {
// //     return str
// //       .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
// //       .replace(/^(.)/, (char) => char.toLowerCase());
// //   }
// //   private toPascalCase(str: string): string {
// //     return this.capitalize(this.toCamelCase(str));
// //   }
// //   private toKebabCase(str: string): string {
// //     return str
// //       .replace(/([a-z])([A-Z])/g, '$1-$2')
// //       .replace(/[\s_]+/g, '-')
// //       .toLowerCase();
// //   }
// //   private extractRefName(ref: string): string {
// //     return ref.split('/').pop() || '';
// //   }
// //   private getSchemas() {
// //     return this.spec.components?.schemas || this.spec.definitions || {};
// //   }
// //   private generateTypeScript(property: SwaggerProperty, schemas: any): string {
// //     if (property.$ref) {
// //       return this.extractRefName(property.$ref);
// //     }
// //     switch (property.type) {
// //       case 'string':
// //         if (property.enum) {
// //           return property.enum.map(e => `'${e}'`).join(' | ');
// //         }
// //         return 'string';
// //       case 'number':
// //       case 'integer':
// //         return 'number';
// //       case 'boolean':
// //         return 'boolean';
// //       case 'array':
// //         if (property.items) {
// //           return `${this.generateTypeScript(property.items, schemas)}[]`;
// //         }
// //         return 'any[]';
// //       case 'object':
// //         if (property.properties) {
// //           const props = Object.entries(property.properties)
// //             .map(([key, value]) => {
// //               const optional = !property.required?.includes(key) ? '?' : '';
// //               const description = value.description ? `\n  /** ${value.description} */` : '';
// //               return `${description}\n  ${key}${optional}: ${this.generateTypeScript(value, schemas)};`;
// //             })
// //             .join('\n');
// //           return `{\n${props}\n}`;
// //         }
// //         return 'any';
// //       default:
// //         return 'any';
// //     }
// //   }
// //   private generateZodSchema(property: SwaggerProperty, schemas: any): string {
// //     if (property.$ref) {
// //       const refName = this.extractRefName(property.$ref);
// //       return `${this.toCamelCase(refName)}Schema`;
// //     }
// //     switch (property.type) {
// //       case 'string':
// //         let zodString = 'z.string()';
// //         if (property.minLength) zodString += `.min(${property.minLength}, { message: "${this.t.tooShort}" })`;
// //         if (property.maxLength) zodString += `.max(${property.maxLength}, { message: "${this.t.tooLong}" })`;
// //         if (property.pattern) zodString += `.regex(/${property.pattern}/, { message: "${this.t.invalidFormat}" })`;
// //         if (property.enum) {
// //           return `z.enum([${property.enum.map(e => `"${e}"`).join(', ')}])`;
// //         }
// //         if (property.format === 'email') zodString += `.email({ message: "${this.t.invalidEmail}" })`;
// //         if (property.format === 'uuid') zodString += `.uuid({ message: "${this.t.invalidUuid}" })`;
// //         return zodString;
// //       case 'number':
// //       case 'integer':
// //         let zodNumber = property.type === 'integer' ? 'z.number().int()' : 'z.number()';
// //         if (property.minimum !== undefined) zodNumber += `.min(${property.minimum})`;
// //         if (property.maximum !== undefined) zodNumber += `.max(${property.maximum})`;
// //         return zodNumber;
// //       case 'boolean':
// //         return 'z.boolean()';
// //       case 'array':
// //         if (property.items) {
// //           return `z.array(${this.generateZodSchema(property.items, schemas)})`;
// //         }
// //         return 'z.array(z.any())';
// //       case 'object':
// //         if (property.properties) {
// //           const props = Object.entries(property.properties)
// //             .map(([key, value]) => {
// //               let zodField = this.generateZodSchema(value, schemas);
// //               if (!property.required?.includes(key)) {
// //                 zodField += '.optional().nullable()';
// //               }
// //               return `  ${key}: ${zodField},`;
// //             })
// //             .join('\n');
// //           return `z.object({\n${props}\n})`;
// //         }
// //         return 'z.object({})';
// //       default:
// //         return 'z.any()';
// //     }
// //   }
// //   private generateTypes(): string {
// //     const schemas = this.getSchemas();
// //     let types = `// ${this.t.generatedTypes}\n\n`;
// //     for (const [name, schema] of Object.entries(schemas)) {
// //       if (schema.properties || schema.type === 'object') {
// //         const properties = Object.entries(schema.properties || {})
// //           .map(([key, value]) => {
// //             const optional = !schema.required?.includes(key) ? '?' : '';
// //             const description = value.description ? `\n  /** ${value.description} */` : '';
// //             return `${description}\n  ${key}${optional}: ${this.generateTypeScript(value, schemas)};`;
// //           })
// //           .join('\n');
// //         const description = schema.description ? `\n/** ${schema.description} */` : '';
// //         types += `${description}\nexport interface ${name} {\n${properties}\n}\n\n`;
// //       }
// //     }
// //     return types;
// //   }
// //   private generateZodSchemas(): string {
// //     const schemas = this.getSchemas();
// //     let zodSchemas = `// ${this.t.generatedSchemas}\nimport * as z from "zod";\n\n`;
// //     for (const [name, schema] of Object.entries(schemas)) {
// //       if (schema.properties || schema.type === 'object') {
// //         const schemaName = `${this.toCamelCase(name)}Schema`;
// //         const zodSchema = this.generateZodSchema(schema, schemas);
// //         zodSchemas += `export const ${schemaName} = ${zodSchema};\n\n`;
// //         zodSchemas += `export type ${this.toPascalCase(name)}Schema = z.infer<typeof ${schemaName}>;\n\n`;
// //       }
// //     }
// //     return zodSchemas;
// //   }
// //   private generateApiFunction(path: string, method: string, endpoint: SwaggerEndpoint, tag: string): string {
// //     const functionName = endpoint.operationId || 
// //       `${method}${path.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
// //     const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
// //     const queryParams = endpoint.parameters?.filter(p => p.in === 'query') || [];
// //     const hasRequestBody = !!endpoint.requestBody;
// //     const responseType = this.getResponseType(endpoint.responses);
// //     const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : '';
// //     let params = '';
// //     let apiCall = '';
// //     let urlPath = path;
// //     // Handle path parameters
// //     if (pathParams.length > 0) {
// //       pathParams.forEach(param => {
// //         params += `${param.name}: string, `;
// //         urlPath = urlPath.replace(`{${param.name}}`, `\${${param.name}}`);
// //       });
// //     }
// //     // Handle request body
// //     if (hasRequestBody) {
// //       params += `data: ${requestBodyType}, `;
// //     }
// //     // Handle query parameters
// //     if (queryParams.length > 0) {
// //       params += `params?: { ${queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }, `;
// //     }
// //     params = params.replace(/, $/, '');
// //     // Generate API call
// //     switch (method.toLowerCase()) {
// //       case 'get':
// //         apiCall = queryParams.length > 0 
// //           ? `api.get<${responseType}>(\`${urlPath}\`, { params })`
// //           : `api.get<${responseType}>(\`${urlPath}\`)`;
// //         break;
// //       case 'post':
// //         if (hasRequestBody) {
// //           apiCall = queryParams.length > 0
// //             ? `api.post<${responseType}>(\`${urlPath}\`, data, { params })`
// //             : `api.post<${responseType}>(\`${urlPath}\`, data)`;
// //         } else {
// //           apiCall = `api.post<${responseType}>(\`${urlPath}\`)`;
// //         }
// //         break;
// //       case 'put':
// //         if (hasRequestBody) {
// //           apiCall = `api.put<${responseType}>(\`${urlPath}\`, data)`;
// //         } else {
// //           apiCall = `api.put<${responseType}>(\`${urlPath}\`)`;
// //         }
// //         break;
// //       case 'patch':
// //         if (hasRequestBody) {
// //           apiCall = `api.patch<${responseType}>(\`${urlPath}\`, data)`;
// //         } else {
// //           apiCall = `api.patch<${responseType}>(\`${urlPath}\`)`;
// //         }
// //         break;
// //       case 'delete':
// //         if (hasRequestBody) {
// //           apiCall = `api.delete<${responseType}>(\`${urlPath}\`, { data })`;
// //         } else {
// //           apiCall = `api.delete<${responseType}>(\`${urlPath}\`)`;
// //         }
// //         break;
// //     }
// //     const description = endpoint.description || endpoint.summary || '';
// //     const jsdoc = description ? `/**\n * ${description}\n */\n` : '';
// //     return `${jsdoc}export const ${this.toCamelCase(functionName)} = async (${params}) => {\n  const { data } = await ${apiCall};\n  return data;\n};\n\n`;
// //   }
// //   private generateQueryHook(path: string, method: string, endpoint: SwaggerEndpoint, tag: string): string {
// //     const functionName = endpoint.operationId || 
// //       `${method}${path.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
// //     const hookName = `use${this.toPascalCase(functionName)}`;
// //     const apiFunctionName = this.toCamelCase(functionName);
// //     const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
// //     const queryParams = endpoint.parameters?.filter(p => p.in === 'query') || [];
// //     let params = '';
// //     let queryKey = `['${functionName.toLowerCase()}']`;
// //     let enabled = '';
// //     if (pathParams.length > 0) {
// //       params = pathParams.map(p => `${p.name}: string`).join(', ');
// //       queryKey = `['${functionName.toLowerCase()}', ${pathParams.map(p => p.name).join(', ')}]`;
// //       enabled = `enabled: !!(${pathParams.map(p => p.name).join(' && ')}),\n    `;
// //     }
// //     if (queryParams.length > 0) {
// //       const queryParamType = `{ ${queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }`;
// //       params = params ? `${params}, params?: ${queryParamType}` : `params?: ${queryParamType}`;
// //       queryKey = pathParams.length > 0 
// //         ? `['${functionName.toLowerCase()}', ${pathParams.map(p => p.name).join(', ')}, params]`
// //         : `['${functionName.toLowerCase()}', params]`;
// //     }
// //     const queryFnParams = pathParams.length > 0 
// //       ? `() => ${apiFunctionName}(${pathParams.map(p => p.name).join(', ')}${queryParams.length > 0 ? ', params' : ''})`
// //       : queryParams.length > 0 
// //         ? `() => ${apiFunctionName}(params)`
// //         : apiFunctionName;
// //     const description = endpoint.description || endpoint.summary || '';
// //     const jsdoc = description ? `/**\n * ${description}\n */\n` : '';
// //     return `${jsdoc}export const ${hookName} = (${params}) => {\n  return useQuery({\n    queryKey: ${queryKey},\n    queryFn: ${queryFnParams},\n    ${enabled}\n  });\n};\n\n`;
// //   }
// //   private generateMutationHook(path: string, method: string, endpoint: SwaggerEndpoint, tag: string): string {
// //     const functionName = endpoint.operationId || 
// //       `${method}${path.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
// //     const hookName = `use${this.toPascalCase(functionName)}`;
// //     const apiFunctionName = this.toCamelCase(functionName);
// //     const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
// //     const hasRequestBody = !!endpoint.requestBody;
// //     const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : '';
// //     let mutationFnType = '';
// //     if (pathParams.length > 0 && hasRequestBody) {
// //       mutationFnType = `(data: ${requestBodyType} & { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`;
// //     } else if (pathParams.length > 0) {
// //       mutationFnType = `(data: { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`;
// //     } else if (hasRequestBody) {
// //       mutationFnType = `(data: ${requestBodyType})`;
// //     } else {
// //       mutationFnType = '()';
// //     }
// //     let mutationFnCall = '';
// //     if (pathParams.length > 0 && hasRequestBody) {
// //       const pathParamsList = pathParams.map(p => `data.${p.name}`).join(', ');
// //       mutationFnCall = `${apiFunctionName}(${pathParamsList}, data)`;
// //     } else if (pathParams.length > 0) {
// //       const pathParamsList = pathParams.map(p => `data.${p.name}`).join(', ');
// //       mutationFnCall = `${apiFunctionName}(${pathParamsList})`;
// //     } else if (hasRequestBody) {
// //       mutationFnCall = `${apiFunctionName}(data)`;
// //     } else {
// //       mutationFnCall = `${apiFunctionName}()`;
// //     }
// //     const description = endpoint.description || endpoint.summary || '';
// //     const jsdoc = description ? `/**\n * ${description}\n */\n` : '';
// //     return `${jsdoc}export const ${hookName} = () => {\n  const queryClient = useQueryClient();\n  \n  return useMutation({\n    mutationFn: ${mutationFnType} => ${mutationFnCall},\n    onSuccess: () => {\n      queryClient.invalidateQueries({ queryKey: ['${functionName.toLowerCase()}'] });\n    },\n  });\n};\n\n`;
// //   }
// //   private getResponseType(responses: { [key: string]: SwaggerResponse }): string {
// //     const successResponse = responses['200'] || responses['201'] || responses['default'];
// //     if (!successResponse) return 'any';
// //     const schema = successResponse.schema || 
// //                   successResponse.content?.['application/json']?.schema;
// //     if (!schema) return 'any';
// //     return this.generateTypeScript(schema, this.getSchemas());
// //   }
// //   private getRequestBodyType(requestBody: any): string {
// //     if (!requestBody) return '';
// //     const schema = requestBody.content?.['application/json']?.schema ||
// //                   requestBody.content?.['application/x-www-form-urlencoded']?.schema;
// //     if (!schema) return 'any';
// //     return this.generateTypeScript(schema, this.getSchemas());
// //   }
// //   private getParamType(param: SwaggerParameter): string {
// //     if (param.schema) {
// //       return this.generateTypeScript(param.schema, this.getSchemas());
// //     }
// //     switch (param.type) {
// //       case 'string': return 'string';
// //       case 'number':
// //       case 'integer': return 'number';
// //       case 'boolean': return 'boolean';
// //       default: return 'any';
// //     }
// //   }
// //   private groupEndpointsByTag(): Map<string, Array<{ path: string; method: string; endpoint: SwaggerEndpoint }>> {
// //     const grouped = new Map<string, Array<{ path: string; method: string; endpoint: SwaggerEndpoint }>>();
// //     for (const [path, methods] of Object.entries(this.spec.paths)) {
// //       for (const [method, endpoint] of Object.entries(methods)) {
// //         const tags = endpoint.tags || ['default'];
// //         for (const tag of tags) {
// //           if (!grouped.has(tag)) {
// //             grouped.set(tag, []);
// //           }
// //           grouped.get(tag)!.push({ path, method, endpoint });
// //         }
// //       }
// //     }
// //     return grouped;
// //   }
// //   private getTypesFromEndpoints(endpoints: Array<{ path: string; method: string; endpoint: SwaggerEndpoint }>): Set<string> {
// //     const types = new Set<string>();
// //     for (const { endpoint } of endpoints) {
// //       // Get response types
// //       const responseType = this.getResponseType(endpoint.responses);
// //       if (responseType !== 'any') {
// //         types.add(responseType);
// //       }
// //       // Get request body types
// //       if (endpoint.requestBody) {
// //         const requestBodyType = this.getRequestBodyType(endpoint.requestBody);
// //         if (requestBodyType !== 'any') {
// //           types.add(requestBodyType);
// //         }
// //       }
// //     }
// //     return types;
// //   }
// //   async generate(): Promise<void> {
// //     console.log('🚀 Generating files by tags...');
// //     const outputDir = this.config.outputDir;
// //     await fs.ensureDir(outputDir);
// //     const groupedEndpoints = this.groupEndpointsByTag();
// //     for (const [tag, endpoints] of groupedEndpoints) {
// //       const tagDir = path.join(outputDir, this.toKebabCase(tag));
// //       await fs.ensureDir(tagDir);
// //       // Get unique types used in this tag
// //       const usedTypes = this.getTypesFromEndpoints(endpoints);
// //       // Generate types for this tag
// //       let tagTypes = `// ${this.t.generatedTypes} - ${tag}\n\n`;
// //       const schemas = this.getSchemas();
// //       for (const typeName of usedTypes) {
// //         if (schemas[typeName]) {
// //           const schema = schemas[typeName];
// //           if (schema.properties || schema.type === 'object') {
// //             const properties = Object.entries(schema.properties || {})
// //               .map(([key, value]) => {
// //                 const optional = !schema.required?.includes(key) ? '?' : '';
// //                 const description = value.description ? `\n  /** ${value.description} */` : '';
// //                 return `${description}\n  ${key}${optional}: ${this.generateTypeScript(value, schemas)};`;
// //               })
// //               .join('\n');
// //             const description = schema.description ? `\n/** ${schema.description} */` : '';
// //             tagTypes += `${description}\nexport interface ${typeName} {\n${properties}\n}\n\n`;
// //           }
// //         }
// //       }
// //       // Generate schemas for this tag
// //       let tagSchemas = `// ${this.t.generatedSchemas} - ${tag}\nimport * as z from "zod";\n\n`;
// //       for (const typeName of usedTypes) {
// //         if (schemas[typeName]) {
// //           const schema = schemas[typeName];
// //           if (schema.properties || schema.type === 'object') {
// //             const schemaName = `${this.toCamelCase(typeName)}Schema`;
// //             const zodSchema = this.generateZodSchema(schema, schemas);
// //             tagSchemas += `export const ${schemaName} = ${zodSchema};\n\n`;
// //             tagSchemas += `export type ${this.toPascalCase(typeName)}Schema = z.infer<typeof ${schemaName}>;\n\n`;
// //           }
// //         }
// //       }
// //       // Generate API functions
// //       let apiContent = `// ${this.t.generatedApi} - ${tag}\nimport api from '@lib/axios';\nimport type {\n`;
// //       const typeImports = Array.from(usedTypes).map(type => `  ${type}`).join(',\n');
// //       apiContent += `${typeImports}\n} from './types';\n\n`;
// //       let hooksContent = `// ${this.t.generatedHooks} - ${tag}\nimport { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";\nimport {\n`;
// //       const importedFunctions: string[] = [];
// //       for (const { path: endpointPath, method, endpoint } of endpoints) {
// //         const functionName = endpoint.operationId || 
// //           `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
// //         apiContent += this.generateApiFunction(endpointPath, method, endpoint, tag);
// //         const camelCaseFunctionName = this.toCamelCase(functionName);
// //         importedFunctions.push(`  ${camelCaseFunctionName}`);
// //         if (method.toLowerCase() === 'get') {
// //           hooksContent += this.generateQueryHook(endpointPath, method, endpoint, tag);
// //         } else {
// //           hooksContent += this.generateMutationHook(endpointPath, method, endpoint, tag);
// //         }
// //       }
// //       hooksContent = hooksContent.replace('import {\n', `import {\n${importedFunctions.join(',\n')}\n} from './api';\n\n// ${this.t.queryHooks}\n\n`);
// //       // Write files
// //       await fs.writeFile(path.join(tagDir, 'types.ts'), tagTypes);
// //       await fs.writeFile(path.join(tagDir, 'schemas.ts'), tagSchemas);
// //       await fs.writeFile(path.join(tagDir, 'api.ts'), apiContent);
// //       await fs.writeFile(path.join(tagDir, 'hooks.ts'), hooksContent);
// //       console.log(`📁 Generated ${tag} files (types.ts, schemas.ts, api.ts, hooks.ts)`);
// //     }
// //     console.log(`✅ Files generated successfully in ${this.config.outputDir}`);
// //   }
// // }
// // async function loadSwaggerSpec(input: string): Promise<SwaggerSpec> {
// //   let content: string;
// //   if (input.startsWith('http://') || input.startsWith('https://')) {
// //     console.log(`📥 Fetching Swagger spec from ${input}...`);
// //     try {
// //       const response = await axios.get(input);
// //       content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
// //       if (content.trim().startsWith('<')) {
// //         console.log('⚠️  Received HTML instead of Swagger spec. Trying common endpoints...');
// //         const baseUrl = input.replace(/\/api\/?$/, '');
// //         const commonPaths = [
// //           '/api/swagger.json',
// //           '/api-docs',
// //           '/api/docs-json',
// //           '/swagger.json',
// //           '/swagger/v1/swagger.json',
// //           '/v1/swagger.json',
// //           '/docs/swagger.json'
// //         ];
// //         for (const path of commonPaths) {
// //           try {
// //             console.log(`🔍 Trying ${baseUrl}${path}...`);
// //             const tryResponse = await axios.get(`${baseUrl}${path}`);
// //             const tryContent = typeof tryResponse.data === 'string' ? tryResponse.data : JSON.stringify(tryResponse.data);
// //             if (!tryContent.trim().startsWith('<')) {
// //               console.log(`✅ Found Swagger spec at ${baseUrl}${path}`);
// //               content = tryContent;
// //               break;
// //             }
// //           } catch (e) {
// //             continue;
// //           }
// //         }
// //         if (content.trim().startsWith('<')) {
// //           throw new Error(`Could not find Swagger JSON/YAML spec. Please provide the direct URL to the specification.`);
// //         }
// //       }
// //     } catch (error) {
// //       //@ts-ignore
// //       throw new Error(`Failed to fetch Swagger spec: ${error.message}`);
// //     }
// //   } else {
// //     console.log(`📁 Loading Swagger spec from ${input}...`);
// //     content = await fs.readFile(input, 'utf-8');
// //   }
// //   try {
// //     const parsed = JSON.parse(content);
// //     if (!parsed.paths) {
// //       throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
// //     }
// //     return parsed;
// //   } catch (jsonError) {
// //     try {
// //       const parsed = yaml.load(content) as SwaggerSpec;
// //       if (!parsed.paths) {
// //         throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
// //       }
// //       return parsed;
// //     } catch (yamlError) {
// //       //@ts-ignore
// //       throw new Error(`Failed to parse Swagger spec: ${jsonError.message}`);
// //     }
// //   }
// // }
// // const program = new Command();
// // program
// //   .name('swagger-to-tanstack')
// //   .description('Generate TanStack Query hooks from Swagger/OpenAPI specification')
// //   .version('1.5.0');
// // program
// //   .command('generate')
// //   .description('Generate API functions and TanStack Query hooks organized by tags')
// //   .requiredOption('-i, --input <input>', 'Swagger spec file path or URL')
// //   .option('-o, --output <o>', 'Output directory', './src/api')
// //   .option('-b, --baseUrl <baseUrl>', 'API base URL', '')
// //   .option('-l, --language <language>', 'Language for comments (en|fr)', 'en')
// //   .action(async (options) => {
// //     try {
// //       if (!['en', 'fr'].includes(options.language)) {
// //         throw new Error('Language must be "en" or "fr"');
// //       }
// //       const config: GeneratorConfig = {
// //         outputDir: options.output,
// //         baseUrl: options.baseUrl,
// //         language: options.language as 'en' | 'fr',
// //       };
// //       const spec = await loadSwaggerSpec(options.input);
// //       const generator = new SwaggerToTanStackGenerator(spec, config);
// //       await generator.generate();
// //     } catch (error) {
// //       //@ts-ignore
// //       console.error('❌ Error:', error.message);
// //       process.exit(1);
// //     }
// //   });
// // program.parse();
// import { Command } from 'commander';
// import fs from 'fs-extra';
// import path from 'path';
// import axios from 'axios';
// import yaml from 'js-yaml';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// interface SwaggerProperty {
//   type?: string;
//   format?: string;
//   items?: SwaggerProperty;
//   $ref?: string;
//   enum?: string[];
//   properties?: { [key: string]: SwaggerProperty };
//   required?: string[];
//   description?: string;
//   example?: any;
//   minimum?: number;
//   maximum?: number;
//   minLength?: number;
//   maxLength?: number;
//   pattern?: string;
// }
// interface SwaggerParameter {
//   name: string;
//   in: 'query' | 'path' | 'body' | 'header' | 'formData';
//   required?: boolean;
//   type?: string;
//   schema?: SwaggerProperty;
//   description?: string;
// }
// interface SwaggerResponse {
//   description: string;
//   schema?: SwaggerProperty;
//   content?: {
//     [mediaType: string]: {
//       schema: SwaggerProperty;
//     };
//   };
// }
// interface SwaggerEndpoint {
//   tags?: string[];
//   summary?: string;
//   description?: string;
//   operationId?: string;
//   parameters?: SwaggerParameter[];
//   requestBody?: {
//     content: {
//       [mediaType: string]: {
//         schema: SwaggerProperty;
//       };
//     };
//     required?: boolean;
//   };
//   responses: {
//     [statusCode: string]: SwaggerResponse;
//   };
// }
// interface SwaggerSpec {
//   swagger?: string;
//   openapi?: string;
//   info?: {
//     title: string;
//     version: string;
//   };
//   servers?: Array<{ url: string; description?: string }>;
//   host?: string;
//   basePath?: string;
//   schemes?: string[];
//   paths: {
//     [path: string]: {
//       [method: string]: SwaggerEndpoint;
//     };
//   };
//   components?: {
//     schemas?: {
//       [name: string]: SwaggerProperty;
//     };
//   };
//   definitions?: {
//     [name: string]: SwaggerProperty;
//   };
//   tags?: Array<{
//     name: string;
//     description?: string;
//   }>;
// }
// interface GeneratorConfig {
//   outputDir: string;
//   baseUrl: string;
//   language: 'en' | 'fr';
// }
// const translations = {
//   en: {
//     generatedTypes: 'Auto-generated TypeScript types from Swagger/OpenAPI spec',
//     generatedSchemas: 'Auto-generated Zod schemas from Swagger/OpenAPI spec',
//     generatedApi: 'Auto-generated API functions from Swagger/OpenAPI spec',
//     generatedHooks: 'Auto-generated React Query hooks from Swagger/OpenAPI spec',
//     queryHooks: 'Query Hooks',
//     mutationHooks: 'Mutation Hooks',
//     getAll: 'Get all',
//     getById: 'Get by ID',
//     create: 'Create',
//     update: 'Update',
//     delete: 'Delete',
//     tooShort: 'Too short',
//     tooLong: 'Too long',
//     invalidFormat: 'Invalid format',
//     invalidEmail: 'Invalid email',
//     invalidUuid: 'Invalid UUID',
//     required: 'Required',
//   },
//   fr: {
//     generatedTypes: 'Types TypeScript auto-générés depuis la spécification Swagger/OpenAPI',
//     generatedSchemas: 'Schémas Zod auto-générés depuis la spécification Swagger/OpenAPI',
//     generatedApi: 'Fonctions API auto-générées depuis la spécification Swagger/OpenAPI',
//     generatedHooks: 'Hooks React Query auto-générés depuis la spécification Swagger/OpenAPI',
//     queryHooks: 'Hooks de Requête',
//     mutationHooks: 'Hooks de Mutation',
//     getAll: 'Récupérer tout',
//     getById: 'Récupérer par ID',
//     create: 'Créer',
//     update: 'Mettre à jour',
//     delete: 'Supprimer',
//     tooShort: 'Trop court',
//     tooLong: 'Trop long',
//     invalidFormat: 'Format invalide',
//     invalidEmail: 'Email invalide',
//     invalidUuid: 'UUID invalide',
//     required: 'Requis',
//   },
// };
// class SwaggerToTanStackGenerator {
//   private spec: SwaggerSpec;
//   private config: GeneratorConfig;
//   private t: typeof translations.en;
//   constructor(spec: SwaggerSpec, config: GeneratorConfig) {
//     this.spec = spec;
//     this.config = config;
//     this.t = translations[config.language];
//   }
//   private capitalize(str: string): string {
//     return str.charAt(0).toUpperCase() + str.slice(1);
//   }
//   private toCamelCase(str: string): string {
//     return str
//       .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
//       .replace(/^(.)/, (char) => char.toLowerCase());
//   }
//   private toPascalCase(str: string): string {
//     return this.capitalize(this.toCamelCase(str));
//   }
//   private toKebabCase(str: string): string {
//     return str
//       .replace(/([a-z])([A-Z])/g, '$1-$2')
//       .replace(/[\s_]+/g, '-')
//       .toLowerCase();
//   }
//   private extractRefName(ref: string): string {
//     return ref.split('/').pop() || '';
//   }
//   private getSchemas() {
//     return this.spec.components?.schemas || this.spec.definitions || {};
//   }
//   private generateTypeScript(property: SwaggerProperty, schemas: any): string {
//     if (property.$ref) {
//       return this.extractRefName(property.$ref);
//     }
//     switch (property.type) {
//       case 'string':
//         if (property.enum) {
//           return property.enum.map(e => `'${e}'`).join(' | ');
//         }
//         return 'string';
//       case 'number':
//       case 'integer':
//         return 'number';
//       case 'boolean':
//         return 'boolean';
//       case 'array':
//         if (property.items) {
//           return `${this.generateTypeScript(property.items, schemas)}[]`;
//         }
//         return 'any[]';
//       case 'object':
//         if (property.properties) {
//           const props = Object.entries(property.properties)
//             .map(([key, value]) => {
//               const optional = !property.required?.includes(key) ? '?' : '';
//               const description = value.description ? `\n  /** ${value.description} */` : '';
//               return `${description}\n  ${key}${optional}: ${this.generateTypeScript(value, schemas)};`;
//             })
//             .join('\n');
//           return `{\n${props}\n}`;
//         }
//         return 'any';
//       default:
//         return 'any';
//     }
//   }
//   private generateZodSchema(property: SwaggerProperty, schemas: any): string {
//     if (property.$ref) {
//       const refName = this.extractRefName(property.$ref);
//       return `${this.toCamelCase(refName)}Schema`;
//     }
//     switch (property.type) {
//       case 'string':
//         let zodString = 'z.string()';
//         if (property.minLength) zodString += `.min(${property.minLength}, { message: "${this.t.tooShort}" })`;
//         if (property.maxLength) zodString += `.max(${property.maxLength}, { message: "${this.t.tooLong}" })`;
//         if (property.pattern) zodString += `.regex(/${property.pattern}/, { message: "${this.t.invalidFormat}" })`;
//         if (property.enum) {
//           return `z.enum([${property.enum.map(e => `"${e}"`).join(', ')}])`;
//         }
//         if (property.format === 'email') zodString += `.email({ message: "${this.t.invalidEmail}" })`;
//         if (property.format === 'uuid') zodString += `.uuid({ message: "${this.t.invalidUuid}" })`;
//         return zodString;
//       case 'number':
//       case 'integer':
//         let zodNumber = property.type === 'integer' ? 'z.number().int()' : 'z.number()';
//         if (property.minimum !== undefined) zodNumber += `.min(${property.minimum})`;
//         if (property.maximum !== undefined) zodNumber += `.max(${property.maximum})`;
//         return zodNumber;
//       case 'boolean':
//         return 'z.boolean()';
//       case 'array':
//         if (property.items) {
//           return `z.array(${this.generateZodSchema(property.items, schemas)})`;
//         }
//         return 'z.array(z.any())';
//       case 'object':
//         if (property.properties) {
//           const props = Object.entries(property.properties)
//             .map(([key, value]) => {
//               let zodField = this.generateZodSchema(value, schemas);
//               if (!property.required?.includes(key)) {
//                 zodField += '.optional().nullable()';
//               }
//               return `  ${key}: ${zodField},`;
//             })
//             .join('\n');
//           return `z.object({\n${props}\n})`;
//         }
//         return 'z.object({})';
//       default:
//         return 'z.any()';
//     }
//   }
//   private generateQueryKeys(): string {
//     const groupedEndpoints = this.groupEndpointsByTag();
//     let queryKeys = `// ${this.config.language === 'fr' ? 'Clés de requête centralisées' : 'Central place to define all query keys'}\nexport const queryKeys = {\n`;
//     for (const [tag, endpoints] of groupedEndpoints) {
//       // Nettoyer le nom du tag pour éviter les espaces et caractères spéciaux
//       const tagCamelCase = this.toCamelCase(tag.replace(/[^a-zA-Z0-9]/g, ''));
//       queryKeys += `  // ${this.capitalize(tag)}\n`;
//       queryKeys += `  ${tagCamelCase}: {\n`;
//       queryKeys += `    all: ["${tagCamelCase}"],\n`;
//       queryKeys += `    lists: () => [...queryKeys.${tagCamelCase}.all, "list"],\n`;
//       queryKeys += `    list: (filters: any) => [...queryKeys.${tagCamelCase}.lists(), filters],\n`;
//       queryKeys += `    details: () => [...queryKeys.${tagCamelCase}.all, "detail"],\n`;
//       queryKeys += `    detail: (id: string) => [...queryKeys.${tagCamelCase}.details(), id],\n`;
//       queryKeys += `  },\n`;
//     }
//     queryKeys += `};\n`;
//     return queryKeys;
//   }
//   private generateApiFunction(path: string, method: string, endpoint: SwaggerEndpoint, tag: string): string {
//     const functionName = endpoint.operationId || 
//       `${method}${path.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
//     const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
//     const queryParams = endpoint.parameters?.filter(p => p.in === 'query') || [];
//     const hasRequestBody = !!endpoint.requestBody;
//     const responseType = this.getResponseType(endpoint.responses);
//     const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : '';
//     let params = '';
//     let apiCall = '';
//     let urlPath = path;
//     if (pathParams.length > 0) {
//       pathParams.forEach(param => {
//         params += `${param.name}: string, `;
//         urlPath = urlPath.replace(`{${param.name}}`, `\${${param.name}}`);
//       });
//     }
//     if (hasRequestBody) {
//       params += `payload: ${requestBodyType}, `;
//     }
//     if (queryParams.length > 0) {
//       params += `params?: { ${queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }, `;
//     }
//     params = params.replace(/, $/, '');
//     switch (method.toLowerCase()) {
//       case 'get':
//         apiCall = queryParams.length > 0 
//           ? `api.get<${responseType}>(\`${urlPath}\`, { params })`
//           : `api.get<${responseType}>(\`${urlPath}\`)`;
//         break;
//       case 'post':
//         if (hasRequestBody) {
//           apiCall = queryParams.length > 0
//             ? `api.post<${responseType}>(\`${urlPath}\`, payload, { params })`
//             : `api.post<${responseType}>(\`${urlPath}\`, payload)`;
//         } else {
//           apiCall = `api.post<${responseType}>(\`${urlPath}\`)`;
//         }
//         break;
//       case 'put':
//         if (hasRequestBody) {
//           apiCall = `api.put<${responseType}>(\`${urlPath}\`, payload)`;
//         } else {
//           apiCall = `api.put<${responseType}>(\`${urlPath}\`)`;
//         }
//         break;
//       case 'patch':
//         if (hasRequestBody) {
//           apiCall = `api.patch<${responseType}>(\`${urlPath}\`, payload)`;
//         } else {
//           apiCall = `api.patch<${responseType}>(\`${urlPath}\`)`;
//         }
//         break;
//       case 'delete':
//         if (hasRequestBody) {
//           apiCall = `api.delete<${responseType}>(\`${urlPath}\`, { data: payload })`;
//         } else {
//           apiCall = `api.delete<${responseType}>(\`${urlPath}\`)`;
//         }
//         break;
//     }
//     const description = endpoint.description || endpoint.summary || '';
//     const jsdoc = description ? `/**\n * ${description}\n */\n` : '';
//     return `${jsdoc}export const ${this.toCamelCase(functionName)} = async (${params}) => {\n  const { data } = await ${apiCall};\n  return data;\n};\n\n`;
//   }
//   private generateQueryHook(path: string, method: string, endpoint: SwaggerEndpoint, tag: string): string {
//     const functionName = endpoint.operationId || 
//       `${method}${path.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
//     const hookName = `use${this.toPascalCase(functionName)}`;
//     const apiFunctionName = this.toCamelCase(functionName);
//     // Nettoyer le nom du tag
//     const tagCamelCase = this.toCamelCase(tag.replace(/[^a-zA-Z0-9]/g, ''));
//     const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
//     const queryParams = endpoint.parameters?.filter(p => p.in === 'query') || [];
//     let params = '';
//     let queryKey = '';
//     let enabled = '';
//     if (pathParams.length > 0) {
//       params = pathParams.map(p => `${p.name}: string`).join(', ');
//       queryKey = `queryKeys.${tagCamelCase}.detail(${pathParams[0].name})`;
//       enabled = `enabled: !!(${pathParams.map(p => p.name).join(' && ')}),\n    `;
//     } else if (queryParams.length > 0) {
//       const queryParamType = `{ ${queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }`;
//       params = `params?: ${queryParamType}`;
//       queryKey = `queryKeys.${tagCamelCase}.list(params)`;
//     } else {
//       queryKey = `queryKeys.${tagCamelCase}.lists()`;
//     }
//     const queryFnParams = pathParams.length > 0 
//       ? `() => ${apiFunctionName}(${pathParams.map(p => p.name).join(', ')}${queryParams.length > 0 ? ', params' : ''})`
//       : queryParams.length > 0 
//         ? `() => ${apiFunctionName}(params)`
//         : apiFunctionName;
//     const description = endpoint.description || endpoint.summary || '';
//     const jsdoc = description ? `/**\n * ${description}\n */\n` : '';
//     return `${jsdoc}export const ${hookName} = (${params}) => {\n  return useQuery({\n    queryKey: ${queryKey},\n    queryFn: ${queryFnParams},\n    ${enabled}\n  });\n};\n\n`;
//   }
//   private generateMutationHook(path: string, method: string, endpoint: SwaggerEndpoint, tag: string): string {
//     const functionName = endpoint.operationId || 
//       `${method}${path.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
//     const hookName = `use${this.toPascalCase(functionName)}`;
//     const apiFunctionName = this.toCamelCase(functionName);
//     // Nettoyer le nom du tag
//     const tagCamelCase = this.toCamelCase(tag.replace(/[^a-zA-Z0-9]/g, ''));
//     const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
//     const hasRequestBody = !!endpoint.requestBody;
//     const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : '';
//     let mutationFnType = '';
//     if (pathParams.length > 0 && hasRequestBody) {
//       mutationFnType = `(payload: ${requestBodyType} & { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`;
//     } else if (pathParams.length > 0) {
//       mutationFnType = `(payload: { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`;
//     } else if (hasRequestBody) {
//       mutationFnType = `(payload: ${requestBodyType})`;
//     } else {
//       mutationFnType = '()';
//     }
//     let mutationFnCall = '';
//     if (pathParams.length > 0 && hasRequestBody) {
//       const pathParamsList = pathParams.map(p => `payload.${p.name}`).join(', ');
//       mutationFnCall = `${apiFunctionName}(${pathParamsList}, payload)`;
//     } else if (pathParams.length > 0) {
//       const pathParamsList = pathParams.map(p => `payload.${p.name}`).join(', ');
//       mutationFnCall = `${apiFunctionName}(${pathParamsList})`;
//     } else if (hasRequestBody) {
//       mutationFnCall = `${apiFunctionName}(payload)`;
//     } else {
//       mutationFnCall = `${apiFunctionName}()`;
//     }
//     let invalidateQueries = '';
//     if (method.toLowerCase() === 'delete') {
//       invalidateQueries = `queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.all });\n      queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.lists() });`;
//     } else if (method.toLowerCase() === 'post') {
//       invalidateQueries = `queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.lists() });`;
//     } else {
//       invalidateQueries = `queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.all });\n      queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.lists() });`;
//     }
//     const description = endpoint.description || endpoint.summary || '';
//     const jsdoc = description ? `/**\n * ${description}\n */\n` : '';
//     return `${jsdoc}export const ${hookName} = () => {\n  const queryClient = useQueryClient();\n  \n  return useMutation({\n    mutationFn: ${mutationFnType} => ${mutationFnCall},\n    onSuccess: () => {\n      ${invalidateQueries}\n    },\n  });\n};\n\n`;
//   }
//   private getResponseType(responses: { [key: string]: SwaggerResponse }): string {
//     const successResponse = responses['200'] || responses['201'] || responses['default'];
//     if (!successResponse) return 'any';
//     const schema = successResponse.schema || 
//                   successResponse.content?.['application/json']?.schema;
//     if (!schema) return 'any';
//     return this.generateTypeScript(schema, this.getSchemas());
//   }
//   private getRequestBodyType(requestBody: any): string {
//     if (!requestBody) return '';
//     const schema = requestBody.content?.['application/json']?.schema ||
//                   requestBody.content?.['application/x-www-form-urlencoded']?.schema;
//     if (!schema) return 'any';
//     return this.generateTypeScript(schema, this.getSchemas());
//   }
//   private getParamType(param: SwaggerParameter): string {
//     if (param.schema) {
//       return this.generateTypeScript(param.schema, this.getSchemas());
//     }
//     switch (param.type) {
//       case 'string': return 'string';
//       case 'number':
//       case 'integer': return 'number';
//       case 'boolean': return 'boolean';
//       default: return 'any';
//     }
//   }
//   private groupEndpointsByTag(): Map<string, Array<{ path: string; method: string; endpoint: SwaggerEndpoint }>> {
//     const grouped = new Map<string, Array<{ path: string; method: string; endpoint: SwaggerEndpoint }>>();
//     for (const [path, methods] of Object.entries(this.spec.paths)) {
//       for (const [method, endpoint] of Object.entries(methods)) {
//         const tags = endpoint.tags || ['default'];
//         for (const tag of tags) {
//           if (!grouped.has(tag)) {
//             grouped.set(tag, []);
//           }
//           grouped.get(tag)!.push({ path, method, endpoint });
//         }
//       }
//     }
//     return grouped;
//   }
//   private getTypesFromEndpoints(endpoints: Array<{ path: string; method: string; endpoint: SwaggerEndpoint }>): Set<string> {
//     const types = new Set<string>();
//     for (const { endpoint } of endpoints) {
//       const responseType = this.getResponseType(endpoint.responses);
//       if (responseType !== 'any') {
//         types.add(responseType);
//       }
//       if (endpoint.requestBody) {
//         const requestBodyType = this.getRequestBodyType(endpoint.requestBody);
//         if (requestBodyType !== 'any') {
//           types.add(requestBodyType);
//         }
//       }
//     }
//     return types;
//   }
//   async generate(): Promise<void> {
//     console.log('🚀 Generating files by tags...');
//     const outputDir = this.config.outputDir;
//     await fs.ensureDir(outputDir);
//     console.log('📝 Generating query keys...');
//     const queryKeysPath = path.join(process.cwd(), 'lib', 'query-keys.ts');
//     await fs.ensureDir(path.dirname(queryKeysPath));
//     await fs.writeFile(queryKeysPath, this.generateQueryKeys());
//     // Generate lib/axios.ts if not exists
//     const axiosPath = path.join(process.cwd(), 'lib', 'axios.ts');
//     if (!await fs.pathExists(axiosPath)) {
//       const axiosConfig = `// Auto-generated Axios configuration
// import axios from 'axios';
// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
// // Request interceptor for adding auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token') || localStorage.getItem('authToken');
//     if (token) {
//       config.headers.Authorization = \`Bearer \${token}\`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );
// // Response interceptor for handling errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('authToken');
//       // Redirect to login page if needed
//       // window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );
// export default api;
// `;
//       await fs.writeFile(axiosPath, axiosConfig);
//       console.log('📝 Generated lib/axios.ts');
//     }
//     const groupedEndpoints = this.groupEndpointsByTag();
//     for (const [tag, endpoints] of groupedEndpoints) {
//       const tagDir = path.join(outputDir, this.toKebabCase(tag));
//       await fs.ensureDir(tagDir);
//       const usedTypes = this.getTypesFromEndpoints(endpoints);
//       let tagTypes = `// ${this.t.generatedTypes} - ${tag}\n\n`;
//       const schemas = this.getSchemas();
//       for (const typeName of usedTypes) {
//         if (schemas[typeName]) {
//           const schema = schemas[typeName];
//           if (schema.properties || schema.type === 'object') {
//             const properties = Object.entries(schema.properties || {})
//               .map(([key, value]) => {
//                 const optional = !schema.required?.includes(key) ? '?' : '';
//                 const description = value.description ? `\n  /** ${value.description} */` : '';
//                 return `${description}\n  ${key}${optional}: ${this.generateTypeScript(value, schemas)};`;
//               })
//               .join('\n');
//             const description = schema.description ? `\n/** ${schema.description} */` : '';
//             tagTypes += `${description}\nexport interface ${typeName} {\n${properties}\n}\n\n`;
//           }
//         }
//       }
//       let tagSchemas = `// ${this.t.generatedSchemas} - ${tag}\nimport * as z from "zod";\n\n`;
//       for (const typeName of usedTypes) {
//         if (schemas[typeName]) {
//           const schema = schemas[typeName];
//           if (schema.properties || schema.type === 'object') {
//             const schemaName = `${this.toCamelCase(typeName)}Schema`;
//             const zodSchema = this.generateZodSchema(schema, schemas);
//             tagSchemas += `export const ${schemaName} = ${zodSchema};\n\n`;
//             tagSchemas += `export type ${this.toPascalCase(typeName)}Schema = z.infer<typeof ${schemaName}>;\n\n`;
//           }
//         }
//       }
//       let apiContent = `// ${this.t.generatedApi} - ${tag}\nimport api from '@lib/axios';\nimport type {\n`;
//       const typeImports = Array.from(usedTypes).map(type => `  ${type}`).join(',\n');
//       apiContent += `${typeImports}\n} from './types';\n\n`;
//       let hooksContent = `// ${this.t.generatedHooks} - ${tag}\n`;
//       hooksContent += `import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";\n`;
//       hooksContent += `import { queryKeys } from '@lib/query-keys';\n`;
//       hooksContent += `import type {\n${typeImports}\n} from './types';\n`;
//       hooksContent += `import {\n`;
//       const importedFunctions: string[] = [];
//       for (const { path: endpointPath, method, endpoint } of endpoints) {
//         const functionName = endpoint.operationId || 
//           `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
//         apiContent += this.generateApiFunction(endpointPath, method, endpoint, tag);
//         const camelCaseFunctionName = this.toCamelCase(functionName);
//         importedFunctions.push(`  ${camelCaseFunctionName}`);
//         if (method.toLowerCase() === 'get') {
//           hooksContent += this.generateQueryHook(endpointPath, method, endpoint, tag);
//         } else {
//           hooksContent += this.generateMutationHook(endpointPath, method, endpoint, tag);
//         }
//       }
//       hooksContent = hooksContent.replace('import {\n', `import {\n${importedFunctions.join(',\n')}\n} from './api';\n\n// ${this.t.queryHooks}\n\n`);
//       await fs.writeFile(path.join(tagDir, 'types.ts'), tagTypes);
//       await fs.writeFile(path.join(tagDir, 'schemas.ts'), tagSchemas);
//       await fs.writeFile(path.join(tagDir, 'api.ts'), apiContent);
//       await fs.writeFile(path.join(tagDir, 'hooks.ts'), hooksContent);
//       console.log(`📁 Generated ${tag} files (types.ts, schemas.ts, api.ts, hooks.ts)`);
//     }
//     console.log(`✅ Files generated successfully in ${this.config.outputDir}`);
//     console.log(`✅ Query keys generated in lib/query-keys.ts`);
//   }
// }
// async function loadSwaggerSpec(input: string): Promise<SwaggerSpec> {
//   let content: string;
//   if (input.startsWith('http://') || input.startsWith('https://')) {
//     console.log(`📥 Fetching Swagger spec from ${input}...`);
//     try {
//       const response = await axios.get(input);
//       content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
//       if (content.trim().startsWith('<')) {
//         console.log('⚠️  Received HTML instead of Swagger spec. Trying common endpoints...');
//         const baseUrl = input.replace(/\/api\/?$/, '');
//         const commonPaths = [
//           '/api/swagger.json',
//           '/api-docs',
//           '/api/docs-json',
//           '/swagger.json',
//           '/swagger/v1/swagger.json',
//           '/v1/swagger.json',
//           '/docs/swagger.json'
//         ];
//         for (const path of commonPaths) {
//           try {
//             console.log(`🔍 Trying ${baseUrl}${path}...`);
//             const tryResponse = await axios.get(`${baseUrl}${path}`);
//             const tryContent = typeof tryResponse.data === 'string' ? tryResponse.data : JSON.stringify(tryResponse.data);
//             if (!tryContent.trim().startsWith('<')) {
//               console.log(`✅ Found Swagger spec at ${baseUrl}${path}`);
//               content = tryContent;
//               break;
//             }
//           } catch (e) {
//             continue;
//           }
//         }
//         if (content.trim().startsWith('<')) {
//           throw new Error(`Could not find Swagger JSON/YAML spec. Please provide the direct URL to the specification.`);
//         }
//       }
//     } catch (error: any) {
//       throw new Error(`Failed to fetch Swagger spec: ${error?.message || 'Unknown error'}`);
//     }
//   } else {
//     console.log(`📁 Loading Swagger spec from ${input}...`);
//     content = await fs.readFile(input, 'utf-8');
//   }
//   try {
//     const parsed = JSON.parse(content);
//     if (!parsed.paths) {
//       throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
//     }
//     return parsed;
//   } catch (jsonError) {
//     try {
//       const parsed = yaml.load(content) as SwaggerSpec;
//       if (!parsed.paths) {
//         throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
//       }
//       return parsed;
//     } catch (yamlError) {
//       //@ts-ignore
//       throw new Error(`Failed to parse Swagger spec: ${jsonError.message}`);
//     }
//   }
// }
// const program = new Command();
// program
//   .name('swagger-to-tanstack')
//   .description('Generate TanStack Query hooks from Swagger/OpenAPI specification')
//   .version('1.5.0');
// program
//   .command('generate')
//   .description('Generate API functions and TanStack Query hooks organized by tags')
//   .requiredOption('-i, --input <input>', 'Swagger spec file path or URL')
//   .option('-o, --output <o>', 'Output directory', './src/api')
//   .option('-b, --baseUrl <baseUrl>', 'API base URL', '')
//   .option('-l, --language <language>', 'Language for comments (en|fr)', 'en')
//   .action(async (options) => {
//     try {
//       if (!['en', 'fr'].includes(options.language)) {
//         throw new Error('Language must be "en" or "fr"');
//       }
//       const config: GeneratorConfig = {
//         outputDir: options.output,
//         baseUrl: options.baseUrl,
//         language: options.language as 'en' | 'fr',
//       };
//       const spec = await loadSwaggerSpec(options.input);
//       const generator = new SwaggerToTanStackGenerator(spec, config);
//       await generator.generate();
//     } catch (error) {
//        //@ts-ignore
//       console.error('❌ Error:', error.message);
//       process.exit(1);
//     }
//   });
// program.parse();
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as readline from 'readline';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const translations = {
    en: {
        generatedTypes: 'Auto-generated TypeScript types from Swagger/OpenAPI spec',
        generatedSchemas: 'Auto-generated Zod schemas from Swagger/OpenAPI spec',
        generatedApi: 'Auto-generated API functions from Swagger/OpenAPI spec',
        generatedHooks: 'Auto-generated React Query hooks from Swagger/OpenAPI spec',
        generatedFakeData: 'Auto-generated fake data for testing',
        queryHooks: 'Query Hooks',
        mutationHooks: 'Mutation Hooks',
        tooShort: 'Too short',
        tooLong: 'Too long',
        invalidFormat: 'Invalid format',
        invalidEmail: 'Invalid email',
        invalidUuid: 'Invalid UUID',
    },
    fr: {
        generatedTypes: 'Types TypeScript auto-générés depuis la spécification Swagger/OpenAPI',
        generatedSchemas: 'Schémas Zod auto-générés depuis la spécification Swagger/OpenAPI',
        generatedApi: 'Fonctions API auto-générées depuis la spécification Swagger/OpenAPI',
        generatedHooks: 'Hooks React Query auto-générés depuis la spécification Swagger/OpenAPI',
        generatedFakeData: 'Données de test auto-générées',
        queryHooks: 'Hooks de Requête',
        mutationHooks: 'Hooks de Mutation',
        tooShort: 'Trop court',
        tooLong: 'Trop long',
        invalidFormat: 'Format invalide',
        invalidEmail: 'Email invalide',
        invalidUuid: 'UUID invalide',
    },
};
function createAxiosInstance(credentials) {
    const instance = axios.create({
        timeout: 10000,
    });
    if (credentials) {
        instance.interceptors.request.use((config) => {
            const token = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
            config.headers.Authorization = `Basic ${token}`;
            return config;
        });
    }
    return instance;
}
async function promptForCredentials() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question('Username: ', (username) => {
            rl.question('Password: ', (password) => {
                rl.close();
                resolve({ username, password });
            });
        });
    });
}
class SwaggerToTanStackGenerator {
    spec;
    config;
    t;
    constructor(spec, config) {
        this.spec = spec;
        this.config = config;
        this.t = translations[config.language];
    }
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    toCamelCase(str) {
        return str
            .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
            .replace(/^(.)/, (char) => char.toLowerCase());
    }
    toPascalCase(str) {
        return this.capitalize(this.toCamelCase(str));
    }
    toKebabCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase();
    }
    extractRefName(ref) {
        return ref.split('/').pop() || '';
    }
    getSchemas() {
        return this.spec.components?.schemas || this.spec.definitions || {};
    }
    generateTypeScript(property, schemas) {
        if (property.$ref) {
            return this.extractRefName(property.$ref);
        }
        switch (property.type) {
            case 'string':
                if (property.enum) {
                    return property.enum.map(e => `'${e}'`).join(' | ');
                }
                return 'string';
            case 'number':
            case 'integer':
                return 'number';
            case 'boolean':
                return 'boolean';
            case 'array':
                if (property.items) {
                    return `${this.generateTypeScript(property.items, schemas)}[]`;
                }
                return 'any[]';
            case 'object':
                if (property.properties) {
                    const props = Object.entries(property.properties)
                        .map(([key, value]) => {
                        const optional = !property.required?.includes(key) ? '?' : '';
                        const description = value.description ? `\n  /** ${value.description} */` : '';
                        return `${description}\n  ${key}${optional}: ${this.generateTypeScript(value, schemas)};`;
                    })
                        .join('\n');
                    return `{\n${props}\n}`;
                }
                return 'any';
            default:
                return 'any';
        }
    }
    generateZodSchema(property, schemas) {
        if (property.$ref) {
            const refName = this.extractRefName(property.$ref);
            return `${this.toCamelCase(refName)}Schema`;
        }
        switch (property.type) {
            case 'string':
                let zodString = 'z.string()';
                if (property.minLength)
                    zodString += `.min(${property.minLength}, { message: "${this.t.tooShort}" })`;
                if (property.maxLength)
                    zodString += `.max(${property.maxLength}, { message: "${this.t.tooLong}" })`;
                if (property.pattern)
                    zodString += `.regex(/${property.pattern}/, { message: "${this.t.invalidFormat}" })`;
                if (property.enum) {
                    return `z.enum([${property.enum.map(e => `"${e}"`).join(', ')}])`;
                }
                if (property.format === 'email')
                    zodString += `.email({ message: "${this.t.invalidEmail}" })`;
                if (property.format === 'uuid')
                    zodString += `.uuid({ message: "${this.t.invalidUuid}" })`;
                return zodString;
            case 'number':
            case 'integer':
                let zodNumber = property.type === 'integer' ? 'z.number().int()' : 'z.number()';
                if (property.minimum !== undefined)
                    zodNumber += `.min(${property.minimum})`;
                if (property.maximum !== undefined)
                    zodNumber += `.max(${property.maximum})`;
                return zodNumber;
            case 'boolean':
                return 'z.boolean()';
            case 'array':
                if (property.items) {
                    return `z.array(${this.generateZodSchema(property.items, schemas)})`;
                }
                return 'z.array(z.any())';
            case 'object':
                if (property.properties) {
                    const props = Object.entries(property.properties)
                        .map(([key, value]) => {
                        let zodField = this.generateZodSchema(value, schemas);
                        if (!property.required?.includes(key)) {
                            zodField += '.optional().nullable()';
                        }
                        return `  ${key}: ${zodField},`;
                    })
                        .join('\n');
                    return `z.object({\n${props}\n})`;
                }
                return 'z.object({})';
            default:
                return 'z.any()';
        }
    }
    generateFakeValue(property, schemas, fieldName) {
        if (property.$ref) {
            const refName = this.extractRefName(property.$ref);
            return `fake${refName}`;
        }
        if (property.example !== undefined) {
            return JSON.stringify(property.example);
        }
        switch (property.type) {
            case 'string':
                if (property.enum) {
                    return `'${property.enum[0]}'`;
                }
                if (property.format === 'email')
                    return `'${fieldName}@example.com'`;
                if (property.format === 'uuid')
                    return `'${fieldName}-uuid-1234'`;
                if (property.format === 'date-time')
                    return `new Date().toISOString()`;
                if (property.format === 'date')
                    return `new Date().toISOString().split('T')[0]`;
                return `'Sample ${fieldName}'`;
            case 'number':
                return String(property.minimum !== undefined ? property.minimum : 0);
            case 'integer':
                return String(property.minimum !== undefined ? property.minimum : 1);
            case 'boolean':
                return 'true';
            case 'array':
                if (property.items) {
                    const itemValue = this.generateFakeValue(property.items, schemas, fieldName);
                    return `[${itemValue}]`;
                }
                return '[]';
            case 'object':
                if (property.properties) {
                    const props = Object.entries(property.properties)
                        .map(([key, value]) => {
                        return `${key}: ${this.generateFakeValue(value, schemas, key)}`;
                    })
                        .join(', ');
                    return `{ ${props} }`;
                }
                return '{}';
            default:
                return 'null';
        }
    }
    generateFakeData(typeName, schema, schemas) {
        if (!schema.properties)
            return '';
        let fakeData = `export const fake${typeName} = {\n`;
        for (const [key, value] of Object.entries(schema.properties)) {
            fakeData += `  ${key}: ${this.generateFakeValue(value, schemas, key)},\n`;
        }
        fakeData += `};\n\n`;
        fakeData += `export const fake${typeName}List = [\n  fake${typeName},\n  { ...fake${typeName}, id: '2' },\n  { ...fake${typeName}, id: '3' },\n];\n\n`;
        return fakeData;
    }
    generateQueryKeys() {
        const groupedEndpoints = this.groupEndpointsByTag();
        let queryKeys = `// ${this.config.language === 'fr' ? 'Clés de requête centralisées' : 'Central place to define all query keys'}\nexport const queryKeys = {\n`;
        for (const [tag, endpoints] of groupedEndpoints) {
            const tagCamelCase = this.toCamelCase(tag.replace(/[^a-zA-Z0-9]/g, ''));
            queryKeys += `  // ${this.capitalize(tag)}\n`;
            queryKeys += `  ${tagCamelCase}: {\n`;
            queryKeys += `    all: ["${tagCamelCase}"],\n`;
            queryKeys += `    lists: () => [...queryKeys.${tagCamelCase}.all, "list"],\n`;
            queryKeys += `    list: (filters: any) => [...queryKeys.${tagCamelCase}.lists(), filters],\n`;
            queryKeys += `    details: () => [...queryKeys.${tagCamelCase}.all, "detail"],\n`;
            queryKeys += `    detail: (id: string) => [...queryKeys.${tagCamelCase}.details(), id],\n`;
            queryKeys += `  },\n`;
        }
        queryKeys += `};\n`;
        return queryKeys;
    }
    generateApiFunction(path, method, endpoint, tag) {
        const functionName = endpoint.operationId ||
            `${method}${path.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
        const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
        const queryParams = endpoint.parameters?.filter(p => p.in === 'query') || [];
        const hasRequestBody = !!endpoint.requestBody;
        const responseType = this.getResponseType(endpoint.responses);
        const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : '';
        let params = '';
        let apiCall = '';
        let urlPath = path;
        if (pathParams.length > 0) {
            pathParams.forEach(param => {
                params += `${param.name}: string, `;
                urlPath = urlPath.replace(`{${param.name}}`, `\${${param.name}}`);
            });
        }
        if (hasRequestBody) {
            params += `payload: ${requestBodyType}, `;
        }
        if (queryParams.length > 0) {
            params += `params?: { ${queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }, `;
        }
        params = params.replace(/, $/, '');
        switch (method.toLowerCase()) {
            case 'get':
                apiCall = queryParams.length > 0
                    ? `api.get<${responseType}>(\`${urlPath}\`, { params })`
                    : `api.get<${responseType}>(\`${urlPath}\`)`;
                break;
            case 'post':
                if (hasRequestBody) {
                    apiCall = queryParams.length > 0
                        ? `api.post<${responseType}>(\`${urlPath}\`, payload, { params })`
                        : `api.post<${responseType}>(\`${urlPath}\`, payload)`;
                }
                else {
                    apiCall = `api.post<${responseType}>(\`${urlPath}\`)`;
                }
                break;
            case 'put':
                if (hasRequestBody) {
                    apiCall = `api.put<${responseType}>(\`${urlPath}\`, payload)`;
                }
                else {
                    apiCall = `api.put<${responseType}>(\`${urlPath}\`)`;
                }
                break;
            case 'patch':
                if (hasRequestBody) {
                    apiCall = `api.patch<${responseType}>(\`${urlPath}\`, payload)`;
                }
                else {
                    apiCall = `api.patch<${responseType}>(\`${urlPath}\`)`;
                }
                break;
            case 'delete':
                if (hasRequestBody) {
                    apiCall = `api.delete<${responseType}>(\`${urlPath}\`, { data: payload })`;
                }
                else {
                    apiCall = `api.delete<${responseType}>(\`${urlPath}\`)`;
                }
                break;
        }
        const description = endpoint.description || endpoint.summary || '';
        const jsdoc = description ? `/**\n * ${description}\n */\n` : '';
        return `${jsdoc}export const ${this.toCamelCase(functionName)} = async (${params}) => {\n  const { data } = await ${apiCall};\n  return data;\n};\n\n`;
    }
    generateQueryHook(path, method, endpoint, tag) {
        const functionName = endpoint.operationId ||
            `${method}${path.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
        const hookName = `use${this.toPascalCase(functionName)}`;
        const apiFunctionName = this.toCamelCase(functionName);
        const tagCamelCase = this.toCamelCase(tag.replace(/[^a-zA-Z0-9]/g, ''));
        const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
        const queryParams = endpoint.parameters?.filter(p => p.in === 'query') || [];
        let params = '';
        let queryKey = '';
        let enabled = '';
        if (pathParams.length > 0) {
            params = pathParams.map(p => `${p.name}: string`).join(', ');
            queryKey = `queryKeys.${tagCamelCase}.detail(${pathParams[0].name})`;
            enabled = `enabled: !!(${pathParams.map(p => p.name).join(' && ')}),\n    `;
        }
        else if (queryParams.length > 0) {
            const queryParamType = `{ ${queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }`;
            params = `params?: ${queryParamType}`;
            queryKey = `queryKeys.${tagCamelCase}.list(params)`;
        }
        else {
            queryKey = `queryKeys.${tagCamelCase}.lists()`;
        }
        const queryFnParams = pathParams.length > 0
            ? `() => ${apiFunctionName}(${pathParams.map(p => p.name).join(', ')}${queryParams.length > 0 ? ', params' : ''})`
            : queryParams.length > 0
                ? `() => ${apiFunctionName}(params)`
                : apiFunctionName;
        const description = endpoint.description || endpoint.summary || '';
        const jsdoc = description ? `/**\n * ${description}\n */\n` : '';
        return `${jsdoc}export const ${hookName} = (${params}) => {\n  return useQuery({\n    queryKey: ${queryKey},\n    queryFn: ${queryFnParams},\n    ${enabled}\n  });\n};\n\n`;
    }
    generateMutationHook(path, method, endpoint, tag) {
        const functionName = endpoint.operationId ||
            `${method}${path.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
        const hookName = `use${this.toPascalCase(functionName)}`;
        const apiFunctionName = this.toCamelCase(functionName);
        const tagCamelCase = this.toCamelCase(tag.replace(/[^a-zA-Z0-9]/g, ''));
        const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
        const hasRequestBody = !!endpoint.requestBody;
        const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : '';
        let mutationFnType = '';
        if (pathParams.length > 0 && hasRequestBody) {
            mutationFnType = `(payload: ${requestBodyType} & { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`;
        }
        else if (pathParams.length > 0) {
            mutationFnType = `(payload: { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`;
        }
        else if (hasRequestBody) {
            mutationFnType = `(payload: ${requestBodyType})`;
        }
        else {
            mutationFnType = '()';
        }
        let mutationFnCall = '';
        if (pathParams.length > 0 && hasRequestBody) {
            const pathParamsList = pathParams.map(p => `payload.${p.name}`).join(', ');
            mutationFnCall = `${apiFunctionName}(${pathParamsList}, payload)`;
        }
        else if (pathParams.length > 0) {
            const pathParamsList = pathParams.map(p => `payload.${p.name}`).join(', ');
            mutationFnCall = `${apiFunctionName}(${pathParamsList})`;
        }
        else if (hasRequestBody) {
            mutationFnCall = `${apiFunctionName}(payload)`;
        }
        else {
            mutationFnCall = `${apiFunctionName}()`;
        }
        let invalidateQueries = '';
        if (method.toLowerCase() === 'delete') {
            invalidateQueries = `queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.all });\n      queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.lists() });`;
        }
        else if (method.toLowerCase() === 'post') {
            invalidateQueries = `queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.lists() });`;
        }
        else {
            invalidateQueries = `queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.all });\n      queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.lists() });`;
        }
        const description = endpoint.description || endpoint.summary || '';
        const jsdoc = description ? `/**\n * ${description}\n */\n` : '';
        return `${jsdoc}export const ${hookName} = () => {\n  const queryClient = useQueryClient();\n  \n  return useMutation({\n    mutationFn: ${mutationFnType} => ${mutationFnCall},\n    onSuccess: () => {\n      ${invalidateQueries}\n    },\n  });\n};\n\n`;
    }
    getResponseType(responses) {
        const successResponse = responses['200'] || responses['201'] || responses['default'];
        if (!successResponse)
            return 'any';
        const schema = successResponse.schema ||
            successResponse.content?.['application/json']?.schema;
        if (!schema)
            return 'any';
        return this.generateTypeScript(schema, this.getSchemas());
    }
    getRequestBodyType(requestBody) {
        if (!requestBody)
            return '';
        const schema = requestBody.content?.['application/json']?.schema ||
            requestBody.content?.['application/x-www-form-urlencoded']?.schema;
        if (!schema)
            return 'any';
        return this.generateTypeScript(schema, this.getSchemas());
    }
    getParamType(param) {
        if (param.schema) {
            return this.generateTypeScript(param.schema, this.getSchemas());
        }
        switch (param.type) {
            case 'string': return 'string';
            case 'number':
            case 'integer': return 'number';
            case 'boolean': return 'boolean';
            default: return 'any';
        }
    }
    groupEndpointsByTag() {
        const grouped = new Map();
        for (const [path, methods] of Object.entries(this.spec.paths)) {
            for (const [method, endpoint] of Object.entries(methods)) {
                const tags = endpoint.tags || ['default'];
                for (const tag of tags) {
                    if (!grouped.has(tag)) {
                        grouped.set(tag, []);
                    }
                    grouped.get(tag).push({ path, method, endpoint });
                }
            }
        }
        return grouped;
    }
    getTypesFromEndpoints(endpoints) {
        const types = new Set();
        for (const { endpoint } of endpoints) {
            const responseType = this.getResponseType(endpoint.responses);
            if (responseType !== 'any') {
                types.add(responseType);
            }
            if (endpoint.requestBody) {
                const requestBodyType = this.getRequestBodyType(endpoint.requestBody);
                if (requestBodyType !== 'any') {
                    types.add(requestBodyType);
                }
            }
        }
        return types;
    }
    async shouldOverwriteFile(filePath) {
        if (!this.config.preserveModified)
            return true;
        const exists = await fs.pathExists(filePath);
        if (!exists)
            return true;
        const content = await fs.readFile(filePath, 'utf-8');
        const hasUserModifications = content.includes('// CUSTOM') ||
            content.includes('// Modified') ||
            content.includes('// TODO');
        return !hasUserModifications;
    }
    async generate() {
        console.log('🚀 Generating files by tags...');
        const outputDir = this.config.outputDir;
        await fs.ensureDir(outputDir);
        console.log('📝 Generating query keys...');
        const queryKeysPath = path.join(process.cwd(), 'lib', 'query-keys.ts');
        await fs.ensureDir(path.dirname(queryKeysPath));
        await fs.writeFile(queryKeysPath, this.generateQueryKeys());
        const axiosPath = path.join(process.cwd(), 'lib', 'axios.ts');
        if (!await fs.pathExists(axiosPath)) {
            const axiosConfig = `// Auto-generated Axios configuration
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export default api;
`;
            await fs.writeFile(axiosPath, axiosConfig);
            console.log('📝 Generated lib/axios.ts');
        }
        const groupedEndpoints = this.groupEndpointsByTag();
        for (const [tag, endpoints] of groupedEndpoints) {
            const tagDir = path.join(outputDir, this.toKebabCase(tag));
            await fs.ensureDir(tagDir);
            const usedTypes = this.getTypesFromEndpoints(endpoints);
            const schemas = this.getSchemas();
            // Types
            let tagTypes = `// ${this.t.generatedTypes} - ${tag}\n\n`;
            for (const typeName of usedTypes) {
                if (schemas[typeName]) {
                    const schema = schemas[typeName];
                    if (schema.properties || schema.type === 'object') {
                        const properties = Object.entries(schema.properties || {})
                            .map(([key, value]) => {
                            const optional = !schema.required?.includes(key) ? '?' : '';
                            const description = value.description ? `\n  /** ${value.description} */` : '';
                            return `${description}\n  ${key}${optional}: ${this.generateTypeScript(value, schemas)};`;
                        })
                            .join('\n');
                        const description = schema.description ? `\n/** ${schema.description} */` : '';
                        tagTypes += `${description}\nexport interface ${typeName} {\n${properties}\n}\n\n`;
                    }
                }
            }
            // Schemas
            let tagSchemas = `// ${this.t.generatedSchemas} - ${tag}\nimport * as z from "zod";\n\n`;
            for (const typeName of usedTypes) {
                if (schemas[typeName]) {
                    const schema = schemas[typeName];
                    if (schema.properties || schema.type === 'object') {
                        const schemaName = `${this.toCamelCase(typeName)}Schema`;
                        const zodSchema = this.generateZodSchema(schema, schemas);
                        tagSchemas += `export const ${schemaName} = ${zodSchema};\n\n`;
                        tagSchemas += `export type ${this.toPascalCase(typeName)}Schema = z.infer<typeof ${schemaName}>;\n\n`;
                    }
                }
            }
            // API functions
            let apiContent = `// ${this.t.generatedApi} - ${tag}\nimport api from '@lib/axios';\nimport type {\n`;
            const typeImports = Array.from(usedTypes).map(type => `  ${type}`).join(',\n');
            apiContent += `${typeImports}\n} from './types';\n\n`;
            // Hooks
            let hooksContent = `// ${this.t.generatedHooks} - ${tag}\n`;
            hooksContent += `import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";\n`;
            hooksContent += `import { queryKeys } from '@lib/query-keys';\n`;
            hooksContent += `import type {\n${typeImports}\n} from './types';\n`;
            hooksContent += `import {\n`;
            const importedFunctions = [];
            for (const { path: endpointPath, method, endpoint } of endpoints) {
                const functionName = endpoint.operationId ||
                    `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
                apiContent += this.generateApiFunction(endpointPath, method, endpoint, tag);
                const camelCaseFunctionName = this.toCamelCase(functionName);
                importedFunctions.push(`  ${camelCaseFunctionName}`);
                if (method.toLowerCase() === 'get') {
                    hooksContent += this.generateQueryHook(endpointPath, method, endpoint, tag);
                }
                else {
                    hooksContent += this.generateMutationHook(endpointPath, method, endpoint, tag);
                }
            }
            hooksContent = hooksContent.replace('import {\n', `import {\n${importedFunctions.join(',\n')}\n} from './api';\n\n// ${this.t.queryHooks}\n\n`);
            // Write files with preserve logic
            const typesPath = path.join(tagDir, 'types.ts');
            const schemasPath = path.join(tagDir, 'schemas.ts');
            const apiPath = path.join(tagDir, 'api.ts');
            const hooksPath = path.join(tagDir, 'hooks.ts');
            if (await this.shouldOverwriteFile(typesPath)) {
                await fs.writeFile(typesPath, tagTypes);
            }
            else {
                console.log(`   Skipped ${tag}/types.ts (has user modifications)`);
            }
            if (await this.shouldOverwriteFile(schemasPath)) {
                await fs.writeFile(schemasPath, tagSchemas);
            }
            else {
                console.log(`   Skipped ${tag}/schemas.ts (has user modifications)`);
            }
            if (await this.shouldOverwriteFile(apiPath)) {
                await fs.writeFile(apiPath, apiContent);
            }
            else {
                console.log(`   Skipped ${tag}/api.ts (has user modifications)`);
            }
            if (await this.shouldOverwriteFile(hooksPath)) {
                await fs.writeFile(hooksPath, hooksContent);
            }
            else {
                console.log(`   Skipped ${tag}/hooks.ts (has user modifications)`);
            }
            // Generate fake data if enabled
            if (this.config.generateFakeData) {
                let fakeDataContent = `// ${this.t.generatedFakeData} - ${tag}\nimport type {\n${typeImports}\n} from './types';\n\n`;
                for (const typeName of usedTypes) {
                    if (schemas[typeName]) {
                        const schema = schemas[typeName];
                        if (schema.properties) {
                            fakeDataContent += this.generateFakeData(typeName, schema, schemas);
                        }
                    }
                }
                const dataPath = path.join(tagDir, 'data.ts');
                if (await this.shouldOverwriteFile(dataPath)) {
                    await fs.writeFile(dataPath, fakeDataContent);
                }
                else {
                    console.log(`   Skipped ${tag}/data.ts (has user modifications)`);
                }
            }
            console.log(`Generated ${tag} files`);
        }
        console.log(`\nGeneration complete!`);
        console.log(`Files generated in ${this.config.outputDir}`);
        console.log(`Query keys in lib/query-keys.ts`);
        console.log(`Axios config in lib/axios.ts`);
    }
}
async function loadSwaggerSpec(input, credentials) {
    let content;
    const axiosInstance = createAxiosInstance(credentials);
    if (input.startsWith('http://') || input.startsWith('https://')) {
        console.log(`Fetching Swagger spec from ${input}...`);
        try {
            const response = await axiosInstance.get(input);
            content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
            if (content.trim().startsWith('<')) {
                console.log('Received HTML instead of Swagger spec. Trying common endpoints...');
                const baseUrl = input.replace(/\/api\/?$/, '');
                const commonPaths = [
                    '/api/swagger.json',
                    '/api-docs',
                    '/api-json',
                    '/api/docs-json',
                    '/swagger.json',
                    '/swagger/v1/swagger.json',
                    '/v1/swagger.json',
                    '/docs/swagger.json'
                ];
                for (const path of commonPaths) {
                    try {
                        console.log(`Trying ${baseUrl}${path}...`);
                        const tryResponse = await axiosInstance.get(`${baseUrl}${path}`);
                        const tryContent = typeof tryResponse.data === 'string' ? tryResponse.data : JSON.stringify(tryResponse.data);
                        if (!tryContent.trim().startsWith('<')) {
                            console.log(`Found Swagger spec at ${baseUrl}${path}`);
                            content = tryContent;
                            break;
                        }
                    }
                    catch (e) {
                        continue;
                    }
                }
                if (content.trim().startsWith('<')) {
                    throw new Error(`Could not find Swagger JSON/YAML spec. Please provide the direct URL to the specification.`);
                }
            }
        }
        catch (error) {
            if (error.response?.status === 401 && !credentials) {
                console.log('\nAuthentication required (401)');
                const creds = await promptForCredentials();
                return loadSwaggerSpec(input, creds);
            }
            throw new Error(`Failed to fetch Swagger spec: ${error?.message || 'Unknown error'}`);
        }
    }
    else {
        console.log(`Loading Swagger spec from ${input}...`);
        content = await fs.readFile(input, 'utf-8');
    }
    try {
        const parsed = JSON.parse(content);
        if (!parsed.paths) {
            throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
        }
        return parsed;
    }
    catch (jsonError) {
        try {
            const parsed = yaml.load(content);
            if (!parsed.paths) {
                throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
            }
            return parsed;
        }
        catch (yamlError) {
            throw new Error(`Failed to parse Swagger spec: ${jsonError.message}`);
        }
    }
}
const program = new Command();
program
    .name('swagger-to-tanstack')
    .description('Generate TanStack Query hooks, types, and schemas from Swagger/OpenAPI specification')
    .version('2.0.0');
program
    .command('init')
    .description('Initialize project with lib/axios.ts and lib/query-keys.ts')
    .action(async () => {
    try {
        console.log('Initializing project...');
        const libDir = path.join(process.cwd(), 'lib');
        await fs.ensureDir(libDir);
        const axiosPath = path.join(libDir, 'axios.ts');
        if (!await fs.pathExists(axiosPath)) {
            const axiosConfig = `// Axios configuration
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export default api;
`;
            await fs.writeFile(axiosPath, axiosConfig);
            console.log('Created lib/axios.ts');
        }
        else {
            console.log('lib/axios.ts already exists');
        }
        const queryKeysPath = path.join(libDir, 'query-keys.ts');
        if (!await fs.pathExists(queryKeysPath)) {
            const queryKeysTemplate = `// Query keys will be populated by swagger-to-tanstack generate
export const queryKeys = {} as const;
`;
            await fs.writeFile(queryKeysPath, queryKeysTemplate);
            console.log('Created lib/query-keys.ts');
        }
        else {
            console.log('lib/query-keys.ts already exists');
        }
        console.log('\nInitialization complete!');
        console.log('Next: Run swagger-to-tanstack generate -i <swagger-url>');
    }
    catch (error) {
        console.error('Error:', error?.message || 'Unknown error');
        process.exit(1);
    }
});
program
    .command('generate')
    .description('Generate API functions, hooks, types, and schemas from Swagger spec')
    .requiredOption('-i, --input <input>', 'Swagger spec file path or URL')
    .option('-o, --output <dir>', 'Output directory', './src/api')
    .option('-b, --baseUrl <url>', 'API base URL override')
    .option('-l, --language <lang>', 'Language for comments (en|fr)', 'en')
    .option('--fake-data', 'Generate fake data for testing')
    .option('--preserve-modified', 'Skip overwriting files with user modifications')
    .option('-u, --username <username>', 'Basic auth username')
    .option('-p, --password <password>', 'Basic auth password')
    .action(async (options) => {
    try {
        if (!['en', 'fr'].includes(options.language)) {
            throw new Error('Language must be "en" or "fr"');
        }
        const config = {
            outputDir: options.output,
            baseUrl: options.baseUrl || '',
            language: options.language,
            generateFakeData: options.fakeData || false,
            preserveModified: options.preserveModified || false,
        };
        let credentials;
        if (options.username && options.password) {
            credentials = { username: options.username, password: options.password };
        }
        const spec = await loadSwaggerSpec(options.input, credentials);
        const generator = new SwaggerToTanStackGenerator(spec, config);
        await generator.generate();
    }
    catch (error) {
        console.error('Error:', error?.message || 'Unknown error');
        process.exit(1);
    }
});
program
    .command('update')
    .description('Update generated files from Swagger spec (preserves user modifications)')
    .requiredOption('-i, --input <input>', 'Swagger spec file path or URL')
    .option('-o, --output <dir>', 'Output directory', './src/api')
    .option('-l, --language <lang>', 'Language (en|fr)', 'en')
    .action(async (options) => {
    try {
        const config = {
            outputDir: options.output,
            baseUrl: '',
            language: options.language,
            generateFakeData: false,
            preserveModified: true,
        };
        const spec = await loadSwaggerSpec(options.input);
        const generator = new SwaggerToTanStackGenerator(spec, config);
        await generator.generate();
    }
    catch (error) {
        console.error('Error:', error?.message || 'Unknown error');
        process.exit(1);
    }
});
program
    .command('watch')
    .description('Watch Swagger spec and regenerate on changes')
    .requiredOption('-i, --input <input>', 'Swagger spec file path')
    .option('-o, --output <dir>', 'Output directory', './src/api')
    .option('-l, --language <lang>', 'Language (en|fr)', 'en')
    .action(async (options) => {
    try {
        if (options.input.startsWith('http')) {
            throw new Error('Watch mode only works with local files');
        }
        console.log(`Watching ${options.input} for changes...`);
        const config = {
            outputDir: options.output,
            baseUrl: '',
            language: options.language,
            generateFakeData: false,
            preserveModified: true,
        };
        const spec = await loadSwaggerSpec(options.input);
        const generator = new SwaggerToTanStackGenerator(spec, config);
        await generator.generate();
        //@ts-ignore
        fs.watch(options.input, async (eventType) => {
            if (eventType === 'change') {
                console.log('\nSwagger spec changed, regenerating...');
                try {
                    const newSpec = await loadSwaggerSpec(options.input);
                    const newGenerator = new SwaggerToTanStackGenerator(newSpec, config);
                    await newGenerator.generate();
                }
                catch (error) {
                    console.error('Error during regeneration:', error?.message);
                }
            }
        });
        console.log('Press Ctrl+C to stop watching');
    }
    catch (error) {
        console.error('Error:', error?.message || 'Unknown error');
        process.exit(1);
    }
});
program
    .command('validate')
    .description('Validate Swagger/OpenAPI specification')
    .requiredOption('-i, --input <input>', 'Swagger spec file path or URL')
    .action(async (options) => {
    try {
        console.log('Validating Swagger specification...');
        const spec = await loadSwaggerSpec(options.input);
        console.log(`Valid ${spec.openapi ? 'OpenAPI' : 'Swagger'} specification`);
        console.log(`Title: ${spec.info?.title}`);
        console.log(`Version: ${spec.info?.version}`);
        console.log(`Paths: ${Object.keys(spec.paths).length}`);
        console.log(`Schemas: ${Object.keys(spec.components?.schemas || spec.definitions || {}).length}`);
        const tags = spec.tags || [];
        if (tags.length > 0) {
            console.log(`Tags: ${tags.map(t => t.name).join(', ')}`);
        }
    }
    catch (error) {
        console.error('Invalid specification:', error?.message || 'Unknown error');
        process.exit(1);
    }
});
program.parse();
