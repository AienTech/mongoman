import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const DEBOUNCE_DEFAULT_INTERVAL = 450;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours`;
  const days = Math.floor(hours / 24);
  return `${days} days`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Byte';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const getUniqueKeys = (arrayOfObjects: object[]) => {
  return [...new Set(arrayOfObjects.flatMap((obj) => Object.keys(obj)))];
};

export function jsonToCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';

  const allKeys = [...new Set(data.flatMap((obj) => Object.keys(obj)))];
  const header = allKeys.map((k) => `"${k}"`).join(',');
  const rows = data.map((obj) =>
    allKeys
      .map((key) => {
        const val = obj[key];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(','),
  );

  return [header, ...rows].join('\n');
}

export function parseCsv(text: string): object[] {
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const obj: Record<string, unknown> = {};
    headers.forEach((header, i) => {
      const val = values[i] || '';
      if (val === 'true') obj[header] = true;
      else if (val === 'false') obj[header] = false;
      else if (val === '' || val === 'null') obj[header] = null;
      else if (!isNaN(Number(val)) && val.trim() !== '') obj[header] = Number(val);
      else obj[header] = val;
    });
    return obj;
  });
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}
