// import * as fs from 'fs-extra';
// import * as path from 'path';
// import { SwaggerSpec, GroupedEndpoint } from '../types/swagger';
// import { GeneratorConfig, Translations } from '../types/config';
// import { StringUtils } from '../utils/string-utils';
// import { TypeGenerator } from '../utils/type-generator';
// import { SchemaGenerator } from '../utils/schema-generator';
// import { FileUtils } from '../utils/file-utils';
// import { RTK_CONFIG_TEMPLATE } from '../templates/rtk-config';

// const translations: Record<'en' | 'fr', Translations> = {
//   en: {
//     generatedTypes: 'Auto-generated TypeScript types',
//     generatedSchemas: 'Auto-generated validation schemas',
//     generatedApi: 'Auto-generated API functions',
//     generatedHooks: 'Auto-generated hooks',
//     generatedQueries: 'Auto-generated queries',
//     generatedMutations: 'Auto-generated mutations',
//     generatedFakeData: 'Auto-generated fake data',
//     queryHooks: 'Query Hooks',
//     mutationHooks: 'Mutation Hooks',
//     tooShort: 'Too short',
//     tooLong: 'Too long',
//     invalidFormat: 'Invalid format',
//     invalidEmail: 'Invalid email',
//     invalidUuid: 'Invalid UUID',
//   },
//   fr: {
//     generatedTypes: 'Types TypeScript auto-générés',
//     generatedSchemas: 'Schémas de validation auto-générés',
//     generatedApi: 'Fonctions API auto-générées',
//     generatedHooks: 'Hooks auto-générés',
//     generatedQueries: 'Requêtes auto-générées',
//     generatedMutations: 'Mutations auto-générées',
//     generatedFakeData: 'Données de test auto-générées',
//     queryHooks: 'Hooks de Requête',
//     mutationHooks: 'Hooks de Mutation',
//     tooShort: 'Trop court',
//     tooLong: 'Trop long',
//     invalidFormat: 'Format invalide',
//     invalidEmail: 'Email invalide',
//     invalidUuid: 'UUID invalide',
//   },
// };

// export class BaseGenerator {
//   protected spec: SwaggerSpec;
//   protected config: GeneratorConfig;
//   protected t: Translations;
//   protected schemaGenerator: SchemaGenerator;

//   constructor(spec: SwaggerSpec, config: GeneratorConfig) {
//     this.spec = spec;
//     this.config = config;
//     this.t = translations[config.language];
//     this.schemaGenerator = new SchemaGenerator(this.t);
//   }

//   async generate(): Promise<void> {
//     console.log('🚀 Starting generation...');
    
//     // Générer config RTK si nécessaire
//     if (this.config.template === 'rtk-query') {
//       await this.generateRTKConfig();
//     }

//     const groupedEndpoints = this.groupEndpointsByTag();
    
//     for (const [tag, endpoints] of groupedEndpoints) {
//       await this.generateTag(tag, endpoints);
//     }

//     console.log('✨ Generation complete!');
//   }

//   protected async generateRTKConfig(): Promise<void> {
//     const configDir = path.join(process.cwd(), 'src', 'services');
//     await fs.ensureDir(configDir);
    
//     const configPath = path.join(configDir, 'config.ts');
    
//     if (!await fs.pathExists(configPath)) {
//       await fs.writeFile(configPath, RTK_CONFIG_TEMPLATE);
//       console.log('✅ Generated src/services/config.ts');
//     }
//   }

//   protected groupEndpointsByTag(): Map<string, GroupedEndpoint[]> {
//     const grouped = new Map<string, GroupedEndpoint[]>();
    
//     for (const [urlPath, methods] of Object.entries(this.spec.paths)) {
//       for (const [method, endpoint] of Object.entries(methods)) {
//         if (typeof endpoint !== 'object') continue;
        
//         const tags = endpoint.tags || ['default'];
        
//         for (const tag of tags) {
//           // Filtrer par tags
//           if (this.config.includeTags.length > 0 && !this.config.includeTags.includes(tag)) {
//             continue;
//           }
          
//           if (this.config.excludeTags.includes(tag)) {
//             continue;
//           }
          
//           if (!grouped.has(tag)) {
//             grouped.set(tag, []);
//           }
          
//           // Nettoyer le path
//           let cleanPath = urlPath;
//           if (this.config.stripBasePath) {
//             const basePath = typeof this.config.stripBasePath === 'string' 
//               ? this.config.stripBasePath 
//               : (this.spec.basePath || '/api/v1');
//             cleanPath = urlPath.replace(new RegExp(`^${basePath}`), '');
//           }
          
//           grouped.get(tag)!.push({ 
//             path: cleanPath, 
//             method, 
//             endpoint 
//           });
//         }
//       }
//     }
    
//     return grouped;
//   }

//   protected async generateTag(tag: string, endpoints: GroupedEndpoint[]): Promise<void> {
//     const tagDir = path.join(this.config.outputDir, StringUtils.toKebabCase(tag));
//     await fs.ensureDir(tagDir);

//     // Extraire les types utilisés
//     const schemas = this.spec.components?.schemas || this.spec.definitions || {};
//     const usedTypes = this.extractUsedTypes(endpoints);

//     // Générer selon le template et la structure
//     switch (this.config.template) {
//       case 'tanstack-query':
//         await this.generateTanStackQuery(tagDir, tag, endpoints, usedTypes, schemas);
//         break;
//       case 'rtk-query':
//         await this.generateRTKQuery(tagDir, tag, endpoints, usedTypes, schemas);
//         break;
//       case 'swr':
//         await this.generateSWR(tagDir, tag, endpoints, usedTypes, schemas);
//         break;
//       case 'react-query-kit':
//         await this.generateReactQueryKit(tagDir, tag, endpoints, usedTypes, schemas);
//         break;
//       case 'basic':
//         await this.generateBasic(tagDir, tag, endpoints, usedTypes, schemas);
//         break;
//     }

//     console.log(`✅ Generated ${tag}`);
//   }

//   protected extractUsedTypes(endpoints: GroupedEndpoint[]): Set<string> {
//     const types = new Set<string>();
    
//     for (const { endpoint } of endpoints) {
//       // Response types
//       for (const response of Object.values(endpoint.responses)) {
//         const schema = response.schema || response.content?.['application/json']?.schema;
//         if (schema?.$ref) {
//           types.add(StringUtils.extractRefName(schema.$ref));
//         }
//       }
      
//       // Request body types
//       if (endpoint.requestBody?.content?.['application/json']?.schema?.$ref) {
//         types.add(StringUtils.extractRefName(endpoint.requestBody.content['application/json'].schema.$ref));
//       }
//     }
    
//     return types;
//   }

//   protected async generateTanStackQuery(
//     tagDir: string, 
//     tag: string, 
//     endpoints: GroupedEndpoint[], 
//     usedTypes: Set<string>, 
//     schemas: Record<string, any>
//   ): Promise<void> {
//     await this.generateTypes(tagDir, usedTypes, schemas);
//     await this.generateSchemas(tagDir, usedTypes, schemas);
    
//     switch (this.config.structureMode) {
//       case 'split':
//         await this.generateTanStackSplit(tagDir, tag, endpoints);
//         break;
//       case 'group':
//         await this.generateTanStackGroup(tagDir, tag, endpoints);
//         break;
//       case 'group-hooks':
//         await this.generateTanStackGroupHooks(tagDir, tag, endpoints);
//         break;
//     }
//   }

