import {
  GLOBAL_MODULE_METADATA,
  type InjectionToken,
  MODULE_METADATA,
  MODULE_WATERMARK,
  type Provider,
  type Type,
} from '@hadin/common';
import { HadinContainer } from '../injector/container';
import { getMetadata, getTokenName } from '../injector/helpers';
import { type Module } from '../injector/module';

type MetadataRecord = Record<PropertyKey, unknown>;

export class HadinScanner {
  constructor(private readonly container: HadinContainer) {}

  scan(rootModule: Type): HadinContainer {
    this.container.assertNotLoaded();
    this.scanModule(rootModule, []);
    this.container.bindGlobalScope();
    this.container.markAsLoaded();
    return this.container;
  }

  private scanModule(moduleClass: Type, importHistory: Type[]): Module {
    const existingModule = this.container.getModule(moduleClass);

    if (existingModule) {
      return existingModule;
    }

    const metadata = this.readMetadata(moduleClass, importHistory);
    const imports = (metadata[MODULE_METADATA.IMPORTS] as Type[] | undefined) ?? [];
    const providers =
      (metadata[MODULE_METADATA.PROVIDERS] as Provider[] | undefined) ?? [];
    const agents = (metadata[MODULE_METADATA.AGENTS] as Type[] | undefined) ?? [];
    const exports =
      (metadata[MODULE_METADATA.EXPORTS] as
        | InjectionToken[]
        | undefined) ?? [];

    const module = this.container.addModule(
      moduleClass,
      metadata[GLOBAL_MODULE_METADATA] === true,
    );

    const childHistory = [...importHistory, moduleClass];

    for (const importedModule of imports) {
      module.addImport(this.scanModule(importedModule, childHistory));
    }

    for (const provider of providers) {
      module.addProvider(provider);
    }

    for (const agent of agents) {
      module.addAgent(agent);
    }

    for (const exportedProvider of exports) {
      module.addExportedProvider(exportedProvider);
    }

    return module;
  }

  private readMetadata(
    moduleClass: Type,
    importHistory: Type[],
  ): MetadataRecord {
    const metadata = getMetadata(moduleClass);

    if (!metadata || metadata[MODULE_WATERMARK] !== true) {
      const path = [...importHistory, moduleClass]
        .map((module) => getTokenName(module))
        .join(' -> ');

      throw new Error(
        `"${getTokenName(moduleClass)}" is missing the @HadinModule() decorator.` +
          (importHistory.length ? `\nImport path [${path}]` : ''),
      );
    }

    return metadata;
  }
}
