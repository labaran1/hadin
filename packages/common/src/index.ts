// TC39 decorator metadata is not available in Node yet, but TypeScript uses
// this symbol when emitting modern decorators.
(Symbol as any).metadata ??= Symbol.for('Symbol.metadata');

export * from './constants';
export * from './decorators';
export * from './enums';
export * from './interfaces';
