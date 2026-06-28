import { GLOBAL_MODULE_METADATA } from '../../constants';

export function Global() {
  return (_target: Function, context: ClassDecoratorContext) => {
    const metadata = context.metadata;

    if (!metadata) {
      throw new Error('Decorator metadata is unavailable in this runtime.');
    }

    metadata[GLOBAL_MODULE_METADATA] = true;
  };
}
