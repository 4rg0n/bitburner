/* eslint-disable @typescript-eslint/no-unused-vars */
import { NS } from '@ns'
import { Assert } from '/test/Assert';
import { TestRunner, TestSkipError } from '/test/TestRunner';
/**
 * Tests TestRunner itself
 */
export async function main(ns : NS) : Promise<void> {
    const runner = new TestRunner(ns);
    runner.run(Tests);
}

const Tests = {
    testShouldFail: (ns : NS) : void => {
        Assert.fail("muh", "blub", "FAILED");
    },
    
    testShouldError: (ns : NS) : void => {
       throw new Error("ERROR");
    },

    testShouldSkip: (ns : NS) : void => {
        throw new TestSkipError("SKIPPED");
    },
    
    testShouldSucceed: (ns : NS) : void => {
       return;
    }
}

