export class MissingModuleDecoratorException extends Error {
  constructor(moduleName: string, importPath?: string) {
    super(
      `"${moduleName}" is missing the @HadinModule() decorator.` +
        (importPath ? `\nImport path [${importPath}]` : ''),
    );
    this.name = 'MissingModuleDecoratorException';
  }
}
