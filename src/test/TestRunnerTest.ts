import { NS } from '@ns'
import { Assert } from '/test/Assert';
import { TestRunner } from '/test/TestRunner';
/**
 * Tests TestRunner itself
 */
export async function main(ns : NS) : Promise<void> {
    const runner = new TestRunner(ns);
    runner.run(Tests);
}

const Tests = {
    testShouldFail: (ns : NS) : void => {
        Assert.fail(undefined, undefined, "FAILED");
    },
    
    testShouldError: (ns : NS) : void => {
       throw new Error("ERROR");
    },
    
    testShouldSucceed: (ns : NS) : void => {
       return;
    }
}

