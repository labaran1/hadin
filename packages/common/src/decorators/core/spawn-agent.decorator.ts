import { SPAWN_METADATA_KEY, SPAWN_WATERMARK } from '../../constants';
import { SpawnOptions } from '../../interfaces/spawn-options.interface';
import { normalizeSpawnOptions } from '../../utils/normalize-spawn-options.util';

export function SpawnAgent(options: SpawnOptions) {
  const policy = normalizeSpawnOptions(options);

  return (target: Function, context: ClassDecoratorContext) => {
    const metadata = context.metadata;

    if (!metadata) {
      throw new Error('Decorator metadata is unavailable in this runtime.');
    }

    if (Object.hasOwn(metadata, SPAWN_METADATA_KEY)) {
      throw new Error(
        `@SpawnAgent() was applied more than once to '${target.name || 'Anonymous'}'.`,
      );
    }

    metadata[SPAWN_WATERMARK] = true;
    metadata[SPAWN_METADATA_KEY] = policy;
  };
}
