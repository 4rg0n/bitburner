import { AssertionError } from '/test/Assert';
export class TestRunner {
    ns;
    constructor(ns) {
        this.ns = ns;
    }
    /**
     * Runs a function or methods in an object starting with "test"
     *
     * @param runable object or function
     */
    run(runable) {
        let results = [];
        if (_.isObject(runable)) {
            results = results.concat(...this.runObject(runable));
        }
        if (_.isFunction(runable)) {
            results = results.concat(this.runFunction(runable));
        }
        if (results.length > 0) {
            this.printResults(results);
            return;
        }
        throw new Error(`Can only run functions and objects / classes`);
    }
    runFunction(func, scope = this) {
        if (!_.isFunction(func)) {
            return new TestResult("" + func);
        }
        try {
            func.apply(scope, [this.ns]);
            this.ns.tprintf(`SUCCESS ☑ ${this.ns.getScriptName()}#${func.name}`);
        }
        catch (err) {
            const result = TestResult.fromError(func.name, err);
            let level = "";
            let symbol = "☒";
            if (result.type === TestResult.Types.Failure) {
                level = "WARN";
            }
            else if (result.type === TestResult.Types.Error) {
                level = "ERROR";
            }
            else if (result.type === TestResult.Types.Skip) {
                symbol = "☐";
                level = "SKIPPED";
            }
            const msg = TestRunner.errorToString(err);
            this.ns.tprintf(`${level} ${symbol} ${this.ns.getScriptName()}#${func.name} test: ${_.upperCase(result.type)} \n${msg}`);
            if (result.type !== TestResult.Types.Skip)
                this.ns.tprintf("\n");
            return result;
        }
        return new TestResult(func.name);
    }
    /**
     * Runs methods in object starting with "test"
     *
     * @param obj with "test" functions to run
     * @returns
     */
    runObject(obj) {
        const results = [];
        for (const key in obj) {
            const func = obj[key];
            if (key.startsWith("test") && _.isFunction(func)) {
                results.push(this.runFunction(func, obj));
            }
        }
        return results;
    }
    printResults(results) {
        const errorCount = results.filter(res => res.type === TestResult.Types.Error).length;
        const failureCount = results.filter(res => res.type === TestResult.Types.Failure).length;
        const skipCount = results.filter(res => res.type === TestResult.Types.Skip).length;
        const successCount = results.filter(res => res.type === TestResult.Types.Success).length;
        let passed = "☑";
        if (errorCount > 0 || failureCount > 0) {
            passed = "☒";
        }
        this.ns.tprintf("\n");
        this.ns.tprintf(` ${passed} Success: ${successCount} Failure: ${failureCount} Error: ${errorCount} Skip: ${skipCount}`);
        this.ns.tprintf("\n");
    }
    /**
     * Will print a message and return whether to skip.
     * Used for not executing test files under some conditions. E.g. an api is not accessable.
     */
    static shouldSkip(ns, doSkip = false, message = "") {
        try {
            TestRunner.skip(doSkip, message);
        }
        catch (err) {
            if (err instanceof TestSkipError) {
                ns.tprintf(`SKIPPED ☐ ${ns.getScriptName()} tests - ${message}`);
                ns.tprintf(`\n`);
                return true;
            }
            throw err;
        }
        return false;
    }
    /**
     * Will throw an error when should skip.
     * Used for skipping a test function under certain conditions.
     * The runner will mark the test as skipped.
     */
    static skip(doSkip = false, message = "") {
        if (doSkip)
            throw new TestSkipError(message);
    }
    static errorToString(err) {
        let errMsg = "";
        if (err instanceof Error) {
            if (!_.isUndefined(err.stack)) {
                errMsg = err.stack;
            }
            else {
                errMsg = err.message;
            }
        }
        if (typeof err === "string") {
            return err;
        }
        return errMsg;
    }
}
class TestResult {
    static Types = {
        Success: "success",
        Failure: "failure",
        Error: "error",
        Skip: "skip"
    };
    error;
    type;
    name;
    constructor(name, error, type = TestResult.Types.Success) {
        this.name = name;
        this.error = error;
        this.type = type;
    }
    static fromError(name, error) {
        let type = undefined;
        if (typeof error === "string") {
            type = TestResult.Types.Error;
        }
        else if (error instanceof TestSkipError) {
            type = TestResult.Types.Skip;
        }
        else if (error instanceof Error) {
            if (error.name === AssertionError.name) {
                type = TestResult.Types.Failure;
            }
            else {
                type = TestResult.Types.Error;
            }
        }
        return new TestResult(name, error, type);
    }
}
export class TestSkipError {
    message;
    constructor(message = "") {
        this.message = message;
    }
    toString() {
        return `${TestSkipError.name}: ${this.message}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdFJ1bm5lci5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbInRlc3QvVGVzdFJ1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRTlDLE1BQU0sT0FBTyxVQUFVO0lBQ25CLEVBQUUsQ0FBSztJQUVQLFlBQVksRUFBTztRQUNmLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsR0FBRyxDQUFDLE9BQThDO1FBQzlDLElBQUksT0FBTyxHQUFrQixFQUFFLENBQUM7UUFFaEMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3JCLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFtQyxDQUFDLENBQUMsQ0FBQztTQUNwRjtRQUVELElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN2QixPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDdkQ7UUFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3BCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0IsT0FBTztTQUNWO1FBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxXQUFXLENBQUMsSUFBYyxFQUFFLFFBQWtCLElBQUk7UUFDOUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDckIsT0FBTyxJQUFJLFVBQVUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDcEM7UUFF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