import {
  InjectionToken,
  Lifetime,
  type ExistingProvider,
  type FactoryProvider,
  type Provider,
  type Type,
} from '@hadin/common';
import { UnknownExportException } from '../errors';
import { getLifetime, getTokenName, isAgent } from './helpers';
import { InstanceWrapper } from './instance-wrapper';

export class Module {
  readonly imports = new Set<Module>();
  readonly providers = new Map<InjectionToken, InstanceWrapper>();
  readonly agents = new Map<Type, InstanceWrapper>();
  readonly exports = new Set<InjectionToken>();

  constructor(
    readonly metatype: Type,
    readonly isGlobal: boolean,
  ) {}

  addImport(module: Module): void {
    this.imports.add(module);
  }

  addProvider(provider: Provider): InstanceWrapper {
    if (typeof provider === 'function') {
      return this.addPlainClassProvider(provider);
    }

    if ('useClass' in provider) {
      const wrapper = new InstanceWrapper({
        token: provider.provide,
        name: getTokenName(provider.provide),
        metatype: provider.useClass,
        host: this,
        lifetime: provider.lifetime ?? Lifetime.Singleton,
      });
      this.providers.set(provider.provide, wrapper);
      return wrapper;
    }

    if ('useValue' in provider) {
      const wrapper = new InstanceWrapper({
        token: provider.provide,
        name: getTokenName(provider.provide),
        metatype: null,
        host: this,
        instance: provider.useValue,
        isResolved: true,
      });
      this.providers.set(provider.provide, wrapper);
      return wrapper;
    }

    if ('useFactory' in provider) {
      return this.addFactoryProvider(provider);
    }

    return this.addExistingProvider(provider);
  }

  addAgent(agent: Type): InstanceWrapper {
    if (!isAgent(agent)) {
      throw new Error(
        `"${getTokenName(agent)}" is not an agent. Did you forget @Agent()?`,
      );
    }

    const wrapper = new InstanceWrapper({
      token: agent as unknown as InjectionToken,
      name: getTokenName(agent),
      metatype: agent,
      host: this,
      lifetime: getLifetime(agent),
    });
    this.agents.set(agent, wrapper);
    return wrapper;
  }

  hasProvider(token: InjectionToken): boolean {
    return this.providers.has(token);
  }

  getProvider(token: InjectionToken): InstanceWrapper | undefined {
    return this.providers.get(token);
  }

  addExportedProvider(token: InjectionToken): void {
    this.validateExportedProvider(token);
    this.exports.add(token);
  }

  validateExportedProvider(token: InjectionToken): void {
    if (this.providers.has(token) || this.hasImportedModule(token)) {
      return;
    }

    throw new UnknownExportException(
      getTokenName(token),
      getTokenName(this.metatype),
    );
  }

  private addPlainClassProvider(provider: Function): InstanceWrapper {
    const wrapper = new InstanceWrapper({
      token: provider,
      name: getTokenName(provider),
      metatype: provider,
      host: this,
      lifetime: getLifetime(provider),
    });
    this.providers.set(provider, wrapper);
    return wrapper;
  }

  private addFactoryProvider(provider: FactoryProvider): InstanceWrapper {
    const wrapper = new InstanceWrapper({
      token: provider.provide,
      name: getTokenName(provider.provide),
      metatype: provider.useFactory,
      host: this,
      lifetime: provider.lifetime ?? Lifetime.Singleton,
      inject: provider.inject ?? [],
    });
    this.providers.set(provider.provide, wrapper);
    return wrapper;
  }

  private addExistingProvider(provider: ExistingProvider): InstanceWrapper {
    const wrapper = new InstanceWrapper({
      token: provider.provide,
      name: getTokenName(provider.provide),
      metatype: null,
      host: this,
      inject: [provider.useExisting],
      isAlias: true,
    });
    this.providers.set(provider.provide, wrapper);
    return wrapper;
  }

  private hasImportedModule(token: InjectionToken): boolean {
    return [...this.imports].some(
      (importedModule) => importedModule.metatype === token,
    );
  }

}
