import {
  AGENT_WATERMARK,
  LIFETIME_METADATA,
  Lifetime,
  type Type,
} from '@hadin/common';

type MetadataRecord = Record<PropertyKey, unknown>;

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
