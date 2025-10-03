import axios from 'axios';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
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

    const response = await axios.get(url, config);
    return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
  }

  private static parse(content: string): SwaggerSpec {
    try {
      const parsed = JSON.parse(content);
      if (!parsed.paths) {
        throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
      }
      return parsed;
    } catch {
      const parsed = yaml.load(content) as SwaggerSpec;
      if (!parsed.paths) {
        throw new Error('Invalid Swagger/OpenAPI specification: missing paths');
      }
      return parsed;
    }
  }
}