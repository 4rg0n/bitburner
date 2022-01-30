import { Scanner } from "server/Scanner";
import { Flags } from "lib/Flags";
import { Zerver } from "server/Zerver";
import { ServerMonitor } from "server/ServerMonitor";
/**
 * Shows some server(s) stats in a logging window
 */
export async function main(ns) {
    ns.disableLog('ALL');
    const flags = new Flags(ns, [
        ["_", "", "Key of field to search in. When no second argument, it will search in evey key."],
        ["_", "", "When given, first argument will be they key and this will be the value to search for (e.g. moneyMax >=1000000; hostname n00dles,foodnstuff)"],
        ["cat", [], `WIll only display servers of a certein category: ${Object.values(Zerver.ServerType).join(", ")}`],
        ["money", [], `Will only display server with a certain money rank: ${Object.values(Zerver.MoneyRank).join(", ")}`],
        ["sort", "", "Will sort by given (e.g. moneyMax) value asc"],
        ["desc", false, "Sort desc"],
        ["help", false, "For displaying various information about servers"]
    ]);
    const args = flags.args();
    const keySearch = args._[0];
    const valueSearch = args._[1];
    const categoies = args["cat"];
    const sortBy = args["sort"];
    const sortDesc = args["desc"];
    const moneyRanks = args["money"];
    const scanner = new Scanner(ns);
    const serverInfos = scanner.scan({ key: keySearch, value: valueSearch }, categoies, moneyRanks, { by: sortBy, desc: sortDesc });
    const monitor = new ServerMonitor(ns, serverInfos.map(s => s.hostname));
    ns.tprintf(`Found ${serverInfos.length} server(s) to monitor`);
    if (serverInfos.length == 0) {
        ns.tprintf(`ERROR No servers to monitor found`);
        return;
    }
    while (true) {
        monitor.monitor();
        await ns.sleep(1000);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uaXRvci5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbIm1vbml0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDbEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFJckQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBQyxFQUFPO0lBQzlCLEVBQUUsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckIsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFO1FBQzlCLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxpRkFBaUYsQ0FBQztRQUM1RixDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsNklBQTZJLENBQUM7UUFDeEosQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLG9EQUFvRCxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUN4RyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsdURBQXVELE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3hILENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSw4Q0FBOEMsQ0FBQztRQUM1RCxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDO1FBQzVCLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxrREFBa0QsQ0FBQztLQUNuRSxDQUFDLENBQUM7SUFFSCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDMUIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDNUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVwQyxNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM3QixNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7SUFDNUgsTUFBTSxPQUFPLEdBQUcsSUFBSSxhQUFhLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUV4RSxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsV0FBVyxDQUFDLE1BQU0sdUJBQXVCLENBQUMsQ0FBQztJQUUvRCxJQUFJLFdBQVcsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1FBQ3pCLEVBQUUsQ0FBQyxPQUFPLENBQUMsbUNBQW1DLENBQUMsQ0FBQztRQUNoRCxPQUFPO0tBQ1Y7SUFFRCxPQUFNLElBQUksRUFBRTtRQUNSLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNsQixNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDeEI7QUFDTCxDQUFDIn0=