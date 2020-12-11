import type { Matcher } from './types';

class RefinementType {
  private matcher: Matcher;

  constructor(matcher: Matcher) {
    this.matcher = matcher;
  }

  test(data: any): boolean {
    return this.matcher(data);
  }

  match(data: any) {
    return this.test(data);
  }

  and(type: RefinementType): RefinementType {
    return new RefinementType((data: any) => this.matcher(data) && type.matcher(data));
  }
  or(type: RefinementType): RefinementType {
    return new RefinementType((data: any) => this.matcher(data) || type.matcher(data));
  }
  not(): RefinementType {
    return new RefinementType((data: any) => !this.matcher(data));
  }
};

export default RefinementType;
