import { TestRunner } from '/test/TestRunner';
export class TestExecuter {
    static TestFileIdentifier = ".test.";
    ns;
    constructor(ns) {
        this.ns = ns;
    }
    /**
     * Runs .test. files with given part in name or all when empty
     *
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
    /**
     * For waiting until a script is finished executing
     *
     * @param script
     * @param timeout in ms
     */
    async await(script, timeout = 0) {
        let elapsedTime = 0;
        while (this.ns.isRunning(script, this.ns.getHostname())) {
            await this.ns.sleep(1000);
            elapsedTime = +1000;
            if ((timeout !== 0 && elapsedTime >= timeout)) {
                throw new TimeoutError(`waiting for ${script} to finish`, timeout);
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
    timeout;
    constructor(message = "", timeout = 0) {
        this.message = message;
        this.timeout = timeout;
    }
    toString() {
        return `${TimeoutError.name} (${this.timeout}ms): ${this.message}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdEV4ZWN1dGVyLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsidGVzdC9UZXN0RXhlY3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRTlDLE1BQU0sT0FBTyxZQUFZO0lBQ3JCLE1BQU0sQ0FBQyxrQkFBa0IsR0FBRyxRQUFRLENBQUM7SUFFckMsRUFBRSxDQUFLO0lBRVAsWUFBWSxFQUFPO1FBQ2YsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxFQUFFLElBQUksR0FBRyxLQUFLO1FBQzlCLElBQUksS0FBSyxDQUFDO1FBRVYsSUFBSSxJQUFJLEVBQUU7WUFDTixLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRTtpQkFDWixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDO21CQUM1RSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUM3RTthQUFNO1lBQ0gsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFFRCxLQUFLLE1BQU0sVUFBVSxJQUFJLEtBQUssRUFBRTtZQUM1QixNQUFNLEdBQUcsR0FBRyxjQUFjLFVBQVUsRUFBRSxDQUFDO1lBRXZDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFB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