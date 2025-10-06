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
    
    // Générer les query keys
    await this.generateQueryKeys(groupedEndpoints);
    
    for (const [tag, endpoints] of groupedEndpoints) {
      await this.generateTag(tag, endpoints);
    }

    console.log('✨ Generation complete!');
  }

  protected async generateQueryKeys(groupedEndpoints: Map<string, GroupedEndpoint[]>): Promise<void> {
    const queryKeysPath = path.join(process.cwd(), 'lib', 'query-keys.ts');
    await fs.ensureDir(path.dirname(queryKeysPath));
    
    let content = `// Auto-generated query keys\n`;
    content += `// Central place to define all query keys\n\n`;
    content += `export const queryKeys = {\n`;
    
    for (const [tag] of groupedEndpoints) {
      const tagCamel = StringUtils.toCamelCase(tag.replace(/[^a-zA-Z0-9]/g, ''));
      
      content += `  // ${StringUtils.capitalize(tag)}\n`;
      content += `  ${tagCamel}: {\n`;
      content += `    all: ["${tagCamel}"] as const,\n`;
      content += `    lists: () => [...queryKeys.${tagCamel}.all, "list"] as const,\n`;
      content += `    list: (filters?: any) => [...queryKeys.${tagCamel}.lists(), filters] as const,\n`;
      content += `    details: () => [...queryKeys.${tagCamel}.all, "detail"] as const,\n`;
      content += `    detail: (id: string) => [...queryKeys.${tagCamel}.details(), id] as const,\n`;
      content += `  },\n`;
    }
    
    content += `};\n`;
    
    await fs.writeFile(queryKeysPath, content);
    console.log('✅ Generated lib/query-keys.ts');
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
    // Normaliser le nom du tag pour créer un nom de dossier valide
    const normalizedTag = StringUtils.normalizeTagName(tag);
    const tagDir = path.join(this.config.outputDir, normalizedTag);
    await fs.ensureDir(tagDir);

    // Extraire les types utilisés
    const schemas = this.spec.components?.schemas || this.spec.definitions || {};
    const usedTypes = this.extractUsedTypes(endpoints);
    
    // Expander pour inclure les dépendances
    const allTypes = this.expandTypeDependencies(usedTypes, schemas);
    
    // Séparer les types locaux (définis dans ce tag) vs externes (d'autres tags)
    const typesByTag = this.categorizeTypesByTag(allTypes, schemas);
    
    // Générer types.ts et schemas.ts avec imports cross-tag
    await this.generateTypesWithCrossTagImports(tagDir, tag, typesByTag, schemas);
    await this.generateSchemasWithCrossTagImports(tagDir, tag, typesByTag, schemas);

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

    console.log(`✅ Generated ${normalizedTag}`);
  }

  protected categorizeTypesByTag(types: Set<string>, schemas: Record<string, SchemaObject>): Map<string, Set<string>> {
    const result = new Map<string, Set<string>>();
    const allEndpointsByTag = this.groupEndpointsByTag();
    
    // Créer un mapping type -> tag où il est défini/utilisé
    const typeToTags = new Map<string, Set<string>>();
    
    for (const [tag, endpoints] of allEndpointsByTag) {
      for (const { endpoint } of endpoints) {
        // Analyser les responses
        for (const response of Object.values(endpoint.responses)) {
          const schema = response.schema || response.content?.['application/json']?.schema;
          this.mapTypesToTag(schema, tag, typeToTags);
        }
        
        // Analyser request body
        const requestSchema = endpoint.requestBody?.content?.['application/json']?.schema;
        this.mapTypesToTag(requestSchema, tag, typeToTags);
      }
    }
    
    // Organiser par tag
    for (const typeName of types) {
      const tags = typeToTags.get(typeName) || new Set();
      
      for (const tag of tags) {
        if (!result.has(tag)) {
          result.set(tag, new Set());
        }
        result.get(tag)!.add(typeName);
      }
      
      // Si le type n'est associé à aucun tag, l'ajouter au tag 'shared'
      if (tags.size === 0) {
        if (!result.has('shared')) {
          result.set('shared', new Set());
        }
        result.get('shared')!.add(typeName);
      }
    }
    
    return result;
  }

  protected mapTypesToTag(schema: any, tag: string, typeToTags: Map<string, Set<string>>): void {
    if (!schema) return;
    
    if (schema.$ref) {
      const typeName = StringUtils.extractRefName(schema.$ref);
      if (!typeToTags.has(typeName)) {
        typeToTags.set(typeName, new Set());
      }
      typeToTags.get(typeName)!.add(tag);
    }
    
    if (schema.type === 'array' && schema.items) {
      this.mapTypesToTag(schema.items, tag, typeToTags);
    }
    
    if (schema.properties) {
      for (const prop of Object.values(schema.properties)) {
        this.mapTypesToTag(prop, tag, typeToTags);
      }
    }
  }

  protected async generateTypesWithCrossTagImports(
    tagDir: string, 
    currentTag: string,
    typesByTag: Map<string, Set<string>>, 
    schemas: Record<string, SchemaObject>
  ): Promise<void> {
    const currentTagTypes = typesByTag.get(currentTag) || new Set();
    if (currentTagTypes.size === 0) return;
    
    let content = `// ${this.t.generatedTypes}\n\n`;
    
    // Déterminer les imports cross-tag nécessaires
    const crossTagImports = new Map<string, Set<string>>();
    
    for (const typeName of currentTagTypes) {
      const schema = schemas[typeName];
      if (!schema) continue;
      
      // Analyser les dépendances de ce type
      if (schema.properties) {
        for (const prop of Object.values(schema.properties)) {
          if (prop.$ref) {
            const refType = StringUtils.extractRefName(prop.$ref);
            
            // Vérifier si ce type est défini dans un autre tag
            for (const [tag, types] of typesByTag) {
              if (tag !== currentTag && types.has(refType) && !currentTagTypes.has(refType)) {
                if (!crossTagImports.has(tag)) {
                  crossTagImports.set(tag, new Set());
                }
                crossTagImports.get(tag)!.add(refType);
              }
            }
          }
          
          // Arrays de refs
          if (prop.type === 'array' && prop.items?.$ref) {
            const refType = StringUtils.extractRefName(prop.items.$ref);
            
            for (const [tag, types] of typesByTag) {
              if (tag !== currentTag && types.has(refType) && !currentTagTypes.has(refType)) {
                if (!crossTagImports.has(tag)) {
                  crossTagImports.set(tag, new Set());
                }
                crossTagImports.get(tag)!.add(refType);
              }
            }
          }
        }
      }
    }
    
    // Générer les imports cross-tag
    if (crossTagImports.size > 0) {
      for (const [tag, types] of crossTagImports) {
        const tagKebab = StringUtils.toKebabCase(tag);
        content += `import type { ${Array.from(types).join(', ')} } from '../${tagKebab}/types';\n`;
      }
      content += '\n';
    }
    
    // Générer les types locaux
    for (const typeName of currentTagTypes) {
      const schema = schemas[typeName];
      if (!schema) continue;
      
      if (schema.properties || schema.type === 'object') {
        const typeStr = TypeGenerator.generate(schema, schemas);
        content += `export interface ${typeName} ${typeStr}\n\n`;
      } else if (schema.enum) {
        content += `export type ${typeName} = ${schema.enum.map(e => `'${e}'`).join(' | ')};\n\n`;
      }
    }
    
    const filePath = path.join(tagDir, 'types.ts');
    await FileUtils.writeIfShould(filePath, content, this.config.preserveModified);
  }

  protected async generateSchemasWithCrossTagImports(
    tagDir: string,
    currentTag: string,
    typesByTag: Map<string, Set<string>>,
    schemas: Record<string, SchemaObject>
  ): Promise<void> {
    const currentTagTypes = typesByTag.get(currentTag) || new Set();
    if (currentTagTypes.size === 0) return;
    
    const validatorLib = this.config.validator === 'zod' ? 'zod' : 'yup';
    let content = `// ${this.t.generatedSchemas}\n`;
    content += this.config.validator === 'zod' ? `import { z } from 'zod';\n` : `import * as yup from 'yup';\n`;
    
    // Déterminer les imports de schemas cross-tag
    const crossTagSchemaImports = new Map<string, Set<string>>();
    
    for (const typeName of currentTagTypes) {
      const schema = schemas[typeName];
      if (!schema || !schema.properties) continue;
      
      for (const prop of Object.values(schema.properties)) {
        if (prop.$ref) {
          const refType = StringUtils.extractRefName(prop.$ref);
          const refSchema = `${StringUtils.toCamelCase(refType)}Schema`;
          
          for (const [tag, types] of typesByTag) {
            if (tag !== currentTag && types.has(refType) && !currentTagTypes.has(refType)) {
              if (!crossTagSchemaImports.has(tag)) {
                crossTagSchemaImports.set(tag, new Set());
              }
              crossTagSchemaImports.get(tag)!.add(refSchema);
            }
          }
        }
        
        if (prop.type === 'array' && prop.items?.$ref) {
          const refType = StringUtils.extractRefName(prop.items.$ref);
          const refSchema = `${StringUtils.toCamelCase(refType)}Schema`;
          
          for (const [tag, types] of typesByTag) {
            if (tag !== currentTag && types.has(refType) && !currentTagTypes.has(refType)) {
              if (!crossTagSchemaImports.has(tag)) {
                crossTagSchemaImports.set(tag, new Set());
              }
              crossTagSchemaImports.get(tag)!.add(refSchema);
            }
          }
        }
      }
    }
    
    // Générer les imports cross-tag pour schemas
    if (crossTagSchemaImports.size > 0) {
      for (const [tag, schemaNames] of crossTagSchemaImports) {
        const tagKebab = StringUtils.toKebabCase(tag);
        content += `import { ${Array.from(schemaNames).join(', ')} } from '../${tagKebab}/schemas';\n`;
      }
      content += '\n';
    }
    
    // Générer les schemas locaux
    for (const typeName of currentTagTypes) {
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

  protected extractUsedTypes(endpoints: GroupedEndpoint[]): Set<string> {
    const types = new Set<string>();
    
    for (const { endpoint } of endpoints) {
      // Response types
      for (const response of Object.values(endpoint.responses)) {
        const schema = response.schema || response.content?.['application/json']?.schema;
        this.collectTypesFromSchema(schema, types);
      }
      
      // Request body types
      const requestSchema = endpoint.requestBody?.content?.['application/json']?.schema ||
                           endpoint.requestBody?.content?.['multipart/form-data']?.schema;
      this.collectTypesFromSchema(requestSchema, types);
    }
    
    return types;
  }

  protected collectTypesFromSchema(schema: any, types: Set<string>): void {
    if (!schema) return;
    
    // Type direct via $ref
    if (schema.$ref) {
      types.add(StringUtils.extractRefName(schema.$ref));
      return;
    }
    
    // Type dans un array
    if (schema.type === 'array' && schema.items) {
      this.collectTypesFromSchema(schema.items, types);
    }
    
    // Types dans les propriétés d'un objet
    if (schema.properties) {
      for (const prop of Object.values(schema.properties)) {
        this.collectTypesFromSchema(prop, types);
      }
    }
    
    // allOf, oneOf, anyOf
    if (schema.allOf) {
      for (const s of schema.allOf) {
        this.collectTypesFromSchema(s, types);
      }
    }
    if (schema.oneOf) {
      for (const s of schema.oneOf) {
        this.collectTypesFromSchema(s, types);
      }
    }
    if (schema.anyOf) {
      for (const s of schema.anyOf) {
        this.collectTypesFromSchema(s, types);
      }
    }
  }

  protected expandTypeDependencies(types: Set<string>, schemas: Record<string, SchemaObject>): Set<string> {
    const expanded = new Set(types);
    const toProcess = Array.from(types);
    
    while (toProcess.length > 0) {
      const typeName = toProcess.shift()!;
      const schema = schemas[typeName];
      
      if (!schema) continue;
      
      // Parcourir les propriétés pour trouver les dépendances
      if (schema.properties) {
        for (const prop of Object.values(schema.properties)) {
          if (prop.$ref) {
            const refName = StringUtils.extractRefName(prop.$ref);
            if (!expanded.has(refName)) {
              expanded.add(refName);
              toProcess.push(refName);
            }
          }
          
          // Arrays de refs
          if (prop.type === 'array' && prop.items?.$ref) {
            const refName = StringUtils.extractRefName(prop.items.$ref);
            if (!expanded.has(refName)) {
              expanded.add(refName);
              toProcess.push(refName);
            }
          }
        }
      }
    }
    
    return expanded;
  }

  protected async generateTypes(tagDir: string, usedTypes: Set<string>, schemas: Record<string, SchemaObject>): Promise<void> {
    if (usedTypes.size === 0) return;
    
    // Expander les types pour inclure les dépendances
    const allTypes = this.expandTypeDependencies(usedTypes, schemas);
    
    let content = `// ${this.t.generatedTypes}\n\n`;
    
    for (const typeName of allTypes) {
      const schema = schemas[typeName];
      if (!schema) continue;
      
      if (schema.properties || schema.type === 'object') {
        const typeStr = TypeGenerator.generate(schema, schemas);
        content += `export interface ${typeName} ${typeStr}\n\n`;
      } else if (schema.enum) {
        // Gérer les enums
        content += `export type ${typeName} = ${schema.enum.map(e => `'${e}'`).join(' | ')};\n\n`;
      }
    }
    
    const filePath = path.join(tagDir, 'types.ts');
    await FileUtils.writeIfShould(filePath, content, this.config.preserveModified);
  }

  protected async generateSchemas(tagDir: string, usedTypes: Set<string>, schemas: Record<string, SchemaObject>): Promise<void> {
    if (usedTypes.size === 0) return;
    
    // Expander les types pour inclure les dépendances
    const allTypes = this.expandTypeDependencies(usedTypes, schemas);
    
    const validatorLib = this.config.validator === 'zod' ? 'zod' : 'yup';
    let content = `// ${this.t.generatedSchemas}\n`;
    content += this.config.validator === 'zod' ? `import { z } from 'zod';\n\n` : `import * as yup from 'yup';\n\n`;
    
    for (const typeName of allTypes) {
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

  // À SUIVRE: generateTypes, generateSchemas, etc.


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
    const schemas = this.spec.components?.schemas || this.spec.definitions || {};
    const allTypes = this.expandTypeDependencies(usedTypes, schemas);
    
    if (allTypes.size > 0) {
      content += `import type { ${Array.from(allTypes).join(', ')} } from './types';\n\n`;
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
    
    // Type de retour
    const returnType = this.getResponseType(endpoint.responses);
    
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
    
    // Ajouter JSDoc si description disponible
    let jsdoc = '';
    if (endpoint.summary || endpoint.description) {
      jsdoc = `/**\n * ${endpoint.summary || endpoint.description}\n */\n`;
    }
    
    let code = `${jsdoc}export const ${funcName} = async (${params}): Promise<${returnType}> => {\n`;
    
    if (this.config.httpClient === 'axios') {
      //@ts-ignore
      code += this.generateAxiosCall(url, method, hasBody, queryParams.length > 0, isFormData, returnType);
    } else {
      //@ts-ignore
      code += this.generateFetchCall(url, method, hasBody, queryParams.length > 0, isFormData);
    }
    
    code += `};\n\n`;
    
    return code;
  }

  protected generateAxiosCall(url: string, method: string, hasBody: boolean, hasQuery: boolean, isFormData: boolean, returnType: string): string {
    let code = '';
    
    switch (method.toLowerCase()) {
      case 'get':
        code = hasQuery 
          ? `  const { data } = await api.get<${returnType}>(\`${url}\`, { params });\n`
          : `  const { data } = await api.get<${returnType}>(\`${url}\`);\n`;
        break;
      case 'post':
        if (isFormData) {
          code = `  const { data } = await api.post<${returnType}>(\`${url}\`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });\n`;
        } else {
          code = hasBody
            ? `  const { data } = await api.post<${returnType}>(\`${url}\`, payload);\n`
            : `  const { data } = await api.post<${returnType}>(\`${url}\`);\n`;
        }
        break;
      case 'put':
      case 'patch':
        code = hasBody
          ? `  const { data } = await api.${method.toLowerCase()}<${returnType}>(\`${url}\`, payload);\n`
          : `  const { data } = await api.${method.toLowerCase()}<${returnType}>(\`${url}\`);\n`;
        break;
      case 'delete':
        if (method.toLowerCase() === 'delete' && returnType === 'void') {
          code = hasBody
            ? `  await api.delete(\`${url}\`, { data: payload });\n  return;\n`
            : `  await api.delete(\`${url}\`);\n  return;\n`;
        } else {
          code = hasBody
            ? `  const { data } = await api.delete<${returnType}>(\`${url}\`, { data: payload });\n`
            : `  const { data } = await api.delete<${returnType}>(\`${url}\`);\n`;
          code += `  return data;\n`;
        }
        return code;
    }
    
    code += `  return data;\n`;
    return code;
  }

  protected getResponseType(responses: Record<string, any>): string {
    const successResponse = responses['200'] || responses['201'] || responses['204'] || responses['default'];
    if (!successResponse) return 'any';
    
    // 204 No Content retourne void
    if (responses['204']) return 'void';
    
    const schema = successResponse.schema || successResponse.content?.['application/json']?.schema;
    if (!schema) return 'any';
    
    const schemas = this.spec.components?.schemas || this.spec.definitions || {};
    return TypeGenerator.generate(schema, schemas);
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
 // Suite de base.ts - Génération par template

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
    
    content += `import {\n  ${apiImports.join(',\n  ')}\n} from './api';\n`;
    
    // Import types utilisés dans les hooks
    const schemas = this.spec.components?.schemas || this.spec.definitions || {};
    const usedTypes = this.extractUsedTypes(endpoints);
    const allTypes = this.expandTypeDependencies(usedTypes, schemas);
    
    if (allTypes.size > 0) {
      content += `import type { ${Array.from(allTypes).join(', ')} } from './types';\n`;
    }
    
    content += `\n// ${this.t.queryHooks}\n\n`;
    
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
// ==================== MÉTHODE generateRTKQuery CORRIGÉE ====================
protected async generateRTKQuery(tagDir: string, tag: string, endpoints: GroupedEndpoint[], usedTypes: Set<string>): Promise<void> {
  const fileName = 'hooks.ts';
  const filePath = path.join(tagDir, fileName);
  
  let content = `// ${this.t.generatedHooks}\n`;
  content += `import { apiInstance, invalidateOn, RESPONSE_BODY_KEY, ResponseError } from '@/services/config';\n`;
  
  // Import types
  const schemas = this.spec.components?.schemas || this.spec.definitions || {};
  const allTypes = this.expandTypeDependencies(usedTypes, schemas);
  
  if (allTypes.size > 0) {
    content += `import type { ${Array.from(allTypes).join(', ')} } from './types';\n\n`;
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
    return `use${StringUtils.toPascalCase(opId)}${method.toLowerCase() === 'get' ? 'Query' : 'Mutation'}`;
  });
  
  content += `export const {\n  ${hookNames.join(',\n  ')}\n} = ${tagCamel}Api;\n`;
  
  await FileUtils.writeIfShould(filePath, content, this.config.preserveModified);
}


protected generateRTKEndpoint(urlPath: string, method: string, endpoint: EndpointSpec, tagPascal: string): string {
  const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
  const isQuery = method.toLowerCase() === 'get';
  const endpointName = StringUtils.toCamelCase(opId);
  
  const pathParams = (endpoint.parameters || []).filter(p => p.in === 'path');
  const queryParams = (endpoint.parameters || []).filter(p => p.in === 'query');
  const hasBody = !!endpoint.requestBody;
  const isFormData = endpoint.requestBody?.content?.['multipart/form-data'];
  
  // Construire le type du payload/body
  let bodyType = 'any';
  if (hasBody) {
    bodyType = this.getRequestBodyType(endpoint.requestBody);
  }
  
  // Construire le type des paramètres avec types explicites
  let queryParamType = '';
  const paramParts: string[] = [];
  
  if (pathParams.length > 0) {
    paramParts.push(...pathParams.map(p => `${p.name}: string`));
  }
  if (queryParams.length > 0) {
    paramParts.push(...queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`));
  }
  if (hasBody) {
    paramParts.push(`payload: ${bodyType}`);
  }
  
  // Déterminer la signature du paramètre
  let queryFnParam = '';
  let queryFnParamType = '';
  
  if (paramParts.length === 0) {
    queryFnParam = '()';
    queryFnParamType = '';
  } else if (paramParts.length === 1 && pathParams.length === 1 && !hasBody && queryParams.length === 0) {
    // Un seul path param
    queryFnParam = `(${pathParams[0].name}: string)`;
    queryFnParamType = '';
  } else if (hasBody && paramParts.length === 1) {
    // Seulement un payload
    queryFnParam = `(payload: ${bodyType})`;
    queryFnParamType = '';
  } else {
    // Plusieurs paramètres - utiliser une interface inline
    const paramNames = [];
    if (pathParams.length > 0) paramNames.push(...pathParams.map(p => p.name));
    if (queryParams.length > 0) paramNames.push(...queryParams.map(p => p.name));
    if (hasBody) paramNames.push('payload');
    
    queryFnParam = `({ ${paramNames.join(', ')} }: { ${paramParts.join('; ')} })`;
    queryFnParamType = '';
  }
  
  // Construire l'URL
  let url = urlPath.replace(/{([^}]+)}/g, '${$1}');
  
  let code = `    ${endpointName}: builder.${isQuery ? 'query' : 'mutation'}({\n`;
  
  // Query function avec types explicites
  code += `      query: ${queryFnParam} => `;
  
  // Corps de la query - gestion des query params pour GET
  if (isQuery && queryParams.length > 0) {
    code += `{\n`;
    code += `        const params = new URLSearchParams();\n`;
    for (const qp of queryParams) {
      code += `        if (${qp.name} !== undefined) params.append('${qp.name}', String(${qp.name}));\n`;
    }
    code += `        return \`${url}?\${params}\`;\n`;
    code += `      },\n`;
  } else {
    // Simple query ou mutation avec body
    code += `({\n`;
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
  }
  
  // providesTags pour queries
  if (isQuery) {
    if (pathParams.length > 0) {
      const firstParam = pathParams[0].name;
      const paramExtract = (paramParts.length === 1 && pathParams.length === 1 && !hasBody && queryParams.length === 0)
        ? firstParam
        : `{ ${firstParam} }`;
      code += `      providesTags: (result, error, ${paramExtract}) => [{ type: '${tagPascal}' as const, id: ${firstParam} }],\n`;
    } else {
      code += `      providesTags: (result, error, arg) => [{ type: '${tagPascal}' as const, id: 'LIST' }],\n`;
    }
    code += `      transformResponse: (response: any) => response[RESPONSE_BODY_KEY],\n`;
  }
  
  // transformErrorResponse
  code += `      transformErrorResponse: (response: { status: number; data: any }) =>\n`;
  code += `        new ResponseError({ status: response.status, data: response.data }).export(),\n`;
  
  // invalidatesTags pour mutations
  if (!isQuery) {
    if (pathParams.length > 0) {
      const firstParam = pathParams[0].name;
      // Si c'est une mutation avec un seul path param (ex: DELETE)
      const paramExtract = (paramParts.length === 1 && pathParams.length === 1)
        ? firstParam
        : `{ ${firstParam} }`;
      code += `      invalidatesTags: (result, error, ${paramExtract}) => [\n`;
      code += `        { type: '${tagPascal}' as const, id: 'LIST' },\n`;
      code += `        { type: '${tagPascal}' as const, id: ${firstParam} },\n`;
      code += `      ],\n`;
    } else {
      code += `      invalidatesTags: (result, error, arg) => invalidateOn({\n`;
      code += `        success: [{ type: '${tagPascal}' as const, id: 'LIST' }],\n`;
      code += `      })(result, error, arg),\n`;
    }
  }
  
  code += `    }),\n`;
  
  return code;
}
  // ==================== SWR, REACT-QUERY-KIT, BASIC ====================
  // ==================== SWR ====================
  // ==================== SWR ====================
protected async generateSWR(tagDir: string, tag: string, endpoints: GroupedEndpoint[], usedTypes: Set<string>): Promise<void> {
  await this.generateApiFile(tagDir, tag, endpoints);
  
  const hooksPath = path.join(tagDir, 'hooks.ts');
  let content = `// ${this.t.generatedHooks}\n`;
  content += `import useSWR from 'swr';\n`;
  content += `import { useSWRConfig } from 'swr';\n`;
  content += `import { useState } from 'react';\n`;
  
  // Import API functions
  const apiImports = endpoints.map(({ method, endpoint, path }) => {
    const opId = endpoint.operationId || `${method}${path.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
    return StringUtils.toCamelCase(opId);
  });
  
  content += `import {\n  ${apiImports.join(',\n  ')}\n} from './api';\n`;
  
  // Import types
  const schemas = this.spec.components?.schemas || this.spec.definitions || {};
  const allTypes = this.expandTypeDependencies(usedTypes, schemas);
  
  if (allTypes.size > 0) {
    content += `import type { ${Array.from(allTypes).join(', ')} } from './types';\n`;
  }
  
  content += `\n// Query and Mutation hooks\n\n`;
  
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
  const queryParams = (endpoint.parameters || []).filter(p => p.in === 'query');
  
  let params = '';
  let swrKey = '';
  let fetcher = '';
  
  if (pathParams.length > 0) {
    params = pathParams.map(p => `${p.name}: string`).join(', ');
    swrKey = `\`${urlPath.replace(/{([^}]+)}/g, '${$1}')}\``;
    fetcher = `() => ${funcName}(${pathParams.map(p => p.name).join(', ')})`;
  } else if (queryParams.length > 0) {
    params = `params?: { ${queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }`;
    swrKey = `params ? \`${urlPath}?\${JSON.stringify(params)}\` : '${urlPath}'`;
    fetcher = `() => ${funcName}(params)`;
  } else {
    swrKey = `'${urlPath}'`;
    fetcher = funcName;
  }
  
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
  
  const pathParams = (endpoint.parameters || []).filter(p => p.in === 'path');
  const hasBody = !!endpoint.requestBody;
  
  let mutationFnType = '';
  let mutationFnCall = '';
  
  if (pathParams.length > 0 && hasBody) {
    const bodyType = this.getRequestBodyType(endpoint.requestBody);
    mutationFnType = `(vars: ${bodyType} & { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`;
    mutationFnCall = `await ${funcName}(${pathParams.map(p => `vars.${p.name}`).join(', ')}, vars)`;
  } else if (pathParams.length > 0) {
    mutationFnType = `(vars: { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`;
    mutationFnCall = `await ${funcName}(${pathParams.map(p => `vars.${p.name}`).join(', ')})`;
  } else if (hasBody) {
    const bodyType = this.getRequestBodyType(endpoint.requestBody);
    mutationFnType = `(payload: ${bodyType})`;
    mutationFnCall = `await ${funcName}(payload)`;
  } else {
    mutationFnType = '()';
    mutationFnCall = `await ${funcName}()`;
  }
  
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
//==================== REACT QUERY KIT ====================
 // ==================== REACT QUERY KIT ====================
protected async generateReactQueryKit(tagDir: string, tag: string, endpoints: GroupedEndpoint[], usedTypes: Set<string>): Promise<void> {
  const hooksPath = path.join(tagDir, 'hooks.ts');
  let content = `// ${this.t.generatedHooks}\n`;
  content += `import { createQuery, createMutation } from 'react-query-kit';\n`;
  
  if (this.config.httpClient === 'axios') {
    content += `import api from '@/lib/axios';\n`;
  }
  
  // Import types
  const schemas = this.spec.components?.schemas || this.spec.definitions || {};
  const allTypes = this.expandTypeDependencies(usedTypes, schemas);
  
  if (allTypes.size > 0) {
    content += `import type { ${Array.from(allTypes).join(', ')} } from './types';\n`;
  }
  
  content += '\n';
  
  for (const { path, method, endpoint } of endpoints) {
    if (method.toLowerCase() === 'get') {
      content += this.generateReactQueryKitQuery(path, method, endpoint);
    } else {
      content += this.generateReactQueryKitMutation(path, method, endpoint);
    }
  }
  
  await FileUtils.writeIfShould(hooksPath, content, this.config.preserveModified);
}
protected generateReactQueryKitQuery(
  urlPath: string,
  method: string,
  endpoint: EndpointSpec
): string {
  const opId =
    endpoint.operationId ||
    `${method}${urlPath
      .split('/')
      .map(p => StringUtils.capitalize(p))
      .join('')}`;
  const hookName = `use${StringUtils.toPascalCase(opId)}`;

  const pathParams = (endpoint.parameters || []).filter(p => p.in === 'path');
  const queryParams = (endpoint.parameters || []).filter(p => p.in === 'query');
  const allParams = [...pathParams, ...queryParams];
  const hasParams = allParams.length > 0;

  // Type de réponse
  let responseType = this.getResponseType(endpoint) || 'any';

  // Clé de cache dynamique
  const queryKey = hasParams
    ? `({ ${allParams.map(p => p.name).join(', ')} }: { ${allParams
        .map(p => `${p.name}${p.required ? '' : '?'}: ${this.getParamType(p)}`)
        .join('; ')} }) => ['${urlPath.split('/')[1]}', { ${allParams.map(p => p.name).join(', ')} }]`
    : `['${urlPath.split('/')[1]}']`;

  // Type pour fetcher
  const paramType = hasParams
    ? `{ ${allParams
        .map(p => `${p.name}${p.required ? '' : '?'}: ${this.getParamType(p)}`)
        .join('; ')} }`
    : 'void';

  let code = `export const ${hookName} = createQuery<${responseType}, Error, ${paramType}>({\n`;
  code += `  queryKey: ${queryKey},\n`;

  if (hasParams) {
    code += `  fetcher: async ({ ${allParams.map(p => p.name).join(', ')} }: ${paramType}) => {\n`;

    if (queryParams.length > 0) {
      code += `    const params = new URLSearchParams();\n`;
      for (const qp of queryParams) {
        code += `    if (${qp.name} !== undefined) params.append('${qp.name}', String(${qp.name}));\n`;
      }
      code += `    const res = await api.get<${responseType}>(\`${urlPath.replace(
        /{([^}]+)}/g,
        '${$1}'
      )}?\${params}\`);\n`;
    } else {
      code += `    const res = await api.get<${responseType}>(\`${urlPath.replace(
        /{([^}]+)}/g,
        '${$1}'
      )}\`);\n`;
    }

    code += `    return res.data;\n`;
    code += `  },\n`;
  } else {
    code += `  fetcher: async () => {\n`;
    code += `    const res = await api.get<${responseType}>('${urlPath}');\n`;
    code += `    return res.data;\n`;
    code += `  },\n`;
  }

  code += `});\n\n`;
  return code;
}



protected generateReactQueryKitMutation(
  urlPath: string,
  method: string,
  endpoint: EndpointSpec
): string {
  const opId =
    endpoint.operationId ||
    `${method}${urlPath
      .split('/')
      .map(p => StringUtils.capitalize(p))
      .join('')}`;
  const hookName = `use${StringUtils.toPascalCase(opId)}`;

  const pathParams = (endpoint.parameters || []).filter(p => p.in === 'path');
  const hasBody = !!endpoint.requestBody;
  const hasParams = pathParams.length > 0;

  // Type de réponse
  const responseType = this.getResponseType(endpoint) || 'any';

  // Clé de mutation dynamique
  const mutationKey = hasParams
    ? `({ ${pathParams.map(p => p.name).join(', ')} }: { ${pathParams
        .map(p => `${p.name}: string`)
        .join('; ')} }) => ['${urlPath.split('/')[1]}', { ${pathParams
        .map(p => p.name)
        .join(', ')} }]`
    : `['${urlPath.split('/')[1]}']`;

  // Type pour variables
  let varsType = 'void';
  if (hasBody && hasParams) {
    const bodyType = this.getRequestBodyType(endpoint.requestBody);
    varsType = `${bodyType} & { ${pathParams.map(p => `${p.name}: string`).join('; ')} }`;
  } else if (hasBody) {
    varsType = this.getRequestBodyType(endpoint.requestBody);
  } else if (hasParams) {
    varsType = `{ ${pathParams.map(p => `${p.name}: string`).join('; ')} }`;
  }

  let code = `export const ${hookName} = createMutation<${responseType}, Error, ${varsType}>({\n`;
  code += `  mutationKey: ${mutationKey},\n`;

  if (hasParams && hasBody) {
    code += `  mutationFn: async (vars: ${varsType}) => {\n`;
    code += `    const res = await api.${method.toLowerCase()}<${responseType}>(\`${urlPath.replace(
      /{([^}]+)}/g,
      '${vars.$1}'
    )}\`, vars);\n`;
    code += `    return res.data;\n`;
    code += `  },\n`;
  } else if (hasParams) {
    code += `  mutationFn: async (vars: ${varsType}) => {\n`;
    code += `    const res = await api.${method.toLowerCase()}<${responseType}>(\`${urlPath.replace(
      /{([^}]+)}/g,
      '${vars.$1}'
    )}\`);\n`;
    code += `    return res.data;\n`;
    code += `  },\n`;
  } else if (hasBody) {
    code += `  mutationFn: async (data: ${varsType}) => {\n`;
    code += `    const res = await api.${method.toLowerCase()}<${responseType}>('${urlPath}', data);\n`;
    code += `    return res.data;\n`;
    code += `  },\n`;
  } else {
    code += `  mutationFn: async () => {\n`;
    code += `    const res = await api.${method.toLowerCase()}<${responseType}>('${urlPath}');\n`;
    code += `    return res.data;\n`;
    code += `  },\n`;
  }

  code += `});\n\n`;
  return code;
}



// protected generateReactQueryKitQuery(urlPath: string, method: string, endpoint: EndpointSpec): string {
//   const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
//   const hookName = `use${StringUtils.toPascalCase(opId)}`;
  
//   const pathParams = (endpoint.parameters || []).filter(p => p.in === 'path');
//   const queryParams = (endpoint.parameters || []).filter(p => p.in === 'query');
  
//   let code = `export const ${hookName} = createQuery({\n`;
//   code += `  queryKey: ['${urlPath}'],\n`;
  
//   if (pathParams.length > 0 || queryParams.length > 0) {
//     const params: string[] = [];
//     if (pathParams.length > 0) params.push(...pathParams.map(p => `${p.name}: string`));
//     if (queryParams.length > 0) params.push(...queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`));
    
//     code += `  fetcher: ({ ${[...pathParams.map(p => p.name), ...queryParams.map(p => p.name)].join(', ')} }: { ${params.join('; ')} }) => {\n`;
    
//     if (queryParams.length > 0) {
//       code += `    const params = new URLSearchParams();\n`;
//       for (const qp of queryParams) {
//         code += `    if (${qp.name} !== undefined) params.append('${qp.name}', String(${qp.name}));\n`;
//       }
//       code += `    return api.get(\`${urlPath.replace(/{([^}]+)}/g, '${$1}')}?\${params}\`).then(res => res.data);\n`;
//     } else {
//       code += `    return api.get(\`${urlPath.replace(/{([^}]+)}/g, '${$1}')}\`).then(res => res.data);\n`;
//     }
    
//     code += `  },\n`;
//   } else {
//     code += `  fetcher: () => api.get('${urlPath}').then(res => res.data),\n`;
//   }
  
//   code += `});\n\n`;
  
//   return code;
// }

// protected generateReactQueryKitMutation(urlPath: string, method: string, endpoint: EndpointSpec): string {
//   const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
//   const hookName = `use${StringUtils.toPascalCase(opId)}`;
  
//   const pathParams = (endpoint.parameters || []).filter(p => p.in === 'path');
//   const hasBody = !!endpoint.requestBody;
  
//   let code = `export const ${hookName} = createMutation({\n`;
//   code += `  mutationKey: ['${urlPath}'],\n`;
  
//   if (pathParams.length > 0 && hasBody) {
//     const bodyType = this.getRequestBodyType(endpoint.requestBody);
//     code += `  mutationFn: (vars: ${bodyType} & { ${pathParams.map(p => `${p.name}: string`).join('; ')} }) =>\n`;
//     code += `    api.${method.toLowerCase()}(\`${urlPath.replace(/{([^}]+)}/g, '${vars.$1}')}\`, vars),\n`;
//   } else if (pathParams.length > 0) {
//     code += `  mutationFn: (vars: { ${pathParams.map(p => `${p.name}: string`).join('; ')} }) =>\n`;
//     code += `    api.${method.toLowerCase()}(\`${urlPath.replace(/{([^}]+)}/g, '${vars.$1}')}\`),\n`;
//   } else if (hasBody) {
//     const bodyType = this.getRequestBodyType(endpoint.requestBody);
//     code += `  mutationFn: (data: ${bodyType}) => api.${method.toLowerCase()}('${urlPath}', data),\n`;
//   } else {
//     code += `  mutationFn: () => api.${method.toLowerCase()}('${urlPath}'),\n`;
//   }
  
//   code += `});\n\n`;
  
//   return code;
// }

 // ==================== BASIC ====================
protected async generateBasic(tagDir: string, tag: string, endpoints: GroupedEndpoint[], usedTypes: Set<string>): Promise<void> {
  await this.generateApiFile(tagDir, tag, endpoints);
  
  const hooksPath = path.join(tagDir, 'hooks.ts');
  let content = `// ${this.t.generatedHooks}\n`;
  content += `import { useState, useEffect } from 'react';\n`;
  
  // Import API functions
  const apiImports = endpoints.map(({ method, endpoint, path }) => {
    const opId = endpoint.operationId || `${method}${path.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
    return StringUtils.toCamelCase(opId);
  });
  
  content += `import {\n  ${apiImports.join(',\n  ')}\n} from './api';\n`;
  
  // Import types
  const schemas = this.spec.components?.schemas || this.spec.definitions || {};
  const allTypes = this.expandTypeDependencies(usedTypes, schemas);
  
  if (allTypes.size > 0) {
    content += `import type { ${Array.from(allTypes).join(', ')} } from './types';\n`;
  }
  
  content += '\n';
  
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
  
  const pathParams = (endpoint.parameters || []).filter(p => p.in === 'path');
  const queryParams = (endpoint.parameters || []).filter(p => p.in === 'query');
  
  // Déterminer le type de retour
  const returnType = this.getResponseType(endpoint.responses);
  
  let params = '';
  let fetchCall = '';
  
  if (pathParams.length > 0) {
    params = pathParams.map(p => `${p.name}: string`).join(', ');
    fetchCall = `${funcName}(${pathParams.map(p => p.name).join(', ')})`;
  } else if (queryParams.length > 0) {
    params = `params?: { ${queryParams.map(p => `${p.name}?: ${this.getParamType(p)}`).join('; ')} }`;
    fetchCall = `${funcName}(params)`;
  } else {
    fetchCall = `${funcName}()`;
  }
  
  let code = `export const ${hookName} = (${params}) => {\n`;
  code += `  const [data, setData] = useState<${returnType} | null>(null);\n`;
  code += `  const [loading, setLoading] = useState(true);\n`;
  code += `  const [error, setError] = useState<Error | null>(null);\n\n`;
  code += `  useEffect(() => {\n`;
  code += `    ${fetchCall}\n`;
  code += `      .then(setData)\n`;
  code += `      .catch(setError)\n`;
  code += `      .finally(() => setLoading(false));\n`;
  
  // Dépendances pour useEffect
  if (pathParams.length > 0) {
    code += `  }, [${pathParams.map(p => p.name).join(', ')}]);\n\n`;
  } else if (queryParams.length > 0) {
    code += `  }, [params]);\n\n`;
  } else {
    code += `  }, []);\n\n`;
  }
  
  code += `  return { data, loading, error };\n`;
  code += `};\n\n`;
  
  return code;
}

protected generateBasicMutationHook(urlPath: string, method: string, endpoint: EndpointSpec): string {
  const opId = endpoint.operationId || `${method}${urlPath.split('/').map(p => StringUtils.capitalize(p)).join('')}`;
  const hookName = `use${StringUtils.toPascalCase(opId)}`;
  const funcName = StringUtils.toCamelCase(opId);
  
  const pathParams = (endpoint.parameters || []).filter(p => p.in === 'path');
  const hasBody = !!endpoint.requestBody;
  
  // Déterminer le type de retour
  const returnType = this.getResponseType(endpoint.responses);
  
  let mutationFnType = '';
  let mutationFnCall = '';
  
  if (pathParams.length > 0 && hasBody) {
    const bodyType = this.getRequestBodyType(endpoint.requestBody);
    mutationFnType = `(vars: ${bodyType} & { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`;
    mutationFnCall = `await ${funcName}(${pathParams.map(p => `vars.${p.name}`).join(', ')}, vars)`;
  } else if (pathParams.length > 0) {
    mutationFnType = `(vars: { ${pathParams.map(p => `${p.name}: string`).join('; ')} })`;
    mutationFnCall = `await ${funcName}(${pathParams.map(p => `vars.${p.name}`).join(', ')})`;
  } else if (hasBody) {
    const bodyType = this.getRequestBodyType(endpoint.requestBody);
    mutationFnType = `(payload: ${bodyType})`;
    mutationFnCall = `await ${funcName}(payload)`;
  } else {
    mutationFnType = '()';
    mutationFnCall = `await ${funcName}()`;
  }
  
  let code = `export const ${hookName} = () => {\n`;
  code += `  const [loading, setLoading] = useState(false);\n`;
  code += `  const [error, setError] = useState<Error | null>(null);\n`;
  code += `  const [data, setData] = useState<${returnType} | null>(null);\n\n`;
  code += `  const mutate = async ${mutationFnType} => {\n`;
  code += `    setLoading(true);\n`;
  code += `    setError(null);\n`;
  code += `    try {\n`;
  code += `      const result = ${mutationFnCall};\n`;
  code += `      setData(result);\n`;
  code += `      setLoading(false);\n`;
  code += `      return result;\n`;
  code += `    } catch (err: any) {\n`;
  code += `      setError(err);\n`;
  code += `      setLoading(false);\n`;
  code += `      throw err;\n`;
  code += `    }\n`;
  code += `  };\n\n`;
  code += `  return { mutate, loading, error, data };\n`;
  code += `};\n\n`;
  
  return code;
}
}