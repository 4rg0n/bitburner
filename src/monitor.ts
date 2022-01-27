
import { Scanner } from "server/Scanner";
import { Flags } from "lib/Flags";
import { Zerver } from "server/Zerver";
import { ServerMonitor } from "server/ServerMonitor";
import { NS } from "@ns";


/** 
 * Shows some server(s) stats in a logging window
 */
export async function main(ns : NS): Promise<void> {
    ns.disableLog('ALL');
    const flags = new Flags(ns, [
		["_", "", "Key of field to search in. When no second argument, it will search in evey key."],
		["_", "", "When given, first argument will be they key and this will be the value to search for (e.g. moneyMax >=1000000; hostname n00dles,foodnstuff)"],
		["cat", [], `WIll only display servers of a certein category: ${Object.values(Zerver.ServerType).join(", ")}`],
        ["money", [], `Will only display server with a certain money rank: ${Object.values(Zerver.MoneyRank).join(", ")}`],
		["sort", "", "Will sort by given (e.g. moneyMax) value asc"],
		["desc", false, "Sort desc"],
		["help", false, ""]
	]);

	const args = flags.args();
	const keySearch = args._[0];
	const valueSearch = args._[1];
	const categoies = args["cat"];
	const sortBy = args["sort"];
	const sortDesc = args["desc"];
    const moneyRanks = args["money"];

	const scanner = new Scanner(ns);
    const serverInfos = scanner.scan({key: keySearch, value: valueSearch}, categoies, moneyRanks, {by: sortBy, desc: sortDesc});
    const monitor = new ServerMonitor(ns, serverInfos.map(s => s.hostname));

    ns.tprintf(`Found ${serverInfos.length} server(s) to monitor`);

    if (serverInfos.length == 0) {
        ns.tprintf(`ERROR No servers to monitor found`);
        return;
    }

    while(true) {
        monitor.monitor();
        await ns.sleep(1000);
    }
}