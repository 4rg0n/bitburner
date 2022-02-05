import { NS } from '@ns'
import { TestExecuter } from '/test/TestExecuter';
import { Flags } from '/lib/Flags';

export async function main(ns : NS) : Promise<void> {
    const flags = new Flags(ns, [
		["_", "", "Part of a test file name"],
		["self", false, "Will run Test Execution self tests"],
		["help", false, "For running tests"]
	]);

	const args = flags.args();
    const testName : string  = args._[0];
    const doSelf : boolean  = args["self"];
    const executer = new TestExecuter(ns);

    await executer.exec(testName, doSelf);
}