import { toPrintableType } from "/lib/utils";
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
                this.fail(any, length, message, "length ==");
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
            this.fail(any, "<undefined> or <null>", message, "!=");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXNzZXJ0LmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsidGVzdC9Bc3NlcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUU3QyxNQUFNLE9BQU8sTUFBTTtJQUVmLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBZSxFQUFFLFVBQStCLFNBQVM7UUFDakUsSUFBSSxDQUFDLEtBQUs7WUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQWdCLEVBQUUsUUFBa0IsRUFBRSxVQUErQixTQUFTO1FBQ3ZGLElBQUksTUFBTSxJQUFJLFFBQVE7WUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQWdCLEVBQUUsUUFBa0IsRUFBRSxVQUErQixTQUFTO1FBQzFGLElBQUksTUFBTSxJQUFJLFFBQVEsRUFBRTtZQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzlDO0lBQ0wsQ0FBQztJQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBYSxFQUFFLE1BQWUsRUFBRSxVQUErQixTQUFTO1FBQ3BGLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ25DLElBQUcsR0FBRyxDQUFDLE1BQU0sS0FBSyxNQUFNO2dCQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxP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