//   protected async generateRTKQuery(
//     tagDir: string, 
//     tag: string, 
//     endpoints: GroupedEndpoint[], 
//     usedTypes: Set<string>, 
//     schemas: Record<string, any>
//   ): Promise<void> {
//     // RTK Query uniquement en mode group-hooks
//     await this.generateTypes(tagDir, usedTypes, schemas);
//     await this.generateSchemas(tagDir, usedTypes, schemas);
    
//     const fileName = this.config.structureMode === 'group-hooks' ? 'hooks.ts' : 'api.ts';
//     const filePath = path.join(tagDir, fileName);
    
//     let content = `// ${this.t.generatedHooks}\n`;
//     content += `import { apiInstance, invalidateOn, RESPONSE_BODY_KEY, ResponseError } from '@/services/config';\n`;
    
//     // Import types seulement s'il y en a
//     if (usedTypes.size > 0) {
//       content += `import type { ${Array.from(usedTypes).join(', ')} } from './types';\n\n`;
//     } else {
//       content += '\n';
//     }
    
//     const tagCamel = StringUtils.toCamelCase(tag);
//     content += `export const ${tagCamel}Api = apiInstance.injectEndpoints({\n`;
//     content += `  endpoints: (builder) => ({\n`;
    
//     for (const { path, method, endpoint } of endpoints) {
//       content += this.generateRTKEndpoint(path, method, endpoint, tag);
//     }
    
//     content += `  }),\n});\n\n`;
    
//     // Export hooks
//     const hookNames = endpoints.map(({ method, endpoint, path }) => {
//       const opId = endpoint.operationId || `${method}${path.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
//       const hookPrefix = method.toLowerCase() === 'get' ? 'use' : 'use';
//       const hookSuffix = method.toLowerCase() === 'get' ? 'Query' : 'Mutation';
//       return `${hookPrefix}${StringUtils.toPascalCase(opId)}${hookSuffix}`;
//     });
    
//     content += `export const {\n  ${hookNames.join(',\n  ')}\n} = ${tagCamel}Api;\n`;
    
//     await FileUtils.writeIfShould(filePath, content, this.config.preserveModified);
//   }

//   protected generateRTKEndpoint(urlPath: string, method: string, endpoint: any, tag: string): string {
//     const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
//     const isQuery = method.toLowerCase() === 'get';
//     const endpointName = StringUtils.toCamelCase(opId);
    
//     let code = `    ${endpointName}: builder.${isQuery ? 'query' : 'mutation'}({\n`;
//     code += `      query: (${this.getRTKParams(urlPath, method, endpoint)}) => ({\n`;
//     code += `        url: \`${this.buildRTKUrl(urlPath)}\`,\n`;
    
//     if (!isQuery) {
//       code += `        method: '${method.toUpperCase()}',\n`;
      
//       const hasBody = !!endpoint.requestBody;
//       const isFormData = endpoint.requestBody?.content?.['multipart/form-data'];
      
//       if (hasBody) {
//         code += `        body: payload,\n`;
        
//         if (isFormData) {
//           code += `        headers: { 'Content-Type': 'multipart/form-data' },\n`;
//         }
//       }
//     }
    
//     code += `      }),\n`;
//     code += `      providesTags: ['${StringUtils.toPascalCase(tag)}'],\n`;
//     code += `    }),\n`;
    
//     return code;
//   }

//   protected getRTKParams(urlPath: string, method: string, endpoint: any): string {
//     const pathParams = (endpoint.parameters || []).filter((p: any) => p.in === 'path');
//     const hasBody = !!endpoint.requestBody;
    
//     if (pathParams.length > 0 && hasBody) {
//       return `{ ${pathParams.map((p: any) => p.name).join(', ')}, payload }`;
//     } else if (pathParams.length > 0) {
//       return `{ ${pathParams.map((p: any) => p.name).join(', ')} }`;
//     } else if (hasBody) {
//       return 'payload';
//     }
    
//     return '';
//   }

//   protected buildRTKUrl(urlPath: string): string {
//     return urlPath.replace(/{([^}]+)}/g, '${$1}');
//   }

//   protected async generateTanStackSplit(tagDir: string, tag: string, endpoints: GroupedEndpoint[]): Promise<void> {
//     // Créer les sous-dossiers
//     const apiDir = path.join(tagDir, 'api');
//     const queriesDir = path.join(tagDir, 'queries');
//     const mutationsDir = path.join(tagDir, 'mutations');
    
//     await fs.ensureDir(apiDir);
//     await fs.ensureDir(queriesDir);
//     await fs.ensureDir(mutationsDir);
    
//     // Générer les fichiers API, queries et mutations individuels
//     // ... (implémentation similaire à votre code existant)
//   }

//   protected async generateTanStackGroup(tagDir: string, tag: string, endpoints: GroupedEndpoint[]): Promise<void> {
//     // Fichiers groupés: api.ts, queries.ts, mutations.ts
//     // ... (implémentation)
//   }

//   protected async generateTanStackGroupHooks(tagDir: string, tag: string, endpoints: GroupedEndpoint[]): Promise<void> {
//     // Générer api.ts
//     await this.generateApiFile(tagDir, tag, endpoints);
    
//     // Générer hooks.ts
//     const hooksPath = path.join(tagDir, 'hooks.ts');
//     let content = `// ${this.t.generatedHooks}\n`;
//     content += `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';\n`;
//     content += `import { queryKeys } from '@/lib/query-keys';\n`;
    
//     // Import API functions
//     const apiImports = endpoints.map(({ method, endpoint, path }) => {
//       const opId = endpoint.operationId || `${method}${path.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
//       return StringUtils.toCamelCase(opId);
//     });
    
//     content += `import {\n  ${apiImports.join(',\n  ')}\n} from './api';\n\n`;
    
//     content += `// ${this.t.queryHooks}\n\n`;
    
//     for (const { path, method, endpoint } of endpoints) {
//       if (method.toLowerCase() === 'get') {
//         content += this.generateTanStackQueryHook(path, method, endpoint, tag);
//       }
//     }
    
//     content += `\n// ${this.t.mutationHooks}\n\n`;
    
//     for (const { path, method, endpoint } of endpoints) {
//       if (method.toLowerCase() !== 'get') {
//         content += this.generateTanStackMutationHook(path, method, endpoint, tag);
//       }
//     }
    
//     await FileUtils.writeIfShould(hooksPath, content, this.config.preserveModified);
//   }

//   protected async generateApiFile(tagDir: string, tag: string, endpoints: GroupedEndpoint[]): Promise<void> {
//     const apiPath = path.join(tagDir, 'api.ts');
//     let content = `// ${this.t.generatedApi}\n`;
    
//     if (this.config.httpClient === 'axios') {
//       content += `import api from '@/lib/axios';\n`;
//     } else {
//       content += `const API_URL = process.env.NEXT_PUBLIC_API_URL || '';\n\n`;
//       content += `const getAuthHeaders = () => {\n`;
//       content += `  const token = localStorage.getItem('token') || localStorage.getItem('authToken');\n`;
//       content += `  return token ? { 'Authorization': \`Bearer \${token}\` } : {};\n`;
//       content += `};\n\n`;
//     }
    
