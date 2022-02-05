import { NS } from '@ns'
import { toPrintableType } from '/lib/utils';
import { Assert } from '/test/Assert';
import { TestRunner } from '/test/TestRunner';

export async function main(ns : NS) : Promise<void> {
    const runner = new TestRunner(ns);
    runner.run(Tests);
}

const Tests = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    test_toPrintableString: (ns : NS) : void => {
        Assert.equal(toPrintableType({}), "{}");
        Assert.equal(toPrintableType([]), "[]");
        Assert.equal(toPrintableType("test"), "'test'");
        Assert.equal(toPrintableType(1), "1");
        Assert.equal(toPrintableType(-1), "-1");
        Assert.equal(toPrintableType({test: "test"}), "{Object}");
        Assert.equal(toPrintableType({test: 0}), "{Object}");
        Assert.equal(toPrintableType(["test1", "test2"]), "['test1','test2']");
        Assert.equal(toPrintableType([0,1,2]), "[0,1,2]");
        Assert.equal(toPrintableType([Assert,Assert,Assert]), "[{Assert},{Assert},{Assert}]");
        Assert.equal(toPrintableType(Assert), "{Assert}");
        Assert.equal(toPrintableType(undefined), "<undefined>");
        Assert.equal(toPrintableType(null), "<null>");
        Assert.equal(toPrintableType(NaN), "<NaN>");
        Assert.equal(toPrintableType(Number.NEGATIVE_INFINITY), "<-Infinity>");
        Assert.equal(toPrintableType(Number.POSITIVE_INFINITY), "<Infinity>");
    }
}