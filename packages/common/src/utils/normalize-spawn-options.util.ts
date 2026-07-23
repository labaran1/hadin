import { SpawnMetadata } from '../interfaces/spawn-metadata.interface';
import { SpawnOptions } from '../interfaces/spawn-options.interface';
import { Type } from '../interfaces/type.interface';

const DEFAULT_MAX_CONCURRENT = 1;
const DEFAULT_MAX_DEPTH = 1;

export function normalizeSpawnOptions(options: SpawnOptions): SpawnMetadata {
  return Object.freeze({
    agents: normalizeAgents(options.agents),
    maxConcurrent: normalizeLimit(
      options.maxConcurrent,
      DEFAULT_MAX_CONCURRENT,
      'maxConcurrent',
    ),
    maxDepth: normalizeLimit(options.maxDepth, DEFAULT_MAX_DEPTH, 'maxDepth'),
  });
}

function normalizeAgents(agents: readonly Type[]): readonly Type[] {
  if (!Array.isArray(agents) || agents.length === 0) {
    throw new Error(`@SpawnAgent() requires a non-empty 'agents' array.`);
  }

  const seen = new Set<Type>();

  agents.forEach((agent, index) => {
    if (agent === undefined || agent === null) {
      throw new Error(
        `@SpawnAgent() received an empty entry at 'agents[${index}]'. This usually means a circular import between the spawning agent and its spawn target.`,
      );
    }

    if (typeof agent !== 'function') {
      throw new Error(
        `@SpawnAgent() received a non-class entry at 'agents[${index}]'.`,
      );
    }

    if (seen.has(agent)) {
      throw new Error(
        `@SpawnAgent() received a duplicate entry '${agent.name || 'Anonymous'}' in 'agents'.`,
      );
    }

    seen.add(agent);
  });

  return Object.freeze([...agents]);
}

function normalizeLimit(
  value: number | undefined,
  fallback: number,
  property: string,
): number {
  if (value === undefined) {
    return fallback;
  }

  if (!Number.isInteger(value) || value < 1) {
    throw new Error(
      `@SpawnAgent() requires '${property}' to be a positive integer.`,
    );
  }

  return value;
}
