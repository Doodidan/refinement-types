import { RefinementTypeCheckFailure, RefinementTypeInnerError } from './errors';
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
  isObject,
} from './types';

class RefinementType {
  private matcher: Matcher;
  name: Name;
  left?: RefinementType;
  right?: RefinementType;

  buffer: WeakMap<object, Promise<any>> = new WeakMap();

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

  test<Type>(data: Type): Promise<Type> {
    let promise: Promise<Type> | undefined;
    if (isObject(data)) {
      promise = this.buffer.get(data);
    }

    if (promise === undefined) {
      promise = new Promise((resolve, reject) => {
        const result = this.matcher(data);
        if (result === true) {
          return resolve(data);
        }
        if (result === false) {
          return reject(new RefinementTypeCheckFailure(this.name));
        }
        result.then(() => resolve(data), (val: RefinementTypeCheckFailure) => reject(val));
      });

      if (isObject(data)) {
        this.buffer.set(data, promise);
      }
    }

    return promise;
  }
  match<Type>(data: Type): Promise<Type> {
    return this.test(data);
  }

  pack<Type>(data: Type): () => Promise<Type> {
    return () => this.test(data);
  }

  and(props: PairRefinementTypeCompositionOptions): RefinementType {
    let type: RefinementType, name: Name;
    if (isPairRefinementTypeCompositionExtended(props)) {
      type = props.type;
      name = props.name;
    } else {
      type = props;
    }
    return new RefinementType({ name: name ?? 'And', matcher: RefinementType.andOperator, left: this, right: type });
  }
  or(props: PairRefinementTypeCompositionOptions): RefinementType {
    let type: RefinementType, name: Name;
    if (isPairRefinementTypeCompositionExtended(props)) {
      type = props.type;
      name = props.name;
    } else {
      type = props;
    }
    return new RefinementType({ name: name ?? 'Or', matcher: RefinementType.orOperator, left: this, right: type });
  }
  not(props?: SingleRefinementTypeCompositionOptions): RefinementType {
    const name: Name = (isName(props) ? props : props.name);
    return new RefinementType({ name: name ?? 'Not', matcher: RefinementType.notOperator, left: this });
  }

  static andOperator(this: RefinementType, data: Data): Promise<boolean> {
    if (this.left && this.right) {
      return Promise.all([
        this.left.test(data),
        this.right.test(data),
      ])
        .then(() => data)
        .catch((val: RefinementTypeCheckFailure) => Promise.reject(new RefinementTypeCheckFailure(this.name, val)));
    }
    return Promise.reject(new RefinementTypeInnerError(`left or right side missing on 'and' operator`));
  }
  static orOperator(this: RefinementType, data: Data): Promise<boolean> {
    if (this.left && this.right) {
      return Promise.all([
        this.left.test(data).catch((val) => val),
        this.right.test(data).catch((val) => val),
      ])
        .then((arr) => {
          for (let item of arr) {
            if (!(item instanceof RefinementTypeCheckFailure || item instanceof RefinementTypeInnerError)) {
              return item;
            }
          }
          return Promise.reject(new RefinementTypeCheckFailure(this.name, arr));
        });
    }
    return Promise.reject(new RefinementTypeInnerError(`left or right side missing on 'or' operator`));
  }
  static notOperator(this: RefinementType, data: Data): Promise<boolean> {
    if (this.left) {
      return this.left.test(data)
        .then(
          () => Promise.reject(
            new RefinementTypeCheckFailure(
              this.name,
              new RefinementTypeCheckFailure(this.left?.name)
            )
          ),
          () => Promise.resolve(data),
        );
    }
    return Promise.reject(new RefinementTypeInnerError(`left side missing on 'not' operator`));
  }
};

export default RefinementType;
