import RefinementType from ".";

export type Matcher = (data: any) => boolean;
export type Name = string;
export type RefinementTypeOptions = { matcher: Matcher, name?: Name };
export type DuoRefinementTypeCompositionOptions = { type: RefinementType, name?: Name };
export type SingleRefinementTypeCompositionOptions = {name?: Name};
