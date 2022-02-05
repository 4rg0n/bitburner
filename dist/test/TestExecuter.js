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
        let tests = this.ls(grep);
        if (!self) {
            tests = tests
                .filter(name => name.toLowerCase().indexOf(TestRunner.name.toLowerCase()) === -1)
                .filter(name => name.toLowerCase().indexOf(TestExecuter.name.toLowerCase()) === -1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdEV4ZWN1dGVyLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsidGVzdC9UZXN0RXhlY3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRTlDLE1BQU0sT0FBTyxZQUFZO0lBQ3JCLE1BQU0sQ0FBQyxrQkFBa0IsR0FBRyxRQUFRLENBQUM7SUFFckMsRUFBRSxDQUFLO0lBRVAsWUFBWSxFQUFPO1FBQ2YsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsRUFBRSxJQUFJLEdBQUcsS0FBSztRQUM5QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTFCLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDUCxLQUFLLEdBQUcsS0FBSztpQkFDUixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDaEYsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMzRjtRQUVELEtBQUssTUFBTSxVQUFVLElBQUksS0FBSyxFQUFFO1lBQzVCLE1BQU0sR0FBRyxHQUFHLGNBQWMsVUFBVSxFQUFFLENBQUM7WUFFdkMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcs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