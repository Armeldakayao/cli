export class StringUtils {
    static capitalize(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  
    static toCamelCase(str: string): string {
      return str
        .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
        .replace(/^(.)/, (char) => char.toLowerCase());
    }
  
    static toPascalCase(str: string): string {
      return this.capitalize(this.toCamelCase(str));
    }
  
    static toKebabCase(str: string): string {
      return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
    }
  
    static extractRefName(ref: string): string {
      return ref.split('/').pop() || '';
    }
  }