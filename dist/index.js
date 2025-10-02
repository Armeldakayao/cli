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
        generatedQueries: 'Auto-generated queries from Swagger/OpenAPI spec',
        generatedMutations: 'Auto-generated mutations from Swagger/OpenAPI spec',
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
        generatedQueries: 'Requêtes auto-générées depuis la spécification Swagger/OpenAPI',
        generatedMutations: 'Mutations auto-générées depuis la spécification Swagger/OpenAPI',
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

    stripBasePath(path) {
        if (this.config.stripBasePath) {
            const basePath = typeof this.config.stripBasePath === 'string' 
                ? this.config.stripBasePath 
                : (this.spec.basePath || '/api/v1');
            return path.replace(new RegExp(`^${basePath}`), '');
        }
        return path;
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
        if (!schema.properties) return '';
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
            queryKeys += `    all: ["${tagCamelCase}"] as const,\n`;
            queryKeys += `    lists: () => [...queryKeys.${tagCamelCase}.all, "list"] as const,\n`;
            queryKeys += `    list: (filters: any) => [...queryKeys.${tagCamelCase}.lists(), filters] as const,\n`;
            queryKeys += `    details: () => [...queryKeys.${tagCamelCase}.all, "detail"] as const,\n`;
            queryKeys += `    detail: (id: string) => [...queryKeys.${tagCamelCase}.details(), id] as const,\n`;
            queryKeys += `  },\n`;
        }
        queryKeys += `};\n`;
        return queryKeys;
    }

    hasFileUpload(endpoint) {
        return !!endpoint.requestBody?.content?.['multipart/form-data'];
    }

    generateApiFunction(path, method, endpoint, tag) {
        const functionName = endpoint.operationId ||
            `${method}${path.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
        const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
        const queryParams = endpoint.parameters?.filter(p => p.in === 'query') || [];
        const hasRequestBody = !!endpoint.requestBody;
        const hasFileUpload = this.hasFileUpload(endpoint);
        const responseType = this.getResponseType(endpoint.responses);
        const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : '';

        let params = '';
        let apiCall = '';
        let urlPath = this.stripBasePath(path);

        if (pathParams.length > 0) {
            pathParams.forEach(param => {
                params += `${param.name}: string, `;
                urlPath = urlPath.replace(`{${param.name}}`, `\${${param.name}}`);
            });
        }

        if (hasRequestBody) {
            params += hasFileUpload 
                ? `${this.toCamelCase(functionName)}Data: { ${Object.keys(this.getRequestBodyProperties(endpoint.requestBody)).map(k => `${k}: ${k === 'file' || k.includes('file') || k.includes('File') ? 'File' : 'any'}`).join('; ')} }, `
                : `payload: ${requestBodyType}, `;
        }

        if (queryParams.length > 0) {
            params += `params?: { ${queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }, `;
        }

        params = params.replace(/, $/, '');

        const payloadVar = hasFileUpload ? `${this.toCamelCase(functionName)}Data` : 'payload';
        const headersConfig = hasFileUpload ? `, { headers: { 'Content-Type': 'multipart/form-data' } }` : '';

        switch (method.toLowerCase()) {
            case 'get':
                apiCall = queryParams.length > 0
                    ? `api.get<${responseType}>(\`${urlPath}\`, { params })`
                    : `api.get<${responseType}>(\`${urlPath}\`)`;
                break;
            case 'post':
                if (hasRequestBody) {
                    apiCall = queryParams.length > 0
                        ? `api.post<${responseType}>(\`${urlPath}\`, ${payloadVar}, { params${headersConfig.replace(', {', ', ...')} })`
                        : `api.post<${responseType}>(\`${urlPath}\`, ${payloadVar}${headersConfig})`;
                } else {
                    apiCall = `api.post<${responseType}>(\`${urlPath}\`)`;
                }
                break;
            case 'put':
                if (hasRequestBody) {
                    apiCall = `api.put<${responseType}>(\`${urlPath}\`, ${payloadVar}${headersConfig})`;
                } else {
                    apiCall = `api.put<${responseType}>(\`${urlPath}\`)`;
                }
                break;
            case 'patch':
                if (hasRequestBody) {
                    apiCall = `api.patch<${responseType}>(\`${urlPath}\`, ${payloadVar}${headersConfig})`;
                } else {
                    apiCall = `api.patch<${responseType}>(\`${urlPath}\`)`;
                }
                break;
            case 'delete':
                if (hasRequestBody) {
                    apiCall = `api.delete<${responseType}>(\`${urlPath}\`, { data: ${payloadVar} })`;
                } else {
                    apiCall = `api.delete<${responseType}>(\`${urlPath}\`)`;
                }
                break;
        }

        const description = endpoint.description || endpoint.summary || '';
        const jsdoc = description ? `/**\n * ${description}\n */\n` : '';
        return `${jsdoc}export const ${this.toCamelCase(functionName)} = async (${params}) => {\n  const { data } = await ${apiCall};\n  return data;\n};\n\n`;
    }

    getRequestBodyProperties(requestBody) {
        if (!requestBody) return {};
        const schema = requestBody.content?.['application/json']?.schema ||
            requestBody.content?.['multipart/form-data']?.schema ||
            requestBody.content?.['application/x-www-form-urlencoded']?.schema;
        return schema?.properties || {};
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
        } else if (queryParams.length > 0) {
            const queryParamType = `{ ${queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }`;
            params = `params?: ${queryParamType}`;
            queryKey = `queryKeys.${tagCamelCase}.list(params)`;
        } else {
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
        const hasFileUpload = this.hasFileUpload(endpoint);
        const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : '';

        let mutationFnType = '';
        if (pathParams.length > 0 && hasRequestBody) {
            mutationFnType = hasFileUpload
                ? `(payload: { ${Object.keys(this.getRequestBodyProperties(endpoint.requestBody)).map(k => `${k}: any`).join('; ')} } & { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`
                : `(payload: ${requestBodyType} & { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`;
        } else if (pathParams.length > 0) {
            mutationFnType = `(payload: { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`;
        } else if (hasRequestBody) {
            mutationFnType = hasFileUpload
                ? `(payload: { ${Object.keys(this.getRequestBodyProperties(endpoint.requestBody)).map(k => `${k}: any`).join('; ')} })`
                : `(payload: ${requestBodyType})`;
        } else {
            mutationFnType = '()';
        }

        let mutationFnCall = '';
        if (pathParams.length > 0 && hasRequestBody) {
            const pathParamsList = pathParams.map(p => `payload.${p.name}`).join(', ');
            mutationFnCall = `${apiFunctionName}(${pathParamsList}, payload)`;
        } else if (pathParams.length > 0) {
            const pathParamsList = pathParams.map(p => `payload.${p.name}`).join(', ');
            mutationFnCall = `${apiFunctionName}(${pathParamsList})`;
        } else if (hasRequestBody) {
            mutationFnCall = `${apiFunctionName}(payload)`;
        } else {
            mutationFnCall = `${apiFunctionName}()`;
        }

        let invalidateQueries = '';
        if (method.toLowerCase() === 'delete') {
            invalidateQueries = `queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.all });\n      queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.lists() });`;
        } else if (method.toLowerCase() === 'post') {
            invalidateQueries = `queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.lists() });`;
        } else {
            invalidateQueries = `queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.all });\n      queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.lists() });`;
        }

        const description = endpoint.description || endpoint.summary || '';
        const jsdoc = description ? `/**\n * ${description}\n */\n` : '';
        return `${jsdoc}export const ${hookName} = () => {\n  const queryClient = useQueryClient();\n  \n  return useMutation({\n    mutationFn: ${mutationFnType} => ${mutationFnCall},\n    onSuccess: () => {\n      ${invalidateQueries}\n    },\n  });\n};\n\n`;
    }

    getResponseType(responses) {
        const successResponse = responses['200'] || responses['201'] || responses['default'];
        if (!successResponse) return 'any';
        const schema = successResponse.schema ||
            successResponse.content?.['application/json']?.schema;
        if (!schema) return 'any';
        return this.generateTypeScript(schema, this.getSchemas());
    }

    getRequestBodyType(requestBody) {
        if (!requestBody) return '';
        const schema = requestBody.content?.['application/json']?.schema ||
            requestBody.content?.['application/x-www-form-urlencoded']?.schema;
        if (!schema) return 'any';
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
                if (typeof endpoint !== 'object') continue;
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
            if (responseType !== 'any' && !responseType.includes('{')) {
                types.add(responseType);
            }
            if (endpoint.requestBody) {
                const requestBodyType = this.getRequestBodyType(endpoint.requestBody);
                if (requestBodyType !== 'any' && !requestBodyType.includes('{')) {
                    types.add(requestBodyType);
                }
            }
        }
        return types;
    }

    async shouldOverwriteFile(filePath) {
        if (!this.config.preserveModified) return true;
        const exists = await fs.pathExists(filePath);
        if (!exists) return true;
        const content = await fs.readFile(filePath, 'utf-8');
        // Check for various user modification markers
        const hasUserModifications = 
            content.includes('// CUSTOM') ||
            content.includes('// Modified') ||
            content.includes('// TODO') ||
            content.includes('// KEEP') ||
            content.includes('// USER:') ||
            content.includes('/* CUSTOM') ||
            content.includes('/* Modified') ||
            // Check if file was significantly modified (more than 20% different from template structure)
            this.hasSignificantModifications(content);
        return !hasUserModifications;
    }

    hasSignificantModifications(content) {
        // Check if imports were added beyond template
        const extraImports = (content.match(/^import .+ from/gm) || []).length > 10;
        // Check for custom functions
        const customFunctions = content.includes('// Custom function') || 
                                content.includes('export const custom') ||
                                content.includes('export function custom');
        return extraImports || customFunctions;
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
            const axiosConfig = `import axios from 'axios';

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

            // Generate content based on template
            const template = this.config.template || 'tanstack-query';
            const structureMode = this.config.structureMode || 'group-hooks';

            if (template === 'tanstack-query') {
                await this.generateTanStackQuery(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode);
            } else if (template === 'rtk-query') {
                await this.generateRTKQuery(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode);
            } else if (template === 'swr') {
                await this.generateSWR(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode);
            } else if (template === 'react-query-kit') {
                await this.generateReactQueryKit(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode);
            } else if (template === 'basic') {
                await this.generateBasic(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode);
            }

            console.log(`✅ Generated ${tag} files`);
        }

        console.log(`\n✨ Generation complete!`);
        console.log(`📁 Files generated in ${this.config.outputDir}`);
        console.log(`🔑 Query keys in lib/query-keys.ts`);
        console.log(`⚡ Axios config in lib/axios.ts`);
    }

    // ==================== TANSTACK QUERY ====================
    async generateTanStackQuery(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode) {
        if (structureMode === 'split') {
            await this.generateTanStackSplit(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas);
        } else if (structureMode === 'group') {
            await this.generateTanStackGroup(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas);
        } else {
            await this.generateTanStackGroupHooks(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas);
        }
    }

    async generateTanStackSplit(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas) {
        const apiDir = path.join(tagDir, 'api');
        const queriesDir = path.join(tagDir, 'queries');
        const mutationsDir = path.join(tagDir, 'mutations');
        
        await fs.ensureDir(apiDir);
        await fs.ensureDir(queriesDir);
        await fs.ensureDir(mutationsDir);

        // Write types and schemas
        await this.writeIfShould(path.join(tagDir, 'types.ts'), tagTypes);
        await this.writeIfShould(path.join(tagDir, 'schemas.ts'), tagSchemas);

        const queryExports = [];
        const mutationExports = [];

        for (const { path: endpointPath, method, endpoint } of endpoints) {
            const functionName = endpoint.operationId ||
                `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
            const camelFunctionName = this.toCamelCase(functionName);

            // Generate API function
            const apiContent = `import api from '@/lib/axios';\n${usedTypes.size > 0 ? `import type { ${Array.from(usedTypes).join(', ')} } from '../types';\n\n` : '\n'}${this.generateApiFunction(endpointPath, method, endpoint, tag)}`;
            await this.writeIfShould(path.join(apiDir, `${camelFunctionName}.ts`), apiContent);

            if (method.toLowerCase() === 'get') {
                // Generate query hook
                const hookContent = `import { useQuery } from "@tanstack/react-query";\nimport { queryKeys } from '@/lib/query-keys';\nimport { ${camelFunctionName} } from '../api/${camelFunctionName}';\n${usedTypes.size > 0 ? `import type { ${Array.from(usedTypes).join(', ')} } from '../types';\n\n` : '\n'}${this.generateQueryHook(endpointPath, method, endpoint, tag).replace(`import {`, `// Import moved to top\nexport const`).replace(`} from './api';\n\n`, ``)}`;
                const hookName = `use${this.toPascalCase(functionName)}`;
                await this.writeIfShould(path.join(queriesDir, `${hookName}.ts`), hookContent);
                queryExports.push(hookName);
            } else {
                // Generate mutation hook
                const hookContent = `import { useMutation, useQueryClient } from "@tanstack/react-query";\nimport { queryKeys } from '@/lib/query-keys';\nimport { ${camelFunctionName} } from '../api/${camelFunctionName}';\n${usedTypes.size > 0 ? `import type { ${Array.from(usedTypes).join(', ')} } from '../types';\n\n` : '\n'}${this.generateMutationHook(endpointPath, method, endpoint, tag).replace(`import {`, `// Import moved to top\nexport const`).replace(`} from './api';\n\n`, ``)}`;
                const hookName = `use${this.toPascalCase(functionName)}`;
                await this.writeIfShould(path.join(mutationsDir, `${hookName}.ts`), hookContent);
                mutationExports.push(hookName);
            }
        }

        // Generate index files
        if (queryExports.length > 0) {
            const queriesIndex = queryExports.map(h => `export { ${h} } from './${h}';`).join('\n');
            await this.writeIfShould(path.join(queriesDir, 'index.ts'), queriesIndex);
        }

        if (mutationExports.length > 0) {
            const mutationsIndex = mutationExports.map(h => `export { ${h} } from './${h}';`).join('\n');
            await this.writeIfShould(path.join(mutationsDir, 'index.ts'), mutationsIndex);
        }

        // Generate fake data if enabled
        if (this.config.generateFakeData) {
            await this.generateFakeDataFile(tagDir, usedTypes, schemas);
        }
    }

    async generateTanStackGroup(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas) {
        // Write types and schemas
        await this.writeIfShould(path.join(tagDir, 'types.ts'), tagTypes);
        await this.writeIfShould(path.join(tagDir, 'schemas.ts'), tagSchemas);

        // API functions
        let apiContent = `// ${this.t.generatedApi} - ${tag}\nimport api from '@/lib/axios';\n`;
        if (usedTypes.size > 0) {
            apiContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n\n`;
        } else {
            apiContent += '\n';
        }

        for (const { path: endpointPath, method, endpoint } of endpoints) {
            apiContent += this.generateApiFunction(endpointPath, method, endpoint, tag);
        }

        await this.writeIfShould(path.join(tagDir, 'api.ts'), apiContent);

        // Queries
        let queriesContent = `// ${this.t.generatedQueries} - ${tag}\nimport { useQuery } from "@tanstack/react-query";\nimport { queryKeys } from '@/lib/query-keys';\n`;
        if (usedTypes.size > 0) {
            queriesContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n`;
        }
        
        const apiFunctions = [];
        for (const { path: endpointPath, method, endpoint } of endpoints) {
            if (method.toLowerCase() === 'get') {
                const functionName = endpoint.operationId ||
                    `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
                apiFunctions.push(`  ${this.toCamelCase(functionName)}`);
            }
        }

        if (apiFunctions.length > 0) {
            queriesContent += `import {\n${apiFunctions.join(',\n')}\n} from './api';\n\n`;

            for (const { path: endpointPath, method, endpoint } of endpoints) {
                if (method.toLowerCase() === 'get') {
                    queriesContent += this.generateQueryHook(endpointPath, method, endpoint, tag);
                }
            }
            await this.writeIfShould(path.join(tagDir, 'queries.ts'), queriesContent);
        }

        // Mutations
        let mutationsContent = `// ${this.t.generatedMutations} - ${tag}\nimport { useMutation, useQueryClient } from "@tanstack/react-query";\nimport { queryKeys } from '@/lib/query-keys';\n`;
        if (usedTypes.size > 0) {
            mutationsContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n`;
        }

        const mutationFunctions = [];
        for (const { path: endpointPath, method, endpoint } of endpoints) {
            if (method.toLowerCase() !== 'get') {
                const functionName = endpoint.operationId ||
                    `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
                mutationFunctions.push(`  ${this.toCamelCase(functionName)}`);
            }
        }

        if (mutationFunctions.length > 0) {
            mutationsContent += `import {\n${mutationFunctions.join(',\n')}\n} from './api';\n\n`;

            for (const { path: endpointPath, method, endpoint } of endpoints) {
                if (method.toLowerCase() !== 'get') {
                    mutationsContent += this.generateMutationHook(endpointPath, method, endpoint, tag);
                }
            }
            await this.writeIfShould(path.join(tagDir, 'mutations.ts'), mutationsContent);
        }

        if (this.config.generateFakeData) {
            await this.generateFakeDataFile(tagDir, usedTypes, schemas);
        }
    }

    async generateTanStackGroupHooks(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas) {
        await this.writeIfShould(path.join(tagDir, 'types.ts'), tagTypes);
        await this.writeIfShould(path.join(tagDir, 'schemas.ts'), tagSchemas);

        let hooksContent = `// ${this.t.generatedHooks} - ${tag}\nimport { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";\nimport { queryKeys } from '@/lib/query-keys';\nimport api from '@/lib/axios';\n`;
        if (usedTypes.size > 0) {
            hooksContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n\n`;
        } else {
            hooksContent += '\n';
        }

        hooksContent += `// ${this.t.queryHooks}\n\n`;

        for (const { path: endpointPath, method, endpoint } of endpoints) {
            const functionName = endpoint.operationId ||
                `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
            
            // Inline API function
            hooksContent += this.generateApiFunction(endpointPath, method, endpoint, tag);

            if (method.toLowerCase() === 'get') {
                hooksContent += this.generateQueryHook(endpointPath, method, endpoint, tag);
            }
        }

        hooksContent += `\n// ${this.t.mutationHooks}\n\n`;

        for (const { path: endpointPath, method, endpoint } of endpoints) {
            if (method.toLowerCase() !== 'get') {
                hooksContent += this.generateMutationHook(endpointPath, method, endpoint, tag);
            }
        }

        await this.writeIfShould(path.join(tagDir, 'hooks.ts'), hooksContent);

        if (this.config.generateFakeData) {
            await this.generateFakeDataFile(tagDir, usedTypes, schemas);
        }
    }

    // ==================== RTK QUERY ====================
    async generateRTKQuery(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode) {
        await this.writeIfShould(path.join(tagDir, 'types.ts'), tagTypes);
        await this.writeIfShould(path.join(tagDir, 'schemas.ts'), tagSchemas);

        const tagCamelCase = this.toCamelCase(tag.replace(/[^a-zA-Z0-9]/g, ''));
        
        let apiSliceContent = `// ${this.t.generatedApi} - ${tag}\nimport { apiInstance, invalidateOn } from "@/services/config";\n`;
        if (usedTypes.size > 0) {
            apiSliceContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n\n`;
        } else {
            apiSliceContent += '\n';
        }

        apiSliceContent += `export const ${tagCamelCase}Api = apiInstance.injectEndpoints({\n  endpoints: (builder) => ({\n`;

        for (const { path: endpointPath, method, endpoint } of endpoints) {
            const functionName = endpoint.operationId ||
                `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
            const camelFunctionName = this.toCamelCase(functionName);
            const responseType = this.getResponseType(endpoint.responses);
            const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
            const queryParams = endpoint.parameters?.filter(p => p.in === 'query') || [];
            const hasRequestBody = !!endpoint.requestBody;
            const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : '';
            let urlPath = this.stripBasePath(endpointPath);

            let queryType = 'void';
            if (pathParams.length > 0 || queryParams.length > 0 || hasRequestBody) {
                const parts = [];
                if (hasRequestBody) parts.push(requestBodyType);
                if (pathParams.length > 0) parts.push(`{ ${pathParams.map(p => `${p.name}: string`).join('; ')} }`);
                if (queryParams.length > 0) parts.push(`{ ${queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }`);
                queryType = parts.join(' & ');
            }

            const isQuery = method.toLowerCase() === 'get';
            const builderMethod = isQuery ? 'query' : 'mutation';

            apiSliceContent += `    ${camelFunctionName}: builder.${builderMethod}<${responseType}, ${queryType}>({\n`;
            
            // Query function
            apiSliceContent += `      query: (`;
            if (queryType !== 'void') {
                if (pathParams.length > 0 && (hasRequestBody || queryParams.length > 0)) {
                    apiSliceContent += `{ ${pathParams.map(p => p.name).join(', ')}${hasRequestBody ? ', ...body' : ''}${queryParams.length > 0 ? ', ...params' : ''} }`;
                } else if (pathParams.length > 0) {
                    apiSliceContent += `{ ${pathParams.map(p => p.name).join(', ')} }`;
                } else if (hasRequestBody) {
                    apiSliceContent += `body`;
                } else {
                    apiSliceContent += `params`;
                }
            }
            apiSliceContent += `) => `;

            // Build URL with path params
            pathParams.forEach(param => {
                urlPath = urlPath.replace(`{${param.name}}`, `\${${param.name}}`);
            });

            if (hasRequestBody && method.toLowerCase() !== 'get') {
                apiSliceContent += `({\n        url: \`${urlPath}\`,\n        method: "${method.toUpperCase()}",\n        body${queryParams.length > 0 ? ',\n        params' : ''},\n      })`;
            } else if (queryParams.length > 0) {
                apiSliceContent += `({\n        url: \`${urlPath}\`,\n        params,\n      })`;
            } else {
                apiSliceContent += `\`${urlPath}\``;
            }
            apiSliceContent += `,\n`;

            // ProvideTags / InvalidatesTags
            if (isQuery) {
                apiSliceContent += `      providesTags: [{ type: "${this.capitalize(tag)}", id: "LIST" }],\n`;
            } else {
                apiSliceContent += `      invalidatesTags: invalidateOn({\n        success: [{ type: "${this.capitalize(tag)}", id: "LIST" }],\n      }),\n`;
            }

            apiSliceContent += `    }),\n`;
        }

        apiSliceContent += `  }),\n});\n\n`;

        // Export hooks
        apiSliceContent += `export const {\n`;
        for (const { path: endpointPath, method, endpoint } of endpoints) {
            const functionName = endpoint.operationId ||
                `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
            const hookName = `use${this.toPascalCase(functionName)}${method.toLowerCase() === 'get' ? 'Query' : 'Mutation'}`;
            apiSliceContent += `  ${hookName},\n`;
        }
        apiSliceContent += `} = ${tagCamelCase}Api;\n`;

        await this.writeIfShould(path.join(tagDir, 'api.ts'), apiSliceContent);

        if (this.config.generateFakeData) {
            await this.generateFakeDataFile(tagDir, usedTypes, schemas);
        }
    }

    // ==================== SWR ====================
    async generateSWR(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode) {
        // Similar structure to TanStack Query but using SWR
        await this.writeIfShould(path.join(tagDir, 'types.ts'), tagTypes);
        await this.writeIfShould(path.join(tagDir, 'schemas.ts'), tagSchemas);

        if (structureMode === 'group-hooks') {
            let hooksContent = `// ${this.t.generatedHooks} - ${tag}\nimport useSWR from "swr";\nimport { useState } from "react";\nimport api from '@/lib/axios';\n`;
            if (usedTypes.size > 0) {
                hooksContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n\n`;
            } else {
                hooksContent += '\n';
            }

            for (const { path: endpointPath, method, endpoint } of endpoints) {
                hooksContent += this.generateApiFunction(endpointPath, method, endpoint, tag);

                const functionName = endpoint.operationId ||
                    `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
                const hookName = `use${this.toPascalCase(functionName)}`;
                const apiFunctionName = this.toCamelCase(functionName);

                if (method.toLowerCase() === 'get') {
                    const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
                    let params = pathParams.length > 0 ? pathParams.map(p => `${p.name}: string`).join(', ') : '';
                    const keyParams = pathParams.length > 0 ? `, ${pathParams.map(p => p.name).join(', ')}` : '';
                    
                    hooksContent += `export function ${hookName}(${params}) {\n`;
                    hooksContent += `  const { data, error, isLoading } = useSWR(\`/${tag}${keyParams}\`, () => ${apiFunctionName}(${pathParams.map(p => p.name).join(', ')}));\n`;
                    hooksContent += `  return { data, error, isLoading };\n}\n\n`;
                } else {
                    // Mutation with useState
                    const hasRequestBody = !!endpoint.requestBody;
                    const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : 'void';
                    
                    hooksContent += `export function ${hookName}() {\n`;
                    hooksContent += `  const [loading, setLoading] = useState(false);\n`;
                    hooksContent += `  const [error, setError] = useState<Error | null>(null);\n\n`;
                    hooksContent += `  const mutate = async (${hasRequestBody ? `input: ${requestBodyType}` : ''}) => {\n`;
                    hooksContent += `    setLoading(true);\n`;
                    hooksContent += `    try {\n`;
                    hooksContent += `      const result = await ${apiFunctionName}(${hasRequestBody ? 'input' : ''});\n`;
                    hooksContent += `      setLoading(false);\n`;
                    hooksContent += `      return result;\n`;
                    hooksContent += `    } catch (err: any) {\n`;
                    hooksContent += `      setError(err);\n`;
                    hooksContent += `      setLoading(false);\n`;
                    hooksContent += `      return null;\n`;
                    hooksContent += `    }\n`;
                    hooksContent += `  };\n\n`;
                    hooksContent += `  return { mutate, loading, error };\n}\n\n`;
                }
            }

            await this.writeIfShould(path.join(tagDir, 'hooks.ts'), hooksContent);
        }

        if (this.config.generateFakeData) {
            await this.generateFakeDataFile(tagDir, usedTypes, schemas);
        }
    }

    // ==================== REACT QUERY KIT ====================
    async generateReactQueryKit(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode) {
        await this.writeIfShould(path.join(tagDir, 'types.ts'), tagTypes);
        await this.writeIfShould(path.join(tagDir, 'schemas.ts'), tagSchemas);

        let hooksContent = `// ${this.t.generatedHooks} - ${tag}\nimport { createQuery, createMutation } from "react-query-kit";\nimport api from '@/lib/axios';\n`;
        if (usedTypes.size > 0) {
            hooksContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n\n`;
        } else {
            hooksContent += '\n';
        }

        for (const { path: endpointPath, method, endpoint } of endpoints) {
            const functionName = endpoint.operationId ||
                `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
            const hookName = `use${this.toPascalCase(functionName)}`;
            const responseType = this.getResponseType(endpoint.responses);
            let urlPath = this.stripBasePath(endpointPath);
            const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
            const hasRequestBody = !!endpoint.requestBody;
            const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : '';

            pathParams.forEach(param => {
                urlPath = urlPath.replace(`{${param.name}}`, `\${variables.${param.name}}`);
            });

            if (method.toLowerCase() === 'get') {
                hooksContent += `export const ${hookName} = createQuery({\n`;
                hooksContent += `  queryKey: ["${urlPath}"],\n`;
                hooksContent += `  fetcher: (${pathParams.length > 0 ? `variables` : ''}): Promise<${responseType}> =>\n`;
                hooksContent += `    api.get(\`${urlPath}\`).then((res) => res.data),\n`;
                hooksContent += `});\n\n`;
            } else {
                hooksContent += `export const ${hookName} = createMutation({\n`;
                hooksContent += `  mutationKey: ["${urlPath}"],\n`;
                let mutationFnParam = '';
                if (pathParams.length > 0 && hasRequestBody) {
                    mutationFnParam = `variables: ${requestBodyType} & { ${pathParams.map(p => `${p.name}: string`).join('; ')} }`;
                } else if (pathParams.length > 0) {
                    mutationFnParam = `variables: { ${pathParams.map(p => `${p.name}: string`).join('; ')} }`;
                } else if (hasRequestBody) {
                    mutationFnParam = `data: ${requestBodyType}`;
                }
                
                hooksContent += `  mutationFn: (${mutationFnParam}) =>\n`;
                if (hasRequestBody) {
                    hooksContent += `    api.${method.toLowerCase()}(\`${urlPath}\`, ${pathParams.length > 0 ? 'variables' : 'data'}),\n`;
                } else {
                    hooksContent += `    api.${method.toLowerCase()}(\`${urlPath}\`),\n`;
                }
                hooksContent += `});\n\n`;
            }
        }

        await this.writeIfShould(path.join(tagDir, 'hooks.ts'), hooksContent);

        if (this.config.generateFakeData) {
            await this.generateFakeDataFile(tagDir, usedTypes, schemas);
        }
    }

    // ==================== BASIC (useState/useEffect) ====================
    async generateBasic(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode) {
        await this.writeIfShould(path.join(tagDir, 'types.ts'), tagTypes);
        await this.writeIfShould(path.join(tagDir, 'schemas.ts'), tagSchemas);

        let hooksContent = `// ${this.t.generatedHooks} - ${tag}\nimport { useEffect, useState } from "react";\nimport api from '@/lib/axios';\n`;
        if (usedTypes.size > 0) {
            hooksContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n\n`;
        } else {
            hooksContent += '\n';
        }

        for (const { path: endpointPath, method, endpoint } of endpoints) {
            hooksContent += this.generateApiFunction(endpointPath, method, endpoint, tag);

            const functionName = endpoint.operationId ||
                `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
            const hookName = `use${this.toPascalCase(functionName)}`;
            const apiFunctionName = this.toCamelCase(functionName);
            const responseType = this.getResponseType(endpoint.responses);
            const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
            const hasRequestBody = !!endpoint.requestBody;
            const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : '';

            if (method.toLowerCase() === 'get') {
                let params = pathParams.length > 0 ? pathParams.map(p => `${p.name}: string`).join(', ') : '';
                const callParams = pathParams.map(p => p.name).join(', ');

                hooksContent += `export function ${hookName}(${params}) {\n`;
                hooksContent += `  const [data, setData] = useState<${responseType} | null>(null);\n`;
                hooksContent += `  const [loading, setLoading] = useState(true);\n`;
                hooksContent += `  const [error, setError] = useState<Error | null>(null);\n\n`;
                hooksContent += `  useEffect(() => {\n`;
                hooksContent += `    ${apiFunctionName}(${callParams})\n`;
                hooksContent += `      .then(setData)\n`;
                hooksContent += `      .catch(setError)\n`;
                hooksContent += `      .finally(() => setLoading(false));\n`;
                hooksContent += `  }, [${pathParams.map(p => p.name).join(', ')}]);\n\n`;
                hooksContent += `  return { data, loading, error };\n}\n\n`;
            } else {
                hooksContent += `export function ${hookName}() {\n`;
                hooksContent += `  const [loading, setLoading] = useState(false);\n`;
                hooksContent += `  const [error, setError] = useState<Error | null>(null);\n\n`;
                hooksContent += `  const mutate = async (${hasRequestBody ? `input: ${requestBodyType}` : ''}) => {\n`;
                hooksContent += `    setLoading(true);\n`;
                hooksContent += `    try {\n`;
                hooksContent += `      const result = await ${apiFunctionName}(${hasRequestBody ? 'input' : ''});\n`;
                hooksContent += `      setLoading(false);\n`;
                hooksContent += `      return result;\n`;
                hooksContent += `    } catch (err: any) {\n`;
                hooksContent += `      setError(err);\n`;
                hooksContent += `      setLoading(false);\n`;
                hooksContent += `      return null;\n`;
                hooksContent += `    }\n`;
                hooksContent += `  };\n\n`;
                hooksContent += `  return { mutate, loading, error };\n}\n\n`;
            }
        }

        await this.writeIfShould(path.join(tagDir, 'hooks.ts'), hooksContent);

        if (this.config.generateFakeData) {
            await this.generateFakeDataFile(tagDir, usedTypes, schemas);
        }
    }

    // ==================== HELPER METHODS ====================
    async generateFakeDataFile(tagDir, usedTypes, schemas) {
        let fakeDataContent = `// ${this.t.generatedFakeData}\n`;
        if (usedTypes.size > 0) {
            fakeDataContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n\n`;
        } else {
            fakeDataContent += '\n';
        }

        for (const typeName of usedTypes) {
            if (schemas[typeName]) {
                const schema = schemas[typeName];
                if (schema.properties) {
                    fakeDataContent += this.generateFakeData(typeName, schema, schemas);
                }
            }
        }

        await this.writeIfShould(path.join(tagDir, 'data.ts'), fakeDataContent);
    }

    async writeIfShould(filePath, content) {
        if (await this.shouldOverwriteFile(filePath)) {
            await fs.writeFile(filePath, content);
        } else {
            console.log(`   ⏭️  Skipped ${path.relative(process.cwd(), filePath)} (has user modifications)`);
        }
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
                            console.log(`✅ Found Swagger spec at ${baseUrl}${path}`);
                            content = tryContent;
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                if (content.trim().startsWith('<')) {
                    throw new Error(`Could not find Swagger JSON/YAML spec. Please provide the direct URL to the specification.`);
                }
            }
        } catch (error) {
            if (error.response?.status === 401 && !credentials) {
                console.log('\nAuthentication required (401)');
                const creds = await promptForCredentials();
                return loadSwaggerSpec(input, creds);
            }
            throw new Error(`Failed to fetch Swagger spec: ${error?.message || 'Unknown error'}`);
        }
    } else {
        console.log(`Loading Swagger spec from ${input}...`);
        content = await fs.readFile(input, 'utf-8');
    }

    try {
        const parsed = JSON.parse(content);
        if (!parsed.paths) {
            throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
        }
        return parsed;
    } catch (jsonError) {
        try {
            const parsed = yaml.load(content);
            if (!parsed.paths) {
                throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
            }
            return parsed;
        } catch (yamlError) {
            throw new Error(`Failed to parse Swagger spec: ${jsonError.message}`);
        }
    }
}

const program = new Command();

program
    .name('swagger-to-tanstack')
    .description('Generate TanStack Query hooks, types, and schemas from Swagger/OpenAPI specification')
    .version('3.0.0');

program
    .command('init')
    .description('Initialize project with lib/axios.ts and lib/query-keys.ts')
    .action(async () => {
        try {
            console.log('🚀 Initializing project...');
            const libDir = path.join(process.cwd(), 'lib');
            await fs.ensureDir(libDir);

            const axiosPath = path.join(libDir, 'axios.ts');
            if (!await fs.pathExists(axiosPath)) {
                const axiosConfig = `import axios from 'axios';

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
                console.log('✅ Created lib/axios.ts');
            } else {
                console.log('⚠️  lib/axios.ts already exists');
            }

            const queryKeysPath = path.join(libDir, 'query-keys.ts');
            if (!await fs.pathExists(queryKeysPath)) {
                const queryKeysTemplate = `// Query keys will be populated by swagger-to-tanstack generate
export const queryKeys = {} as const;
`;
                await fs.writeFile(queryKeysPath, queryKeysTemplate);
                console.log('✅ Created lib/query-keys.ts');
            } else {
                console.log('⚠️  lib/query-keys.ts already exists');
            }

            console.log('\n✨ Initialization complete!');
            console.log('Next: Run swagger-to-tanstack generate -i <swagger-url>');
        } catch (error) {
            console.error('❌ Error:', error?.message || 'Unknown error');
            process.exit(1);
        }
    });

program
    .command('generate')
    .description('Generate API functions, hooks, types, and schemas from Swagger spec')
    .requiredOption('-i, --input <input>', 'Swagger spec file path or URL')
    .option('-o, --output <dir>', 'Output directory', './src/api')
    .option('-t, --template <template>', 'Template to use: tanstack-query, rtk-query, swr, react-query-kit, basic', 'tanstack-query')
    .option('-s, --structure <mode>', 'Structure mode: split, group, group-hooks', 'group-hooks')
    .option('-b, --baseUrl <url>', 'API base URL override')
    .option('--strip-base-path [path]', 'Strip base path from routes (e.g., /api/v1). Use true for auto-detection or provide custom path')
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

            const validTemplates = ['tanstack-query', 'rtk-query', 'swr', 'react-query-kit', 'basic'];
            if (!validTemplates.includes(options.template)) {
                throw new Error(`Template must be one of: ${validTemplates.join(', ')}`);
            }

            const validStructures = ['split', 'group', 'group-hooks'];
            if (!validStructures.includes(options.structure)) {
                throw new Error(`Structure must be one of: ${validStructures.join(', ')}`);
            }

            const config = {
                outputDir: options.output,
                baseUrl: options.baseUrl || '',
                template: options.template,
                structureMode: options.structure,
                stripBasePath: options.stripBasePath === 'true' ? true : options.stripBasePath || false,
                language: options.language,
                generateFakeData: options.fakeData || false,
                preserveModified: options.preserveModified || false,
            };

            let credentials;
            if (options.username && options.password) {
                credentials = { username: options.username, password: options.password };
            }

            console.log(`📋 Template: ${options.template}`);
            console.log(`📁 Structure: ${options.structure}`);
            console.log(`🌐 Language: ${options.language}`);
            if (config.stripBasePath) {
                console.log(`✂️  Stripping base path: ${config.stripBasePath === true ? 'auto-detect' : config.stripBasePath}`);
            }

            const spec = await loadSwaggerSpec(options.input, credentials);
            const generator = new SwaggerToTanStackGenerator(spec, config);
            await generator.generate();
        } catch (error) {
            console.error('❌ Error:', error?.message || 'Unknown error');
            process.exit(1);
        }
    });

