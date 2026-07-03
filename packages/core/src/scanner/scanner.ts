import {
  GLOBAL_MODULE_METADATA,
  MODULE_METADATA,
  MODULE_WATERMARK,
  type Provider,
  type Type,
} from '@hadin/common';

type MetadataRecord = Record<PropertyKey, unknown>;

export interface ScannedModule {
  token: Type;
  imports: Type[];
  providers: Provider[];
  agents: Type[];
  exports: (Type | string | symbol)[];
  isGlobal: boolean;
}

export class HadinScanner {
  private readonly registry = new Map<Type, ScannedModule>();

  scan(rootModule: Type): Map<Type, ScannedModule> {
    this.registry.clear();
    this.scanModule(rootModule, []);
    return this.registry;
  }

  private scanModule(moduleClass: Type, importHistory: Type[]): void {
    if (this.registry.has(moduleClass)) {
      return;
    }

    const metadata = this.readMetadata(moduleClass, importHistory);
    const imports = (metadata[MODULE_METADATA.IMPORTS] as Type[] | undefined) ?? [];
    const providers =
      (metadata[MODULE_METADATA.PROVIDERS] as Provider[] | undefined) ?? [];
    const agents = (metadata[MODULE_METADATA.AGENTS] as Type[] | undefined) ?? [];
    const exports =
      (metadata[MODULE_METADATA.EXPORTS] as
        | (Type | string | symbol)[]
        | undefined) ?? [];

    this.registry.set(moduleClass, {
      token: moduleClass,
      imports,
      providers,
      agents,
      exports,
      isGlobal: metadata[GLOBAL_MODULE_METADATA] === true,
    });

    const childHistory = [...importHistory, moduleClass];

    for (const importedModule of imports) {
      this.scanModule(importedModule, childHistory);
    }
  }

  private readMetadata(
    moduleClass: Type,
    importHistory: Type[],
  ): MetadataRecord {
    const metadata = (moduleClass as any)[Symbol.metadata] as
      | MetadataRecord
      | undefined;

    if (!metadata || metadata[MODULE_WATERMARK] !== true) {
      const path = [...importHistory, moduleClass]
        .map((module) => this.getModuleName(module))
        .join(' -> ');

      throw new Error(
        `"${this.getModuleName(moduleClass)}" is missing the @HadinModule() decorator.` +
          (importHistory.length ? `\nImport path [${path}]` : ''),
      );
    }

    return metadata;
  }

  private getModuleName(moduleClass: Type): string {
    return (moduleClass as Function).name || 'AnonymousModule';
  }
}
