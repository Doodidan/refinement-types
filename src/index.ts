import type { Matcher } from './types';

class RefinementType {
  private matcher: Matcher;

  constructor(matcher: Matcher) {
    this.matcher = matcher;
  }

  test(data: any) : boolean {
    return this.matcher(data);
  }

  match(data: any) {
    return this.test(data);
  }
};

export default RefinementType;
