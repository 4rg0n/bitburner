// @ts-check
/** @typedef {import(".").NS} NS */
import { Cracker } from "./Cracker.js";
import { Deployer } from "./Deployer.js";
import { Flags } from "./Flags.js";
import { Scheduler } from "./Scheduler.js";
import { WorkQueue } from "./WorkQueue.js";
import { Zerver } from "./Zerver.js";


/** 
 * @param {NS} ns
 */
export async function main(ns) {
	const flags = new Flags(ns, [
		["_", "", "Name of server(s) to run threads against"],
		["hack", 0, "Number of hack threads"],
		["grow", 0, "Number of grow threads"],
		["weaken", 0, "Number of weaken threads"],
		["host", Scheduler.WorkerType.All, `Category of hosts to deploy: ${Object.values(Scheduler.WorkerType).join(", ")}`],
		["help", false, ""]
	]);

	const args = flags.args();
    /** @type {string[]} */
	// @ts-ignore
    const targetNames = args._;
	const workerType = args["host"];

	const servers = Zerver.get(ns);
    const targets = servers.filter(s => {
		const matches = targetNames.filter(name => s.name.toLowerCase().indexOf(name.toLowerCase()) >= 0);
		return matches.length > 0;
	});
   
	ns.tprintf(`Found ${targets.length} matching target(s)`);

	const threads = {
		hack: args["hack"],
		grow: args["grow"],
		weaken: args["weaken"]
	}

	if (targets.length === 0) {
		return;
	}

	ns.tprintf(`\n${targets.map(s => s.name).join(", ")}`);

	const cracker = new Cracker(ns);
    const deployer = new Deployer(ns, cracker);
    const scheduler = new Scheduler(ns,targets, deployer, workerType);

	for (const workQueue of scheduler.scheduledQueue) {
		workQueue.queueWork(threads);
	}

	await scheduler.run();
}