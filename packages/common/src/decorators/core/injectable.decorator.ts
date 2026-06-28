import { INJECTABLE_WATERMARK, LIFETIME_METADATA } from '../../constants';
import { InjectableOptions } from '../../interfaces/injectable-options.interface';

export function Injectable(options?: InjectableOptions) {
  return (_target: Function, context: ClassDecoratorContext) => {
    const metadata = context.metadata;

    if (!metadata) {
      throw new Error('Decorator metadata is unavailable in this runtime.');
    }

    metadata[INJECTABLE_WATERMARK] = true;
    metadata[LIFETIME_METADATA] = options?.lifetime;
  };
}
