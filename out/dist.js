/** @typedef {import(".").NS} NS */

import { Zerver } from "./Zerver.js";
import { Scheduler } from "./Scheduler.js";
import { Master } from "./Master.js";
import { Log } from "./Log.js";
import { WorkTicket } from "./WorkTicket.js";
import { ProgressBar, Progression } from "./ProgressBar.js";
import { asFormat, median } from "./utils.js";
import { Purchaser } from "./Purchaser.js";
import { Flags } from "./Flags.js";
import { Crack } from "./Crack.js";

const TargetType = {
    Worth: "worth",
    Low: "low",
    Mid: "mid",
    High: "high",
}

/**
 * For distributing hack / grow / weaken threads to attack a set of targets
 * 
 * @param {NS} ns
 */
export async function main(ns) {
    ns.disableLog('ALL');

    const flags = new Flags(ns, [
        ["target", TargetType.Worth, `Category of targets to attack: ${Object.values(TargetType).join(", ")}`],
        ["host", Scheduler.WorkerType.NotHome, `Category of hosts to deploy: ${Object.values(Scheduler.WorkerType).join(", ")}`],
        ["take", 0.5, "Percentage of money, wich should be hacked between 0 and 1"],
        ["scale", 0, "Percante of available money between 0 and 1 to regularly buy new servers. 0 means no servers will be bought"],
        ["free", 0, "Amount of GB ram to not use on home server when distributing"],
        ["silent", false, "Will not produce any output"],
        ["help", false]
    ]);
    
    const args = flags.args();

    let targets = [];
    const taking = args.take - 0;
    const scale = args.scale - 0;
    const homeRamMinFree = args.free;
    const workerType = args.host;
    const silent = args.silent;
    const cracker = new Crack(ns);

    const servers = Zerver.get(ns);
    cracker.crackServers(servers);

    switch(args.target.toLowerCase()) {
        case TargetType.Low.toLowerCase():
            targets = filterLowServers(ns, servers, taking);
            break;
        case TargetType.Mid.toLowerCase():
            targets = filterMidServers(ns, servers, taking);
            break;
        case TargetType.High.toLowerCase():
            targets = filterHighServers(ns, servers, taking);
            break;        
        default: 
        case TargetType.Worth.toLowerCase():
            targets = filterWorthServers(ns, servers);
            break;   
    }   

    const log = new Log(ns);
    const purchaser = new Purchaser(ns, scale);
    /** @type {Master[]} masters */
    const masters = targets.map(target => new Master(ns, target.name, taking));
    const scheduler = new Scheduler(ns, masters, workerType, homeRamMinFree);

    console.log(scheduler);
    
    await scheduler.cleanup();    
    purchaser.upgradeServers(); // will only buy when scale > 0
    await scheduler.deployHacksToServers();

    const targetsInitBar = new Progression(new ProgressBar(10));
    const targetsRunBar = new Progression(new ProgressBar(10));
    const ticketsInitBar = new Progression(new ProgressBar(10));
    
    const hackDistBar = new Progression(new ProgressBar(10));
    const growDistBar = new Progression(new ProgressBar(10));
    const weakenDistBar = new Progression(new ProgressBar(10));
   
    const hackSchedBar = new Progression(new ProgressBar(10));
    const growSchedBar = new Progression(new ProgressBar(10));
    const weakenSchedBar = new Progression(new ProgressBar(10));

    const loadBar = new Progression(new ProgressBar(10), Progression.Format.Byte);
    const waitingBar = new Progression(new ProgressBar(10));
    const moneyBar = new Progression(new ProgressBar(10));
    const scaleBar = new Progression(new ProgressBar(10));
    const rampUpBar = new Progression(new ProgressBar(10, 2), null, [Progression.Templates.Bar, Progression.Templates.Percent]);

    const secLowBar = new Progression(new ProgressBar(10));
    const secMedBar = new Progression(new ProgressBar(10));
    const secHighBar = new Progression(new ProgressBar(10));
    const secHighestBar = new Progression(new ProgressBar(10));

    while (true) {
        await ns.sleep(500);
        if (purchaser.canUpgradeServers()) {
            ns.toast(`Stopping distribution for upgrading servers`, "info", 10000);
            await scheduler.cleanup();
            purchaser.upgradeServers();
            await scheduler.deployHacksToServers();
        }

        for (let i = 0; i < masters.length; i++) {
            await masters[i].run();
        }
        await scheduler.run();
        await ns.sleep(500);

        if (silent) continue;

        // todo add display stuff to own DistributionMonitor class
         
        const threadsWaiting = scheduler.queue.map(work => work.progress).reduce((a, b) => a + b, 0);
        const totalThreads = scheduler.queue.map(work => work.threads).reduce((a, b) => a + b, 0);
        const totalWeakenThreads = scheduler.queue
            .filter(work => work.script.startsWith(Zerver.Scripts.weaken))
            .map(work => work.threads).reduce((a, b) => a + b, 0);
        const totalGrowThreads = scheduler.queue
            .filter(work => work.script.startsWith(Zerver.Scripts.grow))
            .map(work => work.threads).reduce((a, b) => a + b, 0);
        const totalHackThreads = scheduler.queue
            .filter(work => work.script.startsWith(Zerver.Scripts.hack))
            .map(work => work.threads).reduce((a, b) => a + b, 0);

        const totalWorkHackThreads = masters.map(master => master.threads.hack).reduce((a, b) => a + b, 0);    
        const totalWorkGrowThreads = masters.map(master => master.threads.grow).reduce((a, b) => a + b, 0);    
        const totalWorkWeakenThreads = masters.map(master => master.threads.weaken).reduce((a, b) => a + b, 0); 
        const totalWorkThreads = totalWorkHackThreads + totalWorkGrowThreads + totalWorkWeakenThreads;   
        
        const totalMoneyMax = masters.map(master => master.target.moneyMax).reduce((a, b) => a + b, 0); 
        const totalMoneyAvail = masters.map(master => master.target.moneyAvail).reduce((a, b) => a + b, 0);
        const moneyToHack = totalMoneyMax * taking;
        const moneyToBuyServers = purchaser.getAvailableMoney();
        const moneyTotalUpgrade = purchaser.getUpgradeCosts();
        
        const totalTargetsRunning = masters.filter(master => master.status === WorkTicket.Status.Running).length;
        const totalTargetsInitiating = masters.filter(master => master.status === WorkTicket.Status.Initiating).length;

        const totalRamMax = scheduler.workers.map(worker => worker.ramMax).reduce((a, b) => a + b, 0);
        const totalRamUsed = scheduler.workers.map(worker => worker.ramUsed).reduce((a, b) => a + b, 0);

        const secLowTargets = masters.filter(master => master.target.securityRank === Zerver.SecurityRank.Low).length;
        const secMedTargets = masters.filter(master => master.target.securityRank === Zerver.SecurityRank.Med).length;
        const secHighTargets = masters.filter(master => master.target.securityRank === Zerver.SecurityRank.High).length;
        const secHighestTargets = masters.filter(master => master.target.securityRank === Zerver.SecurityRank.Highest).length;

        const totalTickets = scheduler.queue.length + scheduler.waiting.length;
        
        log.add(`Targets:`)         
            .add(`  Total:\t${targets.length}`)
            .add(`  ${WorkTicket.Status.Initiating}:\t${targetsInitBar.setProgress(totalTargetsInitiating, targets.length)}`)
            .add(`  ${WorkTicket.Status.Running}:\t${targetsRunBar.setProgress(totalTargetsRunning, targets.length)}`)
            .add(`Tickets:`)
            .add(`  Total:\t${totalTickets}`)
            .add(`  ${WorkTicket.Status.Initiating}:\t${ticketsInitBar.setProgress(scheduler.queue.length, totalTickets)}`)
            .add(`  ${WorkTicket.Status.Running}:\t${ticketsInitBar.setProgress(scheduler.waiting.length, totalTickets)}`)
            .add(`Security Distribution:`)
            .add(`  Low:\t\t${secLowBar.setProgress(secLowTargets, targets.length)}`)
            .add(`  Med:\t\t${secMedBar.setProgress(secMedTargets, targets.length)}`)
            .add(`  High: \t${secHighBar.setProgress(secHighTargets, targets.length)}`)
            .add(`  Highest:\t${secHighestBar.setProgress(secHighestTargets, targets.length)}`)
            .add(`Threads Scheduled:`)            
            .add(`  Waiting:\t${waitingBar.setProgress(threadsWaiting, totalThreads)}`)
            .add(`  Total:\t${asFormat(totalThreads, 3)}`)
            .add(`  Hack: \t${hackSchedBar.setProgress(totalHackThreads, totalThreads)}`)
            .add(`  Grow: \t${growSchedBar.setProgress(totalGrowThreads, totalThreads)}`)
            .add(`  Weaken:\t${weakenSchedBar.setProgress(totalWeakenThreads, totalThreads)}`)
            .add(`Threads Distribution:`)
            .add(`  Total:\t${asFormat(totalWorkThreads, 3)}`)
            .add(`  Hack: \t${hackDistBar.setProgress(totalWorkHackThreads, totalWorkThreads)}`)
            .add(`  Grow: \t${growDistBar.setProgress(totalWorkGrowThreads, totalWorkThreads)}`)
            .add(`  Weaken:\t${weakenDistBar.setProgress(totalWorkWeakenThreads, totalWorkThreads)}`)
            .add("----------------------------------------------------")
            .add(`Money:\t${moneyBar.setProgress(totalMoneyAvail, totalMoneyMax)}`)
            .add(`Load: \t${loadBar.setProgress(totalRamUsed, totalRamMax)}`)
            .add(`RampUp:\t${rampUpBar.setProgress(totalMoneyAvail, moneyToHack)}`)
            .add((scale > 0) ? `Scale: \t${scaleBar.setProgress(moneyToBuyServers, moneyTotalUpgrade)}` : ``);

        log.display();
    }
}