//     // Import types si nécessaire
//     const usedTypes = this.extractUsedTypes(endpoints);
//     if (usedTypes.size > 0) {
//       content += `import type { ${Array.from(usedTypes).join(', ')} } from './types';\n\n`;
//     }
    
//     for (const { path, method, endpoint } of endpoints) {
//       content += this.generateApiFunction(path, method, endpoint);
//     }
    
//     await FileUtils.writeIfShould(apiPath, content, this.config.preserveModified);
//   }

//   protected generateApiFunction(urlPath: string, method: string, endpoint: any): string {
//     const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
//     const funcName = StringUtils.toCamelCase(opId);
    
//     const pathParams = (endpoint.parameters || []).filter((p: any) => p.in === 'path');
//     const queryParams = (endpoint.parameters || []).filter((p: any) => p.in === 'query');
//     const hasBody = !!endpoint.requestBody;
//     const isFormData = endpoint.requestBody?.content?.['multipart/form-data'];
    
//     // Construire les paramètres
//     let params = '';
//     if (pathParams.length > 0) {
//       params += pathParams.map((p: any) => `${p.name}: string`).join(', ');
//     }
//     if (hasBody) {
//       if (params) params += ', ';
//       const bodyType = this.getRequestBodyType(endpoint.requestBody);
//       params += `payload: ${bodyType}`;
//     }
//     if (queryParams.length > 0) {
//       if (params) params += ', ';
//       params += `params?: { ${queryParams.map((p: any) => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }`;
//     }
    
//     // Construire l'URL
//     let url = urlPath.replace(/{([^}]+)}/g, '${$1}');
    
//     let code = `export const ${funcName} = async (${params}) => {\n`;
    
//     if (this.config.httpClient === 'axios') {
//       code += this.generateAxiosCall(url, method, hasBody, queryParams.length > 0, isFormData);
//     } else {
//       code += this.generateFetchCall(url, method, hasBody, queryParams.length > 0, isFormData);
//     }
    
//     code += `};\n\n`;
    
//     return code;
//   }

//   protected generateAxiosCall(url: string, method: string, hasBody: boolean, hasQuery: boolean, isFormData: boolean): string {
//     let code = '';
    
//     switch (method.toLowerCase()) {
//       case 'get':
//         code = hasQuery 
//           ? `  const { data } = await api.get(\`${url}\`, { params });\n`
//           : `  const { data } = await api.get(\`${url}\`);\n`;
//         break;
//       case 'post':
//         if (isFormData) {
//           code = `  const { data } = await api.post(\`${url}\`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });\n`;
//         } else {
//           code = hasBody
//             ? `  const { data } = await api.post(\`${url}\`, payload);\n`
//             : `  const { data } = await api.post(\`${url}\`);\n`;
//         }
//         break;
//       case 'put':
//       case 'patch':
//         code = hasBody
//           ? `  const { data } = await api.${method.toLowerCase()}(\`${url}\`, payload);\n`
//           : `  const { data } = await api.${method.toLowerCase()}(\`${url}\`);\n`;
//         break;
//       case 'delete':
//         code = hasBody
//           ? `  const { data } = await api.delete(\`${url}\`, { data: payload });\n`
//           : `  const { data } = await api.delete(\`${url}\`);\n`;
//         break;
//     }
    
//     code += `  return data;\n`;
//     return code;
//   }

//   protected generateFetchCall(url: string, method: string, hasBody: boolean, hasQuery: boolean, isFormData: boolean): string {
//     let code = '';
    
//     if (hasQuery) {
//       code += `  const queryString = new URLSearchParams(params as any).toString();\n`;
//       code += `  const fullUrl = \`\${API_URL}${url}?\${queryString}\`;\n`;
//     } else {
//       code += `  const fullUrl = \`\${API_URL}${url}\`;\n`;
//     }
    
//     code += `  const headers = { ...getAuthHeaders()`;
//     if (!isFormData) {
//       code += `, 'Content-Type': 'application/json'`;
//     }
//     code += ` };\n`;
    
//     code += `  const response = await fetch(fullUrl, {\n`;
//     code += `    method: '${method.toUpperCase()}',\n`;
//     code += `    headers,\n`;
    
//     if (hasBody) {
//       if (isFormData) {
//         code += `    body: payload,\n`;
//       } else {
//         code += `    body: JSON.stringify(payload),\n`;
//       }
//     }
    
//     code += `  });\n`;
//     code += `  if (!response.ok) throw new Error('Request failed');\n`;
//     code += `  return response.json();\n`;
    
//     return code;
//   }

//   protected generateTanStackQueryHook(urlPath: string, method: string, endpoint: any, tag: string): string {
//     const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
//     const hookName = `use${StringUtils.toPascalCase(opId)}`;
//     const funcName = StringUtils.toCamelCase(opId);
//     const tagCamel = StringUtils.toCamelCase(tag);
    
//     const pathParams = (endpoint.parameters || []).filter((p: any) => p.in === 'path');
//     const queryParams = (endpoint.parameters || []).filter((p: any) => p.in === 'query');
    
//     let params = '';
//     let queryKey = '';
//     let enabled = '';
//     let queryFn = '';
    
//     if (pathParams.length > 0) {
//       params = pathParams.map((p: any) => `${p.name}: string`).join(', ');
//       queryKey = `queryKeys.${tagCamel}.detail(${pathParams[0].name})`;
//       enabled = `    enabled: !!(${pathParams.map((p: any) => p.name).join(' && ')}),\n`;
//       queryFn = `() => ${funcName}(${pathParams.map((p: any) => p.name).join(', ')})`;
//     } else if (queryParams.length > 0) {
//       params = `params?: { ${queryParams.map((p: any) => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }`;
//       queryKey = `queryKeys.${tagCamel}.list(params)`;
//       queryFn = `() => ${funcName}(params)`;
//     } else {
//       queryKey = `queryKeys.${tagCamel}.lists()`;
//       queryFn = funcName;
//     }
    
//     let code = `export const ${hookName} = (${params}) => {\n`;
//     code += `  return useQuery({\n`;
//     code += `    queryKey: ${queryKey},\n`;
//     code += `    queryFn: ${queryFn},\n`;
//     code += enabled;
//     code += `  });\n`;
//     code += `};\n\n`;
    
//     return code;
//   }

//   protected generateTanStackMutationHook(urlPath: string, method: string, endpoint: any, tag: string): string {
//     const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
//     const hookName = `use${StringUtils.toPascalCase(opId)}`;
//     const funcName = StringUtils.toCamelCase(opId);
//     const tagCamel = StringUtils.toCamelCase(tag);
    
//     const pathParams = (endpoint.parameters || []).filter((p: any) => p.in === 'path');
//     const hasBody = !!endpoint.requestBody;
    
//     let mutationFnType = '';
//     let mutationFnCall = '';
    
//     if (pathParams.length > 0 && hasBody) {
//       const bodyType = this.getRequestBodyType(endpoint.requestBody);
//       mutationFnType = `(vars: ${bodyType} & { ${pathParams.map((p: any) => `${p.name}: string`).join('; ')} })`;
//       mutationFnCall = `${funcName}(${pathParams.map((p: any) => `vars.${p.name}`).join(', ')}, vars)`;
//     } else if (pathParams.length > 0) {
//       mutationFnType = `(vars: { ${pathParams.map((p: any) => `${p.name}: string`).join('; ')} })`;
//       mutationFnCall = `${funcName}(${pathParams.map((p: any) => `vars.${p.name}`).join(', ')})`;
//     } else if (hasBody) {
//       const bodyType = this.getRequestBodyType(endpoint.requestBody);
//       mutationFnType = `(payload: ${bodyType})`;
//       mutationFnCall = `${funcName}(payload)`;
//     } else {
//       mutationFnType = '()';
//       mutationFnCall = `${funcName}()`;
//     }
    
