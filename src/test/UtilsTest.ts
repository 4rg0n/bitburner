import { NS } from '@ns'
import { toPrintableString } from '/lib/utils';
import { Assert } from '/test/Assert';
import { TestRunner } from '/test/TestRunner';
/**
 * Tests TestRunner itself
 */
export async function main(ns : NS) : Promise<void> {
    const runner = new TestRunner(ns);
    runner.run(UtilsTest);
}

const UtilsTest = {
    test_toPrintableString: (ns : NS) : void => {
        Assert.equal(toPrintableString({}), "{}");
        Assert.equal(toPrintableString([]), "[]");
        Assert.equal(toPrintableString("test"), "test");
        Assert.equal(toPrintableString(1), "1");
        Assert.equal(toPrintableString(-1), "-1");
        Assert.equal(toPrintableString({test: "test"}), "{Object}");
        Assert.equal(toPrintableString({test: 0}), "{Object}");
        Assert.equal(toPrintableString(["test1", "test2"]), "[test1,test2]");
        Assert.equal(toPrintableString([0,1,2]), "[0,1,2]");
        Assert.equal(toPrintableString([Assert,Assert,Assert]), "[{Assert},{Assert},{Assert}]");
        Assert.equal(toPrintableString(Assert), "{Assert}");
    }
}