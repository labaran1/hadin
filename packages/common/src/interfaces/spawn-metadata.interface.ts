import { Type } from './type.interface';

export interface SpawnMetadata {
  agents: readonly Type[];
  maxConcurrent: number;
  maxDepth: number;
}
