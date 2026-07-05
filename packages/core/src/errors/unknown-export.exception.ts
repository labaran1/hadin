export class UnknownExportException extends Error {
  constructor(tokenName: string, moduleName: string) {
    super(
      `Module "${moduleName}" cannot export unknown provider "${tokenName}".`,
    );
    this.name = 'UnknownExportException';
  }
}
