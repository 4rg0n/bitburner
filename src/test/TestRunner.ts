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

    runFunction(func : unknown, scope : any = this) : TestResult {
        if (!_.isFunction(func)) {
            return new TestResult("" + func);
        }

        try {
            func.apply(scope, [this.ns]);
            this.ns.tprintf(`SUCCESS ${this.ns.getScriptName()}#${func.name}`);
        } catch (err) {

            const result = TestResult.fromError(func.name, err);

            let level = "";

            if (result.type === TestResult.Types.Failure) {
                level = "WARN";
            } else if (result.type === TestResult.Types.Error) {
                level = "ERROR";
            }

            let state = "";

            if (result.type === TestResult.Types.Failure) {
                state = "FAILED";
            } else if (result.type === TestResult.Types.Error) {
                state = "ERROR";
            }

            const msg = TestRunner.errorToString(err);
            this.ns.tprintf(`${level} ${this.ns.getScriptName()}#${func.name} test result: ${state} \n${msg}}`);
            this.ns.tprintf("\n");
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
        const successCount = results.filter(res => res.type === TestResult.Types.Success).length;
        let level = "INFO";

        if (errorCount > 0 || failureCount > 0) {
            level = "ERROR"
        } 

        this.ns.tprintf("\n");
        this.ns.tprintf(`${level} Success: ${successCount} Failure: ${failureCount} Error: ${errorCount}`);
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
        Error: "error"
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