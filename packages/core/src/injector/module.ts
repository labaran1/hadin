import {
  Lifetime,
  type ClassProvider,
  type ExistingProvider,
  type FactoryProvider,
  type InjectionToken,
  type Provider,
  type Type,
  type ValueProvider,
} from '@hadin/common';
import {
  InvalidAgentException,
  InvalidProviderException,
  UnknownExportException,
} from '../errors';
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

    if (this.isClassProvider(provider)) {
      return this.addClassProvider(provider);
    }

    if (this.isValueProvider(provider)) {
      return this.addValueProvider(provider);
    }

    if (this.isFactoryProvider(provider)) {
      return this.addFactoryProvider(provider);
    }

    if (this.isExistingProvider(provider)) {
      return this.addExistingProvider(provider);
    }

    throw new InvalidProviderException(
      this.getInvalidProviderName(provider),
      getTokenName(this.metatype),
    );
  }

  addAgent(agent: Type): InstanceWrapper {
    if (!isAgent(agent)) {
      throw new InvalidAgentException(getTokenName(agent));
    }

    const wrapper = new InstanceWrapper({
      token: agent,
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

  private addClassProvider(provider: ClassProvider): InstanceWrapper {
    const wrapper = new InstanceWrapper({
      token: provider.provide,
      name: getTokenName(provider.provide),
      metatype: provider.useClass,
      host: this,
      lifetime: provider.lifetime ?? getLifetime(provider.useClass),
    });
    this.providers.set(provider.provide, wrapper);
    return wrapper;
  }

  private addValueProvider(provider: ValueProvider): InstanceWrapper {
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

  private isClassProvider(provider: unknown): provider is ClassProvider {
    return (
      this.hasProviderToken(provider) &&
      this.hasOwnProperty(provider, 'useClass') &&
      typeof provider.useClass === 'function'
    );
  }

  private isValueProvider(provider: unknown): provider is ValueProvider {
    return (
      this.hasProviderToken(provider) &&
      this.hasOwnProperty(provider, 'useValue')
    );
  }

  private isFactoryProvider(provider: unknown): provider is FactoryProvider {
    return (
      this.hasProviderToken(provider) &&
      this.hasOwnProperty(provider, 'useFactory') &&
      typeof provider.useFactory === 'function'
    );
  }

  private isExistingProvider(provider: unknown): provider is ExistingProvider {
    return (
      this.hasProviderToken(provider) &&
      this.hasOwnProperty(provider, 'useExisting') &&
      this.isInjectionToken(provider.useExisting)
    );
  }

  private hasProviderToken(
    provider: unknown,
  ): provider is { provide: InjectionToken } {
    return (
      typeof provider === 'object' &&
      provider !== null &&
      this.hasOwnProperty(provider, 'provide') &&
      this.isInjectionToken(provider.provide)
    );
  }

  private isInjectionToken(value: unknown): value is InjectionToken {
    return (
      typeof value === 'string' ||
      typeof value === 'symbol' ||
      typeof value === 'function'
    );
  }

  private hasOwnProperty<T extends object, K extends PropertyKey>(
    value: T,
    property: K,
  ): value is T & Record<K, unknown> {
    return Object.prototype.hasOwnProperty.call(value, property);
  }

  private getInvalidProviderName(provider: unknown): string {
    if (this.hasProviderToken(provider)) {
      return getTokenName(provider.provide);
    }

    if (
      typeof provider === 'object' &&
      provider !== null &&
      this.hasOwnProperty(provider, 'provide')
    ) {
      return String((provider as { provide: unknown }).provide);
    }

    return 'Unknown';
  }
}
