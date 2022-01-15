// @ts-check
/** @typedef {import(".").NS} NS */

import { Zerver } from "./Zerver.js";
import { Scheduler } from "./Scheduler.js";
import { WorkQueue } from "./WorkQueue.js";
import { Log } from "./Log.js";
import { TicketId, WorkTicket } from "./WorkTicket.js";
import { ProgressBar, Progression } from "./ProgressBar.js";
import { asFormat } from "./utils.js";
import { Purchaser } from "./Purchaser.js";
import { Flags } from "./Flags.js";
import { Cracker } from "./Cracker.js";
import { Deployer } from "./Deployer.js";

const TargetType = {
    Worth: "worth",
    Low: "low",
    Mid: "mid",
    High: "high",
}

/**
 * For distributing hack / grow / weaken threads to attack a set of targets
 * 
 * @todo Fine tune distribution: higher available money means easier grow? 
 *       So it would be good to keep servers as near as max money as possible?
 * 
 * @todo When there's alot of RAM available, distirbution only produces a 
 *       load of ~10% and does not run scripts on all servers.
 * 
 * @param {NS} ns
 */
export async function main(ns) {
    ns.disableLog('ALL');

    const flags = new Flags(ns, [
        ["target", [], `Category of targets to attack: ${Object.values(Zerver.MoneyRank).join(", ")}`],
        ["host", Scheduler.WorkerType.All, `Category of hosts to deploy: ${Object.values(Scheduler.WorkerType).join(", ")}`],
        ["take", 0.5, "Percentage of money, wich should be hacked between 0 and 1"],
        ["scale", 0, "Percante of available money between 0 and 1 to regularly buy new servers. 0 means no servers will be bought"],
        ["free", 0, "Amount of GB ram to not use on home server when distributing"],
        ["boost", 1, "Factor for boosting calculated threads and therefor load"],
        ["silent", false, "Will not produce any output"],
        ["help", false, ""]
    ]);
    
    const args = flags.args();

    const taking = args["take"] - 0;
    const scale = args["scale"] - 0;
    const homeRamMinFree = args["free"];
    const workerType = args["host"];
    const silent = args["silent"];
    const targetCategories = args["target"];
    const boostFactor = args["boost"];

    const log = new Log(ns);
    const purchaser = new Purchaser(ns, scale, 4);
    const servers = Zerver.get(ns);
    const cracker = new Cracker(ns);
    const deployer = new Deployer(ns, cracker);
    await deployer.deployHacksToServers(servers);

    const targets = Scheduler.filterByMoneyRanks(servers, targetCategories);
    const workers = Scheduler.filterByWorkType(servers, workerType);
    const scheduler = new Scheduler(ns, targets, workers, deployer, taking, boostFactor, homeRamMinFree);

    await scheduler.init();
    await scheduler.cleanup();    
    purchaser.upgradeServers(); // will only buy when scale > 0

    const targetsInitBar = new Progression(new ProgressBar(10));
    const targetsRunBar = new Progression(new ProgressBar(10));
    const ticketsInitBar = new Progression(new ProgressBar(10));
    
    const hackThreadSchedBar = new Progression(new ProgressBar(10));
    const growThreadSchedBar = new Progression(new ProgressBar(10));
    const weakenThreadSchedBar = new Progression(new ProgressBar(10));

    const hackThreadInitBar = new Progression(new ProgressBar(10));
    const growThreadInitBar = new Progression(new ProgressBar(10));
    const weakenThreadInitBar = new Progression(new ProgressBar(10));

    const hackThreadWaitBar = new Progression(new ProgressBar(10));
    const growThreadWaitBar = new Progression(new ProgressBar(10));
    const weakenThreadWaitBar = new Progression(new ProgressBar(10));

    const loadBar = new Progression(new ProgressBar(10), Progression.Format.Byte);
    const moneyBar = new Progression(new ProgressBar(10));
    const scaleBar = new Progression(new ProgressBar(10), null, [Progression.Templates.Bar, Progression.Templates.Ratio, Progression.Templates.Percent]);
    const rampUpBar = new Progression(new ProgressBar(10, 10), null, [Progression.Templates.Bar, Progression.Templates.Percent]);

    const secLowBar = new Progression(new ProgressBar(10));
    const secMedBar = new Progression(new ProgressBar(10));
    const secHighBar = new Progression(new ProgressBar(10));
    const secHighestBar = new Progression(new ProgressBar(10));

    console.log(scheduler);

    while (true) {
        await ns.sleep(500);
        if (purchaser.canUpgradeServers()) {
            ns.toast(`Stopping distribution for upgrading servers`, "info", 10000);
            await scheduler.cleanup();
            purchaser.upgradeServers();
            await scheduler.init();
        }

        scheduler.queueWork();
        await scheduler.run();
        await ns.sleep(500);

        if (silent) continue;

        const totalMoneyMax = scheduler.scheduledQueue.map(master => master.target.moneyMax).reduce((a, b) => a + b, 0); 
        const totalMoneyAvail = scheduler.scheduledQueue.map(master => master.target.moneyAvail).reduce((a, b) => a + b, 0);
        const moneyToHack = totalMoneyMax * taking;
        const moneyToBuyServers = purchaser.getAvailableMoney();
        const moneyTotalUpgrade = purchaser.getUpgradeCosts();
        
        const totalTargetsRunning = scheduler.scheduledQueue.filter(master => master.status === WorkTicket.Status.Running).length;
        const totalTargetsInitiating = scheduler.scheduledQueue.filter(master => master.status === WorkTicket.Status.Initiating).length;

        const totalRamMax = scheduler.workers.map(worker => worker.ramMax).reduce((a, b) => a + b, 0);
        const totalRamUsed = scheduler.workers.map(worker => worker.ramUsed).reduce((a, b) => a + b, 0);

        const totalTickets = scheduler.initQueue.length + scheduler.waitingQueue.length;
        
        const waitingThreads = scheduler.distWaitingThreads();
        const securityRanks = scheduler.totalSecurityRanks();
        const schedThreads = scheduler.distScheduledThreads();
        const initThreads = scheduler.distInitiatingThreads();

        log
            .add("")
            .add(`Targets:`)         
            .add(`  Total:\t${scheduler.targets.length}`)
            .add(`  ${WorkTicket.Status.Initiating}:\t${targetsInitBar.setProgress(totalTargetsInitiating, scheduler.targets.length)}`)
            .add(`  ${WorkTicket.Status.Running}:\t${targetsRunBar.setProgress(totalTargetsRunning, scheduler.targets.length)}`)
            .add(`Tickets(${TicketId}):`)
            .add(`  Total:\t${totalTickets}`)
            .add(`  ${WorkTicket.Status.Initiating}:\t${ticketsInitBar.setProgress(scheduler.initQueue.length, totalTickets)}`)
            .add(`  ${WorkTicket.Status.Running}:\t${ticketsInitBar.setProgress(scheduler.waitingQueue.length, totalTickets)}`)
            .add(`Security Distribution:`)
            .add(`  Low:\t\t${secLowBar.setProgress(securityRanks.low, securityRanks.total)}`)
            .add(`  Med:\t\t${secMedBar.setProgress(securityRanks.med, securityRanks.total)}`)
            .add(`  High: \t${secHighBar.setProgress(securityRanks.high, securityRanks.total)}`)
            .add(`  Highest:\t${secHighestBar.setProgress(securityRanks.highest, securityRanks.total)}`)
            .add(`Threads Scheduled:`)
            .add(`  Total:\t${asFormat(schedThreads.total, 3)}`)
            .add(`  Hack: \t${hackThreadSchedBar.setProgress(schedThreads.hack, schedThreads.total)}`)
            .add(`  Grow: \t${growThreadSchedBar.setProgress(schedThreads.grow, schedThreads.total)}`)
            .add(`  Weaken:\t${weakenThreadSchedBar.setProgress(schedThreads.weaken, schedThreads.total)}`)
            .add(`Threads Initialisating:`)
            .add(`  Total:\t${asFormat(initThreads.total, 3)}`)
            .add(`  Hack: \t${hackThreadInitBar.setProgress(initThreads.hack, initThreads.total)}`)
            .add(`  Grow: \t${growThreadInitBar.setProgress(initThreads.grow, initThreads.total)}`)
            .add(`  Weaken:\t${weakenThreadInitBar.setProgress(initThreads.weaken, initThreads.total)}`)
            .add(`Threads Waiting:`)            
            .add(`  Total:\t${asFormat(waitingThreads.total, 3)}`)
            .add(`  Hack: \t${hackThreadWaitBar.setProgress(waitingThreads.hack, waitingThreads.total)}`)
            .add(`  Grow: \t${growThreadWaitBar.setProgress(waitingThreads.grow, waitingThreads.total)}`)
            .add(`  Weaken:\t${weakenThreadWaitBar.setProgress(waitingThreads.weaken, waitingThreads.total)}`)
            .add("----------------------------------------------------")
            .add(`Money:\t${moneyBar.setProgress(totalMoneyAvail, totalMoneyMax)}`)
            .add(`Load: \t${loadBar.setProgress(totalRamUsed, totalRamMax)}`)
            .add(`RampUp:\t${rampUpBar.setProgress(totalMoneyAvail, moneyToHack)}`)
            .add((scale > 0) ? `Scale: \t${scaleBar.setProgress(moneyToBuyServers, moneyTotalUpgrade)}` : ``);

        log.display();
    }
}