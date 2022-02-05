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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdFJ1bm5lci5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbInRlc3QvVGVzdFJ1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRTlDLE1BQU0sT0FBTyxVQUFVO0lBQ25CLEVBQUUsQ0FBSztJQUVQLFlBQVksRUFBTztRQUNmLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRCxHQUFHLENBQUMsT0FBOEM7UUFDOUMsSUFBSSxPQUFPLEdBQWtCLEVBQUUsQ0FBQztRQUVoQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDckIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQW1DLENBQUMsQ0FBQyxDQUFDO1NBQ3BGO1FBRUQsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3ZCLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUN2RDtRQUVELElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDcEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzQixPQUFPO1NBQ1Y7UUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVELFdBQVcsQ0FBQyxJQUFjLEVBQUUsUUFBa0IsSUFBSTtRQUM5QyxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNyQixPQUFPLElBQUksVUFBVSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUNwQztRQUVELElBQUk7WUFDQSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUN4RTtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1YsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3BELElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNmLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQTtZQUVoQixJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7Z0JBQzFDLEtBQUssR0FBRyxNQUFNLENBQUM7YUFDbEI7aUJBQU0sSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFO2dCQUMvQyxLQUFLLEdBQUcsT0FBTyxDQUFDO2FBQ25CO2lCQUFNLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtnQkFDOUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztnQkFDYixLQUFLLEdBQUcsU0FBUyxDQUFDO2FBQ3JCO1lBRUQsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQUssSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDekgsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSTtnQkFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRSxPQUFPLE1BQU0sQ0FBQztTQUNqQjtRQUVELE9BQU8sSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxTQUFTLENBQUMsR0FBOEI7UUFDcEMsTUFBTSxPQUFPLEdBQWtCLEVBQUUsQ0FBQztRQUVsQyxLQUFLLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRTtZQUNuQixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFdEIsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQy9DLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUM1QztTQUNKO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVELFlBQVksQ0FBQyxPQUFzQjtRQUMvQixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNyRixNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUN6RixNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNuRixNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUN6RixJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFFakIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxJQUFJLFlBQVksR0FBRyxDQUFDLEVBQUU7WUFDcEMsTUFBTSxHQUFHLEdBQUcsQ0FBQztTQUNoQjtRQUVELElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxhQUFhLFlBQVksYUFBYSxZQUFZLFdBQVcsVUFBVSxVQUFVLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDeEgsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVELE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBTSxFQUFFLE1BQU0sR0FBRyxLQUFLLEVBQUUsT0FBTyxHQUFHLEVBQUU7UUFDbEQsSUFBSTtZQUNBLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3BDO1FBQUMsT0FBTSxHQUFHLEVBQUU7WUFDVCxJQUFJLEdBQUcsWUFBWSxhQUFhLEVBQUU7Z0JBQzlCLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUMsYUFBYSxFQUFFLFlBQVksT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDakUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDakIsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUVELE1BQU0sR0FBRyxDQUFDO1NBQ2I7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxFQUFFLE9BQU8sR0FBRyxFQUFFO1FBQ3BDLElBQUksTUFBTTtZQUFFLE1BQU0sSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBZ0Q7UUFDakUsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBRWhCLElBQUksR0FBRyxZQUFZLEtBQUssRUFBRTtZQUN0QixJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzNCLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO2FBQ3RCO2lCQUFNO2dCQUNILE1BQU0sR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDO2FBQ3hCO1NBQ0o7UUFFRCxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtZQUN6QixPQUFPLEdBQUcsQ0FBQztTQUNkO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztDQUNKO0FBRUQsTUFBTSxVQUFVO0lBQ1osTUFBTSxDQUFDLEtBQUssR0FBRztRQUNYLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLEtBQUssRUFBRSxPQUFPO1FBQ2QsSUFBSSxFQUFFLE1BQU07S0FDZixDQUFBO0lBRUQsS0FBSyxDQUFtRTtJQUN4RSxJQUFJLENBQVE7SUFDWixJQUFJLENBQVE7SUFFWixZQUNJLElBQVksRUFDWixRQUE0RSxTQUFTLEVBQ3JGLElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU87UUFFL0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVELE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBYSxFQUFFLEtBQTZEO1FBQ3pGLElBQUksSUFBSSxHQUF3QixTQUFTLENBQUM7UUFFMUMsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7WUFDM0IsSUFBSSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO1NBQ2pDO2FBQU0sSUFBSSxLQUFLLFlBQVksYUFBYSxFQUFFO1lBQ3ZDLElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztTQUNoQzthQUFNLElBQUksS0FBSyxZQUFZLEtBQUssRUFBRTtZQUMvQixJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssY0FBYyxDQUFDLElBQUksRUFBRTtnQkFDcEMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO2FBQ25DO2lCQUFNO2dCQUNILElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQzthQUNqQztTQUNKO1FBRUQsT0FBTyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzdDLENBQUM7O0FBR0wsTUFBTSxPQUFPLGFBQWE7SUFDdEIsT0FBTyxDQUFTO0lBRWhCLFlBQVksT0FBTyxHQUFHLEVBQUU7UUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDM0IsQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLEdBQUcsYUFBYSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEQsQ0FBQztDQUNKIn0=