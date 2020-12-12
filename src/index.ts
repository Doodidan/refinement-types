import type { Matcher, DuoRefinementTypeCompositionOptions, RefinementTypeOptions, SingleRefinementTypeCompositionOptions, Name } from './types';

class RefinementType {
  private matcher: Matcher;
  name: Name | undefined;

  constructor({ matcher, name }: RefinementTypeOptions) {
    this.matcher = matcher;
    this.name = name;
  }

  test(data: any): boolean {
    return this.matcher(data);
  }

  match(data: any) {
    return this.test(data);
  }

  and({ type, name }: DuoRefinementTypeCompositionOptions): RefinementType {
    return new RefinementType({ name, matcher: (data: any) => this.matcher(data) && type.matcher(data) });
  }
  or({ type, name }: DuoRefinementTypeCompositionOptions): RefinementType {
    return new RefinementType({ name, matcher: (data: any) => this.matcher(data) || type.matcher(data) });
  }
  not({ name }: SingleRefinementTypeCompositionOptions): RefinementType {
    return new RefinementType({ name, matcher: (data: any) => !this.matcher(data) });
  }
};

export default RefinementType;
