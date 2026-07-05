import { type Type } from '@hadin/common';
import { UnknownModuleException } from '../errors';
import { type ScannedModule } from '../scanner';
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
          throw new UnknownModuleException(this.getModuleName(importedType));
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
  }

  getGlobalModules(): Set<Module> {
    return this.globalModules;
  }

  private getModuleName(type: Type): string {
    return (type as Function).name || 'AnonymousModule';
  }
}