//     let code = `export const ${hookName} = () => {\n`;
//     code += `  const queryClient = useQueryClient();\n\n`;
//     code += `  return useMutation({\n`;
//     code += `    mutationFn: ${mutationFnType} => ${mutationFnCall},\n`;
//     code += `    onSuccess: () => {\n`;
//     code += `      queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamel}.all });\n`;
//     code += `    },\n`;
//     code += `  });\n`;
//     code += `};\n\n`;
    
//     return code;
//   }

//   protected getRequestBodyType(requestBody: any): string {
//     if (!requestBody) return 'any';
    
//     const schema = requestBody.content?.['application/json']?.schema ||
//                    requestBody.content?.['multipart/form-data']?.schema ||
//                    requestBody.content?.['application/x-www-form-urlencoded']?.schema;
    
//     if (!schema) return 'any';
    
//     if (schema.$ref) {
//       return StringUtils.extractRefName(schema.$ref);
//     }
    
//     const schemas = this.spec.components?.schemas || this.spec.definitions || {};
//     return TypeGenerator.generate(schema, schemas);
//   }

//   protected getParamType(param: any): string {
//     if (param.schema) {
//       const schemas = this.spec.components?.schemas || this.spec.definitions || {};
//       return TypeGenerator.generate(param.schema, schemas);
//     }
    
//     switch (param.type) {
//       case 'string': return 'string';
//       case 'number':
//       case 'integer': return 'number';
//       case 'boolean': return 'boolean';
//       default: return 'any';
//     }
//   }

//   protected async generateSWR(
//     tagDir: string, 
//     tag: string, 
//     endpoints: GroupedEndpoint[], 
//     usedTypes: Set<string>, 
//     schemas: Record<string, any>
//   ): Promise<void> {
//     // SWR uniquement en mode group-hooks
//     await this.generateTypes(tagDir, usedTypes, schemas);
//     await this.generateSchemas(tagDir, usedTypes, schemas);
//     // ... (implémentation SWR)
//   }

//   protected async generateReactQueryKit(
//     tagDir: string, 
//     tag: string, 
//     endpoints: GroupedEndpoint[], 
//     usedTypes: Set<string>, 
//     schemas: Record<string, any>
//   ): Promise<void> {
//     // React Query Kit uniquement en mode group-hooks
//     await this.generateTypes(tagDir, usedTypes, schemas);
//     await this.generateSchemas(tagDir, usedTypes, schemas);
//     // ... (implémentation React Query Kit)
//   }

//   protected async generateBasic(
//     tagDir: string, 
//     tag: string, 
//     endpoints: GroupedEndpoint[], 
//     usedTypes: Set<string>, 
//     schemas: Record<string, any>
//   ): Promise<void> {
//     // Basic uniquement en mode group-hooks
//     await this.generateTypes(tagDir, usedTypes, schemas);
//     await this.generateSchemas(tagDir, usedTypes, schemas);
//     // ... (implémentation Basic)
//   }

//   protected async generateTypes(tagDir: string, usedTypes: Set<string>, schemas: Record<string, any>): Promise<void> {
//     if (usedTypes.size === 0) return;
    
//     let content = `// ${this.t.generatedTypes}\n\n`;
    
//     for (const typeName of usedTypes) {
//       const schema = schemas[typeName];
//       if (!schema) continue;
      
//       if (schema.properties || schema.type === 'object') {
//         const typeStr = TypeGenerator.generate(schema, schemas);
//         content += `export interface ${typeName} ${typeStr}\n\n`;
//       }
//     }
    
//     const filePath = path.join(tagDir, 'types.ts');
//     await FileUtils.writeIfShould(filePath, content, this.config.preserveModified);
//   }

//   protected async generateSchemas(tagDir: string, usedTypes: Set<string>, schemas: Record<string, any>): Promise<void> {
//     if (usedTypes.size === 0) return;
    
//     const validatorLib = this.config.validator === 'zod' ? 'zod' : 'yup';
//     let content = `// ${this.t.generatedSchemas}\n`;
//     content += this.config.validator === 'zod' ? `import { z } from 'zod';\n\n` : `import * as yup from 'yup';\n\n`;
    
//     for (const typeName of usedTypes) {
//       const schema = schemas[typeName];
//       if (!schema || !schema.properties) continue;
      
//       const schemaName = `${StringUtils.toCamelCase(typeName)}Schema`;
//       const schemaStr = this.config.validator === 'zod'
//         ? this.schemaGenerator.generateZod(schema, schemas)
//         : this.schemaGenerator.generateYup(schema, schemas);
      
//       content += `export const ${schemaName} = ${schemaStr};\n\n`;
//     }
    
//     const filePath = path.join(tagDir, 'schemas.ts');
//     await FileUtils.writeIfShould(filePath, content, this.config.preserveModified);
//   }
// }




import * as fs from 'fs-extra';
import * as path from 'path';
import { SwaggerSpec, GroupedEndpoint, SchemaObject, EndpointSpec } from '../types/swagger';
import { GeneratorConfig, Translations } from '../types/config';
import { StringUtils } from '../utils/string-utils';
import { TypeGenerator } from '../utils/type-generator';
import { SchemaGenerator } from '../utils/schema-generator';
import { FileUtils } from '../utils/file-utils';
import { RTK_CONFIG_TEMPLATE } from '../templates/rtk-config';

