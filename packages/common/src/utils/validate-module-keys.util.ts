import { MODULE_METADATA } from '../constants';

const ALLOWED_KEYS = Object.values(MODULE_METADATA);

export function validateModuleKeys(keys: string[]) {
  for (const key of keys) {
    if (!ALLOWED_KEYS.includes(key as any)) {
      throw new Error(
        `Invalid property '${key}' passed into the @HadinModule() decorator.`,
      );
    }
  }
}
