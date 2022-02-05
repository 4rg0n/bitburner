import { NS } from '@ns'
import { AssertionError } from '/test/Assert';

export class TestRunner {
    ns : NS

    constructor(ns : NS) {
        this.ns = ns;
    }

    run(runable : (unknown | {[key: string]: unknown})) : void {
        let results : TestResult[] = [];

        if (_.isObject(runable)) {
            results = results.concat(...this.runObject(runable as {[key: string]: unknown}));
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

    runFunction(func : unknown, scope : unknown = this) : TestResult {
        if (!_.isFunction(func)) {
            return new TestResult("" + func);
        }

        try {
            func.apply(scope, [this.ns]);
            this.ns.tprintf(`SUCCESS ☑ ${this.ns.getScriptName()}#${func.name}`);
        } catch (err) {
            const result = TestResult.fromError(func.name, err);
            let level = "";
            let symbol = "☒"

            if (result.type === TestResult.Types.Failure) {
                level = "WARN";
            } else if (result.type === TestResult.Types.Error) {
                level = "ERROR";
            } else if (result.type === TestResult.Types.Skip) {
                symbol = "☐";
                level = "SKIPPED";
            }

            const msg = TestRunner.errorToString(err);
            this.ns.tprintf(`${level} ${symbol} ${this.ns.getScriptName()}#${func.name} test: ${_.upperCase(result.type)} \n${msg}`);
            if (result.type !== TestResult.Types.Skip) this.ns.tprintf("\n");
            return result;
        }

        return new TestResult(func.name);
    }

    runObject(obj : {[key: string]: unknown}) : TestResult[] {
        const results : TestResult[] = [];

        for (const key in obj) {
            const func = obj[key];

            if (key.startsWith("test") && _.isFunction(func)) {
               results.push(this.runFunction(func, obj));
            }
        }

        return results;
    }

    printResults(results : TestResult[]) : void {
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

    static shouldSkip(ns: NS, doSkip = false, message = "") : boolean {
        try {
            TestRunner.skip(doSkip, message);
        } catch(err) {
            if (err instanceof TestSkipError) {
                ns.tprintf(`SKIPPED ☐ ${ns.getScriptName()} tests - ${message}`);
                ns.tprintf(`\n`);
                return true;
            }

            throw err;
        }

        return false;
    }

    static skip(doSkip = false, message = "") : void {
        if (doSkip) throw new TestSkipError(message);
    }

    static errorToString(err : Error |  AssertionError | string | unknown) : string {
        let errMsg = "";

        if (err instanceof Error) {
            if (!_.isUndefined(err.stack)) {
                errMsg = err.stack;
            } else {
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
    }

    error: Error | AssertionError | string | undefined | unknown | undefined
    type: string
    name: string

    constructor(
        name: string,
        error : Error | AssertionError | string | undefined | unknown | undefined = undefined,
        type = TestResult.Types.Success
    ) {
        this.name = name;
        this.error = error;
        this.type = type;
    }

    static fromError(name : string, error : Error | AssertionError | string | undefined | unknown) : TestResult {
        let type : string | undefined = undefined;
        
        if (typeof error === "string") {
            type = TestResult.Types.Error;
        } else if (error instanceof TestSkipError) {
            type = TestResult.Types.Skip;
        } else if (error instanceof Error) {
            if (error.name === AssertionError.name) {
                type = TestResult.Types.Failure;
            } else {
                type = TestResult.Types.Error;
            }
        } 

        return new TestResult(name, error, type);
    }
}

export class TestSkipError {
    message: string;

    constructor(message = "") {
        this.message = message;
    }

    toString() : string {
        return `${TestSkipError.name}: ${this.message}`;
    }
} 