program
    .command('update')
    .description('Update generated files from Swagger spec (preserves user modifications)')
    .requiredOption('-i, --input <input>', 'Swagger spec file path or URL')
    .option('-o, --output <dir>', 'Output directory', './src/api')
    .option('-t, --template <template>', 'Template to use', 'tanstack-query')
    .option('-s, --structure <mode>', 'Structure mode', 'group-hooks')
    .option('--strip-base-path [path]', 'Strip base path from routes')
    .option('-l, --language <lang>', 'Language (en|fr)', 'en')
    .option('-u, --username <username>', 'Basic auth username')
    .option('-p, --password <password>', 'Basic auth password')
    .action(async (options) => {
        try {
            const config = {
                outputDir: options.output,
                baseUrl: '',
                template: options.template,
                structureMode: options.structure,
                stripBasePath: options.stripBasePath === 'true' ? true : options.stripBasePath || false,
                language: options.language,
                generateFakeData: false,
                preserveModified: true,
            };

            let credentials;
            if (options.username && options.password) {
                credentials = { username: options.username, password: options.password };
            }

            const spec = await loadSwaggerSpec(options.input, credentials);
            const generator = new SwaggerToTanStackGenerator(spec, config);
            await generator.generate();
        } catch (error) {
            console.error('❌ Error:', error?.message || 'Unknown error');
            process.exit(1);
        }
    });

