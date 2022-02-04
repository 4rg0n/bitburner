export class Assert {
    static isLength(any : any, length : number) : void {
        if (_.isArray(any) || _.isString(any)) {
            this.true(any.length === length, `Length to be ${length}, but got ${any.length}`);
        } else {
            this.fail(`Expected value to be ${Array.name} or ${String.name}`);
        }
    }

    static empty(any : any) {
        if (_.isArray(any)) {
            this.true(any.length === 0, `Given value to be empty, but got ${any.length}`);
        } else if (_.isString(any)) {
            this.true(any === "", `Given value to be empty, but got ${any}`);
        } else {
            this.fail(`Expected value to be ${Array.name} or ${String.name}`);
        }
    }

    static notEmpty(any : any) {
        if (_.isArray(any)) {
            this.true(any.length > 0, `Given value to be not empty, but got ${any.length}`);
        } else if (_.isString(any)) {
            this.true(any !== "", `Given value to be not empty, but got ${any}`);
        } else {
            this.fail(undefined, undefined, `Expected value to be ${Array.name} or ${String.name}`);
        }
    }

    static true(bool : boolean, msg : string | undefined = undefined) : void {
        if (!bool) {
            this.fail(bool, true, msg);
        }
    }

    static isArray(any : any) : void {
        this.true(_.isArray(any), `Given value to be ${Array.name}, but got ${typeof any}`);
    }

    static fail(actual?: unknown | undefined, expected?: unknown | undefined, msg?: string | undefined) {
        throw new AssertionError(actual, expected, msg); 
    }
}

export class AssertionError extends Error {
    actual: unknown;
    expected: unknown;

    constructor(actual?: unknown | undefined, expected?: unknown | undefined, msg?: string | undefined) {
        msg = msg || `Got: ${actual}, but expected: ${expected}`;
        super(msg);

        this.actual = actual;
        this.expected = expected;
        this.name = "AssertionError";
        Object.setPrototypeOf(this, AssertionError.prototype);
    }
}