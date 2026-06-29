import { Type } from '../type.interface';
import { Provider } from './provider.interface';

export interface ModuleMetadata {
  imports?: Type[];
  providers?: Provider[];
  agents?: Type[];
  exports?: (Type | string | symbol)[];
}