const translations: Record<'en' | 'fr', Translations> = {
  en: {
    generatedTypes: 'Auto-generated TypeScript types',
    generatedSchemas: 'Auto-generated validation schemas',
    generatedApi: 'Auto-generated API functions',
    generatedHooks: 'Auto-generated hooks',
    generatedQueries: 'Auto-generated queries',
    generatedMutations: 'Auto-generated mutations',
    generatedFakeData: 'Auto-generated fake data',
    queryHooks: 'Query Hooks',
    mutationHooks: 'Mutation Hooks',
    tooShort: 'Too short',
    tooLong: 'Too long',
    invalidFormat: 'Invalid format',
    invalidEmail: 'Invalid email',
    invalidUuid: 'Invalid UUID',
  },
  fr: {
    generatedTypes: 'Types TypeScript auto-générés',
    generatedSchemas: 'Schémas de validation auto-générés',
    generatedApi: 'Fonctions API auto-générées',
    generatedHooks: 'Hooks auto-générés',
    generatedQueries: 'Requêtes auto-générées',
    generatedMutations: 'Mutations auto-générées',
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

export class BaseGenerator {
  protected spec: SwaggerSpec;
  protected config: GeneratorConfig;
  protected t: Translations;
  protected schemaGenerator: SchemaGenerator;

  constructor(spec: SwaggerSpec, config: GeneratorConfig) {
    this.spec = spec;
    this.config = config;
    this.t = translations[config.language];
    this.schemaGenerator = new SchemaGenerator(this.t);
  }

  async generate(): Promise<void> {
    console.log('🚀 Starting generation...');
    
    // Générer config RTK si nécessaire
    if (this.config.template === 'rtk-query') {
      await this.generateRTKConfig();
    }

    const groupedEndpoints = this.groupEndpointsByTag();
    
    for (const [tag, endpoints] of groupedEndpoints) {
      await this.generateTag(tag, endpoints);
    }

    console.log('✨ Generation complete!');
  }

  protected async generateRTKConfig(): Promise<void> {
    const configDir = path.join(process.cwd(), 'src', 'services');
    await fs.ensureDir(configDir);
    
    const configPath = path.join(configDir, 'config.ts');
    
    if (!await fs.pathExists(configPath)) {
      await fs.writeFile(configPath, RTK_CONFIG_TEMPLATE);
      console.log('✅ Generated src/services/config.ts');
    }
  }

  protected groupEndpointsByTag(): Map<string, GroupedEndpoint[]> {
    const grouped = new Map<string, GroupedEndpoint[]>();
    
    for (const [urlPath, methods] of Object.entries(this.spec.paths)) {
      for (const [method, endpoint] of Object.entries(methods)) {
        if (typeof endpoint !== 'object') continue;
        
        const tags = endpoint.tags || ['default'];
        
        for (const tag of tags) {
          // Filtrer par tags
          if (this.config.includeTags && this.config.includeTags.length > 0 && !this.config.includeTags.includes(tag)) {
            continue;
          }
          
          if (this.config.excludeTags && this.config.excludeTags.includes(tag)) {
            continue;
          }
          
          if (!grouped.has(tag)) {
            grouped.set(tag, []);
          }
          
          // Nettoyer le path
          let cleanPath = urlPath;
          if (this.config.stripBasePath) {
            const basePath = typeof this.config.stripBasePath === 'string' 
              ? this.config.stripBasePath 
              : (this.spec.basePath || '/api/v1');
            cleanPath = urlPath.replace(new RegExp(`^${basePath}`), '');
          }
          
          grouped.get(tag)!.push({ 
            path: cleanPath, 
            method, 
            endpoint 
          });
        }
      }
    }
    
    return grouped;
  }

  protected async generateTag(tag: string, endpoints: GroupedEndpoint[]): Promise<void> {
    const tagDir = path.join(this.config.outputDir, StringUtils.toKebabCase(tag));
    await fs.ensureDir(tagDir);

    // Extraire les types utilisés
    const schemas = this.spec.components?.schemas || this.spec.definitions || {};
    const usedTypes = this.extractUsedTypes(endpoints);

    // Générer types.ts et schemas.ts
    await this.generateTypes(tagDir, usedTypes, schemas);
    await this.generateSchemas(tagDir, usedTypes, schemas);

    // Générer selon le template
    switch (this.config.template) {
      case 'tanstack-query':
        await this.generateTanStackQuery(tagDir, tag, endpoints);
        break;
      case 'rtk-query':
        await this.generateRTKQuery(tagDir, tag, endpoints, usedTypes);
        break;
      case 'swr':
        await this.generateSWR(tagDir, tag, endpoints, usedTypes);
        break;
      case 'react-query-kit':
        await this.generateReactQueryKit(tagDir, tag, endpoints, usedTypes);
        break;
      case 'basic':
        await this.generateBasic(tagDir, tag, endpoints, usedTypes);
        break;
    }

    console.log(`✅ Generated ${tag}`);
  }

  protected extractUsedTypes(endpoints: GroupedEndpoint[]): Set<string> {
    const types = new Set<string>();
    
    for (const { endpoint } of endpoints) {
      // Response types
      for (const response of Object.values(endpoint.responses)) {
        const schema = response.schema || response.content?.['application/json']?.schema;
        if (schema?.$ref) {
          types.add(StringUtils.extractRefName(schema.$ref));
        }
      }
      
      // Request body types
      if (endpoint.requestBody?.content?.['application/json']?.schema?.$ref) {
        types.add(StringUtils.extractRefName(endpoint.requestBody.content['application/json'].schema.$ref));
      }
    }
    
    return types;
  }
// Suite de base.ts

protected async generateTypes(tagDir: string, usedTypes: Set<string>, schemas: Record<string, SchemaObject>): Promise<void> {
  if (usedTypes.size === 0) return;
  
  let content = `// ${this.t.generatedTypes}\n\n`;
  
  for (const typeName of usedTypes) {
    const schema = schemas[typeName];
    if (!schema) continue;
    
    if (schema.properties || schema.type === 'object') {
      const typeStr = TypeGenerator.generate(schema, schemas);
      content += `export interface ${typeName} ${typeStr}\n\n`;
    }
  }
  
  const filePath = path.join(tagDir, 'types.ts');
  await FileUtils.writeIfShould(filePath, content, this.config.preserveModified);
}

protected async generateSchemas(tagDir: string, usedTypes: Set<string>, schemas: Record<string, SchemaObject>): Promise<void> {
  if (usedTypes.size === 0) return;
  
  const validatorLib = this.config.validator === 'zod' ? 'zod' : 'yup';
  let content = `// ${this.t.generatedSchemas}\n`;
  content += this.config.validator === 'zod' ? `import { z } from 'zod';\n\n` : `import * as yup from 'yup';\n\n`;
  
  for (const typeName of usedTypes) {
    const schema = schemas[typeName];
    if (!schema || !schema.properties) continue;
    
    const schemaName = `${StringUtils.toCamelCase(typeName)}Schema`;
    const schemaStr = this.config.validator === 'zod'
      ? this.schemaGenerator.generateZod(schema, schemas)
      : this.schemaGenerator.generateYup(schema, schemas);
    
    content += `export const ${schemaName} = ${schemaStr};\n\n`;
  }
  
  const filePath = path.join(tagDir, 'schemas.ts');
  await FileUtils.writeIfShould(filePath, content, this.config.preserveModified);
}

protected async generateApiFile(tagDir: string, tag: string, endpoints: GroupedEndpoint[]): Promise<void> {
  const apiPath = path.join(tagDir, 'api.ts');
  let content = `// ${this.t.generatedApi}\n`;
  
  if (this.config.httpClient === 'axios') {
    content += `import api from '@/lib/axios';\n`;
  } else {
    content += `const API_URL = process.env.NEXT_PUBLIC_API_URL || '';\n\n`;
    content += `const getAuthHeaders = () => {\n`;
    content += `  const token = localStorage.getItem('token') || localStorage.getItem('authToken');\n`;
    content += `  return token ? { 'Authorization': \`Bearer \${token}\` } : {};\n`;
    content += `};\n\n`;
  }
  
  // Import types si nécessaire
  const usedTypes = this.extractUsedTypes(endpoints);
  if (usedTypes.size > 0) {
    content += `import type { ${Array.from(usedTypes).join(', ')} } from './types';\n\n`;
  }
  
  for (const { path, method, endpoint } of endpoints) {
    content += this.generateApiFunction(path, method, endpoint);
  }
  
  await FileUtils.writeIfShould(apiPath, content, this.config.preserveModified);
}

protected generateApiFunction(urlPath: string, method: string, endpoint: EndpointSpec): string {
  const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
  const funcName = StringUtils.toCamelCase(opId);
  
  const pathParams = (endpoint.parameters || []).filter(p => p.in === 'path');
  const queryParams = (endpoint.parameters || []).filter(p => p.in === 'query');
  const hasBody = !!endpoint.requestBody;
  const isFormData = endpoint.requestBody?.content?.['multipart/form-data'];
  
  // Construire les paramètres
  let params = '';
  if (pathParams.length > 0) {
    params += pathParams.map(p => `${p.name}: string`).join(', ');
  }
  if (hasBody) {
    if (params) params += ', ';
    const bodyType = this.getRequestBodyType(endpoint.requestBody);
    params += `payload: ${bodyType}`;
  }
  if (queryParams.length > 0) {
    if (params) params += ', ';
    params += `params?: { ${queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }`;
  }
  
  // Construire l'URL avec template literals corrects
  let url = urlPath.replace(/{([^}]+)}/g, '${$1}');
  
  let code = `export const ${funcName} = async (${params}) => {\n`;
  
  if (this.config.httpClient === 'axios') {
    //@ts-ignore
    code += this.generateAxiosCall(url, method, hasBody, queryParams.length > 0, isFormData);
  } else {
    //@ts-ignore
    code += this.generateFetchCall(url, method, hasBody, queryParams.length > 0, isFormData);
  }
  
  code += `};\n\n`;
  
  return code;
}

protected generateAxiosCall(url: string, method: string, hasBody: boolean, hasQuery: boolean, isFormData: boolean): string {
  let code = '';
  
  switch (method.toLowerCase()) {
    case 'get':
      code = hasQuery 
        ? `  const { data } = await api.get(\`${url}\`, { params });\n`
        : `  const { data } = await api.get(\`${url}\`);\n`;
      break;
    case 'post':
      if (isFormData) {
        code = `  const { data } = await api.post(\`${url}\`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });\n`;
      } else {
        code = hasBody
          ? `  const { data } = await api.post(\`${url}\`, payload);\n`
          : `  const { data } = await api.post(\`${url}\`);\n`;
      }
      break;
    case 'put':
    case 'patch':
      code = hasBody
        ? `  const { data } = await api.${method.toLowerCase()}(\`${url}\`, payload);\n`
        : `  const { data } = await api.${method.toLowerCase()}(\`${url}\`);\n`;
      break;
    case 'delete':
      code = hasBody
        ? `  const { data } = await api.delete(\`${url}\`, { data: payload });\n`
        : `  const { data } = await api.delete(\`${url}\`);\n`;
      break;
  }
  
  code += `  return data;\n`;
  return code;
}

protected generateFetchCall(url: string, method: string, hasBody: boolean, hasQuery: boolean, isFormData: boolean): string {
  let code = '';
  
  if (hasQuery) {
    code += `  const queryString = new URLSearchParams(params as any).toString();\n`;
    code += `  const fullUrl = \`\${API_URL}${url}?\${queryString}\`;\n`;
  } else {
    code += `  const fullUrl = \`\${API_URL}${url}\`;\n`;
  }
  
  code += `  const headers = { ...getAuthHeaders()`;
  if (!isFormData) {
    code += `, 'Content-Type': 'application/json'`;
  }
  code += ` };\n`;
  
  code += `  const response = await fetch(fullUrl, {\n`;
  code += `    method: '${method.toUpperCase()}',\n`;
  code += `    headers,\n`;
  
  if (hasBody) {
    if (isFormData) {
      code += `    body: payload,\n`;
    } else {
      code += `    body: JSON.stringify(payload),\n`;
    }
  }
  
  code += `  });\n`;
  code += `  if (!response.ok) throw new Error('Request failed');\n`;
  code += `  return response.json();\n`;
  
  return code;
}

protected getRequestBodyType(requestBody: any): string {
  if (!requestBody) return 'any';
  
  const schema = requestBody.content?.['application/json']?.schema ||
                 requestBody.content?.['multipart/form-data']?.schema ||
                 requestBody.content?.['application/x-www-form-urlencoded']?.schema;
  
  if (!schema) return 'any';
  
  if (schema.$ref) {
    return StringUtils.extractRefName(schema.$ref);
  }
  
  const schemas = this.spec.components?.schemas || this.spec.definitions || {};
  return TypeGenerator.generate(schema, schemas);
}

protected getParamType(param: any): string {
  if (param.schema) {
    const schemas = this.spec.components?.schemas || this.spec.definitions || {};
    return TypeGenerator.generate(param.schema, schemas);
  }
  
  switch (param.type) {
    case 'string': return 'string';
    case 'number':
    case 'integer': return 'number';
    case 'boolean': return 'boolean';
    default: return 'any';
  }
}
// Suite de base.ts - Génération par template

  // ==================== TANSTACK QUERY ====================
  protected async generateTanStackQuery(tagDir: string, tag: string, endpoints: GroupedEndpoint[]): Promise<void> {
    // Générer api.ts
    await this.generateApiFile(tagDir, tag, endpoints);
    
    // Générer hooks.ts (mode group-hooks)
    if (this.config.structureMode === 'group-hooks') {
      await this.generateTanStackGroupHooks(tagDir, tag, endpoints);
    }
    // Pour split et group: à implémenter si nécessaire
  }

  protected async generateTanStackGroupHooks(tagDir: string, tag: string, endpoints: GroupedEndpoint[]): Promise<void> {
    const hooksPath = path.join(tagDir, 'hooks.ts');
    let content = `// ${this.t.generatedHooks}\n`;
    content += `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';\n`;
    content += `import { queryKeys } from '@/lib/query-keys';\n`;
    
    // Import API functions
    const apiImports = endpoints.map(({ method, endpoint, path }) => {
      const opId = endpoint.operationId || `${method}${path.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
      return StringUtils.toCamelCase(opId);
    });
    
    content += `import {\n  ${apiImports.join(',\n  ')}\n} from './api';\n\n`;
    
    content += `// ${this.t.queryHooks}\n\n`;
    
    for (const { path, method, endpoint } of endpoints) {
      if (method.toLowerCase() === 'get') {
        content += this.generateTanStackQueryHook(path, method, endpoint, tag);
      }
    }
    
    content += `\n// ${this.t.mutationHooks}\n\n`;
    
    for (const { path, method, endpoint } of endpoints) {
      if (method.toLowerCase() !== 'get') {
        content += this.generateTanStackMutationHook(path, method, endpoint, tag);
      }
    }
    
    await FileUtils.writeIfShould(hooksPath, content, this.config.preserveModified);
  }

  protected generateTanStackQueryHook(urlPath: string, method: string, endpoint: EndpointSpec, tag: string): string {
    const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
    const hookName = `use${StringUtils.toPascalCase(opId)}`;
    const funcName = StringUtils.toCamelCase(opId);
    const tagCamel = StringUtils.toCamelCase(tag);
    
    const pathParams = (endpoint.parameters || []).filter(p => p.in === 'path');
    const queryParams = (endpoint.parameters || []).filter(p => p.in === 'query');
    
    let params = '';
    let queryKey = '';
    let enabled = '';
    let queryFn = '';
    
    if (pathParams.length > 0) {
      params = pathParams.map(p => `${p.name}: string`).join(', ');
      queryKey = `queryKeys.${tagCamel}.detail(${pathParams[0].name})`;
      enabled = `    enabled: !!(${pathParams.map(p => p.name).join(' && ')}),\n`;
      queryFn = `() => ${funcName}(${pathParams.map(p => p.name).join(', ')})`;
    } else if (queryParams.length > 0) {
      params = `params?: { ${queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }`;
      queryKey = `queryKeys.${tagCamel}.list(params)`;
      queryFn = `() => ${funcName}(params)`;
    } else {
      queryKey = `queryKeys.${tagCamel}.lists()`;
      queryFn = funcName;
    }
    
    let code = `export const ${hookName} = (${params}) => {\n`;
    code += `  return useQuery({\n`;
    code += `    queryKey: ${queryKey},\n`;
    code += `    queryFn: ${queryFn},\n`;
    code += enabled;
    code += `  });\n`;
    code += `};\n\n`;
    
    return code;
  }

  protected generateTanStackMutationHook(urlPath: string, method: string, endpoint: EndpointSpec, tag: string): string {
    const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
    const hookName = `use${StringUtils.toPascalCase(opId)}`;
    const funcName = StringUtils.toCamelCase(opId);
    const tagCamel = StringUtils.toCamelCase(tag);
    
    const pathParams = (endpoint.parameters || []).filter(p => p.in === 'path');
    const hasBody = !!endpoint.requestBody;
    
    let mutationFnType = '';
    let mutationFnCall = '';
    
    if (pathParams.length > 0 && hasBody) {
      const bodyType = this.getRequestBodyType(endpoint.requestBody);
      mutationFnType = `(vars: ${bodyType} & { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`;
      mutationFnCall = `${funcName}(${pathParams.map(p => `vars.${p.name}`).join(', ')}, vars)`;
    } else if (pathParams.length > 0) {
      mutationFnType = `(vars: { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`;
      mutationFnCall = `${funcName}(${pathParams.map(p => `vars.${p.name}`).join(', ')})`;
    } else if (hasBody) {
      const bodyType = this.getRequestBodyType(endpoint.requestBody);
      mutationFnType = `(payload: ${bodyType})`;
      mutationFnCall = `${funcName}(payload)`;
    } else {
      mutationFnType = '()';
      mutationFnCall = `${funcName}()`;
    }
    
    let code = `export const ${hookName} = () => {\n`;
    code += `  const queryClient = useQueryClient();\n\n`;
    code += `  return useMutation({\n`;
    code += `    mutationFn: ${mutationFnType} => ${mutationFnCall},\n`;
    code += `    onSuccess: () => {\n`;
    code += `      queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamel}.all });\n`;
    code += `    },\n`;
    code += `  });\n`;
    code += `};\n\n`;
    
    return code;
  }

  // ==================== RTK QUERY ====================
  protected async generateRTKQuery(tagDir: string, tag: string, endpoints: GroupedEndpoint[], usedTypes: Set<string>): Promise<void> {
    const fileName = 'hooks.ts';
    const filePath = path.join(tagDir, fileName);
    
    let content = `// ${this.t.generatedHooks}\n`;
    content += `import { apiInstance, invalidateOn, RESPONSE_BODY_KEY, ResponseError } from '@/services/config';\n`;
    
    // Import types seulement s'il y en a
    if (usedTypes.size > 0) {
      content += `import type { ${Array.from(usedTypes).join(', ')} } from './types';\n\n`;
    } else {
      content += '\n';
    }
    
    const tagCamel = StringUtils.toCamelCase(tag);
    const tagPascal = StringUtils.toPascalCase(tag);
    
    content += `export const ${tagCamel}Api = apiInstance.injectEndpoints({\n`;
    content += `  endpoints: (builder) => ({\n`;
    
    for (const { path, method, endpoint } of endpoints) {
      content += this.generateRTKEndpoint(path, method, endpoint, tagPascal);
    }
    
    content += `  }),\n});\n\n`;
    
    // Export hooks
    const hookNames = endpoints.map(({ method, endpoint, path }) => {
      const opId = endpoint.operationId || `${method}${path.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
      const hookPrefix = 'use';
      const hookSuffix = method.toLowerCase() === 'get' ? 'Query' : 'Mutation';
      return `${hookPrefix}${StringUtils.toPascalCase(opId)}${hookSuffix}`;
    });
    
    content += `export const {\n  ${hookNames.join(',\n  ')}\n} = ${tagCamel}Api;\n`;
    
    await FileUtils.writeIfShould(filePath, content, this.config.preserveModified);
  }

  protected generateRTKEndpoint(urlPath: string, method: string, endpoint: EndpointSpec, tagPascal: string): string {
    const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
    const isQuery = method.toLowerCase() === 'get';
    const endpointName = StringUtils.toCamelCase(opId);
    
    const pathParams = (endpoint.parameters || []).filter(p => p.in === 'path');
    const hasBody = !!endpoint.requestBody;
    const isFormData = endpoint.requestBody?.content?.['multipart/form-data'];
    
    let params = '';
    if (pathParams.length > 0 && hasBody) {
      params = `{ ${pathParams.map(p => p.name).join(', ')}, payload }`;
    } else if (pathParams.length > 0) {
      params = `{ ${pathParams.map(p => p.name).join(', ')} }`;
    } else if (hasBody) {
      params = 'payload';
    }
    
    // Construire l'URL
    let url = urlPath.replace(/{([^}]+)}/g, '${$1}');
    
    let code = `    ${endpointName}: builder.${isQuery ? 'query' : 'mutation'}({\n`;
    code += `      query: (${params}) => ({\n`;
    code += `        url: \`${url}\`,\n`;
    
    if (!isQuery) {
      code += `        method: '${method.toUpperCase()}',\n`;
      
      if (hasBody) {
        code += `        body: payload,\n`;
        
        if (isFormData) {
          code += `        headers: { 'Content-Type': 'multipart/form-data' },\n`;
        }
      }
    }
    
    code += `      }),\n`;
    code += `      providesTags: ['${tagPascal}'],\n`;
    code += `    }),\n`;
    
    return code;
  }

  // ==================== SWR, REACT-QUERY-KIT, BASIC ====================
  protected async generateSWR(tagDir: string, tag: string, endpoints: GroupedEndpoint[], usedTypes: Set<string>): Promise<void> {
    // Générer api.ts
    await this.generateApiFile(tagDir, tag, endpoints);
    
    // Générer hooks.ts avec SWR
    const hooksPath = path.join(tagDir, 'hooks.ts');
    let content = `// ${this.t.generatedHooks}\n`;
    content += `import useSWR from 'swr';\n`;
    content += `import { useSWRConfig } from 'swr';\n`;
    content += `import { useState } from 'react';\n`;
    
    const apiImports = endpoints.map(({ method, endpoint, path }) => {
      const opId = endpoint.operationId || `${method}${path.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
      return StringUtils.toCamelCase(opId);
    });
    
    content += `import {\n  ${apiImports.join(',\n  ')}\n} from './api';\n\n`;
    content += `// Query and Mutation hooks\n\n`;
    
    for (const { path, method, endpoint } of endpoints) {
      if (method.toLowerCase() === 'get') {
        content += this.generateSWRQueryHook(path, method, endpoint);
      } else {
        content += this.generateSWRMutationHook(path, method, endpoint);
      }
    }
    
    await FileUtils.writeIfShould(hooksPath, content, this.config.preserveModified);
  }

  protected generateSWRQueryHook(urlPath: string, method: string, endpoint: EndpointSpec): string {
    const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
    const hookName = `use${StringUtils.toPascalCase(opId)}`;
    const funcName = StringUtils.toCamelCase(opId);
    
    const pathParams = (endpoint.parameters || []).filter(p => p.in === 'path');
    
    let params = pathParams.length > 0 ? pathParams.map(p => `${p.name}: string`).join(', ') : '';
    let swrKey = pathParams.length > 0 ? `\`${urlPath.replace(/{([^}]+)}/g, '${$1}')}\`` : `'${urlPath}'`;
    let fetcher = pathParams.length > 0 ? `() => ${funcName}(${pathParams.map(p => p.name).join(', ')})` : funcName;
    
    let code = `export const ${hookName} = (${params}) => {\n`;
    code += `  const { data, error, isLoading } = useSWR(${swrKey}, ${fetcher});\n`;
    code += `  return { data, error, isLoading };\n`;
    code += `};\n\n`;
    
    return code;
  }

  protected generateSWRMutationHook(urlPath: string, method: string, endpoint: EndpointSpec): string {
    const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
    const hookName = `use${StringUtils.toPascalCase(opId)}`;
    const funcName = StringUtils.toCamelCase(opId);
    
    const hasBody = !!endpoint.requestBody;
    let mutationFnType = hasBody ? `(payload: any)` : '()';
    let mutationFnCall = hasBody ? `await ${funcName}(payload)` : `await ${funcName}()`;
    
    let code = `export const ${hookName} = () => {\n`;
    code += `  const { mutate } = useSWRConfig();\n`;
    code += `  const [loading, setLoading] = useState(false);\n`;
    code += `  const [error, setError] = useState<Error | null>(null);\n\n`;
    code += `  const trigger = async ${mutationFnType} => {\n`;
    code += `    setLoading(true);\n`;
    code += `    try {\n`;
    code += `      const result = ${mutationFnCall};\n`;
    code += `      mutate('${urlPath}');\n`;
    code += `      setLoading(false);\n`;
    code += `      return result;\n`;
    code += `    } catch (err: any) {\n`;
    code += `      setError(err);\n`;
    code += `      setLoading(false);\n`;
    code += `      throw err;\n`;
    code += `    }\n`;
    code += `  };\n\n`;
    code += `  return { trigger, loading, error };\n`;
    code += `};\n\n`;
    
    return code;
  }

  protected async generateReactQueryKit(tagDir: string, tag: string, endpoints: GroupedEndpoint[], usedTypes: Set<string>): Promise<void> {
    const hooksPath = path.join(tagDir, 'hooks.ts');
    let content = `// ${this.t.generatedHooks}\n`;
    content += `import { createQuery, createMutation } from 'react-query-kit';\n`;
    
    if (this.config.httpClient === 'axios') {
      content += `import api from '@/lib/axios';\n\n`;
    }
    
    for (const { path, method, endpoint } of endpoints) {
      if (method.toLowerCase() === 'get') {
        content += this.generateReactQueryKitQuery(path, method, endpoint);
      } else {
        content += this.generateReactQueryKitMutation(path, method, endpoint);
      }
    }
    
    await FileUtils.writeIfShould(hooksPath, content, this.config.preserveModified);
  }

  protected generateReactQueryKitQuery(urlPath: string, method: string, endpoint: EndpointSpec): string {
    const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
    const hookName = `use${StringUtils.toPascalCase(opId)}`;
    
    let code = `export const ${hookName} = createQuery({\n`;
    code += `  queryKey: ['${urlPath}'],\n`;
    code += `  fetcher: () => api.get('${urlPath}').then(res => res.data),\n`;
    code += `});\n\n`;
    
    return code;
  }

  protected generateReactQueryKitMutation(urlPath: string, method: string, endpoint: EndpointSpec): string {
    const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
    const hookName = `use${StringUtils.toPascalCase(opId)}`;
    const hasBody = !!endpoint.requestBody;
    
    let code = `export const ${hookName} = createMutation({\n`;
    code += `  mutationKey: ['${urlPath}'],\n`;
    code += hasBody 
      ? `  mutationFn: (data: any) => api.${method.toLowerCase()}('${urlPath}', data),\n`
      : `  mutationFn: () => api.${method.toLowerCase()}('${urlPath}'),\n`;
    code += `});\n\n`;
    
    return code;
  }

  protected async generateBasic(tagDir: string, tag: string, endpoints: GroupedEndpoint[], usedTypes: Set<string>): Promise<void> {
    // Générer api.ts
    await this.generateApiFile(tagDir, tag, endpoints);
    
    // Générer hooks.ts avec useState/useEffect
    const hooksPath = path.join(tagDir, 'hooks.ts');
    let content = `// ${this.t.generatedHooks}\n`;
    content += `import { useState, useEffect } from 'react';\n`;
    
    const apiImports = endpoints.map(({ method, endpoint, path }) => {
      const opId = endpoint.operationId || `${method}${path.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
      return StringUtils.toCamelCase(opId);
    });
    
    content += `import {\n  ${apiImports.join(',\n  ')}\n} from './api';\n\n`;
    
    for (const { path, method, endpoint } of endpoints) {
      if (method.toLowerCase() === 'get') {
        content += this.generateBasicQueryHook(path, method, endpoint);
      } else {
        content += this.generateBasicMutationHook(path, method, endpoint);
      }
    }
    
    await FileUtils.writeIfShould(hooksPath, content, this.config.preserveModified);
  }

  protected generateBasicQueryHook(urlPath: string, method: string, endpoint: EndpointSpec): string {
    const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
    const hookName = `use${StringUtils.toPascalCase(opId)}`;
    const funcName = StringUtils.toCamelCase(opId);
    
    let code = `export const ${hookName} = () => {\n`;
    code += `  const [data, setData] = useState<any>(null);\n`;
    code += `  const [loading, setLoading] = useState(true);\n`;
    code += `  const [error, setError] = useState<Error | null>(null);\n\n`;
    code += `  useEffect(() => {\n`;
    code += `    ${funcName}()\n`;
    code += `      .then(setData)\n`;
    code += `      .catch(setError)\n`;
    code += `      .finally(() => setLoading(false));\n`;
    code += `  }, []);\n\n`;
    code += `  return { data, loading, error };\n`;
    code += `};\n\n`;
    
    return code;
  }

  protected generateBasicMutationHook(urlPath: string, method: string, endpoint: EndpointSpec): string {
    const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
    const hookName = `use${StringUtils.toPascalCase(opId)}`;
    const funcName = StringUtils.toCamelCase(opId);
    const hasBody = !!endpoint.requestBody;
    
    let mutationFnType = hasBody ? `(payload: any)` : '()';
    let mutationFnCall = hasBody ? `await ${funcName}(payload)` : `await ${funcName}()`;
    
    let code = `export const ${hookName} = () => {\n`;
    code += `  const [loading, setLoading] = useState(false);\n`;
    code += `  const [error, setError] = useState<Error | null>(null);\n\n`;
    code += `  const mutate = async ${mutationFnType} => {\n`;
    code += `    setLoading(true);\n`;
    code += `    try {\n`;
    code += `      const result = ${mutationFnCall};\n`;
    code += `      setLoading(false);\n`;
    code += `      return result;\n`;
    code += `    } catch (err: any) {\n`;
    code += `      setError(err);\n`;
    code += `      setLoading(false);\n`;
    code += `      throw err;\n`;
    code += `    }\n`;
    code += `  };\n\n`;
    code += `  return { mutate, loading, error };\n`;
    code += `};\n\n`;
    
    return code;
  }
}
  // À SUIVRE: generateTypes, generateSchemas, etc.
