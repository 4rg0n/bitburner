import { Zerver } from "server/Zerver";
import { Scheduler } from "dist/Scheduler";
import { Flags } from "lib/Flags";
import { DistributionMonitor } from "dist/DistributionMonitor";
import { fromFormatGB } from "/lib/utils";
/**
 * Distribution with minimal under 16GB RAM
 * Will NOT automatically crack / deploy / purchase servers
 */
export async function main(ns) {
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
    const targetNames = args._;
    const taking = args["take"] - 0;
    const homeRamMinFree = args["free"];
    let ramCap = fromFormatGB(args["cap"]);
    const workerType = args["host"];
    const silent = args["silent"];
    const targetCategories = args["target"];
    const doBoost = args["boost"];
    const doAggro = args["aggro"];
    const doShare = args["share"];
    const servers = Zerver.get(ns);
    let targets;
    if (Array.isArray(targetNames) && targetNames.length > 0) {
        targets = servers.filter(s => targetNames.filter(name => s.name.toLowerCase().indexOf(name.toLowerCase()) !== -1).length > 0);
    }
    else {
        targets = Zerver.filterByMoneyRanks(servers, targetCategories);
    }
    if (Number.isNaN(ramCap)) {
        ramCap = 0;
    }
    targets = targets.filter(t => t.isTargetable);
    ns.tprintf(`Found ${targets.length} target(s)`);
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
    if (doBoost)
        monitorTemplate.push(DistributionMonitor.Templates.Boost);
    if (doShare)
        monitorTemplate.push(DistributionMonitor.Templates.Share);
    const monitor = new DistributionMonitor(ns, scheduler, undefined, monitorTemplate);
    while (true) {
        await ns.sleep(500);
        scheduler.scheduleWork();
        await scheduler.run();
        await ns.sleep(500);
        if (silent === true)
            continue;
        monitor.display();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzdC1taW4uanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJkaXN0LW1pbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMzQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRS9ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFMUM7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLEtBQUssVUFBVSxJQUFJLENBQUMsRUFBTztJQUM5QixFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXJCLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTtRQUN4QixDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsbURBQW1ELENBQUM7UUFDaEUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLGtDQUFrQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUM5RixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxnQ0FBZ0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDcEgsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLDREQUE0RCxDQUFDO1FBQzNFLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSw4REFBOEQsQ0FBQztRQUMzRSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsbURBQW1ELENBQUM7UUFD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