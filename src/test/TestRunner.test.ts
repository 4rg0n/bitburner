/* eslint-disable @typescript-eslint/no-unused-vars */
import { NS } from '@ns'
import { Assert } from '/test/Assert';
import { TestRunner, TestSkipError } from '/test/TestRunner';

/**
 * Tests TestRunner itself
 */
export async function main(ns : NS) : Promise<void> {
    //TestRunner.shouldSkip(true, "example skip"); //Skip?
    const runner = new TestRunner(ns);
    runner.run(Tests);
}

const Tests = {
    testShouldFail: (ns : NS) : void => {
        Assert.fail("muh", "blub", "I'm failed");
    },
    
    testShouldError: (ns : NS) : void => {
       throw new Error("I'm error");
    },

    testShouldSkip: (ns : NS) : void => {
        TestRunner.skip(true, "I'm skipped");
    },
    
    testShouldSucceed: (ns : NS) : void => {
       return;
    }
}

