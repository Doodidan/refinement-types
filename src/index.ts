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

  async test(data: Data): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const result = this.matcher(data);
      if (result === true) {
        return resolve(true);
      }
      if (result === false) {
        return reject(false);
      }
      result.then((val) => resolve(val), (val) => reject(val));
    });
  }
  async match(data: Data): Promise<boolean> {
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

  static async andOperator(this: RefinementType, data: Data): Promise<boolean> {
    if (this.left && this.right) {
      return Promise.all([
        this.left.test(data),
        this.right.test(data),
      ])
        .then(() => true)
    }
    return Promise.reject(false);
  }
  static async orOperator(this: RefinementType, data: Data): Promise<boolean> {
    if (this.left && this.right) {
      return Promise.all([
        this.left.test(data).catch(() => false),
        this.right.test(data).catch(() => false),
      ])
        .then((arr) => {
          for (let item of arr) {
            if (item) {
              return true;
            }
          }
          return Promise.reject(false);
        });
    }
    return Promise.reject(false);
  }
  static async notOperator(this: RefinementType, data: Data): Promise<boolean> {
    if (this.left) {
      return this.left.test(data).then(() => Promise.reject(false), () => Promise.resolve(true));
    }
    return Promise.reject(false);
  }
};

export default RefinementType;
