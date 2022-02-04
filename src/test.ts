import { NS } from '@ns'
import { TestExecuter } from '/test/TestExecuter';
import { Flags } from '/lib/Flags';

export async function main(ns : NS) : Promise<void> {
    const flags = new Flags(ns, [
		["_", "", "Part of a test file name"],
		["help", false, "For running tests"]
	]);

	const args = flags.args();
    const testName : string  = args._[0];
    const executer = new TestExecuter(ns);

    await executer.exec(testName);
}