program
    .command('watch')
    .description('Watch Swagger spec and regenerate on changes')
    .requiredOption('-i, --input <input>', 'Swagger spec file path')
    .option('-o, --output <dir>', 'Output directory', './src/api')
    .option('-t, --template <template>', 'Template to use', 'tanstack-query')
    .option('-s, --structure <mode>', 'Structure mode', 'group-hooks')
    .option('--strip-base-path [path]', 'Strip base path from routes')
    .option('-l, --language <lang>', 'Language (en|fr)', 'en')
    .action(async (options) => {
        try {
            if (options.input.startsWith('http')) {
                throw new Error('Watch mode only works with local files');
            }

            console.log(`👀 Watching ${options.input} for changes...`);

            const config = {
                outputDir: options.output,
                baseUrl: '',
                template: options.template,
                structureMode: options.structure,
                stripBasePath: options.stripBasePath === 'true' ? true : options.stripBasePath || false,
                language: options.language,
                generateFakeData: false,
                preserveModified: true,
            };

            const spec = await loadSwaggerSpec(options.input);
            const generator = new SwaggerToTanStackGenerator(spec, config);
            await generator.generate();

            fs.watch(options.input, async (eventType) => {
                if (eventType === 'change') {
                    console.log('\n🔄 Swagger spec changed, regenerating...');
                    try {
                        const newSpec = await loadSwaggerSpec(options.input);
                        const newGenerator = new SwaggerToTanStackGenerator(newSpec, config);
                        await newGenerator.generate();
                    } catch (error) {
                        console.error('❌ Error during regeneration:', error?.message);
                    }
                }
            });

            console.log('Press Ctrl+C to stop watching');
        } catch (error) {
            console.error('❌ Error:', error?.message || 'Unknown error');
            process.exit(1);
        }
    });

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

            const spec = await loadSwaggerSpec(options.input, credentials);
            console.log(`\n✅ Valid ${spec.openapi ? 'OpenAPI' : 'Swagger'} specification`);
            console.log(`📝 Title: ${spec.info?.title}`);
            console.log(`🔢 Version: ${spec.info?.version}`);
            console.log(`🛣️  Paths: ${Object.keys(spec.paths).length}`);
            console.log(`📦 Schemas: ${Object.keys(spec.components?.schemas || spec.definitions || {}).length}`);

            const tags = spec.tags || [];
            if (tags.length > 0) {
                console.log(`🏷️  Tags: ${tags.map(t => t.name).join(', ')}`);
            }

            if (spec.basePath) {
                console.log(`🌐 Base Path: ${spec.basePath}`);
            }
            if (spec.servers && spec.servers.length > 0) {
                console.log(`🖥️  Servers: ${spec.servers.map(s => s.url).join(', ')}`);
            }
        } catch (error) {
            console.error('❌ Invalid specification:', error?.message || 'Unknown error');
            process.exit(1);
        }
    });

program
    .command('list-templates')
    .description('List all available templates and structure modes')
    .action(() => {
        console.log('\n📚 Available Templates:\n');
        console.log('  1. tanstack-query    - TanStack Query (React Query v5)');
        console.log('  2. rtk-query         - RTK Query (Redux Toolkit)');
        console.log('  3. swr               - SWR (Vercel)');
        console.log('  4. react-query-kit   - React Query Kit');
        console.log('  5. basic             - Basic fetch with useState/useEffect');
        
        console.log('\n🏗️  Structure Modes:\n');
        console.log('  • split              - Separate files for api/, queries/, mutations/');
        console.log('  • group              - Grouped files: api.ts, queries.ts, mutations.ts');
        console.log('  • group-hooks        - Single hooks.ts file with everything');
        
        console.log('\n💡 Example Usage:\n');
        console.log('  swagger-to-tanstack generate -i ./swagger.json -t rtk-query -s split');
        console.log('  swagger-to-tanstack generate -i https://api.com/docs -t swr -s group-hooks --strip-base-path /api/v1\n');
    });

program
    .command('config')
    .description('Generate RTK Query config file')
    .option('-o, --output <dir>', 'Output directory', './src/services')
    .action(async (options) => {
        try {
            console.log('Generating RTK Query config...');
            const configDir = path.join(process.cwd(), options.output);
            await fs.ensureDir(configDir);

            const configContent = `import { createApi, fetchBaseQuery, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { getSession, signOut } from "next-auth/react";

export const invalidateOn = <T>({ success, error }: { success?: T[]; error?: T[] }) => {
  return (result: unknown) => (result ? (success ?? []) : (error ?? []));
};

const getActiveOfficeId = () => {
  const activeOffice = sessionStorage.getItem("active-office");
  return activeOffice ? JSON.parse(activeOffice).state.activeOfficeId : undefined;
};

export const setActiveOfficeId = (officeId: string) => {
  sessionStorage.setItem(
    "active-office",
    JSON.stringify({ state: { activeOfficeId: officeId } })
  );
};

const getBaseQuery = () =>
  fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: async (headers, { arg }) => {
      const session = await getSession();
      
      if (
        !headers.has("Content-Type") &&
        (typeof arg === "string" || !(arg?.body instanceof FormData))
      ) {
        headers.set("Content-Type", "application/json");
      }

      if (session?.accessToken) {
        headers.set("Authorization", \`Bearer \${session.accessToken}\`);
      }

      const activeOfficeId = getActiveOfficeId();
      if (activeOfficeId) {
        headers.set("X-Office-Id", activeOfficeId);
      }

      return headers;
    },
    responseHandler: async (response) => {
      const data = await response.json();
      const status = response.status;

      if (process.env.NODE_ENV === "development") {
        console.log(\`Response from \${response.url}:\`, JSON.stringify(data));
      }

      if (status === 401) {
        await signOut();
      }

      if (status === 422) {
        await signOut({ redirect: false });
        window.location.href = "/blocked-account";
      }

      return data;
    },
  });

export class ResponseError<InFields extends string> extends Error {
  constructor(
    { status, data }: FetchBaseQueryError,
    private readonly globalError?: string,
    private readonly fieldsErrors?: Record<InFields, string>
  ) {
    super();
    switch (status) {
      case "TIMEOUT_ERROR":
        this.globalError = "Request timed out. Please try again.";
        break;
      case "FETCH_ERROR":
        this.globalError = "Cannot reach out to the server. Please try again.";
        break;
      default:
        if (data) {
          this.globalError = (data as { message?: string; errors?: Record<InFields, string> }).message;
          this.fieldsErrors = (data as { message?: string; errors?: Record<InFields, string> }).errors;
        } else {
          this.globalError = "Something went wrong. Please try again.";
        }
        break;
    }
  }

  export<OutFields extends string>(fieldsMap?: Partial<Record<InFields, OutFields>>) {
    return {
      message: this.globalError,
      errors:
        fieldsMap && this.fieldsErrors
          ? Object.keys(this.fieldsErrors).reduce(
              (acc, key) => ({
                ...acc,
                [fieldsMap[key as InFields]]: this.fieldsErrors![key as InFields],
              }),
              {}
            )
          : {},
    };
  }
}

export type ListQueryParams<
  TParams extends Partial<Record<string, string | number | boolean>> = Partial<
    Record<string, string | number | boolean>
  >
> = TParams & {
  page?: number;
  limit?: number;
  query?: string;
};

export type ListMeta = {
  total?: number;
  page?: number;
  limit?: number;
};

export type ListQueryResponse<TData> = TData extends {
  [RESPONSE_BODY_KEY]: infer D extends object;
}
  ? {
      [RESPONSE_BODY_KEY]: D & ListMeta;
    }
  : never;

export type ListData<TData> = {
  data: TData;
  meta: ListMeta;
};

export const parseListResponse = <TData>(meta: ListMeta, mappedData: TData): ListData<TData> => ({
  data: mappedData,
  meta: {
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
  },
});

export const prepareListQueryParams = <
  TParams extends Partial<Record<string, string | number | boolean>> = Partial<
    Record<string, string | number | boolean>
  >
>(
  queryParams: ListQueryParams<TParams> | void
) => {
  const params = new URLSearchParams();
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
  }
  return params;
};

export const RESPONSE_BODY_KEY = "data";

export const apiInstance = createApi({
  tagTypes: [
    "Auth",
    "Account",
    "Users",
    // Add your tag types here
  ],
  baseQuery: getBaseQuery(),
  endpoints: () => ({}),
});

export { getBaseQuery };
`;

            const configPath = path.join(configDir, 'config.ts');
            await fs.writeFile(configPath, configContent);
            console.log(`✅ Created ${configPath}`);
            console.log('\n✨ RTK Query config generated successfully!');
        } catch (error) {
            console.error('❌ Error:', error?.message || 'Unknown error');
            process.exit(1);
        }
    });

program.parse();






