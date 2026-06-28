import { TOOLS_METADATA_KEY, TOOL_WATERMARK } from '../../constants';
import { ToolMetadata } from '../../interfaces/tool-metadata.interface';

export function Tool(description?: string) {
  return (_value: Function, context: ClassMethodDecoratorContext) => {
    const metadata = context.metadata;

    if (!metadata) {
      throw new Error('Decorator metadata is unavailable in this runtime.');
    }

    metadata[TOOL_WATERMARK] = true;

    const name = context.name as string;
    const tools = (metadata[TOOLS_METADATA_KEY] as ToolMetadata[] | undefined) ?? [];
    tools.push({ name, description: description ?? name });
    metadata[TOOLS_METADATA_KEY] = tools;
  };
}
