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
        ["help", false, ""]
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