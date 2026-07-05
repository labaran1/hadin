import { type Type } from '@hadin/common';
import { Module } from './module';

export class HadinContainer {
  private readonly modules = new Map<Type, Module>();
  private readonly globalModules = new Set<Module>();
  private loaded = false;

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

  getGlobalModules(): Set<Module> {
    return this.globalModules;
  }

  assertNotLoaded(): void {
    if (this.loaded) {
      throw new Error('HadinContainer has already been loaded.');
    }
  }

  markAsLoaded(): void {
    this.loaded = true;
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
