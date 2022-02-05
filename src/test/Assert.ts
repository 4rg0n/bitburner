import { PropertyPath } from "lodash";
import { toPrintableType } from "/lib/utils";

export class Assert {

    static true(value : unknown, message? : string) : void {
        if (!value) this.fail(value, true, message, "==");
    }

    static equal(actual : unknown, expected : unknown, message? : string) : void {
        if (actual != expected) this.fail(actual, expected, message, "==");
    }

    static notEqual(actual : unknown, expected : unknown, message? : string) : void {
        if (actual == expected) {
            this.fail(actual, expected, message, "!=");
        }
    }

    static isLength(any : unknown, length : number, message? : string) : void {
        if (_.isArray(any) || _.isString(any)) {
            if(any.length !== length) this.fail(any, length, message, "length ==");
        } else {
            this.fail(`Expected value to be ${Array.name} or ${String.name}, but got ${typeof any}`);
        }
    }

    static empty(any : unknown, message? : string) : void {
        if (!_.isEmpty(any)) this.fail(any, 0, message, "length ==");
    }

    static notEmpty(any : unknown, message? : string) : void {
        if (_.isEmpty(any)) this.fail(any, 0, message, "length >");
    }

    static isArray(any : unknown, message? : string) : void {
        if (!_.isArray(any)) this.fail(typeof any, "array", message, "==");
    }

    static notUndefinedOrNull(any : unknown, message? : string) : void {
        if (_.isUndefined(any) || _.isNull(any)) this.fail(any, "<undefined> or <null>", message, "!=");
    }

    static has<T>(object: T, path: PropertyPath, message? : string) : void {
        if (!_.has(object, path)) this.fail(object, `${path.toString()}`, message, "does not have");
    }

    static fail(
        actual? : unknown,
        expected? : unknown, 
        message? : string,
        operator? : string
    ) : void {
        throw new AssertionError({
            message: message,
            actual: actual,
            expected: expected,
            operator: operator,
        });
    }
}

export class AssertionError extends Error implements IAssertionError {
    actual?: unknown;
    expected?: unknown;
    operator?: string;

    constructor(options : IAssertionError) {
        const operator = (!_.isUndefined(options.operator)) ? ` ${options.operator} ` : " to be ";
        const expectedMsg = `↯ Expected: ${toPrintableType(options.actual)}${operator}${toPrintableType(options.expected)}`;
        const msg = (_.isUndefined(options.message)) ? `${expectedMsg}` : `${options.message}\n${expectedMsg}`;

        super(msg);

        this.actual = options.actual;
        this.expected = options.expected;
        this.operator = operator;
        this.name = "AssertionError";
        Object.setPrototypeOf(this, AssertionError.prototype);
    }
}
interface IAssertionError {
    message?: string;
    actual?: unknown;
    expected?: unknown;
    operator?: string;
}

