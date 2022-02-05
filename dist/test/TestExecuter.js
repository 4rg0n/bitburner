import { TestRunner } from '/test/TestRunner';
export class TestExecuter {
    static TestFileIdentifier = ".test.";
    ns;
    constructor(ns) {
        this.ns = ns;
    }
    /**
     * @param grep part of test name
     * @param self should include tests, which test the test execution itself
     */
    async exec(grep = "", self = false) {
        let tests;
        if (self) {
            tests = this.ls()
                .filter(name => name.toLowerCase().indexOf(TestRunner.name.toLowerCase()) === 1
                || name.toLowerCase().indexOf(TestExecuter.name.toLowerCase()) === 1);
        }
        else {
            tests = this.ls(grep);
        }
        for (const testScript of tests) {
            const msg = `Start test ${testScript}`;
            this.ns.tprintf(`INFO ${"*".repeat(msg.length + 4)}`);
            this.ns.tprintf(`INFO * ${msg} *`);
            this.ns.tprintf(`INFO ${"*".repeat(msg.length + 4)}`);
            try {
                if (this.ns.exec(testScript, this.ns.getHostname()) === 0) {
                    this.ns.tprintf(`ERROR ☒ ${msg}`);
                    this.ns.tprintf(`\n`);
                    continue;
                }
                await this.await(testScript, 30000);
            }
            catch (err) {
                let msg = "";
                if (_.isString(err) || err instanceof TimeoutError || err instanceof Error) {
                    msg = err.toString();
                }
                this.ns.tprintf(`ERROR ☒ ${testScript} - ${msg}`);
                this.ns.tprintf(`\n`);
            }
        }
    }
    async await(script, timeout = 0) {
        let elapsedTime = 0;
        while (this.ns.isRunning(script, this.ns.getHostname())) {
            await this.ns.sleep(1000);
            elapsedTime = +1000;
            if ((timeout !== 0 && elapsedTime >= timeout)) {
                throw new TimeoutError(`Did not finish in ${timeout}ms`);
            }
        }
    }
    ls(grep = "") {
        const tests = this.ns.ls(this.ns.getHostname(), TestExecuter.TestFileIdentifier);
        if (grep !== "") {
            return tests.filter(name => name.toLowerCase().indexOf(grep.toLowerCase()) !== -1);
        }
        return tests;
    }
}
class TimeoutError {
    message;
    constructor(message = "") {
        this.message = message;
    }
    toString() {
        return `${TimeoutError.name}: ${this.message}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdEV4ZWN1dGVyLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsidGVzdC9UZXN0RXhlY3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRTlDLE1BQU0sT0FBTyxZQUFZO0lBQ3JCLE1BQU0sQ0FBQyxrQkFBa0IsR0FBRyxRQUFRLENBQUM7SUFFckMsRUFBRSxDQUFLO0lBRVAsWUFBWSxFQUFPO1FBQ2YsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsRUFBRSxJQUFJLEdBQUcsS0FBSztRQUM5QixJQUFJLEtBQUssQ0FBQztRQUVWLElBQUksSUFBSSxFQUFFO1lBQ04sS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUU7aUJBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQzttQkFDNUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDN0U7YUFBTTtZQUNILEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBRUQsS0FBSyxNQUFNLFVBQVUsSUFBSSxLQUFLLEVBQUU7WUFDNUIsTUFBTSxHQUFHLEdBQUcsY0FBYyxVQUFVLEVBQUUsQ0FBQztZQUV2QyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0s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