import {
  Matcher,
  PairRefinementTypeCompositionOptions,
  RefinementTypeOptions,
  SingleRefinementTypeCompositionOptions,
  Name,
  Data,
  isRefinementTypeOperatorOptions,
  isPairRefinementTypeCompositionExtended,
  isName,
  isMatcher,
} from './types';

class RefinementType {
  private matcher: Matcher;
  name: Name;
  left?: RefinementType;
  right?: RefinementType;

  constructor(props: RefinementTypeOptions) {
    this.name = props.name;

    if (isMatcher(props)) {
      this.matcher = props;
    } else {
      this.matcher = props.matcher;
    }

    if (isRefinementTypeOperatorOptions(props)) {
      const { left, right } = props;
      this.left = left;
      this.right = right;
    }
  }

  test(data: Data): boolean {
    return this.matcher(data);
  }
  match(data: Data): boolean {
    return this.test(data);
  }

  and(props: PairRefinementTypeCompositionOptions): RefinementType {
    let type: RefinementType, name: Name;
    if (isPairRefinementTypeCompositionExtended(props)) {
      type = props.type;
      name = props.name;
    } else {
      type = props;
    }
    return new RefinementType({ name, matcher: RefinementType.andOperator, left: this, right: type });
  }
  or(props: PairRefinementTypeCompositionOptions): RefinementType {
    let type: RefinementType, name: Name;
    if (isPairRefinementTypeCompositionExtended(props)) {
      type = props.type;
      name = props.name;
    } else {
      type = props;
    }
    return new RefinementType({ name, matcher: RefinementType.orOperator, left: this, right: type });
  }
  not(props?: SingleRefinementTypeCompositionOptions): RefinementType {
    const name: Name = isName(props) ? props : props.name;
    return new RefinementType({ name, matcher: RefinementType.notOperator, left: this });
  }

  static andOperator(this: RefinementType, data: Data): boolean {
    if (this.left && this.right) {
      return this.left.test(data) && this.right.test(data);
    }
    return false;
  }
  static orOperator(this: RefinementType, data: Data): boolean {
    if (this.left && this.right) {
      return this.left.test(data) || this.right.test(data);
    }
    return false;
  }
  static notOperator(this: RefinementType, data: Data): boolean {
    if (this.left) {
      return !this.left.test(data);
    }
    return false;
  }
};

export default RefinementType;
