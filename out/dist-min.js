// @ts-check
/** @typedef {import(".").NS} NS */

import { Zerver } from "./Zerver.js";
import { Scheduler } from "./Scheduler.js";
import { WorkQueue } from "./WorkQueue.js";
import { Flags } from "./Flags.js";
import { Deployer } from "./Deployer.js";
import { Cracker } from "./Cracker.js";

/**
 * For distributing hack / grow / weaken threads to attack a set of targets
 * Uses as less RAM as possible (12 - 16GB)
 * 
 * @param {NS} ns
 */
export async function main(ns) {
    ns.disableLog('ALL');

    const flags = new Flags(ns, [
        ["target", [], `Category of targets to attack: ${Object.values(Zerver.MoneyRank).join(", ")}`],
        ["host", Scheduler.WorkerType.NotHome, `Category of hosts to deploy: ${Object.values(Scheduler.WorkerType).join(", ")}`],
        ["take", 0.5, "Percentage of money, wich should be hacked between 0 and 1"],
        ["free", 0, "Amount of GB ram to not use on home server when distributing"],
        ["boost", 1, "Factor for boosting calculated threads and therefor load"],
        ["help", false, ""]
    ]);
    const args = flags.args();

    const servers = Zerver.get(ns);
    const taking = args["take"] - 0;
    const homeRamMinFree = args["free"];
    const workerType = args["host"];
    const boostFactor = args["boost"];
    const targetCategories = args["target"];

    const cracker = new Cracker(ns);
    const deployer = new Deployer(ns, cracker);
    const targets = Scheduler.filterByMoneyRanks(servers, targetCategories);
    const workers = Scheduler.filterByWorkType(servers, workerType);
    const scheduler = new Scheduler(ns, targets, workers, deployer, taking, boostFactor, homeRamMinFree);
    
    await scheduler.init();
    await scheduler.cleanup();    
    await scheduler.deployHacksToServers();

    while (true) {
        await ns.sleep(500);
        scheduler.queueWork();
        await scheduler.run();
        await ns.sleep(500);   
    }  
}