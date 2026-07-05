import {
  AGENT_WATERMARK,
  LIFETIME_METADATA,
  Lifetime,
  type InjectionToken,
  type Type,
} from '@hadin/common';

export type MetadataRecord = Record<PropertyKey, unknown>;

export function getMetadata(cls: Type | Function): MetadataRecord | undefined {
  return (cls as any)[Symbol.metadata] as MetadataRecord | undefined;
}

export function getLifetime(cls: Type | Function): Lifetime {
  return (
    (getMetadata(cls)?.[LIFETIME_METADATA] as Lifetime | undefined) ??
    Lifetime.Singleton
  );
}

export function isAgent(cls: Type | Function): boolean {
  return getMetadata(cls)?.[AGENT_WATERMARK] === true;
}

export function getTokenName(token: InjectionToken | Type): string {
  if (typeof token === 'string') {
    return token;
  }

  if (typeof token === 'symbol') {
    return token.description ?? token.toString();
  }

  return (token as Function).name || 'Anonymous';
}