// import { Command } from 'commander';
// import fs from 'fs-extra';
// import path from 'path';
// import axios from 'axios';
// import yaml from 'js-yaml';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import * as readline from 'readline';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const translations = {
//     en: {
//         generatedTypes: 'Auto-generated TypeScript types from Swagger/OpenAPI spec',
//         generatedSchemas: 'Auto-generated schemas from Swagger/OpenAPI spec',
//         generatedApi: 'Auto-generated API functions from Swagger/OpenAPI spec',
//         generatedHooks: 'Auto-generated hooks from Swagger/OpenAPI spec',
//         generatedQueries: 'Auto-generated queries from Swagger/OpenAPI spec',
//         generatedMutations: 'Auto-generated mutations from Swagger/OpenAPI spec',
//         generatedFakeData: 'Auto-generated fake data for testing',
//         queryHooks: 'Query Hooks',
//         mutationHooks: 'Mutation Hooks',
//         tooShort: 'Too short',
//         tooLong: 'Too long',
//         invalidFormat: 'Invalid format',
//         invalidEmail: 'Invalid email',
//         invalidUuid: 'Invalid UUID',
//     },
//     fr: {
//         generatedTypes: 'Types TypeScript auto-générés depuis la spécification Swagger/OpenAPI',
//         generatedSchemas: 'Schémas auto-générés depuis la spécification Swagger/OpenAPI',
//         generatedApi: 'Fonctions API auto-générées depuis la spécification Swagger/OpenAPI',
//         generatedHooks: 'Hooks auto-générés depuis la spécification Swagger/OpenAPI',
//         generatedQueries: 'Requêtes auto-générées depuis la spécification Swagger/OpenAPI',
//         generatedMutations: 'Mutations auto-générées depuis la spécification Swagger/OpenAPI',
//         generatedFakeData: 'Données de test auto-générées',
//         queryHooks: 'Hooks de Requête',
//         mutationHooks: 'Hooks de Mutation',
//         tooShort: 'Trop court',
//         tooLong: 'Trop long',
//         invalidFormat: 'Format invalide',
//         invalidEmail: 'Email invalide',
//         invalidUuid: 'UUID invalide',
//     },
// };

// function createAxiosInstance(credentials) {
//     const instance = axios.create({
//         timeout: 10000,
//     });
//     if (credentials) {
//         instance.interceptors.request.use((config) => {
//             const token = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
//             config.headers.Authorization = `Basic ${token}`;
//             return config;
//         });
//     }
//     return instance;
// }

// async function promptForCredentials() {
//     const rl = readline.createInterface({
//         input: process.stdin,
//         output: process.stdout
//     });
//     return new Promise((resolve) => {
//         rl.question('Username: ', (username) => {
//             rl.question('Password: ', (password) => {
//                 rl.close();
//                 resolve({ username, password });
//             });
//         });
//     });
// }

// class SwaggerToTanStackGenerator {
//     constructor(spec, config) {
//         this.spec = spec;
//         this.config = config;
//         this.t = translations[config.language];
//     }

//     capitalize(str) {
//         return str.charAt(0).toUpperCase() + str.slice(1);
//     }

//     toCamelCase(str) {
//         return str
//             .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
//             .replace(/^(.)/, (char) => char.toLowerCase());
//     }

//     toPascalCase(str) {
//         return this.capitalize(this.toCamelCase(str));
//     }

//     toKebabCase(str) {
//         return str
//             .replace(/([a-z])([A-Z])/g, '$1-$2')
//             .replace(/[\s_]+/g, '-')
//             .toLowerCase();
//     }

//     extractRefName(ref) {
//         return ref.split('/').pop() || '';
//     }

//     getSchemas() {
//         return this.spec.components?.schemas || this.spec.definitions || {};
//     }

//     stripBasePath(path) {
//         if (this.config.stripBasePath) {
//             const basePath = typeof this.config.stripBasePath === 'string' 
//                 ? this.config.stripBasePath 
//                 : (this.spec.basePath || '/api/v1');
//             return path.replace(new RegExp(`^${basePath}`), '');
//         }
//         return path;
//     }

//     generateTypeScript(property, schemas) {
//         if (property.$ref) {
//             return this.extractRefName(property.$ref);
//         }
//         switch (property.type) {
//             case 'string':
//                 if (property.enum) {
//                     return property.enum.map(e => `'${e}'`).join(' | ');
//                 }
//                 return 'string';
//             case 'number':
//             case 'integer':
//                 return 'number';
//             case 'boolean':
//                 return 'boolean';
//             case 'array':
//                 if (property.items) {
//                     return `${this.generateTypeScript(property.items, schemas)}[]`;
//                 }
//                 return 'any[]';
//             case 'object':
//                 if (property.properties) {
//                     const props = Object.entries(property.properties)
//                         .map(([key, value]) => {
//                             const optional = !property.required?.includes(key) ? '?' : '';
//                             const description = value.description ? `\n  /** ${value.description} */` : '';
//                             return `${description}\n  ${key}${optional}: ${this.generateTypeScript(value, schemas)};`;
//                         })
//                         .join('\n');
//                     return `{\n${props}\n}`;
//                 }
//                 return 'any';
//             default:
//                 return 'any';
//         }
//     }

//     generateZodSchema(property, schemas) {
//         if (property.$ref) {
//             const refName = this.extractRefName(property.$ref);
//             return `${this.toCamelCase(refName)}Schema`;
//         }
//         switch (property.type) {
//             case 'string':
//                 let zodString = 'z.string()';
//                 if (property.minLength)
//                     zodString += `.min(${property.minLength}, { message: "${this.t.tooShort}" })`;
//                 if (property.maxLength)
//                     zodString += `.max(${property.maxLength}, { message: "${this.t.tooLong}" })`;
//                 if (property.pattern)
//                     zodString += `.regex(/${property.pattern}/, { message: "${this.t.invalidFormat}" })`;
//                 if (property.enum) {
//                     return `z.enum([${property.enum.map(e => `"${e}"`).join(', ')}])`;
//                 }
//                 if (property.format === 'email')
//                     zodString += `.email({ message: "${this.t.invalidEmail}" })`;
//                 if (property.format === 'uuid')
//                     zodString += `.uuid({ message: "${this.t.invalidUuid}" })`;
//                 return zodString;
//             case 'number':
//             case 'integer':
//                 let zodNumber = property.type === 'integer' ? 'z.number().int()' : 'z.number()';
//                 if (property.minimum !== undefined)
//                     zodNumber += `.min(${property.minimum})`;
//                 if (property.maximum !== undefined)
//                     zodNumber += `.max(${property.maximum})`;
//                 return zodNumber;
//             case 'boolean':
//                 return 'z.boolean()';
//             case 'array':
//                 if (property.items) {
//                     return `z.array(${this.generateZodSchema(property.items, schemas)})`;
//                 }
//                 return 'z.array(z.any())';
//             case 'object':
//                 if (property.properties) {
//                     const props = Object.entries(property.properties)
//                         .map(([key, value]) => {
//                             let zodField = this.generateZodSchema(value, schemas);
//                             if (!property.required?.includes(key)) {
//                                 zodField += '.optional().nullable()';
//                             }
//                             return `  ${key}: ${zodField},`;
//                         })
//                         .join('\n');
//                     return `z.object({\n${props}\n})`;
//                 }
//                 return 'z.object({})';
//             default:
//                 return 'z.any()';
//         }
//     }

//     generateYupSchema(property, schemas) {
//         if (property.$ref) {
//             const refName = this.extractRefName(property.$ref);
//             return `${this.toCamelCase(refName)}Schema`;
//         }
//         switch (property.type) {
//             case 'string':
//                 let yupString = 'yup.string()';
//                 if (property.minLength)
//                     yupString += `.min(${property.minLength}, "${this.t.tooShort}")`;
//                 if (property.maxLength)
//                     yupString += `.max(${property.maxLength}, "${this.t.tooLong}")`;
//                 if (property.pattern)
//                     yupString += `.matches(/${property.pattern}/, "${this.t.invalidFormat}")`;
//                 if (property.enum) {
//                     return `yup.string().oneOf([${property.enum.map(e => `"${e}"`).join(', ')}])`;
//                 }
//                 if (property.format === 'email')
//                     yupString += `.email("${this.t.invalidEmail}")`;
//                 return yupString;
//             case 'number':
//             case 'integer':
//                 let yupNumber = property.type === 'integer' ? 'yup.number().integer()' : 'yup.number()';
//                 if (property.minimum !== undefined)
//                     yupNumber += `.min(${property.minimum})`;
//                 if (property.maximum !== undefined)
//                     yupNumber += `.max(${property.maximum})`;
//                 return yupNumber;
//             case 'boolean':
//                 return 'yup.boolean()';
//             case 'array':
//                 if (property.items) {
//                     return `yup.array().of(${this.generateYupSchema(property.items, schemas)})`;
//                 }
//                 return 'yup.array()';
//             case 'object':
//                 if (property.properties) {
//                     const props = Object.entries(property.properties)
//                         .map(([key, value]) => {
//                             let yupField = this.generateYupSchema(value, schemas);
//                             if (!property.required?.includes(key)) {
//                                 yupField += '.nullable()';
//                             }
//                             return `  ${key}: ${yupField},`;
//                         })
//                         .join('\n');
//                     return `yup.object({\n${props}\n})`;
//                 }
//                 return 'yup.object()';
//             default:
//                 return 'yup.mixed()';
//         }
//     }
//         if (property.$ref) {
//             const refName = this.extractRefName(property.$ref);
//             return `fake${refName}`;
//         }
//         if (property.example !== undefined) {
//             return JSON.stringify(property.example);
//         }
//         switch (property.type) {
//             case 'string':
//                 if (property.enum) {
//                     return `'${property.enum[0]}'`;
//                 }
//                 if (property.format === 'email')
//                     return `'${fieldName}@example.com'`;
//                 if (property.format === 'uuid')
//                     return `'${fieldName}-uuid-1234'`;
//                 if (property.format === 'date-time')
//                     return `new Date().toISOString()`;
//                 if (property.format === 'date')
//                     return `new Date().toISOString().split('T')[0]`;
//                 return `'Sample ${fieldName}'`;
//             case 'number':
//                 return String(property.minimum !== undefined ? property.minimum : 0);
//             case 'integer':
//                 return String(property.minimum !== undefined ? property.minimum : 1);
//             case 'boolean':
//                 return 'true';
//             case 'array':
//                 if (property.items) {
//                     const itemValue = this.generateFakeValue(property.items, schemas, fieldName);
//                     return `[${itemValue}]`;
//                 }
//                 return '[]';
//             case 'object':
//                 if (property.properties) {
//                     const props = Object.entries(property.properties)
//                         .map(([key, value]) => {
//                             return `${key}: ${this.generateFakeValue(value, schemas, key)}`;
//                         })
//                         .join(', ');
//                     return `{ ${props} }`;
//                 }
//                 return '{}';
//             default:
//                 return 'null';
//         }
//     }

//     generateFakeData(typeName, schema, schemas) {
//         if (!schema.properties) return '';
//         let fakeData = `export const fake${typeName} = {\n`;
//         for (const [key, value] of Object.entries(schema.properties)) {
//             fakeData += `  ${key}: ${this.generateFakeValue(value, schemas, key)},\n`;
//         }
//         fakeData += `};\n\n`;
//         fakeData += `export const fake${typeName}List = [\n  fake${typeName},\n  { ...fake${typeName}, id: '2' },\n  { ...fake${typeName}, id: '3' },\n];\n\n`;
//         return fakeData;
//     }

//     generateQueryKeys() {
//         const groupedEndpoints = this.groupEndpointsByTag();
//         let queryKeys = `// ${this.config.language === 'fr' ? 'Clés de requête centralisées' : 'Central place to define all query keys'}\nexport const queryKeys = {\n`;
//         for (const [tag, endpoints] of groupedEndpoints) {
//             const tagCamelCase = this.toCamelCase(tag.replace(/[^a-zA-Z0-9]/g, ''));
//             queryKeys += `  // ${this.capitalize(tag)}\n`;
//             queryKeys += `  ${tagCamelCase}: {\n`;
//             queryKeys += `    all: ["${tagCamelCase}"] as const,\n`;
//             queryKeys += `    lists: () => [...queryKeys.${tagCamelCase}.all, "list"] as const,\n`;
//             queryKeys += `    list: (filters: any) => [...queryKeys.${tagCamelCase}.lists(), filters] as const,\n`;
//             queryKeys += `    details: () => [...queryKeys.${tagCamelCase}.all, "detail"] as const,\n`;
//             queryKeys += `    detail: (id: string) => [...queryKeys.${tagCamelCase}.details(), id] as const,\n`;
//             queryKeys += `  },\n`;
//         }
//         queryKeys += `};\n`;
//         return queryKeys;
//     }

//     hasFileUpload(endpoint) {
//         return !!endpoint.requestBody?.content?.['multipart/form-data'];
//     }

//     generateApiFunction(path, method, endpoint, tag) {
//         const functionName = endpoint.operationId ||
//             `${method}${path.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
//         const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
//         const queryParams = endpoint.parameters?.filter(p => p.in === 'query') || [];
//         const hasRequestBody = !!endpoint.requestBody;
//         const hasFileUpload = this.hasFileUpload(endpoint);
//         const responseType = this.getResponseType(endpoint.responses);
//         const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : '';
//         const httpClient = this.config.httpClient || 'fetch';

//         let params = '';
//         let apiCall = '';
//         let urlPath = this.stripBasePath(path);

//         if (pathParams.length > 0) {
//             pathParams.forEach(param => {
//                 params += `${param.name}: string, `;
//                 urlPath = urlPath.replace(`{${param.name}}`, `\${${param.name}}`);
//             });
//         }

//         if (hasRequestBody) {
//             params += hasFileUpload 
//                 ? `${this.toCamelCase(functionName)}Data: { ${Object.keys(this.getRequestBodyProperties(endpoint.requestBody)).map(k => `${k}: ${k === 'file' || k.includes('file') || k.includes('File') ? 'File' : 'any'}`).join('; ')} }, `
//                 : `payload: ${requestBodyType}, `;
//         }

//         if (queryParams.length > 0) {
//             params += `params?: { ${queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }, `;
//         }

//         params = params.replace(/, $/, '');

//         const payloadVar = hasFileUpload ? `${this.toCamelCase(functionName)}Data` : 'payload';

//         if (httpClient === 'axios') {
//             const headersConfig = hasFileUpload ? `, { headers: { 'Content-Type': 'multipart/form-data' } }` : '';

//             switch (method.toLowerCase()) {
//                 case 'get':
//                     apiCall = queryParams.length > 0
//                         ? `api.get<${responseType}>(\`${urlPath}\`, { params })`
//                         : `api.get<${responseType}>(\`${urlPath}\`)`;
//                     break;
//                 case 'post':
//                     if (hasRequestBody) {
//                         apiCall = queryParams.length > 0
//                             ? `api.post<${responseType}>(\`${urlPath}\`, ${payloadVar}, { params${headersConfig.replace(', {', ', ...')} })`
//                             : `api.post<${responseType}>(\`${urlPath}\`, ${payloadVar}${headersConfig})`;
//                     } else {
//                         apiCall = `api.post<${responseType}>(\`${urlPath}\`)`;
//                     }
//                     break;
//                 case 'put':
//                     if (hasRequestBody) {
//                         apiCall = `api.put<${responseType}>(\`${urlPath}\`, ${payloadVar}${headersConfig})`;
//                     } else {
//                         apiCall = `api.put<${responseType}>(\`${urlPath}\`)`;
//                     }
//                     break;
//                 case 'patch':
//                     if (hasRequestBody) {
//                         apiCall = `api.patch<${responseType}>(\`${urlPath}\`, ${payloadVar}${headersConfig})`;
//                     } else {
//                         apiCall = `api.patch<${responseType}>(\`${urlPath}\`)`;
//                     }
//                     break;
//                 case 'delete':
//                     if (hasRequestBody) {
//                         apiCall = `api.delete<${responseType}>(\`${urlPath}\`, { data: ${payloadVar} })`;
//                     } else {
//                         apiCall = `api.delete<${responseType}>(\`${urlPath}\`)`;
//                     }
//                     break;
//             }

