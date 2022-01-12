/** @typedef {import(".").NS} NS */
import { Flags } from "./Flags.js";
import { TestConst, Test } from "./test2.js";

/** @param {NS} ns **/
export async function main(ns) {
    const flags = new Flags(ns, [
		["_", "muh", "Part of file name or path to delete"],
		["_", "muh", "Part of file name or path to delete"],
		["host", "", "Name of the server to delete files from"],
		["help", false]
	]);
    const args = flags.args();

	const test = new Test(ns);

    ns.tprint(TestConst.test + ": " +  ns.getScriptRam("test.js"));
}