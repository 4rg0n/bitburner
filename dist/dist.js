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
    const targetNames = args._;
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
    let targets;
    if (Array.isArray(targetNames) && targetNames.length > 0) {
        targets = servers.filter(s => targetNames.filter(name => s.name.toLowerCase().indexOf(name.toLowerCase()) !== -1).length > 0);
    }
    else {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzdC5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImRpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDbEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUN2QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRy9EOztHQUVHO0FBQ0gsTUFBTSxDQUFDLEtBQUssVUFBVSxJQUFJLENBQUMsRUFBTztJQUM5QixFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXJCLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTtRQUN4QixDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsbURBQW1ELENBQUM7UUFDaEUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLGtDQUFrQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUM5RixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxnQ0FBZ0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDcEgsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLDREQUE0RCxDQUFDO1FBQzNFLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSw2R0FBNkcsQ0FBQztRQUMzSCxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsOERBQThELENBQUM7UUFDM0UsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLGlEQUFpRCxDQUFDO1FBQ25FLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSwrRUFBK0UsQ0FBQztRQUNqRyxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUscUlBQXFJLENBQUM7UUFDdkosQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLDZCQUE2QixDQUFDO1FBQ2hELENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7S0FDdEIsQ0FBQyxDQUFDO0lBRUgsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzFCLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBRTFDLE1BQU0sV0FBVyxHQUFjLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEMsTUFBTSxNQUFNLEdBQWEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3hDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3hDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDOUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRTlCLE1BQU0sU0FBUyxHQUFHLElBQUksU0FBUyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDOUMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMvQixNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoQyxNQUFNLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDM0MsTUFBTSxRQUFRLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFL0MsSUFBSSxPQUFPLENBQUM7SUFFWixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDdEQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQ3BCLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FDbkIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztLQUN4RjtTQUFNO1FBQ0gsT0FBTyxHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztLQUNsRTtJQUVELE1BQU0sU0FBUyxHQUFHLElBQUksU0FBUyxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFFdEgsTUFBTSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFdkIsTUFBTSxlQUFlLEdBQUc7UUFDcEIsbUJBQW1CLENBQUMsU0FBUyxDQUFDLE9BQU87UUFDckMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLElBQUk7UUFDbEMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLFlBQVk7UUFDMUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLElBQUk7UUFDbEMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLG9CQUFvQjtRQUNsRCxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsZUFBZTtRQUM3QyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsbUJBQW1CO1FBQ2pELG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxrQkFBa0I7UUFDaEQsbUJBQW1CLENBQUMsU0FBUyxDQUFDLElBQUk7UUFDbEMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLElBQUk7UUFDbEMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLEtBQUs7S0FDdEMsQ0FBQztJQUVGLElBQUksT0FBTztRQUFFLGVBQWUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZFLElBQUksS0FBSyxHQUFHLENBQUM7UUFBRSxlQUFlLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUd6RSxNQUFNLE9BQU8sR0FBRyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBSW5GLE9BQU8sSUFBSSxFQUFFO1FBQ1QsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksU0FBUyxDQUFDLGlCQUFpQixFQUFFLEVBQUU7WUFDL0IsRUFBRSxDQUFDLEtBQUssQ0FBQyw2Q0FBNkMsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdkUsTUFBTSxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDMUIsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQzNCLE1BQU0sU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQzFCO1FBRUQsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3RCLE1BQU0sU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVwQixJQUFJLE1BQU0sS0FBSyxJQUFJO1lBQUUsU0FBUztRQUU5QixPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDckI7QUFDTCxDQUFDIn0=