//             const description = endpoint.description || endpoint.summary || '';
//             const jsdoc = description ? `/**\n * ${description}\n */\n` : '';
//             return `${jsdoc}export const ${this.toCamelCase(functionName)} = async (${params}) => {\n  const { data } = await ${apiCall};\n  return data;\n};\n\n`;
//         } else {
//             // Fetch implementation
//             const baseUrl = '${process.env.NEXT_PUBLIC_API_URL || ""}';
//             let fetchOptions = '';
//             let queryString = '';

//             if (queryParams.length > 0) {
//                 queryString = `\n  const queryString = params ? '?' + new URLSearchParams(Object.entries(params).reduce((acc, [key, value]) => value !== undefined ? {...acc, [key]: String(value)} : acc, {})).toString() : '';`;
//             }

//             switch (method.toLowerCase()) {
//                 case 'get':
//                     fetchOptions = `{\n    method: 'GET',\n    headers: {\n      'Content-Type': 'application/json',\n      ...getAuthHeaders(),\n    },\n  }`;
//                     break;
//                 case 'post':
//                 case 'put':
//                 case 'patch':
//                     if (hasFileUpload) {
//                         fetchOptions = `{\n    method: '${method.toUpperCase()}',\n    headers: {\n      ...getAuthHeaders(),\n    },\n    body: ${payloadVar},\n  }`;
//                     } else if (hasRequestBody) {
//                         fetchOptions = `{\n    method: '${method.toUpperCase()}',\n    headers: {\n      'Content-Type': 'application/json',\n      ...getAuthHeaders(),\n    },\n    body: JSON.stringify(${payloadVar}),\n  }`;
//                     } else {
//                         fetchOptions = `{\n    method: '${method.toUpperCase()}',\n    headers: {\n      'Content-Type': 'application/json',\n      ...getAuthHeaders(),\n    },\n  }`;
//                     }
//                     break;
//                 case 'delete':
//                     if (hasRequestBody) {
//                         fetchOptions = `{\n    method: 'DELETE',\n    headers: {\n      'Content-Type': 'application/json',\n      ...getAuthHeaders(),\n    },\n    body: JSON.stringify(${payloadVar}),\n  }`;
//                     } else {
//                         fetchOptions = `{\n    method: 'DELETE',\n    headers: {\n      'Content-Type': 'application/json',\n      ...getAuthHeaders(),\n    },\n  }`;
//                     }
//                     break;
//             }

//             const description = endpoint.description || endpoint.summary || '';
//             const jsdoc = description ? `/**\n * ${description}\n */\n` : '';
            
//             return `${jsdoc}export const ${this.toCamelCase(functionName)} = async (${params}): Promise<${responseType}> => {${queryString}\n  const response = await fetch(\`${baseUrl}${urlPath}${queryParams.length > 0 ? '${queryString}' : ''}\`, ${fetchOptions});\n  if (!response.ok) throw new Error('Request failed');\n  return response.json();\n};\n\n`;
//         }
//     }

//     getRequestBodyProperties(requestBody) {
//         if (!requestBody) return {};
//         const schema = requestBody.content?.['application/json']?.schema ||
//             requestBody.content?.['multipart/form-data']?.schema ||
//             requestBody.content?.['application/x-www-form-urlencoded']?.schema;
//         return schema?.properties || {};
//     }

//     generateQueryHook(path, method, endpoint, tag) {
//         const functionName = endpoint.operationId ||
//             `${method}${path.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
//         const hookName = `use${this.toPascalCase(functionName)}`;
//         const apiFunctionName = this.toCamelCase(functionName);
//         const tagCamelCase = this.toCamelCase(tag.replace(/[^a-zA-Z0-9]/g, ''));
//         const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
//         const queryParams = endpoint.parameters?.filter(p => p.in === 'query') || [];

//         let params = '';
//         let queryKey = '';
//         let enabled = '';

//         if (pathParams.length > 0) {
//             params = pathParams.map(p => `${p.name}: string`).join(', ');
//             queryKey = `queryKeys.${tagCamelCase}.detail(${pathParams[0].name})`;
//             enabled = `enabled: !!(${pathParams.map(p => p.name).join(' && ')}),\n    `;
//         } else if (queryParams.length > 0) {
//             const queryParamType = `{ ${queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }`;
//             params = `params?: ${queryParamType}`;
//             queryKey = `queryKeys.${tagCamelCase}.list(params)`;
//         } else {
//             queryKey = `queryKeys.${tagCamelCase}.lists()`;
//         }

//         const queryFnParams = pathParams.length > 0
//             ? `() => ${apiFunctionName}(${pathParams.map(p => p.name).join(', ')}${queryParams.length > 0 ? ', params' : ''})`
//             : queryParams.length > 0
//                 ? `() => ${apiFunctionName}(params)`
//                 : apiFunctionName;

//         const description = endpoint.description || endpoint.summary || '';
//         const jsdoc = description ? `/**\n * ${description}\n */\n` : '';
//         return `${jsdoc}export const ${hookName} = (${params}) => {\n  return useQuery({\n    queryKey: ${queryKey},\n    queryFn: ${queryFnParams},\n    ${enabled}\n  });\n};\n\n`;
//     }

//     generateMutationHook(path, method, endpoint, tag) {
//         const functionName = endpoint.operationId ||
//             `${method}${path.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
//         const hookName = `use${this.toPascalCase(functionName)}`;
//         const apiFunctionName = this.toCamelCase(functionName);
//         const tagCamelCase = this.toCamelCase(tag.replace(/[^a-zA-Z0-9]/g, ''));
//         const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
//         const hasRequestBody = !!endpoint.requestBody;
//         const hasFileUpload = this.hasFileUpload(endpoint);
//         const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : '';

//         let mutationFnType = '';
//         if (pathParams.length > 0 && hasRequestBody) {
//             mutationFnType = hasFileUpload
//                 ? `(payload: { ${Object.keys(this.getRequestBodyProperties(endpoint.requestBody)).map(k => `${k}: any`).join('; ')} } & { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`
//                 : `(payload: ${requestBodyType} & { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`;
//         } else if (pathParams.length > 0) {
//             mutationFnType = `(payload: { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`;
//         } else if (hasRequestBody) {
//             mutationFnType = hasFileUpload
//                 ? `(payload: { ${Object.keys(this.getRequestBodyProperties(endpoint.requestBody)).map(k => `${k}: any`).join('; ')} })`
//                 : `(payload: ${requestBodyType})`;
//         } else {
//             mutationFnType = '()';
//         }

//         let mutationFnCall = '';
//         if (pathParams.length > 0 && hasRequestBody) {
//             const pathParamsList = pathParams.map(p => `payload.${p.name}`).join(', ');
//             mutationFnCall = `${apiFunctionName}(${pathParamsList}, payload)`;
//         } else if (pathParams.length > 0) {
//             const pathParamsList = pathParams.map(p => `payload.${p.name}`).join(', ');
//             mutationFnCall = `${apiFunctionName}(${pathParamsList})`;
//         } else if (hasRequestBody) {
//             mutationFnCall = `${apiFunctionName}(payload)`;
//         } else {
//             mutationFnCall = `${apiFunctionName}()`;
//         }

//         let invalidateQueries = '';
//         if (method.toLowerCase() === 'delete') {
//             invalidateQueries = `queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.all });\n      queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.lists() });`;
//         } else if (method.toLowerCase() === 'post') {
//             invalidateQueries = `queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.lists() });`;
//         } else {
//             invalidateQueries = `queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.all });\n      queryClient.invalidateQueries({ queryKey: queryKeys.${tagCamelCase}.lists() });`;
//         }

//         const description = endpoint.description || endpoint.summary || '';
//         const jsdoc = description ? `/**\n * ${description}\n */\n` : '';
//         return `${jsdoc}export const ${hookName} = () => {\n  const queryClient = useQueryClient();\n  \n  return useMutation({\n    mutationFn: ${mutationFnType} => ${mutationFnCall},\n    onSuccess: () => {\n      ${invalidateQueries}\n    },\n  });\n};\n\n`;
//     }

//     getResponseType(responses) {
//         const successResponse = responses['200'] || responses['201'] || responses['default'];
//         if (!successResponse) return 'any';
//         const schema = successResponse.schema ||
//             successResponse.content?.['application/json']?.schema;
//         if (!schema) return 'any';
//         return this.generateTypeScript(schema, this.getSchemas());
//     }

//     getRequestBodyType(requestBody) {
//         if (!requestBody) return '';
//         const schema = requestBody.content?.['application/json']?.schema ||
//             requestBody.content?.['application/x-www-form-urlencoded']?.schema;
//         if (!schema) return 'any';
//         return this.generateTypeScript(schema, this.getSchemas());
//     }

//     getParamType(param) {
//         if (param.schema) {
//             return this.generateTypeScript(param.schema, this.getSchemas());
//         }
//         switch (param.type) {
//             case 'string': return 'string';
//             case 'number':
//             case 'integer': return 'number';
//             case 'boolean': return 'boolean';
//             default: return 'any';
//         }
//     }

//     groupEndpointsByTag() {
//         const grouped = new Map();
//         const includeTags = this.config.includeTags;
//         const excludeTags = this.config.excludeTags;

//         for (const [path, methods] of Object.entries(this.spec.paths)) {
//             for (const [method, endpoint] of Object.entries(methods)) {
//                 if (typeof endpoint !== 'object') continue;
//                 const tags = endpoint.tags || ['default'];
//                 for (const tag of tags) {
//                     // Filter by include/exclude tags
//                     if (includeTags && includeTags.length > 0 && !includeTags.includes(tag)) {
//                         continue;
//                     }
//                     if (excludeTags && excludeTags.length > 0 && excludeTags.includes(tag)) {
//                         continue;
//                     }

//                     if (!grouped.has(tag)) {
//                         grouped.set(tag, []);
//                     }
//                     grouped.get(tag).push({ path, method, endpoint });
//                 }
//             }
//         }
//         return grouped;
//     }

//     getTypesFromEndpoints(endpoints) {
//         const types = new Set();
//         for (const { endpoint } of endpoints) {
//             const responseType = this.getResponseType(endpoint.responses);
//             // Extraire le type de base sans les crochets ou accolades
//             if (responseType !== 'any' && !responseType.includes('{')) {
//                 const baseType = responseType.replace(/\[\]$/, ''); // Enlever []
//                 if (!baseType.includes('|') && !baseType.includes('&')) { // Ignorer unions/intersections
//                     types.add(baseType);
//                 }
//             }
//             if (endpoint.requestBody) {
//                 const requestBodyType = this.getRequestBodyType(endpoint.requestBody);
//                 if (requestBodyType !== 'any' && !requestBodyType.includes('{')) {
//                     const baseType = requestBodyType.replace(/\[\]$/, '');
//                     if (!baseType.includes('|') && !baseType.includes('&')) {
//                         types.add(baseType);
//                     }
//                 }
//             }
//         }
//         return types;
//     }

//     async shouldOverwriteFile(filePath) {
//         if (!this.config.preserveModified) return true;
//         const exists = await fs.pathExists(filePath);
//         if (!exists) return true;
//         const content = await fs.readFile(filePath, 'utf-8');
//         // Check for various user modification markers
//         const hasUserModifications = 
//             content.includes('// CUSTOM') ||
//             content.includes('// Modified') ||
//             content.includes('// TODO') ||
//             content.includes('// KEEP') ||
//             content.includes('// USER:') ||
//             content.includes('/* CUSTOM') ||
//             content.includes('/* Modified') ||
//             // Check if file was significantly modified (more than 20% different from template structure)
//             this.hasSignificantModifications(content);
//         return !hasUserModifications;
//     }

//     hasSignificantModifications(content) {
//         // Check if imports were added beyond template
//         const extraImports = (content.match(/^import .+ from/gm) || []).length > 10;
//         // Check for custom functions
//         const customFunctions = content.includes('// Custom function') || 
//                                 content.includes('export const custom') ||
//                                 content.includes('export function custom');
//         return extraImports || customFunctions;
//     }

//     async generate() {
//         console.log('🚀 Generating files by tags...');
//         const outputDir = this.config.outputDir;
//         await fs.ensureDir(outputDir);

//         console.log('📝 Generating query keys...');
//         const queryKeysPath = path.join(process.cwd(), 'lib', 'query-keys.ts');
//         await fs.ensureDir(path.dirname(queryKeysPath));
//         await fs.writeFile(queryKeysPath, this.generateQueryKeys());

//         const axiosPath = path.join(process.cwd(), 'lib', 'axios.ts');
//         if (!await fs.pathExists(axiosPath)) {
//             const axiosConfig = `import axios from 'axios';

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

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

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('authToken');
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;
// `;
//             await fs.writeFile(axiosPath, axiosConfig);
//             console.log('📝 Generated lib/axios.ts');
//         }

//         const groupedEndpoints = this.groupEndpointsByTag();
        
//         for (const [tag, endpoints] of groupedEndpoints) {
//             const tagDir = path.join(outputDir, this.toKebabCase(tag));
//             await fs.ensureDir(tagDir);

//             const usedTypes = this.getTypesFromEndpoints(endpoints);
//             const schemas = this.getSchemas();

//             // Types
//             let tagTypes = `// ${this.t.generatedTypes} - ${tag}\n\n`;
//             for (const typeName of usedTypes) {
//                 if (schemas[typeName]) {
//                     const schema = schemas[typeName];
//                     if (schema.properties || schema.type === 'object') {
//                         const properties = Object.entries(schema.properties || {})
//                             .map(([key, value]) => {
//                                 const optional = !schema.required?.includes(key) ? '?' : '';
//                                 const description = value.description ? `\n  /** ${value.description} */` : '';
//                                 return `${description}\n  ${key}${optional}: ${this.generateTypeScript(value, schemas)};`;
//                             })
//                             .join('\n');
//                         const description = schema.description ? `\n/** ${schema.description} */` : '';
//                         tagTypes += `${description}\nexport interface ${typeName} {\n${properties}\n}\n\n`;
//                     }
//                 }
//             }

//             // Schemas
//             let tagSchemas = `// ${this.t.generatedSchemas} - ${tag}\nimport * as z from "zod";\n\n`;
//             for (const typeName of usedTypes) {
//                 if (schemas[typeName]) {
//                     const schema = schemas[typeName];
//                     if (schema.properties || schema.type === 'object') {
//                         const schemaName = `${this.toCamelCase(typeName)}Schema`;
//                         const zodSchema = this.generateZodSchema(schema, schemas);
//                         tagSchemas += `export const ${schemaName} = ${zodSchema};\n\n`;
//                         tagSchemas += `export type ${this.toPascalCase(typeName)}Schema = z.infer<typeof ${schemaName}>;\n\n`;
//                     }
//                 }
//             }

//             // Generate content based on template
//             const template = this.config.template || 'tanstack-query';
//             const structureMode = this.config.structureMode || 'group-hooks';

//             if (template === 'tanstack-query') {
//                 await this.generateTanStackQuery(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode);
//             } else if (template === 'rtk-query') {
//                 await this.generateRTKQuery(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode);
//             } else if (template === 'swr') {
//                 await this.generateSWR(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode);
//             } else if (template === 'react-query-kit') {
//                 await this.generateReactQueryKit(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode);
//             } else if (template === 'basic') {
//                 await this.generateBasic(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode);
//             }

//             console.log(`✅ Generated ${tag} files`);
//         }

//         console.log(`\n✨ Generation complete!`);
//         console.log(`📁 Files generated in ${this.config.outputDir}`);
//         console.log(`🔑 Query keys in lib/query-keys.ts`);
//         console.log(`⚡ Axios config in lib/axios.ts`);
//     }

