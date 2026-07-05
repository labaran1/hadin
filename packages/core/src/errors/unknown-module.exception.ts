export class UnknownModuleException extends Error {
  constructor(name?: string) {
    super(name ? `Unknown module "${name}".` : 'Unknown module.');
    this.name = 'UnknownModuleException';
  }
}
