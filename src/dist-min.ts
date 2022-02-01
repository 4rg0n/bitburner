import { Zerver } from "server/Zerver";
import { Scheduler } from "dist/Scheduler";
import { Flags } from "lib/Flags";
import { DistributionMonitor } from "dist/DistributionMonitor";
import { NS } from "@ns";
import { fromFormatGB } from "/lib/utils";

/**
 * Distribution with minimal under 16GB RAM
 * Will NOT automatically crack / deploy / purchase servers
 */
export async function main(ns : NS): Promise<void> {
    ns.disableLog('ALL');

    const flags = new Flags(ns, [
        ["...", "", `Hostnames of server to attack seperated by spaces`],
        ["target", [], `Category of targets to attack: ${Object.values(Zerver.MoneyRank).join(", ")}`],
        ["host", Scheduler.WorkerType.All, `Category of hosts to deploy: ${Object.values(Scheduler.WorkerType).join(", ")}`],
        ["take", 0.5, "Percentage of money, wich should be hacked between 0 and 1"],
        ["free", 0, "Amount of GB ram to not use on home server when distributing"],
        ["cap", "", "Amount of ram to use as maximum (e.g. 1PB, 960TB)"],
        ["share", false, "Wether free ram capacity shall be shared or not"],
        ["boost", false, "This will produce new work as long as there's free ram. May cause game crash."],
        ["aggro", false, "Another method of distribution where each ticket starts it's own set of script instead of scripts per target. May cause game crash."],
        ["silent", false, "Will not produce any output"],
        ["help", false, `Minimal ram version for distributing ${Object.keys(Zerver.Scripts)} executions to a range of servers`]
    ]);
    
    const args = flags.args();
    ns.tprintf(`\n${flags.cmdLine()} --tail`);

    const targetNames : string[] = args._;
    const taking = args["take"] - 0;
    const homeRamMinFree = args["free"];
    let ramCap = fromFormatGB(args["cap"]);
    const workerType = args["host"];
    const silent : boolean = args["silent"];
    const targetCategories = args["target"];
    const doBoost = args["boost"];
    const doAggro = args["aggro"];
    const doShare = args["share"];

    const servers = Zerver.get(ns);

    let targets;

    if (Array.isArray(targetNames) && targetNames.length > 0) {
        targets = servers.filter(
            s => targetNames.filter(
                name => s.name.toLowerCase().indexOf(name.toLowerCase()) !== -1).length > 0);
    } else {
        targets = Zerver.filterByMoneyRanks(servers, targetCategories);
    }

    if (Number.isNaN(ramCap)) {
        ramCap = 0;
    }

    const scheduler = new Scheduler(ns, targets, undefined, workerType, taking, doShare, doBoost, doAggro, homeRamMinFree, ramCap);

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
    if (doShare) monitorTemplate.push(DistributionMonitor.Templates.Share);

    const monitor = new DistributionMonitor(ns, scheduler, undefined, monitorTemplate);

    while (true) {
        await ns.sleep(500);
        scheduler.scheduleWork();
        await scheduler.run();
        await ns.sleep(500);

        if (silent === true) continue;

        monitor.display();
    }
}

