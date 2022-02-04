import { toPrintableString } from "/lib/utils";
export class Assert {
    static true(value, message = undefined) {
        if (!value)
            this.fail(value, true, message, "==");
    }
    static equal(actual, expected, message = undefined) {
        if (actual != expected)
            this.fail(actual, expected, message, "==");
    }
    static notEqual(actual, expected, message = undefined) {
        if (actual == expected) {
            this.fail(actual, expected, message, "!=");
        }
    }
    static isLength(any, length, message = undefined) {
        if (_.isArray(any) || _.isString(any)) {
            if (any.length !== length)
                this.fail(any.length, length, message, "length ==");
        }
        else {
            this.fail(`Expected value to be ${Array.name} or ${String.name}, but got ${typeof any}`);
        }
    }
    static empty(any, message = undefined) {
        if (!_.isEmpty(any))
            this.fail(any, 0, message, "length ==");
    }
    static notEmpty(any, message = undefined) {
        if (_.isEmpty(any))
            this.fail(any, 0, message, "length >");
    }
    static isArray(any, message = undefined) {
        if (!_.isArray(any))
            this.fail(typeof any, "array", message, "==");
    }
    static notUndefinedOrNull(any, message = undefined) {
        if (_.isUndefined(any) || _.isNull(any))
            this.fail(any, message, "undefined or null", "!=");
    }
    static has(object, path, message = undefined) {
        if (!_.has(object, path))
            this.fail(object, `${path.toString()}`, message, "does not have");
    }
    static fail(actual = undefined, expected = undefined, message = undefined, operator = undefined) {
        throw new AssertionError({
            message: message,
            actual: actual,
            expected: expected,
            operator: operator,
        });
    }
}
export class AssertionError extends Error {
    actual;
    expected;
    operator;
    constructor(options) {
        const operator = (!_.isUndefined(options.operator)) ? ` ${options.operator} ` : " to be ";
        const msg = (_.isUndefined(options.message))
            ? `Expected: ${toPrintableString(options.actual)}${operator}${toPrintableString(options.expected)}` : options.message;
        super(msg);
        this.actual = options.actual;
        this.expected = options.expected;
        this.operator = operator;
        this.name = "AssertionError";
        Object.setPrototypeOf(this, AssertionError.prototype);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXNzZXJ0LmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsidGVzdC9Bc3NlcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRS9DLE1BQU0sT0FBTyxNQUFNO0lBRWYsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFlLEVBQUUsVUFBK0IsU0FBUztRQUNqRSxJQUFJLENBQUMsS0FBSztZQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBZ0IsRUFBRSxRQUFrQixFQUFFLFVBQStCLFNBQVM7UUFDdkYsSUFBSSxNQUFNLElBQUksUUFBUTtZQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBZ0IsRUFBRSxRQUFrQixFQUFFLFVBQStCLFNBQVM7UUFDMUYsSUFBSSxNQUFNLElBQUksUUFBUSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDOUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFhLEVBQUUsTUFBZSxFQUFFLFVBQStCLFNBQVM7UUFDcEYsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDbkMsSUFBRyxHQUFHLENBQUMsTUFBTSxLQUFLLE1BQU07Z0JBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFF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