//     // ==================== TANSTACK QUERY ====================
//     async generateTanStackQuery(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode) {
//         if (structureMode === 'split') {
//             await this.generateTanStackSplit(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas);
//         } else if (structureMode === 'group') {
//             await this.generateTanStackGroup(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas);
//         } else {
//             await this.generateTanStackGroupHooks(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas);
//         }
//     }

//     async generateTanStackSplit(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas) {
//         const apiDir = path.join(tagDir, 'api');
//         const queriesDir = path.join(tagDir, 'queries');
//         const mutationsDir = path.join(tagDir, 'mutations');
        
//         await fs.ensureDir(apiDir);
//         await fs.ensureDir(queriesDir);
//         await fs.ensureDir(mutationsDir);

//         // Write types and schemas
//         await this.writeIfShould(path.join(tagDir, 'types.ts'), tagTypes);
//         await this.writeIfShould(path.join(tagDir, 'schemas.ts'), tagSchemas);

//         const queryExports = [];
//         const mutationExports = [];

//         for (const { path: endpointPath, method, endpoint } of endpoints) {
//             const functionName = endpoint.operationId ||
//                 `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
//             const camelFunctionName = this.toCamelCase(functionName);

//             // Generate API function
//             const apiContent = `import api from '@/lib/axios';\n${usedTypes.size > 0 ? `import type { ${Array.from(usedTypes).join(', ')} } from '../types';\n\n` : '\n'}${this.generateApiFunction(endpointPath, method, endpoint, tag)}`;
//             await this.writeIfShould(path.join(apiDir, `${camelFunctionName}.ts`), apiContent);

//             if (method.toLowerCase() === 'get') {
//                 // Generate query hook
//                 const hookContent = `import { useQuery } from "@tanstack/react-query";\nimport { queryKeys } from '@/lib/query-keys';\nimport { ${camelFunctionName} } from '../api/${camelFunctionName}';\n${usedTypes.size > 0 ? `import type { ${Array.from(usedTypes).join(', ')} } from '../types';\n\n` : '\n'}${this.generateQueryHook(endpointPath, method, endpoint, tag).replace(`import {`, `// Import moved to top\nexport const`).replace(`} from './api';\n\n`, ``)}`;
//                 const hookName = `use${this.toPascalCase(functionName)}`;
//                 await this.writeIfShould(path.join(queriesDir, `${hookName}.ts`), hookContent);
//                 queryExports.push(hookName);
//             } else {
//                 // Generate mutation hook
//                 const hookContent = `import { useMutation, useQueryClient } from "@tanstack/react-query";\nimport { queryKeys } from '@/lib/query-keys';\nimport { ${camelFunctionName} } from '../api/${camelFunctionName}';\n${usedTypes.size > 0 ? `import type { ${Array.from(usedTypes).join(', ')} } from '../types';\n\n` : '\n'}${this.generateMutationHook(endpointPath, method, endpoint, tag).replace(`import {`, `// Import moved to top\nexport const`).replace(`} from './api';\n\n`, ``)}`;
//                 const hookName = `use${this.toPascalCase(functionName)}`;
//                 await this.writeIfShould(path.join(mutationsDir, `${hookName}.ts`), hookContent);
//                 mutationExports.push(hookName);
//             }
//         }

//         // Generate index files
//         if (queryExports.length > 0) {
//             const queriesIndex = queryExports.map(h => `export { ${h} } from './${h}';`).join('\n');
//             await this.writeIfShould(path.join(queriesDir, 'index.ts'), queriesIndex);
//         }

//         if (mutationExports.length > 0) {
//             const mutationsIndex = mutationExports.map(h => `export { ${h} } from './${h}';`).join('\n');
//             await this.writeIfShould(path.join(mutationsDir, 'index.ts'), mutationsIndex);
//         }

//         // Generate fake data if enabled
//         if (this.config.generateFakeData) {
//             await this.generateFakeDataFile(tagDir, usedTypes, schemas);
//         }
//     }

//     async generateTanStackGroup(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas) {
//         // Write types and schemas
//         await this.writeIfShould(path.join(tagDir, 'types.ts'), tagTypes);
//         await this.writeIfShould(path.join(tagDir, 'schemas.ts'), tagSchemas);

//         // API functions
//         let apiContent = `// ${this.t.generatedApi} - ${tag}\nimport api from '@/lib/axios';\n`;
//         if (usedTypes.size > 0) {
//             apiContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n\n`;
//         } else {
//             apiContent += '\n';
//         }

//         for (const { path: endpointPath, method, endpoint } of endpoints) {
//             apiContent += this.generateApiFunction(endpointPath, method, endpoint, tag);
//         }

//         await this.writeIfShould(path.join(tagDir, 'api.ts'), apiContent);

//         // Queries
//         let queriesContent = `// ${this.t.generatedQueries} - ${tag}\nimport { useQuery } from "@tanstack/react-query";\nimport { queryKeys } from '@/lib/query-keys';\n`;
//         if (usedTypes.size > 0) {
//             queriesContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n`;
//         }
        
//         const apiFunctions = [];
//         for (const { path: endpointPath, method, endpoint } of endpoints) {
//             if (method.toLowerCase() === 'get') {
//                 const functionName = endpoint.operationId ||
//                     `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
//                 apiFunctions.push(`  ${this.toCamelCase(functionName)}`);
//             }
//         }

//         if (apiFunctions.length > 0) {
//             queriesContent += `import {\n${apiFunctions.join(',\n')}\n} from './api';\n\n`;

//             for (const { path: endpointPath, method, endpoint } of endpoints) {
//                 if (method.toLowerCase() === 'get') {
//                     queriesContent += this.generateQueryHook(endpointPath, method, endpoint, tag);
//                 }
//             }
//             await this.writeIfShould(path.join(tagDir, 'queries.ts'), queriesContent);
//         }

//         // Mutations
//         let mutationsContent = `// ${this.t.generatedMutations} - ${tag}\nimport { useMutation, useQueryClient } from "@tanstack/react-query";\nimport { queryKeys } from '@/lib/query-keys';\n`;
//         if (usedTypes.size > 0) {
//             mutationsContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n`;
//         }

//         const mutationFunctions = [];
//         for (const { path: endpointPath, method, endpoint } of endpoints) {
//             if (method.toLowerCase() !== 'get') {
//                 const functionName = endpoint.operationId ||
//                     `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
//                 mutationFunctions.push(`  ${this.toCamelCase(functionName)}`);
//             }
//         }

//         if (mutationFunctions.length > 0) {
//             mutationsContent += `import {\n${mutationFunctions.join(',\n')}\n} from './api';\n\n`;

//             for (const { path: endpointPath, method, endpoint } of endpoints) {
//                 if (method.toLowerCase() !== 'get') {
//                     mutationsContent += this.generateMutationHook(endpointPath, method, endpoint, tag);
//                 }
//             }
//             await this.writeIfShould(path.join(tagDir, 'mutations.ts'), mutationsContent);
//         }

//         if (this.config.generateFakeData) {
//             await this.generateFakeDataFile(tagDir, usedTypes, schemas);
//         }
//     }

//     async generateTanStackGroupHooks(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas) {
//         await this.writeIfShould(path.join(tagDir, 'types.ts'), tagTypes);
        
//         // Generate schemas based on validator choice
//         const validator = this.config.validator || 'zod';
//         let tagSchemas = `// ${this.t.generatedSchemas} - ${tag}\n`;
        
//         if (validator === 'zod') {
//             tagSchemas += `import * as z from "zod";\n\n`;
//             for (const typeName of usedTypes) {
//                 if (schemas[typeName]) {
//                     const schema = schemas[typeName];
//                     if (schema.properties || schema.type === 'object') {
//                         const schemaName = `${this.toCamelCase(typeName)}Schema`;
//                         const zodSchema = this.generateZodSchema(schema, schemas);
//                         tagSchemas += `export const ${schemaName} = ${zodSchema};\n\n`;
//                         tagSchemas += `export type ${this.toPascalCase(typeName)}Schema = z.infer<typeof ${schemaName}>;\n\n`;
//                     }
//                 }
//             }
//         } else if (validator === 'yup') {
//             tagSchemas += `import * as yup from "yup";\n\n`;
//             for (const typeName of usedTypes) {
//                 if (schemas[typeName]) {
//                     const schema = schemas[typeName];
//                     if (schema.properties || schema.type === 'object') {
//                         const schemaName = `${this.toCamelCase(typeName)}Schema`;
//                         const yupSchema = this.generateYupSchema(schema, schemas);
//                         tagSchemas += `export const ${schemaName} = ${yupSchema};\n\n`;
//                         tagSchemas += `export type ${this.toPascalCase(typeName)}Schema = yup.InferType<typeof ${schemaName}>;\n\n`;
//                     }
//                 }
//             }
//         }

//         await this.writeIfShould(path.join(tagDir, 'schemas.ts'), tagSchemas);

//         // Generate api.ts with API functions only
//         const httpClient = this.config.httpClient || 'fetch';
//         let apiContent = `// ${this.t.generatedApi} - ${tag}\n`;
        
//         if (httpClient === 'axios') {
//             apiContent += `import api from '@/lib/axios';\n`;
//         } else {
//             apiContent += `const getAuthHeaders = () => {\n`;
//             apiContent += `  const token = localStorage.getItem('token') || localStorage.getItem('authToken');\n`;
//             apiContent += `  return token ? { 'Authorization': \`Bearer \${token}\` } : {};\n`;
//             apiContent += `};\n\n`;
//         }

//         if (usedTypes.size > 0) {
//             apiContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n\n`;
//         } else {
//             apiContent += '\n';
//         }

//         for (const { path: endpointPath, method, endpoint } of endpoints) {
//             apiContent += this.generateApiFunction(endpointPath, method, endpoint, tag);
//         }

//         await this.writeIfShould(path.join(tagDir, 'api.ts'), apiContent);

//         // Generate hooks.ts with queries and mutations
//         let hooksContent = `// ${this.t.generatedHooks} - ${tag}\nimport { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";\nimport { queryKeys } from '@/lib/query-keys';\n`;
//         if (usedTypes.size > 0) {
//             hooksContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n`;
//         }

//         // Import all API functions
//         const allApiFunctions = [];
//         for (const { path: endpointPath, method, endpoint } of endpoints) {
//             const functionName = endpoint.operationId ||
//                 `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
//             allApiFunctions.push(`  ${this.toCamelCase(functionName)}`);
//         }

//         if (allApiFunctions.length > 0) {
//             hooksContent += `import {\n${allApiFunctions.join(',\n')}\n} from './api';\n\n`;
//         }

//         hooksContent += `// ${this.t.queryHooks}\n\n`;

//         // Queries
//         for (const { path: endpointPath, method, endpoint } of endpoints) {
//             if (method.toLowerCase() === 'get') {
//                 hooksContent += this.generateQueryHook(endpointPath, method, endpoint, tag);
//             }
//         }

//         hooksContent += `\n// ${this.t.mutationHooks}\n\n`;

//         // Mutations
//         for (const { path: endpointPath, method, endpoint } of endpoints) {
//             if (method.toLowerCase() !== 'get') {
//                 hooksContent += this.generateMutationHook(endpointPath, method, endpoint, tag);
//             }
//         }

//         await this.writeIfShould(path.join(tagDir, 'hooks.ts'), hooksContent);

//         if (this.config.generateFakeData) {
//             await this.generateFakeDataFile(tagDir, usedTypes, schemas);
//         }
//     }

//     // ==================== RTK QUERY ====================
//     async generateRTKQuery(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode) {
//         // RTK Query only supports group-hooks structure
//         if (structureMode !== 'group-hooks') {
//             console.log(`⚠️  RTK Query only supports 'group-hooks' structure. Using group-hooks instead of ${structureMode}.`);
//         }

//         await this.writeIfShould(path.join(tagDir, 'types.ts'), tagTypes);
//         await this.writeIfShould(path.join(tagDir, 'schemas.ts'), tagSchemas);

//         const tagCamelCase = this.toCamelCase(tag.replace(/[^a-zA-Z0-9]/g, ''));
        
//         let apiSliceContent = `// ${this.t.generatedApi} - ${tag}\nimport { apiInstance, invalidateOn } from "@/services/config";\n`;
//         if (usedTypes.size > 0) {
//             apiSliceContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n\n`;
//         } else {
//             apiSliceContent += '\n';
//         }

//         apiSliceContent += `export const ${tagCamelCase}Api = apiInstance.injectEndpoints({\n  endpoints: (builder) => ({\n`;

//         for (const { path: endpointPath, method, endpoint } of endpoints) {
//             const functionName = endpoint.operationId ||
//                 `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
//             const camelFunctionName = this.toCamelCase(functionName);
//             const responseType = this.getResponseType(endpoint.responses);
//             const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
//             const queryParams = endpoint.parameters?.filter(p => p.in === 'query') || [];
//             const hasRequestBody = !!endpoint.requestBody;
//             const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : '';
//             let urlPath = this.stripBasePath(endpointPath);

//             let queryType = 'void';
//             if (pathParams.length > 0 || queryParams.length > 0 || hasRequestBody) {
//                 const parts = [];
//                 if (hasRequestBody) parts.push(requestBodyType);
//                 if (pathParams.length > 0) parts.push(`{ ${pathParams.map(p => `${p.name}: string`).join('; ')} }`);
//                 if (queryParams.length > 0) parts.push(`{ ${queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }`);
//                 queryType = parts.join(' & ');
//             }

//             const isQuery = method.toLowerCase() === 'get';
//             const builderMethod = isQuery ? 'query' : 'mutation';

//             apiSliceContent += `    ${camelFunctionName}: builder.${builderMethod}<${responseType}, ${queryType}>({\n`;
            
//             // Query function
//             apiSliceContent += `      query: (`;
//             if (queryType !== 'void') {
//                 if (pathParams.length > 0 && (hasRequestBody || queryParams.length > 0)) {
//                     apiSliceContent += `{ ${pathParams.map(p => p.name).join(', ')}${hasRequestBody ? ', ...body' : ''}${queryParams.length > 0 ? ', ...params' : ''} }`;
//                 } else if (pathParams.length > 0) {
//                     apiSliceContent += `{ ${pathParams.map(p => p.name).join(', ')} }`;
//                 } else if (hasRequestBody) {
//                     apiSliceContent += `body`;
//                 } else {
//                     apiSliceContent += `params`;
//                 }
//             }
//             apiSliceContent += `) => `;

//             // Build URL with path params
//             pathParams.forEach(param => {
//                 urlPath = urlPath.replace(`{${param.name}}`, `\${${param.name}}`);
//             });

//             if (hasRequestBody && method.toLowerCase() !== 'get') {
//                 apiSliceContent += `({\n        url: \`${urlPath}\`,\n        method: "${method.toUpperCase()}",\n        body${queryParams.length > 0 ? ',\n        params' : ''},\n      })`;
//             } else if (queryParams.length > 0) {
//                 apiSliceContent += `({\n        url: \`${urlPath}\`,\n        params,\n      })`;
//             } else {
//                 apiSliceContent += `\`${urlPath}\``;
//             }
//             apiSliceContent += `,\n`;

//             // ProvideTags / InvalidatesTags
//             if (isQuery) {
//                 apiSliceContent += `      providesTags: [{ type: "${this.capitalize(tag)}", id: "LIST" }],\n`;
//             } else {
//                 apiSliceContent += `      invalidatesTags: invalidateOn({\n        success: [{ type: "${this.capitalize(tag)}", id: "LIST" }],\n      }),\n`;
//             }

//             apiSliceContent += `    }),\n`;
//         }

//         apiSliceContent += `  }),\n});\n\n`;

//         // Export hooks
//         apiSliceContent += `export const {\n`;
//         for (const { path: endpointPath, method, endpoint } of endpoints) {
//             const functionName = endpoint.operationId ||
//                 `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
//             const hookName = `use${this.toPascalCase(functionName)}${method.toLowerCase() === 'get' ? 'Query' : 'Mutation'}`;
//             apiSliceContent += `  ${hookName},\n`;
//         }
//         apiSliceContent += `} = ${tagCamelCase}Api;\n`;

