import { Name } from "./types";

export class RefinementTypeInnerError extends Error {
  constructor(message: string) {
    super(`Refinement Type library inner error (${message})`);
    this.name = 'RefinementTypeInnerError';
  }
}

export class RefinementTypeCheckFailure extends Error {
  short: Name;

  constructor(name: Name = 'Unnamed', cause?: Error | Error[]) {
    super(`${name}${cause !== undefined ? `: ${cause instanceof Array ? cause.reduce((acc, item, index) => `${acc}${index ? ' and ' : ''}${item instanceof RefinementTypeCheckFailure ? item.short : item}`, '') : cause instanceof RefinementTypeCheckFailure ? cause.short : cause}` : ''}`);
    this.short = name;
    this.name = 'RefinementTypeCheckFailure';
  }
}
