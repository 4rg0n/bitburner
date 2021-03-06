import { Assert } from '/test/Assert';
import { TestRunner } from '/test/TestRunner';
/**
 * Tests TestRunner itself
 */
export async function main(ns) {
    //if (TestRunner.shouldSkip(true, "example skip")) return; //Skip?
    const runner = new TestRunner(ns);
    runner.run(Tests);
}
const Tests = {
    testShouldFail: (ns) => {
        Assert.fail("muh", "blub", "I'm failed");
    },
    testShouldError: (ns) => {
        throw new Error("I'm error");
    },
    testShouldSkip: (ns) => {
        TestRunner.skip(true, "I'm skipped");
    },
    testShouldSucceed: (ns) => {
        return;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdFJ1bm5lci50ZXN0LmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsidGVzdC9UZXN0UnVubmVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUN0QyxPQUFPLEVBQUUsVUFBVSxFQUFpQixNQUFNLGtCQUFrQixDQUFDO0FBRTdEOztHQUVHO0FBQ0gsTUFBTSxDQUFDLEtBQUssVUFBVSxJQUFJLENBQUMsRUFBTztJQUM5QixrRUFBa0U7SUFDbEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN0QixDQUFDO0FBRUQsTUFBTSxLQUFLLEdBQUc7SUFDVixjQUFjLEVBQUUsQ0FBQyxFQUFPLEVBQVMsRUFBRTtRQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELGVBQWUsRUFBRSxDQUFDLEVBQU8sRUFBUyxFQUFFO1FBQ2pDLE1BQU0sSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVELGNBQWMsRUFBRSxDQUFDLEVBQU8sRUFBUyxFQUFFO1FBQy9CLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxpQkFBaUIsRUFBRSxDQUFDLEVBQU8sRUFBUyxFQUFFO1FBQ25DLE9BQU87SUFDVixDQUFDO0NBQ0osQ0FBQSJ9