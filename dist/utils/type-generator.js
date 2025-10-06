"use strict";
// import { SchemaObject } from '../types/swagger';
// import { StringUtils } from './string-utils';
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeGenerator = void 0;
const string_utils_1 = require("./string-utils");
class TypeGenerator {
    static generate(property, schemas) {
        if (property.$ref) {
            return string_utils_1.StringUtils.extractRefName(property.$ref);
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
                    return `${this.generate(property.items, schemas)}[]`;
                }
                return 'any[]';
            case 'object':
                if (property.properties) {
                    const props = Object.entries(property.properties)
                        .map(([key, value]) => {
                        const optional = !property.required?.includes(key) ? '?' : '';
                        const desc = value.description ? `\n  /** ${value.description} */` : '';
                        return `${desc}\n  ${key}${optional}: ${this.generate(value, schemas)};`;
                    })
                        .join('\n');
                    return `{\n${props}\n}`;
                }
                return 'any';
            default:
                return 'any';
        }
    }
}
exports.TypeGenerator = TypeGenerator;
//# sourceMappingURL=type-generator.js.map