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

export function isMatcher(props: RefinementTypeOptions): props is Matcher {
  return typeof props === 'function' || props instanceof Promise;
}
export function isRefinementTypeOperatorOptions(props: RefinementTypeOptions): props is RefinementTypeOperatorOptions {
  return (props as RefinementTypeOperatorOptions).left !== undefined;
}
export function isPairRefinementTypeCompositionExtended(props: PairRefinementTypeCompositionOptions): props is PairRefinementTypeCompositionExtended {
  return (props as PairRefinementTypeCompositionExtended).type !== undefined;
}
export function isName(props: any): props is Name {
  return typeof props === 'string' || props === undefined;
}
