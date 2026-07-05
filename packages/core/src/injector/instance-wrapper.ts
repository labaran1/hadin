import { InjectionToken, Lifetime, type Type } from '@hadin/common';
import type { Module } from './module';

export interface InstanceWrapperOptions<T = any> {
  token: InjectionToken;
  name: string;
  metatype: Type | Function | null;
  host: Module;
  instance?: T | null;
  isResolved?: boolean;
  lifetime?: Lifetime;
  inject?: InjectionToken[];
  isAlias?: boolean;
}

export class InstanceWrapper<T = any> {
  readonly token: InjectionToken;
  readonly name: string;
  readonly metatype: Type | Function | null;
  readonly host: Module;
  instance: T | null;
  isResolved: boolean;
  lifetime: Lifetime;
  inject?: InjectionToken[];
  isAlias?: boolean;

  constructor(options: InstanceWrapperOptions<T>) {
    this.token = options.token;
    this.name = options.name;
    this.metatype = options.metatype;
    this.host = options.host;
    this.instance = options.instance ?? null;
    this.isResolved = options.isResolved ?? false;
    this.lifetime = options.lifetime ?? Lifetime.Singleton;
    this.inject = options.inject;
    this.isAlias = options.isAlias;
  }
}
