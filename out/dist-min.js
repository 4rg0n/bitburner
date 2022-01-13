/** @typedef {import(".").NS} NS */

import { Zerver } from "./Zerver.js";
import { Scheduler } from "./Scheduler.js";
import { Master } from "./Master.js";
import { Flags } from "./Flags.js";

/**
 * For distributing hack / grow / weaken threads to attack a set of targets
 * 
 * @param {NS} ns
 */
export async function main(ns) {
    ns.disableLog('ALL');

    const flags = new Flags(ns, [
        ["host", Scheduler.WorkerType.NotHome, `Category of hosts to deploy: ${Object.values(Scheduler.WorkerType).join(", ")}`],
        ["take", 0.5, "Percentage of money, wich should be hacked between 0 and 1"],
        ["free", 0, "Amount of GB ram to not use on home server when distributing"],
        ["help", false]
    ]);
    
    const args = flags.args();

    let targets = [];
    const servers = Zerver.get(ns);
    const taking = args.take - 0;
    const homeRamMinFree = args.free;
    const workerType = args.host;

    targets = servers.filter(t => t.isTargetable);

    /** @type {Master[]} masters */
    const masters = targets.map(target => new Master(ns, target.name, taking));
    const scheduler = new Scheduler(ns, masters, workerType, homeRamMinFree);
    
    await scheduler.cleanup();    
    await scheduler.deployHacksToServers();

    while (true) {
        await ns.sleep(500);
        for (let i = 0; i < masters.length; i++) {
            await masters[i].run();
        }
        await SCHEDULER.run();
        await ns.sleep(500);   
    }  
}