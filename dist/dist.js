import { Zerver } from "server/Zerver";
import { Scheduler } from "dist/Scheduler";
import { Purchaser } from "server/Purchaser";
import { Flags } from "lib/Flags";
import { Cracker } from "dist/Cracker";
import { Deployer } from "dist/Deployer";
import { DistributionMonitor } from "dist/DistributionMonitor";
/**
 * For distributing hack / grow / weaken threads to attack a set of targets
 */
export async function main(ns) {
    ns.disableLog('ALL');
    const flags = new Flags(ns, [
        ["_", "", `Hostname of server to attack`],
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
    const targetName = args._[0];
    const taking = args["take"] - 0;
    const scale = args["scale"] - 0;
    const homeRamMinFree = args["free"];
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
    const targets = (typeof targetName !== "string" && targetName === "") ?
        Zerver.filterByMoneyRanks(servers, targetCategories) :
        servers.filter(s => s.name.toLowerCase().indexOf(targetName.toLowerCase()) !== -1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzdC5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImRpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDbEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUN2QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRy9EOztHQUVHO0FBQ0gsTUFBTSxDQUFDLEtBQUssVUFBVSxJQUFJLENBQUMsRUFBTztJQUM5QixFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXJCLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTtRQUN4QixDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsOEJBQThCLENBQUM7UUFDekMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLGtDQUFrQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUM5RixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxnQ0FBZ0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDcEgsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLDREQUE0RCxDQUFDO1FBQzNFLENBQUMsT0FB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