import { Lifetime } from '../enums/lifetime.enum';

export interface AgentOptions {
  name: string;
  description?: string;
  lifetime?: Lifetime;
}
