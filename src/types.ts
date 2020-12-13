import RefinementType from ".";

export type Data = any;
export type Matcher = (data: Data) => boolean | Promise<boolean>;
export type Name = string | undefined;

export type RefinementTypePair = { left: RefinementType, right: RefinementType };
export type RefinementTypeSingle = { left: RefinementType };

export type RefinementTypeMatcherOptions = { matcher: Matcher, name?: Name };
export type RefinementTypeOperatorOptions = { matcher: Matcher, left: RefinementType, right?: RefinementType, name?: Name };
export type RefinementTypeOptions = RefinementTypeMatcherOptions | RefinementTypeOperatorOptions | Matcher;

export type PairRefinementTypeCompositionExtended = { type: RefinementType, name?: Name }
export type PairRefinementTypeCompositionOptions = PairRefinementTypeCompositionExtended | RefinementType;
export type SingleRefinementTypeCompositionOptions = { name?: Name } | Name;

export function isMatcher(val: RefinementTypeOptions): val is Matcher {
  return typeof val === 'function' || val instanceof Promise;
}
export function isRefinementTypeOperatorOptions(val: RefinementTypeOptions): val is RefinementTypeOperatorOptions {
  return (val as RefinementTypeOperatorOptions).left !== undefined;
}
export function isPairRefinementTypeCompositionExtended(val: PairRefinementTypeCompositionOptions): val is PairRefinementTypeCompositionExtended {
  return (val as PairRefinementTypeCompositionExtended).type !== undefined;
}
export function isName(val: any): val is Name {
  return typeof val === 'string' || val === undefined;
}
export function isObject(val: any): val is object {
  return typeof val === 'object';
}
