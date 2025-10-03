// import { SchemaObject } from '../types/swagger';
// import { StringUtils } from './string-utils';

// export class TypeGenerator {
//   static generate(property: SchemaObject, schemas: Record<string, SchemaObject>): string {
//     if (property.$ref) {
//       return StringUtils.extractRefName(property.$ref);
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
//           return `${this.generate(property.items, schemas)}[]`;
//         }
//         return 'any[]';
//       case 'object':
//         if (property.properties) {
//           const props = Object.entries(property.properties)
//             .map(([key, value]) => {
//               const optional = !property.required?.includes(key) ? '?' : '';
//               const desc = value.description ? `\n  /** ${value.description} */` : '';
//               return `${desc}\n  ${key}${optional}: ${this.generate(value, schemas)};`;
//             })
//             .join('\n');
//           return `{\n${props}\n}`;
//         }
//         return 'any';
//       default:
//         return 'any';
//     }
//   }
// }



import { SchemaObject } from '../types/swagger';
import { StringUtils } from './string-utils';

export class TypeGenerator {
  static generate(property: SchemaObject, schemas: Record<string, SchemaObject>): string {
    if (property.$ref) {
      return StringUtils.extractRefName(property.$ref);
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