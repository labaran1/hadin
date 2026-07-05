export class InvalidProviderException extends Error {
  constructor(providerName: string, moduleName: string) {
    super(`Module "${moduleName}" received invalid provider "${providerName}".`);
    this.name = 'InvalidProviderException';
  }
}
