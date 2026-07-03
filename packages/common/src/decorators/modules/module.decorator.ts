import { MODULE_METADATA, MODULE_WATERMARK } from '../../constants';
import { ModuleMetadata } from '../../interfaces/modules/module-metadata.interface';
import { validateModuleKeys } from '../../utils/validate-module-keys.util';

export function HadinModule(metadata: ModuleMetadata) {
  validateModuleKeys(Object.keys(metadata));

  return (_target: Function, context: ClassDecoratorContext) => {
    const decoratorMetadata = context.metadata;

    if (!decoratorMetadata) {
      throw new Error('Decorator metadata is unavailable in this runtime.');
    }

    decoratorMetadata[MODULE_WATERMARK] = true;
    decoratorMetadata[MODULE_METADATA.IMPORTS] = metadata.imports ?? [];
    decoratorMetadata[MODULE_METADATA.PROVIDERS] = metadata.providers ?? [];
    decoratorMetadata[MODULE_METADATA.AGENTS] = metadata.agents ?? [];
    decoratorMetadata[MODULE_METADATA.EXPORTS] = metadata.exports ?? [];
  };
}