//         await this.writeIfShould(path.join(tagDir, 'api.ts'), apiSliceContent);

//         if (this.config.generateFakeData) {
//             await this.generateFakeDataFile(tagDir, usedTypes, schemas);
//         }
//     }

//     // ==================== SWR ====================
//     async generateSWR(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode) {
//         // Similar structure to TanStack Query but using SWR
//         await this.writeIfShould(path.join(tagDir, 'types.ts'), tagTypes);
//         await this.writeIfShould(path.join(tagDir, 'schemas.ts'), tagSchemas);

//         if (structureMode === 'group-hooks') {
//             let hooksContent = `// ${this.t.generatedHooks} - ${tag}\nimport useSWR from "swr";\nimport { useState } from "react";\nimport api from '@/lib/axios';\n`;
//             if (usedTypes.size > 0) {
//                 hooksContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n\n`;
//             } else {
//                 hooksContent += '\n';
//             }

//             for (const { path: endpointPath, method, endpoint } of endpoints) {
//                 hooksContent += this.generateApiFunction(endpointPath, method, endpoint, tag);

//                 const functionName = endpoint.operationId ||
//                     `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
//                 const hookName = `use${this.toPascalCase(functionName)}`;
//                 const apiFunctionName = this.toCamelCase(functionName);

//                 if (method.toLowerCase() === 'get') {
//                     const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
//                     let params = pathParams.length > 0 ? pathParams.map(p => `${p.name}: string`).join(', ') : '';
//                     const keyParams = pathParams.length > 0 ? `, ${pathParams.map(p => p.name).join(', ')}` : '';
                    
//                     hooksContent += `export function ${hookName}(${params}) {\n`;
//                     hooksContent += `  const { data, error, isLoading } = useSWR(\`/${tag}${keyParams}\`, () => ${apiFunctionName}(${pathParams.map(p => p.name).join(', ')}));\n`;
//                     hooksContent += `  return { data, error, isLoading };\n}\n\n`;
//                 } else {
//                     // Mutation with useState
//                     const hasRequestBody = !!endpoint.requestBody;
//                     const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : 'void';
                    
//                     hooksContent += `export function ${hookName}() {\n`;
//                     hooksContent += `  const [loading, setLoading] = useState(false);\n`;
//                     hooksContent += `  const [error, setError] = useState<Error | null>(null);\n\n`;
//                     hooksContent += `  const mutate = async (${hasRequestBody ? `input: ${requestBodyType}` : ''}) => {\n`;
//                     hooksContent += `    setLoading(true);\n`;
//                     hooksContent += `    try {\n`;
//                     hooksContent += `      const result = await ${apiFunctionName}(${hasRequestBody ? 'input' : ''});\n`;
//                     hooksContent += `      setLoading(false);\n`;
//                     hooksContent += `      return result;\n`;
//                     hooksContent += `    } catch (err: any) {\n`;
//                     hooksContent += `      setError(err);\n`;
//                     hooksContent += `      setLoading(false);\n`;
//                     hooksContent += `      return null;\n`;
//                     hooksContent += `    }\n`;
//                     hooksContent += `  };\n\n`;
//                     hooksContent += `  return { mutate, loading, error };\n}\n\n`;
//                 }
//             }

//             await this.writeIfShould(path.join(tagDir, 'hooks.ts'), hooksContent);
//         }

//         if (this.config.generateFakeData) {
//             await this.generateFakeDataFile(tagDir, usedTypes, schemas);
//         }
//     }

//     // ==================== REACT QUERY KIT ====================
//     async generateReactQueryKit(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode) {
//         await this.writeIfShould(path.join(tagDir, 'types.ts'), tagTypes);
//         await this.writeIfShould(path.join(tagDir, 'schemas.ts'), tagSchemas);

//         let hooksContent = `// ${this.t.generatedHooks} - ${tag}\nimport { createQuery, createMutation } from "react-query-kit";\nimport api from '@/lib/axios';\n`;
//         if (usedTypes.size > 0) {
//             hooksContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n\n`;
//         } else {
//             hooksContent += '\n';
//         }

//         for (const { path: endpointPath, method, endpoint } of endpoints) {
//             const functionName = endpoint.operationId ||
//                 `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
//             const hookName = `use${this.toPascalCase(functionName)}`;
//             const responseType = this.getResponseType(endpoint.responses);
//             let urlPath = this.stripBasePath(endpointPath);
//             const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
//             const hasRequestBody = !!endpoint.requestBody;
//             const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : '';

//             // Build query key - static version sans variables
//             const staticUrlPath = this.stripBasePath(endpointPath);

//             if (method.toLowerCase() === 'get') {
//                 hooksContent += `export const ${hookName} = createQuery({\n`;
//                 hooksContent += `  queryKey: ["${staticUrlPath}"],\n`;
//                 hooksContent += `  fetcher: (${pathParams.length > 0 ? `variables: { ${pathParams.map(p => `${p.name}: string`).join('; ')} }` : ''}): Promise<${responseType}> => {\n`;
                
//                 // Build URL avec template literals
//                 pathParams.forEach(param => {
//                     urlPath = urlPath.replace(`{${param.name}}`, `\${variables.${param.name}}`);
//                 });
                
//                 hooksContent += `    return api.get(\`${urlPath}\`).then((res) => res.data);\n`;
//                 hooksContent += `  },\n`;
//                 hooksContent += `});\n\n`;
//             } else {
//                 hooksContent += `export const ${hookName} = createMutation({\n`;
//                 hooksContent += `  mutationKey: ["${staticUrlPath}"],\n`;
//                 let mutationFnParam = '';
//                 if (pathParams.length > 0 && hasRequestBody) {
//                     mutationFnParam = `variables: ${requestBodyType} & { ${pathParams.map(p => `${p.name}: string`).join('; ')} }`;
//                 } else if (pathParams.length > 0) {
//                     mutationFnParam = `variables: { ${pathParams.map(p => `${p.name}: string`).join('; ')} }`;
//                 } else if (hasRequestBody) {
//                     mutationFnParam = `data: ${requestBodyType}`;
//                 }
                
//                 // Build URL avec template literals
//                 pathParams.forEach(param => {
//                     urlPath = urlPath.replace(`{${param.name}}`, `\${variables.${param.name}}`);
//                 });
                
//                 hooksContent += `  mutationFn: (${mutationFnParam}) => {\n`;
//                 if (hasRequestBody) {
//                     hooksContent += `    return api.${method.toLowerCase()}(\`${urlPath}\`, ${pathParams.length > 0 ? 'variables' : 'data'});\n`;
//                 } else {
//                     hooksContent += `    return api.${method.toLowerCase()}(\`${urlPath}\`);\n`;
//                 }
//                 hooksContent += `  },\n`;
//                 hooksContent += `});\n\n`;
//             }
//         }

//         await this.writeIfShould(path.join(tagDir, 'hooks.ts'), hooksContent);

//         if (this.config.generateFakeData) {
//             await this.generateFakeDataFile(tagDir, usedTypes, schemas);
//         }
//     }

//     // ==================== BASIC (useState/useEffect) ====================
//     async generateBasic(tag, endpoints, tagDir, usedTypes, schemas, tagTypes, tagSchemas, structureMode) {
//         await this.writeIfShould(path.join(tagDir, 'types.ts'), tagTypes);
//         await this.writeIfShould(path.join(tagDir, 'schemas.ts'), tagSchemas);

//         let hooksContent = `// ${this.t.generatedHooks} - ${tag}\nimport { useEffect, useState } from "react";\nimport api from '@/lib/axios';\n`;
//         if (usedTypes.size > 0) {
//             hooksContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n\n`;
//         } else {
//             hooksContent += '\n';
//         }

//         for (const { path: endpointPath, method, endpoint } of endpoints) {
//             hooksContent += this.generateApiFunction(endpointPath, method, endpoint, tag);

//             const functionName = endpoint.operationId ||
//                 `${method}${endpointPath.split('/').map(p => p.startsWith('{') ? '' : this.capitalize(p)).join('')}`;
//             const hookName = `use${this.toPascalCase(functionName)}`;
//             const apiFunctionName = this.toCamelCase(functionName);
//             const responseType = this.getResponseType(endpoint.responses);
//             const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
//             const hasRequestBody = !!endpoint.requestBody;
//             const requestBodyType = hasRequestBody ? this.getRequestBodyType(endpoint.requestBody) : '';

//             if (method.toLowerCase() === 'get') {
//                 let params = pathParams.length > 0 ? pathParams.map(p => `${p.name}: string`).join(', ') : '';
//                 const callParams = pathParams.map(p => p.name).join(', ');

//                 hooksContent += `export function ${hookName}(${params}) {\n`;
//                 hooksContent += `  const [data, setData] = useState<${responseType} | null>(null);\n`;
//                 hooksContent += `  const [loading, setLoading] = useState(true);\n`;
//                 hooksContent += `  const [error, setError] = useState<Error | null>(null);\n\n`;
//                 hooksContent += `  useEffect(() => {\n`;
//                 hooksContent += `    ${apiFunctionName}(${callParams})\n`;
//                 hooksContent += `      .then(setData)\n`;
//                 hooksContent += `      .catch(setError)\n`;
//                 hooksContent += `      .finally(() => setLoading(false));\n`;
//                 hooksContent += `  }, [${pathParams.map(p => p.name).join(', ')}]);\n\n`;
//                 hooksContent += `  return { data, loading, error };\n}\n\n`;
//             } else {
//                 hooksContent += `export function ${hookName}() {\n`;
//                 hooksContent += `  const [loading, setLoading] = useState(false);\n`;
//                 hooksContent += `  const [error, setError] = useState<Error | null>(null);\n\n`;
//                 hooksContent += `  const mutate = async (${hasRequestBody ? `input: ${requestBodyType}` : ''}) => {\n`;
//                 hooksContent += `    setLoading(true);\n`;
//                 hooksContent += `    try {\n`;
//                 hooksContent += `      const result = await ${apiFunctionName}(${hasRequestBody ? 'input' : ''});\n`;
//                 hooksContent += `      setLoading(false);\n`;
//                 hooksContent += `      return result;\n`;
//                 hooksContent += `    } catch (err: any) {\n`;
//                 hooksContent += `      setError(err);\n`;
//                 hooksContent += `      setLoading(false);\n`;
//                 hooksContent += `      return null;\n`;
//                 hooksContent += `    }\n`;
//                 hooksContent += `  };\n\n`;
//                 hooksContent += `  return { mutate, loading, error };\n}\n\n`;
//             }
//         }

//         await this.writeIfShould(path.join(tagDir, 'hooks.ts'), hooksContent);

//         if (this.config.generateFakeData) {
//             await this.generateFakeDataFile(tagDir, usedTypes, schemas);
//         }
//     }

//     // ==================== HELPER METHODS ====================
//     async generateFakeDataFile(tagDir, usedTypes, schemas) {
//         let fakeDataContent = `// ${this.t.generatedFakeData}\n`;
//         if (usedTypes.size > 0) {
//             fakeDataContent += `import type {\n  ${Array.from(usedTypes).join(',\n  ')}\n} from './types';\n\n`;
//         } else {
//             fakeDataContent += '\n';
//         }

//         for (const typeName of usedTypes) {
//             if (schemas[typeName]) {
//                 const schema = schemas[typeName];
//                 if (schema.properties) {
//                     fakeDataContent += this.generateFakeData(typeName, schema, schemas);
//                 }
//             }
//         }

//         await this.writeIfShould(path.join(tagDir, 'data.ts'), fakeDataContent);
//     }

//     async writeIfShould(filePath, content) {
//         if (await this.shouldOverwriteFile(filePath)) {
//             await fs.writeFile(filePath, content);
//         } else {
//             console.log(`   ⏭️  Skipped ${path.relative(process.cwd(), filePath)} (has user modifications)`);
//         }
//     }
// }

// async function loadSwaggerSpec(input, credentials) {
//     let content;
//     const axiosInstance = createAxiosInstance(credentials);
//     if (input.startsWith('http://') || input.startsWith('https://')) {
//         console.log(`Fetching Swagger spec from ${input}...`);
//         try {
//             const response = await axiosInstance.get(input);
//             content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
//             if (content.trim().startsWith('<')) {
//                 console.log('Received HTML instead of Swagger spec. Trying common endpoints...');
//                 const baseUrl = input.replace(/\/api\/?$/, '');
//                 const commonPaths = [
//                     '/api/swagger.json',
//                     '/api-docs',
//                     '/api-json',
//                     '/api/docs-json',
//                     '/swagger.json',
//                     '/swagger/v1/swagger.json',
//                     '/v1/swagger.json',
//                     '/docs/swagger.json'
//                 ];
//                 for (const path of commonPaths) {
//                     try {
//                         console.log(`Trying ${baseUrl}${path}...`);
//                         const tryResponse = await axiosInstance.get(`${baseUrl}${path}`);
//                         const tryContent = typeof tryResponse.data === 'string' ? tryResponse.data : JSON.stringify(tryResponse.data);
//                         if (!tryContent.trim().startsWith('<')) {
//                             console.log(`✅ Found Swagger spec at ${baseUrl}${path}`);
//                             content = tryContent;
//                             break;
//                         }
//                     } catch (e) {
//                         continue;
//                     }
//                 }
//                 if (content.trim().startsWith('<')) {
//                     throw new Error(`Could not find Swagger JSON/YAML spec. Please provide the direct URL to the specification.`);
//                 }
//             }
//         } catch (error) {
//             if (error.response?.status === 401 && !credentials) {
//                 console.log('\nAuthentication required (401)');
//                 const creds = await promptForCredentials();
//                 return loadSwaggerSpec(input, creds);
//             }
//             throw new Error(`Failed to fetch Swagger spec: ${error?.message || 'Unknown error'}`);
//         }
//     } else {
//         console.log(`Loading Swagger spec from ${input}...`);
//         content = await fs.readFile(input, 'utf-8');
//     }

//     try {
//         const parsed = JSON.parse(content);
//         if (!parsed.paths) {
//             throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
//         }
//         return parsed;
//     } catch (jsonError) {
//         try {
//             const parsed = yaml.load(content);
//             if (!parsed.paths) {
//                 throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
//             }
//             return parsed;
//         } catch (yamlError) {
//             throw new Error(`Failed to parse Swagger spec: ${jsonError.message}`);
//         }
//     }
// }

// const program = new Command();

// program
//     .name('swagger-to-tanstack')
//     .description('Generate TanStack Query hooks, types, and schemas from Swagger/OpenAPI specification')
//     .version('3.0.0');

// program
//     .command('init')
//     .description('Initialize project with lib/axios.ts and lib/query-keys.ts')
//     .action(async () => {
//         try {
//             console.log('🚀 Initializing project...');
//             const libDir = path.join(process.cwd(), 'lib');
//             await fs.ensureDir(libDir);

//             const axiosPath = path.join(libDir, 'axios.ts');
//             if (!await fs.pathExists(axiosPath)) {
//                 const axiosConfig = `import axios from 'axios';

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

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

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('authToken');
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;
// `;
//                 await fs.writeFile(axiosPath, axiosConfig);
//                 console.log('✅ Created lib/axios.ts');
//             } else {
//                 console.log('⚠️  lib/axios.ts already exists');
//             }

//             const queryKeysPath = path.join(libDir, 'query-keys.ts');
//             if (!await fs.pathExists(queryKeysPath)) {
//                 const queryKeysTemplate = `// Query keys will be populated by swagger-to-tanstack generate
// export const queryKeys = {} as const;
// `;
//                 await fs.writeFile(queryKeysPath, queryKeysTemplate);
//                 console.log('✅ Created lib/query-keys.ts');
//             } else {
//                 console.log('⚠️  lib/query-keys.ts already exists');
//             }

//             console.log('\n✨ Initialization complete!');
//             console.log('Next: Run swagger-to-tanstack generate -i <swagger-url>');
//         } catch (error) {
//             console.error('❌ Error:', error?.message || 'Unknown error');
//             process.exit(1);
//         }
//     });

