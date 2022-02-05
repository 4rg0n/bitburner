import { NS } from '@ns'
import { TestRunner } from '/test/TestRunner';

export class TestExecuter {
    static TestFileIdentifier = ".test.";

    ns : NS

    constructor(ns : NS) {
        this.ns = ns;
    }

    /**
     * Runs .test. files with given part in name or all when empty
     * 
     * @param grep part of test name
     * @param self should include tests, which test the test execution itself
     */
    async exec(grep = "", self = false) : Promise<void> {
        let tests;

        if (self) {
            tests = this.ls()
                .filter(name => name.toLowerCase().indexOf(TestRunner.name.toLowerCase()) === 1 
                || name.toLowerCase().indexOf(TestExecuter.name.toLowerCase()) === 1);
        } else {
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
            } catch (err) {
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
    async await(script : string, timeout = 0): Promise<void>  {
        let elapsedTime = 0;
        while (this.ns.isRunning(script, this.ns.getHostname())) {
            await this.ns.sleep(1000);
            elapsedTime =+ 1000;

            if ((timeout !== 0 && elapsedTime >= timeout)) {
                throw new TimeoutError(`waiting for ${script} to finish`, timeout)
            }
        }
    }

    ls(grep = "") : string[] {
        const tests = this.ns.ls(this.ns.getHostname(), TestExecuter.TestFileIdentifier);

        if (grep !== "") {
            return tests.filter(name => name.toLowerCase().indexOf(grep.toLowerCase()) !== -1);
        }
        
        return tests;
    }
}

class TimeoutError {
    message: string;
    timeout: number;

    constructor(message = "", timeout = 0) {
        this.message = message;
        this.timeout = timeout;
    }
    
    toString() : string {
        return `${TimeoutError.name} (${this.timeout}ms): ${this.message}`;
    }
}