/**
 * 
 * @param {NS} ns 
 * @param {Zerver[]} servers 
 * @param {number} taking
 * @returns {Zerver[]}
 */
function filterHighServers(ns, servers, taking) {
    return filterWorthServers(ns, servers)
        .filter(s => s.moneyMax >= 1000000000);
}

/**
 * 
 * @param {NS} ns 
 * @param {Zerver[]} servers 
 * @param {number} taking
 * @returns {Zerver[]}
 */
function filterMidServers(ns, servers, taking) {
    return filterWorthServers(ns, servers)
        .filter(s => s.moneyMax > 100000000 && s.moneyMax < 1000000000);
}

/**
 * 
 * @param {NS} ns 
 * @param {Zerver[]} servers
 * @param {number} taking 
 * @returns {Zerver[]}
 */
function filterLowServers(ns, servers, taking) {
    return filterWorthServers(ns, servers)
        .filter(s => s.moneyMax <= 100000000);
}

/**
 * 
 * @param {NS} ns 
 * @param {Zerver[]} servers 
 * @returns {Zerver[]}
 */
function filterWorthServers(ns, servers) {
    return servers
        // Ignore servers that can't be hacked
        .filter(s => s.type === Zerver.ServerType.MoneyFarm)
        // Ignore servers we don't have root for yet
        .filter(s => s.hasRoot)
        .filter(s => s.levelNeeded <= ns.getHackingLevel())
        // Ignore servers that has out of control security
        .filter(s => s.securityCurr <= 100)
        // Filter from blacklisted servers (never worth using)
        .filter(s => ['fulcrumassets'].indexOf(s.name) === -1);
}