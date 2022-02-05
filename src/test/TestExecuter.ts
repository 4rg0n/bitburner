import { NS } from '@ns'
import { TestRunner } from '/test/TestRunner';

export class TestExecuter {
    static TestFileIdentifier = ".test.";

    ns : NS

    constructor(ns : NS) {
        this.ns = ns;
    }

    /**
     * @param grep part of test name
     * @param self should include tests, which test the test execution itself
     */
    async exec(grep = "", self = false) : Promise<void> {
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

    async await(script : string, timeout = 0): Promise<void>  {
        let elapsedTime = 0;
        while (this.ns.isRunning(script, this.ns.getHostname())) {
            await this.ns.sleep(1000);
            elapsedTime =+ 1000;

            if ((timeout !== 0 && elapsedTime >= timeout)) {
                throw new TimeoutError(`Did not finish in ${timeout}ms`)
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

    constructor(message = "") {
        this.message = message;
    }
    
    toString() : string {
        return `${TimeoutError.name}: ${this.message}`;
    }
}