import { Zerver } from "server/Zerver";
import { Scheduler } from "dist/Scheduler";
import { Purchaser } from "server/Purchaser";
import { Flags } from "lib/Flags";
import { Cracker } from "dist/Cracker";
import { Deployer } from "dist/Deployer";
import { DistributionMonitor } from "dist/DistributionMonitor";
import { NS } from "@ns";

/**
 * For distributing hack / grow / weaken threads to attack a set of targets
 */
export async function main(ns : NS): Promise<void> {
    ns.disableLog('ALL');

    const flags = new Flags(ns, [
        ["...", "", `Hostnames of server to attack seperated by spaces`],
        ["target", [], `Category of targets to attack: ${Object.values(Zerver.MoneyRank).join(", ")}`],
        ["host", Scheduler.WorkerType.All, `Category of hosts to deploy: ${Object.values(Scheduler.WorkerType).join(", ")}`],
        ["take", 0.5, "Percentage of money, wich should be hacked between 0 and 1"],
        ["scale", 0, "Percante of available money between 0 and 1 to regularly buy new servers. 0 means no servers will be bought"],
        ["free", 0, "Amount of GB ram to not use on home server when distributing"],
        ["share", false, "Wether free ram capacity shall be shared or not"],
        ["boost", false, "This will produce new work as long as there's free ram. May cause game crash."],
        ["aggro", false, "Another method of distribution where each ticket starts it's own set of script instead of scripts per target. May cause game crash."],
        ["silent", false, "Will not produce any output"],
        ["help", false, ""]
    ]);
    
    const args = flags.args();
    ns.tprintf(`\n${flags.cmdLine()} --tail`);

    const targetNames : string[] = args._;
    const taking = args["take"] - 0;
    const scale = args["scale"] - 0;
    const homeRamMinFree = args["free"];
    const workerType = args["host"];
    const silent : boolean = args["silent"];
    const targetCategories = args["target"];
    const doBoost = args["boost"];
    const doAggro = args["aggro"];
    const doShare = args["share"];

    const purchaser = new Purchaser(ns, scale, 4);
    const servers = Zerver.get(ns);
    const cracker = new Cracker(ns);
    const deployer = new Deployer(ns, cracker);
    await deployer.deployScriptsToServers(servers);

    let targets;

    if (Array.isArray(targetNames) && targetNames.length > 0) {
        targets = servers.filter(
            s => targetNames.filter(
                name => s.name.toLowerCase().indexOf(name.toLowerCase()) !== -1).length > 0);
    } else {
        targets = Zerver.filterByMoneyRanks(servers, targetCategories);
    }
       
    const scheduler = new Scheduler(ns, targets, deployer, workerType, taking, doShare, doBoost, doAggro, homeRamMinFree);

    await scheduler.init();

    const monitorTemplate = [
        DistributionMonitor.Templates.Targets,
        DistributionMonitor.Templates.Line,
        DistributionMonitor.Templates.DistSecurity,
        DistributionMonitor.Templates.Line,
        DistributionMonitor.Templates.DistThreadsScheduled,
        DistributionMonitor.Templates.DistThreadsInit,
        DistributionMonitor.Templates.ThreadsInitProgress,
        DistributionMonitor.Templates.DistThreadsWaiting,
        DistributionMonitor.Templates.Line,
        DistributionMonitor.Templates.Load,
        DistributionMonitor.Templates.Money,
    ];

    if (doBoost) monitorTemplate.push(DistributionMonitor.Templates.Boost);
    if (scale > 0) monitorTemplate.push(DistributionMonitor.Templates.Scale);
    

    const monitor = new DistributionMonitor(ns, scheduler, purchaser, monitorTemplate);



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

        if (silent === true) continue;

        monitor.display();
    }
}

