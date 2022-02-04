export class Assert {
    static isLength(any, length) {
        if (_.isArray(any) || _.isString(any)) {
            this.true(any.length === length, `Length to be ${length}, but got ${any.length}`);
        }
        else {
            this.fail(`Expected value to be ${Array.name} or ${String.name}`);
        }
    }
    static empty(any) {
        if (_.isArray(any)) {
            this.true(any.length === 0, `Given value to be empty, but got ${any.length}`);
        }
        else if (_.isString(any)) {
            this.true(any === "", `Given value to be empty, but got ${any}`);
        }
        else {
            this.fail(`Expected value to be ${Array.name} or ${String.name}`);
        }
    }
    static notEmpty(any) {
        if (_.isArray(any)) {
            this.true(any.length > 0, `Given value to be not empty, but got ${any.length}`);
        }
        else if (_.isString(any)) {
            this.true(any !== "", `Given value to be not empty, but got ${any}`);
        }
        else {
            this.fail(undefined, undefined, `Expected value to be ${Array.name} or ${String.name}`);
        }
    }
    static true(bool, msg = undefined) {
        if (!bool) {
            this.fail(bool, true, msg);
        }
    }
    static isArray(any) {
        this.true(_.isArray(any), `Given value to be ${Array.name}, but got ${typeof any}`);
    }
    static fail(actual, expected, msg) {
        throw new AssertionError(actual, expected, msg);
    }
}
export class AssertionError extends Error {
    actual;
    expected;
    constructor(actual, expected, msg) {
        msg = msg || `Got: ${actual}, but expected: ${expected}`;
        super(msg);
        this.actual = actual;
        this.expected = expected;
        this.name = "AssertionError";
        Object.setPrototypeOf(this, AssertionError.prototype);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXNzZXJ0LmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsidGVzdC9Bc3NlcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxPQUFPLE1BQU07SUFDZixNQUFNLENBQUMsUUFBUSxDQUFDLEdBQVMsRUFBRSxNQUFlO1FBQ3RDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUUsZ0JBQWdCLE1BQU0sYUFBYSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztTQUNyRjthQUFNO1lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsS0FBSyxDQUFDLElBQUksT0FBTyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUNyRTtJQUNMLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQVM7UUFDbEIsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsb0NBQW9DLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQ2pGO2FBQU0sSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLEVBQUUsRUFBRSxvQ0FBb0MsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUNwRTthQUFNO1lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsS0FBSyxDQUFDLElBQUksT0FBTyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUNyRTtJQUNMLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQVM7UUFDckIsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsd0NBQXdDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQ25GO2FBQU0sSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLEVBQUUsRUFBRSx3Q0FBd0MsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUN4RTthQUFNO1lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLHdCQUF3QixLQUFLLENBQUMsSUFBSSxPQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQzNGO0lBQ0wsQ0FBQztJQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBYyxFQUFFLE1BQTJCLFNBQVM7UUFDNUQsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNQLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztTQUM5QjtJQUNMLENBQUM7SUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQVM7UUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLHFCQUFxQixLQUFLLENBQUMsSUFBSSxhQUFhLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQztJQUN4RixDQUFDO0lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUE0QixFQUFFLFFBQThCLEVBQUUsR0FBd0I7UUFDOUYsTUFBTSxJQUFJLGNBQWMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3BELENBQUM7Q0FDSjtBQUVELE1BQU0sT0FBTyxjQUFlLFNBQVEsS0FBSztJQUNyQyxNQUFNLENBQVU7SUFDaEIsUUFBUSxDQUFVO0lBRWxCLFlBQVksTUFBNEIsRUFBRSxRQUE4QixFQUFFLEdBQXdCO1FBQzlGLEdBQUcsR0FBRyxHQUFHLElBQUksUUFBUSxNQUFNLG1CQUFtQixRQUFRLEVBQUUsQ0FBQztRQUN6RCxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFWCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFDO1FBQzdCLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMxRCxDQUFDO0NBQ0oifQ==