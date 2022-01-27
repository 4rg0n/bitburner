import { NS } from "@ns";
import { Cracker } from "dist/Cracker";
import { Deployer } from "dist/Deployer";
import { Flags } from "lib/Flags";
import { Scheduler } from "dist/Scheduler";
import { Zerver } from "server/Zerver";


export async function main(ns : NS): Promise<void> {
	const flags = new Flags(ns, [
		["_", "", "Name of server(s) to run threads against"],
		["hack", 0, "Number of hack threads"],
		["grow", 0, "Number of grow threads"],
		["weaken", 0, "Number of weaken threads"],
		["host", Scheduler.WorkerType.All, `Category of hosts to deploy: ${Object.values(Scheduler.WorkerType).join(", ")}`],
		["help", false, ""]
	]);

	const args = flags.args();
    const targetNames : string[] = args._;
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