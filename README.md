# Refinement Types for JavaScript
Do you want to be sure your uncontrolled data match expectations?
This library is developed to solve this.
- __Simple API__ - it's easy to start to use
- __Agile__ - you can describe any type you want
- __Pure JS__ - no extra dependencies, no dialects needs
- __Environment agnostic__ - it can be used on backend and frontend and both
- __Full typed__ - you can be sure you use it in a right way
# Install
## NPM
```bash
npm i -S refinement-types
```
## Yarn
```bash
yarn add refinement-types
```
# Usage
```js
import RefinementType from 'refinement-types';

// Just check for string
const StringType = new RefinementType({
  name: 'StringType',
  matcher: (data) => typeof data === 'string',
});

StringType.test('This is a string!').then((val) => console.log(val));
StringType.not().test(['And this is not a string but an array']).then((val) => console.log(val));

// Check that a length is greater than 5 
const MinLengthType = new RefinementType({
  name: 'MinLengthType',
  matcher: (data) => data.length <= 5,
});

// Check for string and min length
const Login = StringType.and(MinLengthType);
// Check for string and max length
const ShortName = StringType.and(MinLengthType.not());

Login.test('Long Pong Name').then((val) => console.log(val));
ShortName.test('LPN').then((val) => console.log(val));

// Error with trace to error cause
ShortName.test('Long Pong Name').catch((val) => console.log(val));
```
# API
## Make new type
```js
// Only type checked function
// It can receive any type data and should return boolean
const StringType = new RefinementType((data) => typeof data === 'string');

// For better reading of errors name property providing is recommended
const NamedStringType = new RefinementType({
  name: 'NamedStringType',
  matcher: (data) => typeof data === 'string',
});
```
Also there is another API which can be user for creating custom operator
```js
// new RefinementType({
//    name: string, // optional
//    left: RefinementType, // required
//    right: RefinementType, // optional - do not provide if it's single side operator
//    matcher: (any): boolean, // type matching function
// });
```
For more details look at Custom Operator section
## Test data for type matching
Using promises:
```js
const StringType = new RefinementType((data) => typeof data === 'string');
let data = 'Data for testing';

StringType.test(data)
  // val will be exact the data
  .then((val) => console.log(val))
  // er will contain error tree
  .catch((er) => console.warn(er));
```
Using awaits:
```js
const StringType = new RefinementType((data) => typeof data === 'string');
let data = 'Data for testing';

(async () => {
  try {
    const val = await StringType.test(data);
    console.log(val);
  } catch (e) {
    console.warn(e);
  }
})();
```
There is alias for `test` - `match` - if you prefer.
### Typescript - type saving
`test` method return Promise with same type as it receive.
```ts
const StringType = new RefinementType((data: any) => typeof data === 'string');
let data: string = 'Data for testing';

(async () => {
  try {
    // val type will be string
    const val: string = await StringType.test(data);
    console.log(val);
  } catch (e) {
    console.warn(e);
  }
})();
```
## Composition
To create a new type use type combination methods
### And
`and` method receive RefinementType or object with RefinementType and name of new type.

Resulted type will check data for matching to both type: 'and' method owner and provided type.

If the name property is not provided the `And` name will be used.
```js
const StringType = new RefinementType({
  name: 'StringType',
  matcher: (data) => typeof data === 'string',
});
const MinLengthType = new RefinementType({
  name: 'MinLengthType',
  matcher: (data) => data.length <= 5,
});

const Login = StringType.and(MinLengthType);
const NamedLoginType = StringType.and({
  name: 'NamedLoginType',
  type: MinLengthType,
});
```
### Or
`or` method receive RefinementType or object with RefinementType and name of new type.

Resulted type will check data for matching one of types: 'or' method owner or provided type.

If the name property is not provided the `Or` name will be used.
```js
const StringType = new RefinementType({
  name: 'StringType',
  matcher: (data) => typeof data === 'string',
});
const DateType = new RefinementType({
  name: 'MinLengthType',
  matcher: (data) => data instanceof Date,
});

const CommonDateType = StringType.or(DateType);
const NamedCommonDateType = StringType.or({
  name: 'NamedCommonDateType',
  type: DateType,
});
```
### Not
`not` method receive name of new type or object with name of new type or nothing.

Resulted type will check data for matching type and reverse the result.

If the name property is not provided the `Not` name will be used.
```js
const StringType = new RefinementType({
  name: 'StringType',
  matcher: (data) => typeof data === 'string',
});

const NotStringType = StringType.not();
const NamedNotStringType = StringType.not('NamedNotStringType');
const AnotherNamedNotStringType = StringType.not({
  name: 'AnotherNamedNotStringType',
});
```
### Custom composition
To fing info about custom types composition go to 'Custom operator' section
## Packaging
There is a way to check data type later and pack type class and data together:
```js
const StringType = new RefinementType((data) => typeof data === 'string');
let data = 'Data for testing';

const unpackData = StringType.pack(data);

(async () => {
  try {
    // the same result as StringType.test(data)
    const val = await unpackData();
    console.log(val);
  } catch (e) {
    console.warn(e);
  }
})()
```
# Additional opportunities
## Caching of data checks
The library uses WeakMap internally. So any obejct-type data check will be cached without memory leaks.

If you want to cache primitive-typed data check wrap it into object:
```js
const StringType = new RefinementType((data) => typeof data === 'string');

// Wrong: string-type data check will not be cached
const stringData = 'Data for testing';
StringType.test(stringData);

// Wrong: everytime new object is created so everytime it's new key
StringType.test({data: stringData});
StringType.test({data: stringData});

// Right: the same object is used
const data = {data: 'Data for testing'};
StringType.test(data);
StringType.test(data);
```
## Promises in provided type matcher
Default matcher for type checking returns boolean type:
```ts
(data: any) => boolean;
```
But it can return Promise which return boolean. In fact matcher interface is:
```ts
(data: any) => boolean | Promise<boolean>;
```
## Custom operator
If `and`, `or`, `not` operators don't cover your needs you can use your own matcher:
```js
// Let's implement xor operator

import RefinementType from 'refinement-types';
import {RefinementTypeCheckFailure, RefinementTypeInnerError} from 'refinement-types/lib/errors';

const LessFiveType = new RefinementType((num) => num < 5);
const MoreThreeType = new RefinementType((num) => num > 3);

const checkItemForFailure = (item) => item instanceof RefinementTypeCheckFailure || item instanceof RefinementTypeInnerError;

const LessThreeAndMoreFiveType = new RefinementType({
  name: 'XOR',
  left: LessFiveType,
  right: MoreThreeType,
  matcher: function (data) {
    // this will be the new RefinementType
    if (this.left && this.right) {
      return Promise.all([
        // catch errors to prevent Promise.all from stopping
        this.left.test(data).catch((val) => val),
        this.right.test(data).catch((val) => val),
      ])
        .then((arr) => {
          let successfulArr = arr.map(item => !checkItemForFailure(item));

          if ((successfulArr[0] && !successfulArr[1]) || (!successfulArr[0] && successfulArr[1])) {
            return data;
          }

          return Promise.reject(new RefinementTypeCheckFailure(this.name));
        });
    }
    // if left or right missing (something went wrong)
    return Promise.reject(new RefinementTypeInnerError(`left or right side missing on 'and' operator`));
  },
});
```
Errors interfaces:
```ts
// RefinementTypeInnerError
constructor(message: string);

// RefinementTypeCheckFailure
constructor(name?: Name, cause?: Error | Error[]);
```
# Contributing
Feel free to open an issue or pull requests. There is no any contributing guides currently.