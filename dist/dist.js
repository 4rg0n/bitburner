import { Zerver } from "server/Zerver";
import { Scheduler } from "dist/Scheduler";
import { Purchaser } from "server/Purchaser";
import { Flags } from "lib/Flags";
import { Cracker } from "dist/Cracker";
import { Deployer } from "dist/Deployer";
import { DistributionMonitor } from "dist/DistributionMonitor";
import { fromFormatGB } from "/lib/utils";
/**
 * For distributing hack / grow / weaken threads to attack a set of targets
 */
export async function main(ns) {
    ns.disableLog('ALL');
    const flags = new Flags(ns, [
        ["...", "", `Hostnames of server to attack seperated by spaces`],
        ["target", [], `Category of targets to attack: ${Object.values(Zerver.MoneyRank).join(", ")}`],
        ["host", Scheduler.WorkerType.All, `Category of hosts to deploy: ${Object.values(Scheduler.WorkerType).join(", ")}`],
        ["take", 0.5, "Percentage of money, wich should be hacked between 0 and 1"],
        ["scale", 0, "Percante of available money between 0 and 1 to regularly buy new servers. 0 means no servers will be bought"],
        ["free", 0, "Amount of GB ram to not use on home server when distributing"],
        ["cap", "", "Amount of ram to use as maximum (e.g. 1PB, 960TB)"],
        ["share", false, "Wether free ram capacity shall be shared or not"],
        ["boost", false, "This will produce new work as long as there's free ram. May cause game crash."],
        ["aggro", false, "Another method of distribution where each ticket starts it's own set of script instead of scripts per target. May cause game crash."],
        ["silent", false, "Will not produce any output"],
        ["help", false, `For distributing ${Object.keys(Zerver.Scripts)} executions to a range of servers`]
    ]);
    const args = flags.args();
    ns.tprintf(`\n${flags.cmdLine()} --tail`);
    const targetNames = args._;
    const taking = args["take"] - 0;
    const scale = args["scale"] - 0;
    const homeRamMinFree = args["free"];
    let ramCap = fromFormatGB(args["cap"]);
    const workerType = args["host"];
    const silent = args["silent"];
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
        targets = servers.filter(s => targetNames.filter(name => s.name.toLowerCase().indexOf(name.toLowerCase()) !== -1).length > 0);
    }
    else {
        targets = Zerver.filterByMoneyRanks(servers, targetCategories);
    }
    if (Number.isNaN(ramCap)) {
        ramCap = 0;
    }
    // todo implement ramCap
    /*
    Runners are currently responsiple for calculating the threads based on ram available.
    Runners can currently hold a certain amount of ram free on its host.
        Solution: "Remove" some Workers by setting the minFree Ram to total ram when runner inits
    */
    const scheduler = new Scheduler(ns, targets, deployer, workerType, taking, doShare, doBoost, doAggro, homeRamMinFree, ramCap);
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
    if (scale > 0)
        monitorTemplate.push(DistributionMonitor.Templates.Scale);
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
        if (silent === true)
            continue;
        monitor.display();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzdC5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImRpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDbEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUN2QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRS9ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFMUM7O0dBRUc7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBQyxFQUFPO0lBQzlCLEVBQUUsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFckIsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFO1FBQ3hCLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxtREFBbUQsQ0FBQztRQUNoRSxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsa0NBQWtDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQzlGLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLGdDQUFnQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNwSCxDQUFDLE1BQU0s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