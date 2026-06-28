import { Lifetime } from '../../enums/lifetime.enum';

export type InjectionToken = string | symbol | Function;

export type Provider<T = any> =
  | Function
  | ClassProvider<T>
  | ValueProvider<T>
  | FactoryProvider<T>
  | ExistingProvider<T>;

export interface ClassProvider<T = any> {
  provide: InjectionToken;
  useClass: new (...args: any[]) => T;
  lifetime?: Lifetime;
}

export interface ValueProvider<T = any> {
  provide: InjectionToken;
  useValue: T;
}

export interface FactoryProvider<T = any> {
  provide: InjectionToken;
  useFactory: (...args: any[]) => T | Promise<T>;
  inject?: InjectionToken[];
  lifetime?: Lifetime;
}

export interface ExistingProvider<T = any> {
  provide: InjectionToken;
  useExisting: InjectionToken;
}
