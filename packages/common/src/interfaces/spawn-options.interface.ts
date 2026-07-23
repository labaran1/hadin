import { Type } from './type.interface';

export interface SpawnOptions {
  agents: readonly Type[];
  maxConcurrent?: number;
  maxDepth?: number;
}
