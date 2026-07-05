export class InvalidAgentException extends Error {
  constructor(agentName: string) {
    super(`"${agentName}" is not an agent. Did you forget @Agent()?`);
    this.name = 'InvalidAgentException';
  }
}
