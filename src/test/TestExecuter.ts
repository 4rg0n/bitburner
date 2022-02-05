import { NS } from '@ns'

export class TestExecuter {
    ns : NS

    constructor(ns : NS) {
        this.ns = ns;
    }

    async exec(grep = "") : Promise<void> {
        const tests = this.ls(grep);

        for (const test of tests) {
            const msg = `Start test ${test}`;

            this.ns.tprintf(`INFO ${"*".repeat(msg.length + 4)}`);
            this.ns.tprintf(`INFO * ${msg} *`);
            this.ns.tprintf(`INFO ${"*".repeat(msg.length + 4)}`);
            this.ns.exec(test, this.ns.getHostname());
            
            await this.await(test);
        }
    }

    async await(script : string): Promise<void>  {
        while (this.ns.isRunning(script, this.ns.getHostname())) {
            await this.ns.sleep(1000);
        }
    }

    ls(grep = "") : string[] {
        const tests = this.ns.ls(this.ns.getHostname(), ".test.");

        if (grep !== "") {
            return tests.filter(name => name.toLowerCase().indexOf(grep.toLowerCase()) !== -1);
        }
        
        return tests;
    }
}