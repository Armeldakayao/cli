// import { SchemaObject } from '../types/swagger';
// import { StringUtils } from './string-utils';
// import { Translations } from '../types/config';

// export class SchemaGenerator {
//   constructor(private translations: Translations) {}

//   generateZod(property: SchemaObject, schemas: Record<string, SchemaObject>): string {
//     if (property.$ref) {
//       const refName = StringUtils.extractRefName(property.$ref);
//       return `${StringUtils.toCamelCase(refName)}Schema`;
//     }

//     switch (property.type) {
//       case 'string':
//         let zodString = 'z.string()';
//         if (property.minLength) zodString += `.min(${property.minLength}, { message: "${this.translations.tooShort}" })`;
//         if (property.maxLength) zodString += `.max(${property.maxLength}, { message: "${this.translations.tooLong}" })`;
//         if (property.pattern) zodString += `.regex(/${property.pattern}/, { message: "${this.translations.invalidFormat}" })`;
//         if (property.enum) return `z.enum([${property.enum.map(e => `"${e}"`).join(', ')}])`;
//         if (property.format === 'email') zodString += `.email({ message: "${this.translations.invalidEmail}" })`;
//         if (property.format === 'uuid') zodString += `.uuid({ message: "${this.translations.invalidUuid}" })`;
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
//         if (property.items) return `z.array(${this.generateZod(property.items, schemas)})`;
//         return 'z.array(z.any())';
//       case 'object':
//         if (property.properties) {
//           const props = Object.entries(property.properties)
//             .map(([key, value]) => {
//               let zodField = this.generateZod(value, schemas);
//               if (!property.required?.includes(key)) zodField += '.optional().nullable()';
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

//   generateYup(property: SchemaObject, schemas: Record<string, SchemaObject>): string {
//     if (property.$ref) {
//       const refName = StringUtils.extractRefName(property.$ref);
//       return `${StringUtils.toCamelCase(refName)}Schema`;
//     }

//     switch (property.type) {
//       case 'string':
//         let yupString = 'yup.string()';
//         if (property.minLength) yupString += `.min(${property.minLength}, "${this.translations.tooShort}")`;
//         if (property.maxLength) yupString += `.max(${property.maxLength}, "${this.translations.tooLong}")`;
//         if (property.pattern) yupString += `.matches(/${property.pattern}/, "${this.translations.invalidFormat}")`;
//         if (property.enum) return `yup.string().oneOf([${property.enum.map(e => `"${e}"`).join(', ')}])`;
//         if (property.format === 'email') yupString += `.email("${this.translations.invalidEmail}")`;
//         return yupString;
//       case 'number':
//       case 'integer':
//         let yupNumber = property.type === 'integer' ? 'yup.number().integer()' : 'yup.number()';
//         if (property.minimum !== undefined) yupNumber += `.min(${property.minimum})`;
//         if (property.maximum !== undefined) yupNumber += `.max(${property.maximum})`;
//         return yupNumber;
//       case 'boolean':
//         return 'yup.boolean()';
//       case 'array':
//         if (property.items) return `yup.array().of(${this.generateYup(property.items, schemas)})`;
//         return 'yup.array()';
//       case 'object':
//         if (property.properties) {
//           const props = Object.entries(property.properties)
//             .map(([key, value]) => {
//               let yupField = this.generateYup(value, schemas);
//               if (!property.required?.includes(key)) yupField += '.nullable()';
//               return `  ${key}: ${yupField},`;
//             })
//             .join('\n');
//           return `yup.object({\n${props}\n})`;
//         }
//         return 'yup.object()';
//       default:
//         return 'yup.mixed()';
//     }
//   }
// }



import { SchemaObject } from '../types/swagger';
import { StringUtils } from './string-utils';
import { Translations } from '../types/config';

export class SchemaGenerator {
  constructor(private translations: Translations) {}

  generateZod(property: SchemaObject, schemas: Record<string, SchemaObject>): string {
    if (property.$ref) {
      const refName = StringUtils.extractRefName(property.$ref);
      return `${StringUtils.toCamelCase(refName)}Schema`;
    }

    switch (property.type) {
      case 'string':
        let zodString = 'z.string()';
        if (property.minLength) zodString += `.min(${property.minLength}, { message: "${this.translations.tooShort}" })`;
        if (property.maxLength) zodString += `.max(${property.maxLength}, { message: "${this.translations.tooLong}" })`;
        if (property.pattern) zodString += `.regex(/${property.pattern}/, { message: "${this.translations.invalidFormat}" })`;
        if (property.enum) return `z.enum([${property.enum.map(e => `"${e}"`).join(', ')}])`;
        if (property.format === 'email') zodString += `.email({ message: "${this.translations.invalidEmail}" })`;
        if (property.format === 'uuid') zodString += `.uuid({ message: "${this.translations.invalidUuid}" })`;
        return zodString;
      case 'number':
      case 'integer':
        let zodNumber = property.type === 'integer' ? 'z.number().int()' : 'z.number()';
        if (property.minimum !== undefined) zodNumber += `.min(${property.minimum})`;
        if (property.maximum !== undefined) zodNumber += `.max(${property.maximum})`;
        return zodNumber;
      case 'boolean':
        return 'z.boolean()';
      case 'array':
        if (property.items) return `z.array(${this.generateZod(property.items, schemas)})`;
        return 'z.array(z.any())';
      case 'object':
        if (property.properties) {
          const props = Object.entries(property.properties)
            .map(([key, value]) => {
              let zodField = this.generateZod(value, schemas);
              if (!property.required?.includes(key)) zodField += '.optional().nullable()';
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

  generateYup(property: SchemaObject, schemas: Record<string, SchemaObject>): string {
    if (property.$ref) {
      const refName = StringUtils.extractRefName(property.$ref);
      return `${StringUtils.toCamelCase(refName)}Schema`;
    }

    switch (property.type) {
      case 'string':
        let yupString = 'yup.string()';
        if (property.minLength) yupString += `.min(${property.minLength}, "${this.translations.tooShort}")`;
        if (property.maxLength) yupString += `.max(${property.maxLength}, "${this.translations.tooLong}")`;
        if (property.pattern) yupString += `.matches(/${property.pattern}/, "${this.translations.invalidFormat}")`;
        if (property.enum) return `yup.string().oneOf([${property.enum.map(e => `"${e}"`).join(', ')}])`;
        if (property.format === 'email') yupString += `.email("${this.translations.invalidEmail}")`;
        return yupString;
      case 'number':
      case 'integer':
        let yupNumber = property.type === 'integer' ? 'yup.number().integer()' : 'yup.number()';
        if (property.minimum !== undefined) yupNumber += `.min(${property.minimum})`;
        if (property.maximum !== undefined) yupNumber += `.max(${property.maximum})`;
        return yupNumber;
      case 'boolean':
        return 'yup.boolean()';
      case 'array':
        if (property.items) return `yup.array().of(${this.generateYup(property.items, schemas)})`;
        return 'yup.array()';
      case 'object':
        if (property.properties) {
          const props = Object.entries(property.properties)
            .map(([key, value]) => {
              let yupField = this.generateYup(value, schemas);
              if (!property.required?.includes(key)) yupField += '.nullable()';
              return `  ${key}: ${yupField},`;
            })
            .join('\n');
          return `yup.object({\n${props}\n})`;
        }
        return 'yup.object()';
      default:
        return 'yup.mixed()';
    }
  }
}