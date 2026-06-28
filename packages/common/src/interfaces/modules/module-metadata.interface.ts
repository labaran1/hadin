import { Provider } from './provider.interface';

export interface ModuleMetadata {
  imports?: Function[];
  providers?: Provider[];
  agents?: Function[];
  exports?: (Function | string | symbol)[];
}
