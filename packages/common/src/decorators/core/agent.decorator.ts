import {
  AGENT_DESCRIPTION_METADATA,
  AGENT_NAME_METADATA,
  AGENT_WATERMARK,
  LIFETIME_METADATA,
} from '../../constants';
import { AgentOptions } from '../../interfaces/agent-options.interface';

export function Agent(options: AgentOptions) {
  return (_target: Function, context: ClassDecoratorContext) => {
    const metadata = context.metadata;

    if (!metadata) {
      throw new Error('Decorator metadata is unavailable in this runtime.');
    }

    metadata[AGENT_WATERMARK] = true;
    metadata[AGENT_NAME_METADATA] = options.name;
    metadata[AGENT_DESCRIPTION_METADATA] = options.description;
    metadata[LIFETIME_METADATA] = options.lifetime;
  };
}
