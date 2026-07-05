import { type Type } from '@hadin/common';
import { UnknownModuleException } from '../errors';
import { type ScannedModule } from '../scanner';
import { getTokenName } from './helpers';
import { Module } from './module';

export class HadinContainer {
  private readonly modules = new Map<Type, Module>();
  private readonly globalModules = new Set<Module>();

  addModule(type: Type, isGlobal: boolean): Module {
    const existingModule = this.modules.get(type);

    if (existingModule) {
      return existingModule;
    }

    const module = new Module(type, isGlobal);
    this.modules.set(type, module);

    if (module.isGlobal) {
      this.globalModules.add(module);
    }

    return module;
  }

  getModule(type: Type): Module | undefined {
    return this.modules.get(type);
  }

  getModules(): Map<Type, Module> {
    return this.modules;
  }

  load(scanned: Map<Type, ScannedModule>): void {
    for (const scannedModule of scanned.values()) {
      this.addModule(scannedModule.token, scannedModule.isGlobal);
    }

    for (const scannedModule of scanned.values()) {
      const module = this.addModule(scannedModule.token, scannedModule.isGlobal);

      for (const importedType of scannedModule.imports) {
        const importedModule = this.getModule(importedType);

        if (!importedModule) {
          throw new UnknownModuleException(getTokenName(importedType));
        }

        module.addImport(importedModule);
      }

      for (const provider of scannedModule.providers) {
        module.addProvider(provider);
      }

      for (const agent of scannedModule.agents) {
        module.addAgent(agent);
      }
    }

    for (const scannedModule of scanned.values()) {
      const module = this.addModule(scannedModule.token, scannedModule.isGlobal);

      for (const exportedProvider of scannedModule.exports) {
        module.addExportedProvider(exportedProvider);
      }
    }

    this.bindGlobalScope();
  }

  getGlobalModules(): Set<Module> {
    return this.globalModules;
  }

  bindGlobalScope(): void {
    for (const module of this.modules.values()) {
      for (const globalModule of this.globalModules) {
        if (module !== globalModule) {
          module.addImport(globalModule);
        }
      }
    }
  }
}
