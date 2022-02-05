import { AssertionError } from '/test/Assert';
/**
 * FIXME There might be issues when e.g. gang API isn't currently available and you try to run tests with it
 */
export class TestRunner {
    ns;
    constructor(ns) {
        this.ns = ns;
    }
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
            if (result.type === TestResult.Types.Failure) {
                level = "WARN";
            }
            else if (result.type === TestResult.Types.Error) {
                level = "ERROR";
            }
            let state = "";
            if (result.type === TestResult.Types.Failure) {
                state = "FAILED";
            }
            else if (result.type === TestResult.Types.Error) {
                state = "ERROR";
            }
            const msg = TestRunner.errorToString(err);
            this.ns.tprintf(`${level} ☒ ${this.ns.getScriptName()}#${func.name} test result: ${state} \n${msg}}`);
            this.ns.tprintf("\n");
            return result;
        }
        return new TestResult(func.name);
    }
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
        const successCount = results.filter(res => res.type === TestResult.Types.Success).length;
        let passed = "☑";
        if (errorCount > 0 || failureCount > 0) {
            passed = "☒";
        }
        this.ns.tprintf("\n");
        this.ns.tprintf(` ${passed} Success: ${successCount} Failure: ${failureCount} Error: ${errorCount}`);
        this.ns.tprintf("\n");
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
        Error: "error"
    };
    error;
    type;
    name;
    constructor(name, error = undefined, type = TestResult.Types.Success) {
        this.name = name;
        this.error = error;
        this.type = type;
    }
    static fromError(name, error) {
        let type = undefined;
        if (typeof error === "string") {
            type = TestResult.Types.Error;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdFJ1bm5lci5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbInRlc3QvVGVzdFJ1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRTlDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFVBQVU7SUFDbkIsRUFBRSxDQUFLO0lBRVAsWUFBWSxFQUFPO1FBQ2YsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUVELEdBQUcsQ0FBQyxPQUE4QztRQUM5QyxJQUFJLE9BQU8sR0FBa0IsRUFBRSxDQUFDO1FBRWhDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNyQixPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBbUMsQ0FBQyxDQUFDLENBQUM7U0FDcEY7UUFFRCxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDdkIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ3ZEO1FBRUQsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNwQixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNCLE9BQU87U0FDVjtRQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQsV0FBVyxDQUFDLElBQWMsRUFBRSxRQUFrQixJQUFJO1FBQzlDLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3JCLE9BQU8sSUFBSSxVQUFVLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQ3BDO1FBRUQs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