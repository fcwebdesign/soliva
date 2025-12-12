import fs from 'fs';
import path from 'path';

export function resolveContentPath(siteKey: string): string {
  // site "soliva" = data/content.json, sinon data/templates/{siteKey}/content.json si existe
  const base = siteKey === 'soliva' ? path.join(process.cwd(), 'data', 'content.json') : path.join(process.cwd(), 'data', 'templates', siteKey, 'content.json');
  return base;
}

export function readJsonFile(filePath: string): any {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

export function writeJsonFile(filePath: string, data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}
