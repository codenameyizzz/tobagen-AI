import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export interface RuntimeConfig {
  apiKey?: string;
  primaryModel: string;
  fallbackModel: string;
  port: number;
}

export function loadEnvironment(projectRoot: string) {
  const envPaths = [
    path.join(projectRoot, '.env'),
    path.join(projectRoot, '.env.local'),
  ];

  const mergedEnv = envPaths.reduce<Record<string, string>>((accumulator, envPath) => {
    const result = loadDotenvFile(envPath);
    if (!result.parsed) {
      return accumulator;
    }

    return {
      ...accumulator,
      ...result.parsed,
    };
  }, {});

  for (const [key, value] of Object.entries(mergedEnv)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function loadDotenvFile(envPath: string): { parsed?: Record<string, string> } {
  try {
    const dotenv = require('dotenv') as typeof import('dotenv');
    return dotenv.config({ path: envPath });
  } catch {
    return {};
  }
}

export function getRuntimeConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  return {
    apiKey: env.GEMINI_API_KEY?.trim(),
    primaryModel: env.GEMINI_PRIMARY_MODEL?.trim() || env.GEMINI_MODEL?.trim() || 'gemini-3-flash-preview',
    fallbackModel: env.GEMINI_FALLBACK_MODEL?.trim() || 'gemini-3.1-flash-lite',
    port: resolvePort(env.PORT),
  };
}

function resolvePort(portValue: string | undefined): number {
  const parsedPort = Number(portValue);
  if (Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65535) {
    return parsedPort;
  }

  return 3001;
}
