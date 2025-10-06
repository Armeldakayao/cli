export interface SwaggerSpec {
    openapi?: string;
    swagger?: string;
    info: {
        title: string;
        version: string;
    };
    servers?: Array<{
        url: string;
    }>;
    basePath?: string;
    paths: Record<string, Record<string, EndpointSpec>>;
    components?: {
        schemas?: Record<string, SchemaObject>;
    };
    definitions?: Record<string, SchemaObject>;
    tags?: Array<{
        name: string;
        description?: string;
    }>;
}
export interface EndpointSpec {
    operationId?: string;
    summary?: string;
    description?: string;
    tags?: string[];
    parameters?: Parameter[];
    requestBody?: RequestBody;
    responses: Record<string, Response>;
}
export interface Parameter {
    name: string;
    in: 'path' | 'query' | 'header' | 'cookie';
    required?: boolean;
    schema?: SchemaObject;
    type?: string;
}
export interface RequestBody {
    required?: boolean;
    content?: Record<string, {
        schema: SchemaObject;
    }>;
}
export interface Response {
    description?: string;
    content?: Record<string, {
        schema: SchemaObject;
    }>;
    schema?: SchemaObject;
}
export interface SchemaObject {
    type?: string;
    properties?: Record<string, SchemaObject>;
    required?: string[];
    items?: SchemaObject;
    $ref?: string;
    enum?: string[];
    format?: string;
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    description?: string;
    example?: any;
    nullable?: boolean;
}
export interface GroupedEndpoint {
    path: string;
    method: string;
    endpoint: EndpointSpec;
}
//# sourceMappingURL=swagger.d.ts.map