// program
//     .command('generate')
//     .description('Generate API functions, hooks, types, and schemas from Swagger spec')
//     .requiredOption('-i, --input <input>', 'Swagger spec file path or URL')
//     .option('-o, --output <dir>', 'Output directory', './src/api')
//     .option('-t, --template <template>', 'Template to use: tanstack-query, rtk-query, swr, react-query-kit, basic', 'tanstack-query')
//     .option('-s, --structure <mode>', 'Structure mode: split, group, group-hooks', 'group-hooks')
//     .option('-b, --baseUrl <url>', 'API base URL override')
//     .option('--strip-base-path [path]', 'Strip base path from routes (e.g., /api/v1). Use true for auto-detection or provide custom path')
//     .option('-l, --language <lang>', 'Language for comments (en|fr)', 'en')
//     .option('--fake-data', 'Generate fake data for testing')
//     .option('--preserve-modified', 'Skip overwriting files with user modifications')
//     .option('-u, --username <username>', 'Basic auth username')
//     .option('-p, --password <password>', 'Basic auth password')
//     .action(async (options) => {
//         try {
//             if (!['en', 'fr'].includes(options.language)) {
//                 throw new Error('Language must be "en" or "fr"');
//             }

//             const validTemplates = ['tanstack-query', 'rtk-query', 'swr', 'react-query-kit', 'basic'];
//             if (!validTemplates.includes(options.template)) {
//                 throw new Error(`Template must be one of: ${validTemplates.join(', ')}`);
//             }

//             const validStructures = ['split', 'group', 'group-hooks'];
//             if (!validStructures.includes(options.structure)) {
//                 throw new Error(`Structure must be one of: ${validStructures.join(', ')}`);
//             }

//             const config = {
//                 outputDir: options.output,
//                 baseUrl: options.baseUrl || '',
//                 template: options.template,
//                 structureMode: options.structure,
//                 stripBasePath: options.stripBasePath === 'true' ? true : options.stripBasePath || false,
//                 language: options.language,
//                 generateFakeData: options.fakeData || false,
//                 preserveModified: options.preserveModified || false,
//             };

//             let credentials;
//             if (options.username && options.password) {
//                 credentials = { username: options.username, password: options.password };
//             }

//             console.log(`📋 Template: ${options.template}`);
//             console.log(`📁 Structure: ${options.structure}`);
//             console.log(`🌐 Language: ${options.language}`);
//             if (config.stripBasePath) {
//                 console.log(`✂️  Stripping base path: ${config.stripBasePath === true ? 'auto-detect' : config.stripBasePath}`);
//             }

//             const spec = await loadSwaggerSpec(options.input, credentials);
//             const generator = new SwaggerToTanStackGenerator(spec, config);
//             await generator.generate();
//         } catch (error) {
//             console.error('❌ Error:', error?.message || 'Unknown error');
//             process.exit(1);
//         }
//     });

// program
//     .command('update')
//     .description('Update generated files from Swagger spec (preserves user modifications)')
//     .requiredOption('-i, --input <input>', 'Swagger spec file path or URL')
//     .option('-o, --output <dir>', 'Output directory', './src/api')
//     .option('-t, --template <template>', 'Template to use', 'tanstack-query')
//     .option('-s, --structure <mode>', 'Structure mode', 'group-hooks')
//     .option('--strip-base-path [path]', 'Strip base path from routes')
//     .option('-l, --language <lang>', 'Language (en|fr)', 'en')
//     .option('-u, --username <username>', 'Basic auth username')
//     .option('-p, --password <password>', 'Basic auth password')
//     .action(async (options) => {
//         try {
//             const config = {
//                 outputDir: options.output,
//                 baseUrl: '',
//                 template: options.template,
//                 structureMode: options.structure,
//                 stripBasePath: options.stripBasePath === 'true' ? true : options.stripBasePath || false,
//                 language: options.language,
//                 generateFakeData: false,
//                 preserveModified: true,
//             };

//             let credentials;
//             if (options.username && options.password) {
//                 credentials = { username: options.username, password: options.password };
//             }

//             const spec = await loadSwaggerSpec(options.input, credentials);
//             const generator = new SwaggerToTanStackGenerator(spec, config);
//             await generator.generate();
//         } catch (error) {
//             console.error('❌ Error:', error?.message || 'Unknown error');
//             process.exit(1);
//         }
//     });

// program
//     .command('watch')
//     .description('Watch Swagger spec and regenerate on changes')
//     .requiredOption('-i, --input <input>', 'Swagger spec file path')
//     .option('-o, --output <dir>', 'Output directory', './src/api')
//     .option('-t, --template <template>', 'Template to use', 'tanstack-query')
//     .option('-s, --structure <mode>', 'Structure mode', 'group-hooks')
//     .option('--strip-base-path [path]', 'Strip base path from routes')
//     .option('-l, --language <lang>', 'Language (en|fr)', 'en')
//     .action(async (options) => {
//         try {
//             if (options.input.startsWith('http')) {
//                 throw new Error('Watch mode only works with local files');
//             }

//             console.log(`👀 Watching ${options.input} for changes...`);

//             const config = {
//                 outputDir: options.output,
//                 baseUrl: '',
//                 template: options.template,
//                 structureMode: options.structure,
//                 stripBasePath: options.stripBasePath === 'true' ? true : options.stripBasePath || false,
//                 language: options.language,
//                 generateFakeData: false,
//                 preserveModified: true,
//             };

//             const spec = await loadSwaggerSpec(options.input);
//             const generator = new SwaggerToTanStackGenerator(spec, config);
//             await generator.generate();

//             fs.watch(options.input, async (eventType) => {
//                 if (eventType === 'change') {
//                     console.log('\n🔄 Swagger spec changed, regenerating...');
//                     try {
//                         const newSpec = await loadSwaggerSpec(options.input);
//                         const newGenerator = new SwaggerToTanStackGenerator(newSpec, config);
//                         await newGenerator.generate();
//                     } catch (error) {
//                         console.error('❌ Error during regeneration:', error?.message);
//                     }
//                 }
//             });

//             console.log('Press Ctrl+C to stop watching');
//         } catch (error) {
//             console.error('❌ Error:', error?.message || 'Unknown error');
//             process.exit(1);
//         }
//     });

// program
//     .command('validate')
//     .description('Validate Swagger/OpenAPI specification')
//     .requiredOption('-i, --input <input>', 'Swagger spec file path or URL')
//     .option('-u, --username <username>', 'Basic auth username')
//     .option('-p, --password <password>', 'Basic auth password')
//     .action(async (options) => {
//         try {
//             console.log('🔍 Validating Swagger specification...');

//             let credentials;
//             if (options.username && options.password) {
//                 credentials = { username: options.username, password: options.password };
//             }

//             const spec = await loadSwaggerSpec(options.input, credentials);
//             console.log(`\n✅ Valid ${spec.openapi ? 'OpenAPI' : 'Swagger'} specification`);
//             console.log(`📝 Title: ${spec.info?.title}`);
//             console.log(`🔢 Version: ${spec.info?.version}`);
//             console.log(`🛣️  Paths: ${Object.keys(spec.paths).length}`);
//             console.log(`📦 Schemas: ${Object.keys(spec.components?.schemas || spec.definitions || {}).length}`);

//             const tags = spec.tags || [];
//             if (tags.length > 0) {
//                 console.log(`🏷️  Tags: ${tags.map(t => t.name).join(', ')}`);
//             }

//             if (spec.basePath) {
//                 console.log(`🌐 Base Path: ${spec.basePath}`);
//             }
//             if (spec.servers && spec.servers.length > 0) {
//                 console.log(`🖥️  Servers: ${spec.servers.map(s => s.url).join(', ')}`);
//             }
//         } catch (error) {
//             console.error('❌ Invalid specification:', error?.message || 'Unknown error');
//             process.exit(1);
//         }
//     });

// program
//     .command('list-templates')
//     .description('List all available templates and structure modes')
//     .action(() => {
//         console.log('\n📚 Available Templates:\n');
//         console.log('  1. tanstack-query    - TanStack Query (React Query v5)');
//         console.log('     Compatible structures: split, group, group-hooks ✅');
//         console.log('');
//         console.log('  2. rtk-query         - RTK Query (Redux Toolkit)');
//         console.log('     Compatible structures: group-hooks only ⚠️');
//         console.log('     Note: Requires config file. Run: swagger-to-tanstack config');
//         console.log('');
//         console.log('  3. swr               - SWR (Vercel)');
//         console.log('     Compatible structures: group-hooks only ⚠️');
//         console.log('');
//         console.log('  4. react-query-kit   - React Query Kit');
//         console.log('     Compatible structures: group-hooks only ⚠️');
//         console.log('');
//         console.log('  5. basic             - Basic fetch with useState/useEffect');
//         console.log('     Compatible structures: group-hooks only ⚠️');
        
//         console.log('\n🏗️  Structure Modes:\n');
//         console.log('  • split              - Separate folders: api/, queries/, mutations/');
//         console.log('                         Each endpoint gets its own file');
//         console.log('');
//         console.log('  • group              - Grouped files: api.ts, queries.ts, mutations.ts');
//         console.log('                         All endpoints in category files');
//         console.log('');
//         console.log('  • group-hooks        - Single hooks.ts file');
//         console.log('                         Everything in one place (recommended)');
        
//         console.log('\n💡 Example Usage:\n');
//         console.log('  # TanStack Query with split structure');
//         console.log('  swagger-to-tanstack generate -i ./swagger.json -t tanstack-query -s split\n');
//         console.log('  # RTK Query (only supports group-hooks)');
//         console.log('  swagger-to-tanstack config  # Generate config first');
//         console.log('  swagger-to-tanstack generate -i ./swagger.json -t rtk-query\n');
//         console.log('  # SWR with base path stripping');
//         console.log('  swagger-to-tanstack generate -i https://api.com/docs -t swr --strip-base-path /api/v1\n');
//     });
        
//         console.log('\n🏗️  Structure Modes:\n');
//         console.log('  • split              - Separate files for api/, queries/, mutations/');
//         console.log('  • group              - Grouped files: api.ts, queries.ts, mutations.ts');
//         console.log('  • group-hooks        - Single hooks.ts file with everything');
        
//         console.log('\n💡 Example Usage:\n');
//         console.log('  swagger-to-tanstack generate -i ./swagger.json -t rtk-query -s split');
//         console.log('  swagger-to-tanstack generate -i https://api.com/docs -t swr -s group-hooks --strip-base-path /api/v1\n');
//     });

// program
//     .command('config')
//     .description('Generate RTK Query config file')
//     .option('-o, --output <dir>', 'Output directory', './src/services')
//     .action(async (options) => {
//         try {
//             console.log('Generating RTK Query config...');
//             const configDir = path.join(process.cwd(), options.output);
//             await fs.ensureDir(configDir);

//             const configContent = `import { createApi, fetchBaseQuery, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
// import { getSession, signOut } from "next-auth/react";

// export const invalidateOn = <T>({ success, error }: { success?: T[]; error?: T[] }) => {
//   return (result: unknown) => (result ? (success ?? []) : (error ?? []));
// };

// const getActiveOfficeId = () => {
//   const activeOffice = sessionStorage.getItem("active-office");
//   return activeOffice ? JSON.parse(activeOffice).state.activeOfficeId : undefined;
// };

// export const setActiveOfficeId = (officeId: string) => {
//   sessionStorage.setItem(
//     "active-office",
//     JSON.stringify({ state: { activeOfficeId: officeId } })
//   );
// };

// const getBaseQuery = () =>
//   fetchBaseQuery({
//     baseUrl: process.env.NEXT_PUBLIC_API_URL,
//     prepareHeaders: async (headers, { arg }) => {
//       const session = await getSession();
      
//       if (
//         !headers.has("Content-Type") &&
//         (typeof arg === "string" || !(arg?.body instanceof FormData))
//       ) {
//         headers.set("Content-Type", "application/json");
//       }

//       if (session?.accessToken) {
//         headers.set("Authorization", \`Bearer \${session.accessToken}\`);
//       }

//       const activeOfficeId = getActiveOfficeId();
//       if (activeOfficeId) {
//         headers.set("X-Office-Id", activeOfficeId);
//       }

//       return headers;
//     },
//     responseHandler: async (response) => {
//       const data = await response.json();
//       const status = response.status;

//       if (process.env.NODE_ENV === "development") {
//         console.log(\`Response from \${response.url}:\`, JSON.stringify(data));
//       }

//       if (status === 401) {
//         await signOut();
//       }

//       if (status === 422) {
//         await signOut({ redirect: false });
//         window.location.href = "/blocked-account";
//       }

//       return data;
//     },
//   });

// export class ResponseError<InFields extends string> extends Error {
//   constructor(
//     { status, data }: FetchBaseQueryError,
//     private readonly globalError?: string,
//     private readonly fieldsErrors?: Record<InFields, string>
//   ) {
//     super();
//     switch (status) {
//       case "TIMEOUT_ERROR":
//         this.globalError = "Request timed out. Please try again.";
//         break;
//       case "FETCH_ERROR":
//         this.globalError = "Cannot reach out to the server. Please try again.";
//         break;
//       default:
//         if (data) {
//           this.globalError = (data as { message?: string; errors?: Record<InFields, string> }).message;
//           this.fieldsErrors = (data as { message?: string; errors?: Record<InFields, string> }).errors;
//         } else {
//           this.globalError = "Something went wrong. Please try again.";
//         }
//         break;
//     }
//   }

//   export<OutFields extends string>(fieldsMap?: Partial<Record<InFields, OutFields>>) {
//     return {
//       message: this.globalError,
//       errors:
//         fieldsMap && this.fieldsErrors
//           ? Object.keys(this.fieldsErrors).reduce(
//               (acc, key) => ({
//                 ...acc,
//                 [fieldsMap[key as InFields]]: this.fieldsErrors![key as InFields],
//               }),
//               {}
//             )
//           : {},
//     };
//   }
// }

// export type ListQueryParams<
//   TParams extends Partial<Record<string, string | number | boolean>> = Partial<
//     Record<string, string | number | boolean>
//   >
// > = TParams & {
//   page?: number;
//   limit?: number;
//   query?: string;
// };

// export type ListMeta = {
//   total?: number;
//   page?: number;
//   limit?: number;
// };

// export type ListQueryResponse<TData> = TData extends {
//   [RESPONSE_BODY_KEY]: infer D extends object;
// }
//   ? {
//       [RESPONSE_BODY_KEY]: D & ListMeta;
//     }
//   : never;

// export type ListData<TData> = {
//   data: TData;
//   meta: ListMeta;
// };

// export const parseListResponse = <TData>(meta: ListMeta, mappedData: TData): ListData<TData> => ({
//   data: mappedData,
//   meta: {
//     total: meta.total,
//     page: meta.page,
//     limit: meta.limit,
//   },
// });

// export const prepareListQueryParams = <
//   TParams extends Partial<Record<string, string | number | boolean>> = Partial<
//     Record<string, string | number | boolean>
//   >
// >(
//   queryParams: ListQueryParams<TParams> | void
// ) => {
//   const params = new URLSearchParams();
//   if (queryParams) {
//     Object.entries(queryParams).forEach(([key, value]) => {
//       if (value !== undefined) {
//         params.append(key, value.toString());
//       }
//     });
//   }
//   return params;
// };

// export const RESPONSE_BODY_KEY = "data";

// export const apiInstance = createApi({
//   tagTypes: [
//     "Auth",
//     "Account",
//     "Users",
//     // Add your tag types here
//   ],
//   baseQuery: getBaseQuery(),
//   endpoints: () => ({}),
// });

// export { getBaseQuery };
// `;

//             const configPath = path.join(configDir, 'config.ts');
//             await fs.writeFile(configPath, configContent);
//             console.log(`✅ Created ${configPath}`);
//             console.log('\n✨ RTK Query config generated successfully!');
//         } catch (error) {
//             console.error('❌ Error:', error?.message || 'Unknown error');
//             process.exit(1);
//         }
//     });

// program.parse();


