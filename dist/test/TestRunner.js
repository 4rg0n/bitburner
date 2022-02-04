import { AssertionError } from '/test/Assert';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdFJ1bm5lci5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbInRlc3QvVGVzdFJ1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRTlDLE1BQU0sT0FBTyxVQUFVO0lBQ25CLEVBQUUsQ0FBSztJQUVQLFlBQVksRUFBTztRQUNmLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRCxHQUFHLENBQUMsT0FBOEM7UUFDOUMsSUFBSSxPQUFPLEdBQWtCLEVBQUUsQ0FBQztRQUVoQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDckIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQW1DLENBQUMsQ0FBQyxDQUFDO1NBQ3BGO1FBRUQsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3ZCLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUN2RDtRQUVELElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDcEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzQixPQUFPO1NBQ1Y7UUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVELFdBQVcsQ0FBQyxJQUFjLEVBQUUsUUFBa0IsSUFBSTtRQUM5QyxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNyQixPQUFPLElBQUksVUFBVSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUNwQztRQUVELElBQUk7WUFDQSxJ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